import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcceptanceService {
  constructor(private prisma: PrismaService) {}

  create(orderId: string, data: any) {
    return this.prisma.workAcceptance.create({ data: { ...data, orderId } });
  }

  findByOrder(orderId: string) {
    return this.prisma.workAcceptance.findMany({
      where: { orderId },
      include: { items: true, remarks: true },
    });
  }

  findOne(id: string) {
    return this.prisma.workAcceptance.findUnique({
      where: { id },
      include: { items: true, remarks: true },
    });
  }

  approve(id: string, biometricData: string) {
    return this.prisma.workAcceptance.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  reject(id: string, data: any) {
    return this.prisma.workAcceptance.update({
      where: { id },
      data: { status: 'REJECTED', ...data },
    });
  }
}
