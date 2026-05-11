'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '../../../../../../../components/layout/AppHeader';

// Моковые данные оконных блоков
const DEMO_WINDOWS = [
  { id: 'w1', number: 1, totalArea: 4.2, remarksCount: 2, scratchesHeight: 3.0, scaleHeight: 0.75, changesHeight: 2.5, scratchesGround: 5.0, scaleGround: 1.25, groundExceedsTotal: true },
  { id: 'w2', number: 2, totalArea: 4.2, remarksCount: 0, scratchesHeight: 2.0, scaleHeight: 0.5, changesHeight: 1.5, scratchesGround: 3.0, scaleGround: 0.8, groundExceedsTotal: false },
];

export default function WindowBlocksPage() {
  const { objectId, status, statementId } = useParams<{
    objectId: string; status: string; statementId: string;
  }>();

  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [statementStatus, setStatementStatus] = useState('Не согласовано');
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const totalArea = DEMO_WINDOWS.reduce((s, w) => s + w.totalArea, 0);

  const STATUS_OPTIONS = ['Согласовано', 'Не согласовано', 'В работе', 'Готово к сдаче', 'Принято заказчиком'];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 px-4 py-4">
        <p className="text-base text-gray-500 px-4 mb-4">Оконные блоки</p>

        {/* Схемы оконных блоков */}
        <div className="flex gap-4 overflow-x-auto px-4 mb-6">
          {DEMO_WINDOWS.map((w) => (
            <Link
              key={w.id}
              href={`/objects/${objectId}/statements/${status}/${statementId}/windows/${w.id}`}
            >
              <WindowSchemaPreview window={w} />
            </Link>
          ))}
          {/* Добавить ОБ */}
          <Link href={`/objects/${objectId}/statements/${status}/${statementId}/windows/new`}>
            <div className="btn-primary w-40 py-3 rounded-xl text-base text-center flex-shrink-0 mt-4">
              Добавить ОБ
            </div>
          </Link>
        </div>

        {/* Суммарная площадь */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between border-b border-[#d9d9d9] pb-2 mb-2">
            <span className="text-base text-gray-500">Оконные блоки</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{totalArea.toFixed(1)}</span>
            <span className="text-base text-gray-500 mb-1">м²</span>
            <span className="text-base text-gray-500 mb-1 ml-2">Суммарная площадь стекол (всех ОБ)</span>
          </div>
        </div>

        {/* Рабочая площадь */}
        <div className="px-4 mb-2">
          <div className="flex items-center justify-between border-b border-[#d9d9d9] pb-1 mb-4">
            <span className="text-base text-gray-500">Рабочая площадь</span>
          </div>

          {/* Высотные работы */}
          <h3 className="text-center text-xl font-semibold mb-4">Высотные работы</h3>
          <div className="space-y-3 mb-6">
            <StatRow icon="(+)" label="Царапины" value={DEMO_WINDOWS.reduce((s, w) => s + w.scratchesHeight, 0)} unit="м²" isHeight />
            <StatRow icon="(о)" label="Окалины" value={DEMO_WINDOWS.reduce((s, w) => s + w.scaleHeight, 0)} unit="м²" isHeight />
            <StatRow icon="" label="Смены" value={DEMO_WINDOWS.reduce((s, w) => s + w.changesHeight, 0)} unit="дней" />
          </div>

          {/* Наземные работы */}
          <h3 className="text-center text-xl font-semibold mb-4">Наземные работы</h3>
          <div className="space-y-3 mb-6">
            <StatRow icon="+,−" label="Царапины" value={DEMO_WINDOWS.reduce((s, w) => s + w.scratchesGround, 0)} unit="м²" />
            <StatRow icon="о" label="Окалины" value={DEMO_WINDOWS.reduce((s, w) => s + w.scaleGround, 0)} unit="м²" />
          </div>
        </div>

        {/* Комментарий к ведомости */}
        <div className="px-4 mb-4">
          <div className="border border-[#d9d9d9] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setCommentOpen(!commentOpen)}
              className="w-full flex items-center justify-between px-4 py-4 bg-[#d9d9d9]"
            >
              <span className="text-lg">Оставить комментарий к ведомости</span>
              <div className={`w-12 h-7 rounded-full ${commentOpen ? 'bg-[#888888]' : 'bg-white border border-gray-300'} relative transition-colors`}>
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${commentOpen ? 'translate-x-6' : 'translate-x-1'} ${commentOpen ? '' : 'bg-[#d9d9d9]'}`} />
              </div>
            </button>
            {commentOpen && (
              <div className="px-4 py-3 bg-[#f0f0f0]">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-transparent resize-none text-base focus:outline-none min-h-[80px]"
                  placeholder="Введите комментарий..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Статус ведомости */}
        <div className="px-4 mb-6 relative">
          <p className="text-lg mb-2">Статус ведомости</p>
          <button
            type="button"
            onClick={() => setShowStatusPicker(!showStatusPicker)}
            className="field-input flex items-center justify-between"
          >
            <span>{statementStatus || '-Изменить-'}</span>
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
              <path d="M1 1 L7 8 L13 1" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {showStatusPicker && (
            <div className="absolute left-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="w-full text-left px-4 py-3 text-lg hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  onClick={() => { setStatementStatus(s); setShowStatusPicker(false); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="px-4 space-y-3 pb-8">
          <Link href={`/objects/${objectId}/statements/${status}/${statementId}/view`}>
            <div className="btn-secondary flex items-center justify-center gap-3 rounded-xl py-4">
              <span className="text-xl">Просмотр</span>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="black" strokeWidth="1.5"/>
                <circle cx="11" cy="11" r="4" stroke="black" strokeWidth="1.5"/>
              </svg>
            </div>
          </Link>
          <button className="btn-secondary flex items-center justify-center gap-3 rounded-xl py-4 w-full">
            <span className="text-xl">Распечатать</span>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="4" y="7" width="14" height="10" rx="2" stroke="black" strokeWidth="1.5"/>
              <path d="M7 7 L7 4 L15 4 L15 7" stroke="black" strokeWidth="1.5"/>
              <rect x="7" y="12" width="8" height="4" rx="1" fill="black" fillOpacity="0.2" stroke="black" strokeWidth="1"/>
            </svg>
          </button>
          <button className="btn-secondary flex items-center justify-center gap-3 rounded-xl py-4 w-full">
            <span className="text-xl">Экспорт</span>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 4 L11 14M7 10 L11 14 L15 10" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 16 L4 18 L18 18 L18 16" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function WindowSchemaPreview({ window: w }: { window: typeof DEMO_WINDOWS[0] }) {
  return (
    <div className="flex-shrink-0 w-36 relative">
      <div className="text-center text-base font-medium mb-2">{w.number}</div>
      {/* Схема окна */}
      <div className="relative w-full aspect-[2/3] border-2 border-gray-400 rounded-sm bg-gray-50 overflow-hidden">
        {/* Вертикальная линия посередине */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400" />
        {/* Горизонтальная линия */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400" />
        {/* Маркеры дефектов — символические */}
        <div className="absolute top-3 left-3 text-red-500 text-xs font-bold">(+)</div>
        <div className="absolute top-8 right-3 text-red-500 text-xs font-bold">+</div>
        <div className="absolute bottom-3 left-3 text-gray-600 text-xs">(о)</div>
        <div className="absolute bottom-8 right-3 text-gray-600 text-xs">о</div>
        {/* Буква Н — норма */}
        <div className="absolute top-1/2 left-3 text-green-600 text-xs font-bold -translate-y-1/2">Н</div>
      </div>
      {/* Кол-во замечаний */}
      {w.remarksCount > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <div className="w-5 h-5 rounded-full bg-[#E8820C] flex items-center justify-center text-white text-xs">!</div>
          <span className="text-sm">кол-во замечаний: {w.remarksCount}</span>
        </div>
      )}
    </div>
  );
}

function StatRow({ icon, label, value, unit, isHeight = false }: {
  icon: string; label: string; value: number; unit: string; isHeight?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className={`text-lg font-medium w-16 ${isHeight ? 'text-red-500' : 'text-black'}`}>{label}</span>
      {icon && (
        <span className={`text-base border rounded-full w-9 h-9 flex items-center justify-center text-xs font-bold ${
          isHeight ? 'border-red-400 text-red-400' : 'border-black text-black'
        }`}>
          {icon}
        </span>
      )}
      <span className="text-xl font-light ml-auto">{value.toFixed(2)}</span>
      <span className="text-base text-gray-500 w-12">{unit}</span>
    </div>
  );
}
