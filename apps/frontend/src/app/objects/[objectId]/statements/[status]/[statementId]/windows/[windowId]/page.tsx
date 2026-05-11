'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '../../../../../../../../components/layout/AppHeader';

type DefectType = 'scratch' | 'scale' | 'normal';
type DefectHeight = 'height' | 'ground';

interface DefectMarker {
  id: string;
  x: number; // 0-100% relative to pane
  y: number; // 0-100%
  type: DefectType;
  height: DefectHeight;
  pane: number; // 0-3 (4 sections of window)
}

const DEFECT_ICONS: Record<DefectType, Record<DefectHeight, string>> = {
  scratch: { height: '(+)', ground: '+,-' },
  scale: { height: '(о)', ground: 'о' },
  normal: { height: 'Н', ground: 'Н' },
};

const DEFECT_COLORS: Record<DefectType, string> = {
  scratch: 'text-red-500',
  scale: 'text-gray-700',
  normal: 'text-green-600',
};

// Демо маркеры дефектов
const INITIAL_MARKERS: DefectMarker[] = [
  { id: '1', x: 25, y: 20, type: 'scratch', height: 'height', pane: 0 },
  { id: '2', x: 70, y: 30, type: 'scratch', height: 'ground', pane: 1 },
  { id: '3', x: 30, y: 65, type: 'scale', height: 'height', pane: 2 },
  { id: '4', x: 65, y: 70, type: 'scale', height: 'ground', pane: 3 },
  { id: '5', x: 50, y: 45, type: 'normal', height: 'ground', pane: 0 },
];

export default function WindowParamsPage() {
  const { objectId, status, statementId, windowId } = useParams<{
    objectId: string; status: string; statementId: string; windowId: string;
  }>();
  const router = useRouter();

  const windowNumber = windowId === 'new' ? '?' : windowId === 'w1' ? 1 : 2;
  const [markers, setMarkers] = useState<DefectMarker[]>(INITIAL_MARKERS);
  const [otherExecutor, setOtherExecutor] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedType, setSelectedType] = useState<DefectType>('scratch');
  const [selectedHeight, setSelectedHeight] = useState<DefectHeight>('height');

  const scratchesHeight = 3.0;
  const scaleHeight = 0.75;
  const changesHeight = 2.5;
  const scratchesGround = 5.0;
  const scaleGround = 1.25;
  const totalArea = 4.2;
  const groundExceedsTotal = scratchesGround > totalArea;

  const handleSchemaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newMarker: DefectMarker = {
      id: Date.now().toString(),
      x, y,
      type: selectedType,
      height: selectedHeight,
      pane: x < 50 ? (y < 50 ? 0 : 2) : (y < 50 ? 1 : 3),
    };
    setMarkers((prev) => [...prev, newMarker]);
  };

  const removeMarker = (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 px-6 py-4 pb-8">
        {/* Номер блока */}
        <div className="mb-4">
          <p className="text-lg text-gray-500">Оконный блок №</p>
          <div className="field-input text-center text-2xl font-bold mt-1">
            {windowNumber}
          </div>
        </div>

        {/* Схема оконного блока */}
        <div className="mb-4">
          {markers.some((m) => m.type !== 'normal') && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#E8820C] flex items-center justify-center text-white text-xs font-bold">!</div>
              <span className="text-sm text-[#E8820C]">кол-во замечаний: {markers.filter((m) => m.type !== 'normal').length}</span>
            </div>
          )}

          <div
            className="relative w-full aspect-[3/4] border-2 border-gray-500 bg-gray-50 rounded-sm cursor-crosshair"
            onClick={handleSchemaClick}
          >
            {/* Сетка окна — вертикальная и горизонтальная линии */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500 -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-500 -translate-y-1/2" />
            {/* Внутренние деления (импосты) */}
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-300" />
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-300" />
            <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-300" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-300" />

            {/* Маркеры Б (балкон) и Н (норма) в заголовках секций */}
            <div className="absolute top-2 left-2 text-xs font-bold text-gray-500">1</div>
            <div className="absolute top-2 right-8 text-xs font-bold text-gray-500">3</div>
            <div className="absolute bottom-8 left-2 text-xs font-bold text-gray-500">2</div>
            <div className="absolute bottom-8 right-8 text-xs font-bold text-gray-500">4</div>

            {/* Метка Б (балкон) */}
            <div className="absolute top-1/2 left-2 -translate-y-1/2 text-xs font-bold text-gray-700">Б</div>
            {/* Метка Н (норма) */}
            <div className="absolute bottom-4 left-1/4 text-xs font-bold text-green-600">Н</div>
            <div className="absolute bottom-4 right-1/4 text-xs font-bold text-green-600">Н</div>

            {/* Дефектные маркеры */}
            {markers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                onClick={(e) => { e.stopPropagation(); if (editMode) removeMarker(marker.id); }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold ${DEFECT_COLORS[marker.type]} hover:scale-125 transition-transform`}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              >
                {DEFECT_ICONS[marker.type][marker.height]}
              </button>
            ))}
          </div>
        </div>

        {/* Инструменты редактирования */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            className={editMode ? 'btn-primary rounded-xl' : 'btn-secondary rounded-xl'}
          >
            {editMode ? '✓ Редактирование активно' : 'Редактировать схему'}
          </button>

          {editMode && (
            <div className="space-y-2 bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Тип дефекта:</p>
              <div className="flex gap-2">
                {(['scratch', 'scale', 'normal'] as DefectType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${selectedType === t ? 'bg-[#888888] text-white border-[#888888]' : 'border-gray-300'}`}
                  >
                    {t === 'scratch' ? 'Царапины' : t === 'scale' ? 'Окалины' : 'Норма'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {(['height', 'ground'] as DefectHeight[]).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSelectedHeight(h)}
                    className={`flex-1 py-2 rounded-lg text-sm border ${selectedHeight === h ? 'bg-[#888888] text-white border-[#888888]' : 'border-gray-300'}`}
                  >
                    {h === 'height' ? 'Высотные' : 'Наземные'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="button" className="btn-secondary rounded-xl">
            Параметры СТП
          </button>

          <button type="button" className="btn-secondary flex items-center justify-center gap-2 rounded-xl w-full">
            <span>Фото ОБ с маркерами дефектов</span>
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
              <rect x="1" y="4" width="20" height="13" rx="2" stroke="black" strokeWidth="1.5"/>
              <path d="M7 4 L8 1 L14 1 L15 4" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="11" cy="11" r="4" stroke="black" strokeWidth="1.5"/>
              <circle cx="11" cy="11" r="2" fill="black" fillOpacity="0.3"/>
            </svg>
          </button>
        </div>

        {/* Площадь ОБ */}
        <div className="border-b border-[#d9d9d9] pb-2 mb-4">
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{totalArea.toFixed(1)}</span>
            <span className="text-base text-gray-500 mb-0.5">м²</span>
            <span className="text-sm text-gray-500 mb-0.5 ml-1">Площадь оконного блока (всех СТП)</span>
          </div>
        </div>

        {/* Высотные работы */}
        <h3 className="text-center text-xl font-semibold mb-3">Высотные работы</h3>
        <div className="space-y-3 mb-6">
          <WindowStatRow label="Царапины" icon="(+)" value={scratchesHeight} unit="м²" isHeight />
          <WindowStatRow label="Окалины" icon="(о)" value={scaleHeight} unit="м²" isHeight />
          <WindowStatRow label="Смены" icon="" value={changesHeight} unit="дней" />
        </div>

        {/* Наземные работы */}
        <h3 className="text-center text-xl font-semibold mb-3">Наземные работы</h3>
        {groundExceedsTotal && (
          <div className="text-red-500 text-sm mb-2 font-medium">
            Рабочая площадь превышает площадь всего ОБ !
          </div>
        )}
        <div className="space-y-3 mb-6">
          <WindowStatRow label="Царапины" icon="+,−" value={scratchesGround} unit="м²" hasError={groundExceedsTotal} />
          <WindowStatRow label="Окалины" icon="о" value={scaleGround} unit="м²" />
        </div>

        {/* Другой исполнитель */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base">Другой исполнитель для ОБ</span>
          <button
            type="button"
            onClick={() => setOtherExecutor(!otherExecutor)}
            className={`relative w-12 h-7 rounded-full transition-colors ${otherExecutor ? 'bg-[#888888]' : 'bg-[#d9d9d9]'}`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${otherExecutor ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {otherExecutor && (
          <div className="field-input mb-4">
            Бригадиренко С.
          </div>
        )}

        {/* Сохранить */}
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-primary rounded-xl"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

function WindowStatRow({ label, icon, value, unit, isHeight = false, hasError = false }: {
  label: string; icon: string; value: number; unit: string; isHeight?: boolean; hasError?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-base font-medium w-24 ${hasError ? 'text-red-500' : ''}`}>{label}</span>
      {icon && (
        <span className={`text-sm border rounded-full w-9 h-9 flex-shrink-0 flex items-center justify-center font-bold ${
          isHeight ? 'border-red-400 text-red-400' : hasError ? 'border-red-500 text-red-500' : 'border-black text-black'
        }`}>
          {icon}
        </span>
      )}
      <input
        type="number"
        defaultValue={value}
        step="0.01"
        className="ml-auto w-20 bg-transparent text-xl font-light text-right border-b border-[#d9d9d9] focus:outline-none focus:border-gray-500"
      />
      <span className="text-base text-gray-500 w-10">{unit}</span>
    </div>
  );
}
