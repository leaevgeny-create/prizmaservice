'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '../../../../../../components/layout/AppHeader';

const DEMO_STATEMENT = {
  id: 's1',
  room: 'Кв 123',
  corps: 'ЮГ',
  floor: 12,
  date: '12.01.24',
  acceptDate: '15.01.24',
  executor: 'Бригадиренко С.',
  access: 'Ключ',
  status: 'Согласовано',
  onlyHeight: false,
  onlyGround: false,
  windowsCount: 2,
};

const STATUS_LABELS: Record<string, string> = {
  agreed: 'Согласовано',
  not_agreed: 'Не согласовано',
  in_work: 'В работе',
  ready: 'Готово к сдаче',
  accepted: 'Принято заказчиком',
};

export default function StatementDetailPage() {
  const { objectId, status, statementId } = useParams<{
    objectId: string; status: string; statementId: string;
  }>();
  const router = useRouter();

  const stmt = DEMO_STATEMENT;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 px-6 py-4">
        <h1 className="text-2xl font-light mb-1">Дефектная ведомость</h1>
        <p className="text-base text-gray-500 mb-6">{STATUS_LABELS[status] ?? status}</p>

        <div className="space-y-4 mb-8">
          <Field label="Помещение" value={stmt.room} />
          <Field label="Корпус" value={stmt.corps} />
          <Field label="Этаж" value={String(stmt.floor)} />
          <Field label="Исполнитель" value={stmt.executor} />
          <Field label="Доступ" value={stmt.access} />
          <Field label="Дата дефектовки" value={stmt.date} />
          <Field label="Дата приемки" value={stmt.acceptDate} />
          <Field label="Статус" value={stmt.status} />
        </div>

        <div className="space-y-3">
          <Link
            href={`/objects/${objectId}/statements/${status}/${statementId}/windows`}
            className="block"
          >
            <div className="btn-primary text-center rounded-xl py-4 text-xl">
              Оконные блоки ({stmt.windowsCount})
            </div>
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary rounded-xl w-full py-4 text-center text-xl"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="field-input">{value}</div>
    </div>
  );
}
