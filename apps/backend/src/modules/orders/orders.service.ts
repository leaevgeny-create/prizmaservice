import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role, WorkType } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const object = await this.prisma.constructionObject.findFirst({
      where: { id: dto.objectId, customerId },
    });
    if (!object) throw new NotFoundException('Объект не найден или недоступен');

    const order = await this.prisma.order.create({
      data: {
        objectId: dto.objectId,
        customerId,
        workTypes: dto.workTypes,
        executorsNeeded: dto.executorsNeeded,
        description: dto.description,
        requirements: dto.requirements,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: OrderStatus.DRAFT,
      },
      include: { object: true, customer: { include: { profile: true } } },
    });

    this.events.emit('order.created', { orderId: order.id });
    return order;
  }

  async publish(orderId: string, customerId: string) {
    const order = await this.findOneOrFail(orderId);
    if (order.customerId !== customerId) throw new ForbiddenException();
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Можно опубликовать только черновик');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PUBLISHED },
    });
  }

  async findAvailableForExecutor(executorId: string, workTypes?: WorkType[]) {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.PUBLISHED,
        ...(workTypes?.length ? { workTypes: { hasSome: workTypes } } : {}),
        executorId: null,
      },
      include: {
        object: true,
        customer: {
          select: { id: true, profile: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        object: true,
        executor: { include: { profile: true } },
        defectStatements: { where: { status: 'APPROVED' }, take: 1 },
        acceptances: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForExecutor(executorId: string) {
    return this.prisma.order.findMany({
      where: { executorId },
      include: {
        object: true,
        customer: { include: { profile: true } },
        weatherStops: { where: { approved: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForManager(managerId: string) {
    return this.prisma.order.findMany({
      where: { managerId },
      include: {
        object: true,
        customer: { include: { profile: true } },
        executor: { include: { profile: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async assignExecutor(orderId: string, executorId: string, managerId: string) {
    const order = await this.findOneOrFail(orderId);
    if (order.status !== OrderStatus.PUBLISHED && order.status !== OrderStatus.EXECUTOR_SEARCH) {
      throw new BadRequestException('Нельзя назначить исполнителя в текущем статусе заявки');
    }

    const executor = await this.prisma.user.findUnique({
      where: { id: executorId },
    });
    if (!executor) throw new NotFoundException('Исполнитель не найден');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { executorId, managerId, status: OrderStatus.NEGOTIATION },
    });

    this.events.emit('order.executor_assigned', { orderId, executorId });
    return updated;
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto, userId: string, userRole: Role) {
    const order = await this.findOneOrFail(orderId);
    this.validateStatusTransition(order.status, dto.status, userRole);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
    });

    this.events.emit('order.status_changed', { orderId, newStatus: dto.status });
    return updated;
  }

  async findOne(orderId: string) {
    return this.findOneOrFail(orderId);
  }

  // Автоматически расширяет дедлайн на количество одобренных дней простоя
  async recalculateDeadline(orderId: string) {
    const order = await this.findOneOrFail(orderId);
    const approvedStops = await this.prisma.weatherStop.aggregate({
      where: { orderId, approved: true },
      _sum: { daysExtended: true },
    });

    const totalExtension = approvedStops._sum.daysExtended || 0;
    const newEndDate = new Date(order.endDate);
    newEndDate.setDate(newEndDate.getDate() + totalExtension);

    return this.prisma.order.update({
      where: { id: orderId },
      data: { actualEndDate: newEndDate },
    });
  }

  private async findOneOrFail(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        object: true,
        customer: { include: { profile: true } },
        executor: { include: { profile: true } },
        defectStatements: true,
        weatherStops: true,
      },
    });
    if (!order) throw new NotFoundException(`Заявка ${orderId} не найдена`);
    return order;
  }

  private validateStatusTransition(current: OrderStatus, next: OrderStatus, role: Role) {
    const transitions: Record<OrderStatus, { allowed: OrderStatus[]; roles: Role[] }> = {
      DRAFT: { allowed: [OrderStatus.PUBLISHED], roles: [Role.CUSTOMER_ADMIN, Role.CUSTOMER_MANAGER] },
      PUBLISHED: { allowed: [OrderStatus.EXECUTOR_SEARCH, OrderStatus.CANCELLED], roles: [Role.AGGREGATOR_ADMIN, Role.AGGREGATOR_MANAGER] },
      EXECUTOR_SEARCH: { allowed: [OrderStatus.NEGOTIATION], roles: [Role.AGGREGATOR_ADMIN, Role.AGGREGATOR_MANAGER] },
      NEGOTIATION: { allowed: [OrderStatus.CONTRACT_SIGNED, OrderStatus.CANCELLED], roles: [Role.AGGREGATOR_ADMIN, Role.AGGREGATOR_MANAGER] },
      CONTRACT_SIGNED: { allowed: [OrderStatus.IN_PROGRESS], roles: [Role.EXECUTOR_COMPANY, Role.EXECUTOR_IP, Role.EXECUTOR_SELF_EMPLOYED] },
      IN_PROGRESS: { allowed: [OrderStatus.ACCEPTANCE, OrderStatus.DISPUTED], roles: [Role.CUSTOMER_ADMIN, Role.CUSTOMER_MANAGER, Role.AGGREGATOR_MANAGER] },
      ACCEPTANCE: { allowed: [OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS, OrderStatus.DISPUTED], roles: [Role.CUSTOMER_ADMIN, Role.CUSTOMER_MANAGER, Role.AGGREGATOR_MANAGER] },
      COMPLETED: { allowed: [], roles: [] },
      DISPUTED: { allowed: [OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED], roles: [Role.AGGREGATOR_ADMIN, Role.EXPERT] },
      CANCELLED: { allowed: [], roles: [] },
    };

    const rule = transitions[current];
    if (!rule.allowed.includes(next)) {
      throw new BadRequestException(`Переход из статуса "${current}" в "${next}" недопустим`);
    }
    if (!rule.roles.includes(role)) {
      throw new ForbiddenException(`Роль "${role}" не может выполнить данный переход`);
    }
  }
}
