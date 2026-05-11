import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkOrdersService {
  constructor(private prisma: PrismaService) {}

  create(orderId: string, data: any) {
    return this.prisma.workOrder.create({ data: { ...data, orderId } });
  }

  findByOrder(orderId: string) {
    return this.prisma.workOrder.findMany({
      where: { orderId },
      include: { signatures: true },
    });
  }

  sign(id: string, userId: string, biometricData: string) {
    return this.prisma.workOrderSignature.create({
      data: { workOrderId: id, userId, biometricHash: biometricData },
    });
  }
}
