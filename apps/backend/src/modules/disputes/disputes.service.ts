import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  create(orderId: string, initiatorId: string, data: any) {
    return this.prisma.dispute.create({
      data: { orderId, initiatorId, ...data },
    });
  }

  findByOrder(orderId: string) {
    return this.prisma.dispute.findMany({
      where: { orderId },
      include: { messages: true },
    });
  }

  resolve(id: string, resolution: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: { status: 'RESOLVED', resolution },
    });
  }

  addMessage(disputeId: string, userId: string, text: string) {
    return this.prisma.disputeMessage.create({
      data: { disputeId, userId, text },
    });
  }
}
