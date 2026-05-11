import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.company.create({ data });
  }

  findOne(id: string) {
    return this.prisma.company.findUnique({ where: { id }, include: { members: true } });
  }

  findByUser(userId: string) {
    return this.prisma.companyMember.findMany({
      where: { userId },
      include: { company: true },
    });
  }
}
