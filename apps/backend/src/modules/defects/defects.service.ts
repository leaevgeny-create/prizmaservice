import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DefectsService {
  constructor(private prisma: PrismaService) {}

  create(objectId: string, data: any) {
    return this.prisma.defectStatement.create({
      data: { ...data, objectId },
    });
  }

  findByObject(objectId: string) {
    return this.prisma.defectStatement.findMany({
      where: { objectId },
      include: { windowBlocks: true, history: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.defectStatement.findUnique({
      where: { id },
      include: { windowBlocks: { include: { items: true } }, history: true },
    });
  }

  submit(id: string) {
    return this.prisma.defectStatement.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    });
  }

  approve(id: string) {
    return this.prisma.defectStatement.update({
      where: { id },
      data: { status: 'AGREED' },
    });
  }

  reject(id: string, comment: string) {
    return this.prisma.defectStatement.update({
      where: { id },
      data: { status: 'NOT_AGREED' },
    });
  }

  createWindowBlock(statementId: string, data: any) {
    return this.prisma.windowBlock.create({
      data: { ...data, statementId },
    });
  }

  updateWindowBlock(id: string, data: any) {
    return this.prisma.windowBlock.update({ where: { id }, data });
  }
}
