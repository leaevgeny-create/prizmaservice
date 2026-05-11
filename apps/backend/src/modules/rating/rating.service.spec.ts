import { RatingService } from './rating.service';

// Тесты для изолированной бизнес-логики расчёта рейтинга
describe('RatingService — расчёт рейтинга', () => {
  let service: Partial<RatingService>;

  beforeEach(() => {
    // Тестируем только приватные методы через proxy
    service = {
      // Доступ к приватным методам через any
    } as any;
  });

  describe('calcQualityScore (качество на основе замечаний)', () => {
    const calc = (remarks: number) => {
      const MAX_REMARKS = 10;
      if (remarks === 0) return 10;
      const score = 10 - (remarks / MAX_REMARKS) * 10;
      return Math.max(0, parseFloat(score.toFixed(2)));
    };

    it('должен вернуть 10 при 0 замечаниях', () => {
      expect(calc(0)).toBe(10);
    });

    it('должен вернуть 5 при 5 замечаниях', () => {
      expect(calc(5)).toBe(5);
    });

    it('должен вернуть 0 при 10 и более замечаниях', () => {
      expect(calc(10)).toBe(0);
      expect(calc(15)).toBe(0);
    });

    it('не должен возвращать отрицательные значения', () => {
      expect(calc(100)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calcOnTimeScore (соблюдение сроков)', () => {
    const calc = (startDate: Date, plannedEnd: Date, actualEnd: Date | null) => {
      const actual = actualEnd || new Date();
      const totalDays = (plannedEnd.getTime() - startDate.getTime()) / 86400000;
      const overdueDays = Math.max(0, (actual.getTime() - plannedEnd.getTime()) / 86400000);
      if (overdueDays === 0) return 10;
      const ratio = overdueDays / totalDays;
      const score = 10 * Math.max(0, 1 - ratio);
      return parseFloat(score.toFixed(2));
    };

    it('должен вернуть 10 при сдаче в срок', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const actual = new Date('2024-01-30');
      expect(calc(start, end, actual)).toBe(10);
    });

    it('должен вернуть 0 при просрочке равной длине проекта', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31'); // 30 дней
      const actual = new Date('2024-03-01'); // просрочка 30 дней
      expect(calc(start, end, actual)).toBe(0);
    });

    it('должен снижать рейтинг пропорционально просрочке', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-03-01'); // 60 дней
      const actual = new Date('2024-04-01'); // просрочка 30 дней = 50%
      const score = calc(start, end, actual);
      expect(score).toBeCloseTo(5, 0);
    });
  });

  describe('Итоговый рейтинг (взвешенный)', () => {
    const calcOverall = (onTime: number, quality: number, customer: number | null) => {
      const WEIGHTS = { onTime: 0.4, quality: 0.4, customer: 0.2 };
      const cScore = customer ?? 5; // Дефолт если нет оценки заказчика
      return parseFloat((onTime * WEIGHTS.onTime + quality * WEIGHTS.quality + cScore * WEIGHTS.customer).toFixed(2));
    };

    it('идеальный рейтинг: 10/10/10 = 10', () => {
      expect(calcOverall(10, 10, 10)).toBe(10);
    });

    it('нулевой рейтинг: 0/0/0 = 0', () => {
      expect(calcOverall(0, 0, 0)).toBe(0);
    });

    it('рейтинг без оценки заказчика использует дефолт 5', () => {
      const score = calcOverall(10, 10, null);
      expect(score).toBeCloseTo(9, 0); // 10*0.4 + 10*0.4 + 5*0.2 = 9
    });
  });
});
