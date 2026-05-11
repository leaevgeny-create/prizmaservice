'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '../../../../components/layout/AppHeader';

type WorkFilter = 'all' | 'height' | 'ground';
type StatusCategory = 'agreed' | 'not_agreed' | 'in_work' | 'ready' | 'accepted';

const WORK_FILTER_LABELS: Record<WorkFilter, string> = {
  all: 'Все',
  height: 'Высотные',
  ground: 'Наземные',
};

const STATUS_CATEGORIES: { key: StatusCategory; label: string; count: number }[] = [
  { key: 'agreed', label: 'Согласовано', count: 24 },
  { key: 'not_agreed', label: 'Не согласовано', count: 12 },
  { key: 'in_work', label: 'В работе', count: 10 },
  { key: 'ready', label: 'Готово к сдаче', count: 5 },
  { key: 'accepted', label: 'Принято заказчиком', count: 12 },
];

// Моковые данные объекта
const DEMO_OBJECTS: Record<string, string> = {
  'demo-1': 'ЖК Царская площадь',
  'demo-2': 'Объект Б',
};

export default function StatementsListPage() {
  const { objectId } = useParams<{ objectId: string }>();
  const router = useRouter();
  const [workFilter, setWorkFilter] = useState<WorkFilter>('all');

  const objectName = DEMO_OBJECTS[objectId] ?? objectId;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 px-8 py-4">
        <h1 className="text-3xl font-light mb-1">{objectName}</h1>
        <p className="text-xl text-gray-500 mb-6">Дефектные ведомости</p>

        {/* Фильтр по виду работ */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto">
          <span className="text-lg shrink-0">Вид работ:</span>
          {(Object.keys(WORK_FILTER_LABELS) as WorkFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setWorkFilter(key)}
              className={`shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                workFilter === key ? 'bg-[#888888] text-white' : 'bg-[#d9d9d9] text-black'
              }`}
            >
              {WORK_FILTER_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Категории статусов */}
        <div className="space-y-4">
          {STATUS_CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={`/objects/${objectId}/statements/${cat.key}?work=${workFilter}`}
            >
              <div className="btn-primary text-center py-4 rounded-xl text-xl">
                {cat.label} ({cat.count})
              </div>
            </Link>
          ))}
        </div>

        {/* Кнопка создать ведомость */}
        <div className="mt-8">
          <Link href={`/objects/${objectId}/statements/new`}>
            <div className="btn-secondary text-center py-4 rounded-xl text-xl">
              + Создать ведомость
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
