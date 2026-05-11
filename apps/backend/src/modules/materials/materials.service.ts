import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  findByObject(objectId: string) {
    return this.prisma.materialStock.findMany({ where: { objectId } });
  }

  createMovement(data: any) {
    return this.prisma.materialMovement.create({ data });
  }

  findMovements(stockId: string) {
    return this.prisma.materialMovement.findMany({
      where: { stockId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
