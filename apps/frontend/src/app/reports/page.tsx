'use client';

import { useState } from 'react';
import { AppHeader } from '../../components/layout/AppHeader';

const DEMO_REPORTS = [
  { id: 'r1', title: 'КС-2 Акт выполненных работ', object: 'ЖК Царская площадь', date: '15.01.24', status: 'Подписан' },
  { id: 'r2', title: 'КС-3 Справка о стоимости', object: 'ЖК Царская площадь', date: '15.01.24', status: 'Подписан' },
  { id: 'r3', title: 'Дефектная ведомость', object: 'ЖК Царская площадь', date: '12.01.24', status: 'Согласовано' },
  { id: 'r4', title: 'Наряд-допуск', object: 'ЖК Царская площадь', date: '10.01.24', status: 'Активен' },
];

export default function ReportsPage() {
  const [search, setSearch] = useState('');

  const filtered = DEMO_REPORTS.filter(
    (r) => r.title.toLowerCase().includes(search.toLowerCase()) || r.object.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 px-6 py-4">
        <h1 className="text-2xl font-light mb-4">Отчеты и документы</h1>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="field-input"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto mb-4">
          {['Все', 'КС-2', 'КС-3', 'Ведомости', 'Наряды'].map((f) => (
            <button key={f} className="shrink-0 px-3 py-1.5 rounded-xl text-xs bg-[#d9d9d9] text-black">
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="border border-[#d9d9d9] rounded-xl p-4">
              <div className="flex items-start justify-between mb-1">
                <span className="font-medium text-base">{r.title}</span>
                <span className="text-xs text-gray-500 ml-2 shrink-0">{r.date}</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">{r.object}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">{r.status}</span>
                <div className="flex gap-2">
                  <button type="button" className="text-xs border border-gray-300 rounded-lg px-3 py-1.5">
                    Просмотр
                  </button>
                  <button type="button" className="text-xs border border-gray-300 rounded-lg px-3 py-1.5">
                    Скачать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
