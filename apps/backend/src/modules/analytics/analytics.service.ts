import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async customerDashboard(customerId: string) {
    const [total, completed, inProgress] = await Promise.all([
      this.prisma.order.count({ where: { customerId } }),
      this.prisma.order.count({ where: { customerId, status: 'COMPLETED' } }),
      this.prisma.order.count({ where: { customerId, status: { in: ['IN_PROGRESS', 'PENDING_ACCEPTANCE'] } } }),
    ]);
    return { total, completed, inProgress };
  }

  async aggregatorDashboard() {
    const [totalOrders, totalExecutors, totalCustomers, revenue] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.user.count({ where: { role: 'EXECUTOR' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.aggregate({ _sum: { totalCost: true }, where: { status: 'COMPLETED' } }),
    ]);
    return { totalOrders, totalExecutors, totalCustomers, revenue: revenue._sum.totalCost ?? 0 };
  }

  async executorDashboard(executorId: string) {
    const [total, completed, earnings] = await Promise.all([
      this.prisma.order.count({ where: { executorId } }),
      this.prisma.order.count({ where: { executorId, status: 'COMPLETED' } }),
      this.prisma.order.aggregate({ _sum: { totalCost: true }, where: { executorId, status: 'COMPLETED' } }),
    ]);
    return { total, completed, earnings: earnings._sum.totalCost ?? 0 };
  }
}
