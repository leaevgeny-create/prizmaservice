import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkType } from '@prisma/client';
import { SubmitRatingDto } from './dto/submit-rating.dto';

// Веса для расчёта итогового рейтинга
const RATING_WEIGHTS = {
  onTime: 0.4,      // 40% — соблюдение сроков
  quality: 0.4,     // 40% — качество (число замечаний)
  customer: 0.2,    // 20% — субъективная оценка заказчика
} as const;

// Максимальное число замечаний, при котором рейтинг качества = 0
const MAX_REMARKS = 10;

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  async submitRating(orderId: string, customerId: string, dto: SubmitRatingDto) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { acceptances: { include: { remarks: true } } },
    });

    if (!order.executorId) throw new Error('У заявки нет исполнителя');
    if (order.customerId !== customerId) throw new Error('Доступ запрещён');

    const remarksCount = order.acceptances.reduce(
      (sum, a) => sum + a.remarks.length,
      0,
    );

    // Нелинейный штраф за замечания: каждое замечание сверх 1 снижает качество
    const qualityScore = this.calcQualityScore(remarksCount);

    // Процент выполнения в срок
    const onTimeScore = this.calcOnTimeScore(order.startDate, order.endDate, order.actualEndDate);

    const customerScore = Math.min(10, Math.max(0, dto.customerScore));

    const overallScore =
      onTimeScore * RATING_WEIGHTS.onTime +
      qualityScore * RATING_WEIGHTS.quality +
      customerScore * RATING_WEIGHTS.customer;

    const rating = await this.prisma.executorRating.upsert({
      where: { executorId_orderId: { executorId: order.executorId, orderId } },
      create: {
        executorId: order.executorId,
        orderId,
        customerId,
        onTimeScore,
        qualityScore,
        customerScore,
        overallScore,
        remarksCount,
        onTimePercent: onTimeScore * 10,
      },
      update: {
        customerScore,
        overallScore:
          onTimeScore * RATING_WEIGHTS.onTime +
          qualityScore * RATING_WEIGHTS.quality +
          customerScore * RATING_WEIGHTS.customer,
      },
    });

    // Пересчитываем агрегированный рейтинг компании
    await this.recalcCompanyRating(order.executorId, order.workTypes as WorkType[]);

    return rating;
  }

  async getExecutorRatingSummary(executorId: string) {
    const ratings = await this.prisma.executorRating.findMany({
      where: { executorId },
      orderBy: { createdAt: 'desc' },
    });

    if (ratings.length === 0) return { overallScore: null, ordersCount: 0, breakdown: null };

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    return {
      overallScore: parseFloat(avg(ratings.map((r) => r.overallScore)).toFixed(2)),
      onTimeScore: parseFloat(avg(ratings.map((r) => r.onTimeScore)).toFixed(2)),
      qualityScore: parseFloat(avg(ratings.map((r) => r.qualityScore)).toFixed(2)),
      customerScore: ratings.some((r) => r.customerScore !== null)
        ? parseFloat(avg(ratings.filter((r) => r.customerScore !== null).map((r) => r.customerScore!)).toFixed(2))
        : null,
      ordersCount: ratings.length,
      remarksAvg: parseFloat(avg(ratings.map((r) => r.remarksCount)).toFixed(1)),
    };
  }

  async getCompanyRating(companyId: string, workType?: WorkType) {
    return this.prisma.companyRating.findMany({
      where: { companyId, ...(workType ? { workType } : {}) },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  private async recalcCompanyRating(executorId: string, workTypes: WorkType[]) {
    const member = await this.prisma.companyMember.findFirst({
      where: { userId: executorId },
    });
    if (!member) return;

    for (const workType of workTypes) {
      // Берём всех исполнителей компании и их рейтинги по данному типу работ
      const members = await this.prisma.companyMember.findMany({
        where: { companyId: member.companyId },
        select: { userId: true },
      });
      const executorIds = members.map((m) => m.userId);

      const ratings = await this.prisma.executorRating.findMany({
        where: {
          executorId: { in: executorIds },
          order: { workTypes: { has: workType } },
        },
      });

      if (ratings.length === 0) continue;

      const avgScore = ratings.reduce((s, r) => s + r.overallScore, 0) / ratings.length;

      await this.prisma.companyRating.create({
        data: {
          companyId: member.companyId,
          workType,
          avgScore,
          ordersCount: ratings.length,
        },
      });
    }
  }

  // Рейтинг качества: 10 при 0 замечаниях, линейно снижается до 0 при MAX_REMARKS
  private calcQualityScore(remarksCount: number): number {
    if (remarksCount === 0) return 10;
    const score = 10 - (remarksCount / MAX_REMARKS) * 10;
    return Math.max(0, parseFloat(score.toFixed(2)));
  }

  // Рейтинг сроков: 10 если завершено в срок, пропорционально снижается за просрочку
  private calcOnTimeScore(startDate: Date, plannedEnd: Date, actualEnd: Date | null): number {
    const actual = actualEnd || new Date();
    const totalDays = (plannedEnd.getTime() - startDate.getTime()) / 86400000;
    const overdueDays = Math.max(0, (actual.getTime() - plannedEnd.getTime()) / 86400000);

    if (overdueDays === 0) return 10;
    const ratio = overdueDays / totalDays;
    const score = 10 * Math.max(0, 1 - ratio);
    return parseFloat(score.toFixed(2));
  }
}
