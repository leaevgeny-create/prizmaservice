'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '../../../../../components/layout/AppHeader';

type WorkFilter = 'all' | 'height' | 'ground';

const STATUS_LABELS: Record<string, string> = {
  agreed: '– Согласовано',
  not_agreed: '– Не согласовано',
  in_work: '– В работе',
  ready: '– Готово к сдаче',
  accepted: '– Принято заказчиком',
};

// Демо ведомости
const DEMO_STATEMENTS = [
  {
    id: 's1',
    room: 'Кв 123',
    corps: 'ЮГ',
    floor: 12,
    date: '12.01.24',
    executor: 'Бригадиренко С.',
    access: 'Ключ',
    status: 'Согласовано',
    // Статистика дефектов
    scratchesGround: 6.0,
    scaleGround: 1.5,
    remarksCount: 3,
    remarksWindows: 2,
    scratchesHeight: 6.0,
    scaleHeight: 1.5,
  },
  {
    id: 's2',
    room: 'Кв 99',
    corps: 'ЮГ',
    floor: 9,
    date: '10.01.24',
    executor: 'Бригадиренко С.',
    access: 'Ключ',
    status: 'Согласовано',
    scratchesGround: 3.2,
    scaleGround: 0.8,
    remarksCount: 1,
    remarksWindows: 1,
    scratchesHeight: 4.0,
    scaleHeight: 0.6,
  },
  {
    id: 's3',
    room: 'Кв 134',
    corps: 'ЮГ',
    floor: 12,
    date: '11.01.24',
    executor: 'Бригадиренко С.',
    access: 'Ключ',
    status: 'Согласовано',
    scratchesGround: 5.0,
    scaleGround: 1.2,
    remarksCount: 2,
    remarksWindows: 2,
    scratchesHeight: 5.5,
    scaleHeight: 1.0,
  },
];

const CORPS_FILTERS = ['ЮГ (22)', 'Север (2)', 'Запад (0)'];
const SORT_OPTIONS = ['Дата', 'Исполнитель', 'Номер'];

export default function StatementsCategoryPage() {
  const { objectId, status } = useParams<{ objectId: string; status: string }>();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [activeCorps, setActiveCorps] = useState(0);
  const [activeSort, setActiveSort] = useState(0);
  const [workFilter, setWorkFilter] = useState<WorkFilter>(
    (searchParams.get('work') as WorkFilter) ?? 'all',
  );

  const statusLabel = STATUS_LABELS[status] ?? status;
  const totalCount = DEMO_STATEMENTS.length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 px-4 py-4">
        {/* Заголовок с выпадающим статусом */}
        <div className="px-4 mb-4">
          <div className="bg-[#f0f0f0] rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xl">{statusLabel} ({totalCount})</span>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <path d="M1 1 L8 9 L15 1" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Фильтры */}
        <div className="px-4 mb-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-lg text-black"
          >
            Фильтры
            <svg
              width="12" height="8" viewBox="0 0 12 8" fill="none"
              style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }}
            >
              <path d="M1 7 L6 1 L11 7" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {showFilters && (
          <div className="px-4 mb-4 space-y-3">
            {/* Корпус */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-base shrink-0">Корпус:</span>
              {CORPS_FILTERS.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setActiveCorps(i)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs ${
                    activeCorps === i ? 'bg-[#888888] text-white' : 'bg-[#d9d9d9] text-black'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Сортировка */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-base shrink-0">Сортировка:</span>
              {SORT_OPTIONS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setActiveSort(i)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs ${
                    activeSort === i ? 'bg-[#888888] text-white' : 'bg-white border border-gray-300'
                  }`}
                >
                  {s} {activeSort === i ? '▼' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Список ведомостей */}
        <div className="space-y-4 px-2">
          {DEMO_STATEMENTS.map((stmt) => (
            <Link
              key={stmt.id}
              href={`/objects/${objectId}/statements/${status}/${stmt.id}`}
            >
              <StatementCard stmt={stmt} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatementCard({ stmt }: { stmt: typeof DEMO_STATEMENTS[0] }) {
  return (
    <div className="statement-card rounded-xl overflow-hidden">
      {/* Заголовок карточки */}
      <div className="flex gap-3 mb-3">
        {/* Иконка документа */}
        <div className="w-16 h-20 bg-[#a8d8f0] rounded-lg flex-shrink-0 flex items-center justify-center relative">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
            <rect x="4" y="0" width="32" height="44" rx="3" fill="white" fillOpacity="0.8"/>
            <path d="M4 0 L28 0 L36 8 L36 44 L4 44 Z" fill="white" fillOpacity="0.6"/>
            <path d="M28 0 L28 8 L36 8" fill="#d0eaf8"/>
            <rect x="9" y="14" width="20" height="2" rx="1" fill="#666"/>
            <rect x="9" y="20" width="18" height="2" rx="1" fill="#666"/>
            <rect x="9" y="26" width="20" height="2" rx="1" fill="#666"/>
            <path d="M28 38 L36 46" stroke="#333" strokeWidth="1.5"/>
            <circle cx="24" cy="38" r="6" fill="#eee" stroke="#ccc" strokeWidth="1"/>
          </svg>
        </div>

        {/* Данные */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <span className="text-lg font-bold">{stmt.room}</span>
            <div className="text-right">
              <span className="text-sm">Этаж <strong>{stmt.floor}</strong></span>
              <div className="text-sm text-gray-500">{stmt.date}</div>
            </div>
          </div>
          <div className="text-sm mt-1">Корпус <strong>{stmt.corps}</strong></div>
          <div className="text-sm">Исполнитель: <strong>{stmt.executor}</strong></div>
          <div className="text-sm">Доступ: <strong>{stmt.access}</strong></div>
          <div className="text-sm">Статус: <strong>{stmt.status}</strong></div>
        </div>
      </div>

      {/* Статистика дефектов */}
      <div className="border-t border-gray-300 pt-3 space-y-2">
        {/* Наземные */}
        <div className="flex items-center gap-4">
          <DefectBadge type="scratches-both" value={stmt.scratchesGround} unit="м²" />
          <DefectBadge type="scale" value={stmt.scaleGround} unit="м²" />
          <RemarksBadge count={stmt.remarksCount} windows={stmt.remarksWindows} />
        </div>
        {/* Высотные */}
        <div className="flex items-center gap-4">
          <DefectBadge type="scratches-height" value={stmt.scratchesHeight} unit="м²" />
          <DefectBadge type="scale-height" value={stmt.scaleHeight} unit="м²" />
        </div>
      </div>
    </div>
  );
}

function DefectBadge({ type, value, unit }: { type: string; value: number; unit: string }) {
  const configs: Record<string, { icon: string; color: string }> = {
    'scratches-both': { icon: '+,−', color: 'text-red-500' },
    'scale': { icon: 'о', color: 'text-black' },
    'scratches-height': { icon: '(+)', color: 'text-red-400' },
    'scale-height': { icon: '(о)', color: 'text-black' },
  };
  const c = configs[type] ?? { icon: '?', color: 'text-black' };

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-base font-bold ${c.color} border border-current rounded-full w-9 h-9 flex items-center justify-center text-xs leading-none`}>
        {c.icon}
      </span>
      <span className="text-xl font-light">{value.toFixed(1)}</span>
      <span className="text-sm text-gray-500">{unit}</span>
    </div>
  );
}

function RemarksBadge({ count, windows }: { count: number; windows: number }) {
  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <div className="w-9 h-9 rounded-full bg-[#E8820C] flex items-center justify-center text-white text-sm font-bold">
        {count}
      </div>
      <span className="text-xl font-light">{windows}</span>
    </div>
  );
}
