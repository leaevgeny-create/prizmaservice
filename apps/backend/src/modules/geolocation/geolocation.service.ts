import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeolocationService {
  constructor(private prisma: PrismaService) {}

  checkIn(userId: string, orderId: string, lat: number, lng: number) {
    return this.prisma.geoCheckIn.create({
      data: { userId, orderId, lat, lng },
    });
  }

  findByOrder(orderId: string) {
    return this.prisma.geoCheckIn.findMany({
      where: { orderId },
      include: { user: { select: { id: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
