'use client';

import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '../../../../../../../components/layout/AppHeader';

const DEMO_WINDOWS = [
  { id: 'w1', number: 1, totalArea: 4.2, remarksCount: 2, scratchesHeight: 3.0, scaleHeight: 0.75, changesHeight: 2.5, scratchesGround: 5.0, scaleGround: 1.25 },
  { id: 'w2', number: 2, totalArea: 4.2, remarksCount: 0, scratchesHeight: 2.0, scaleHeight: 0.5, changesHeight: 1.5, scratchesGround: 3.0, scaleGround: 0.8 },
];

export default function StatementViewPage() {
  const { objectId, status, statementId } = useParams<{
    objectId: string; status: string; statementId: string;
  }>();
  const router = useRouter();

  const totalArea = DEMO_WINDOWS.reduce((s, w) => s + w.totalArea, 0);
  const totalScratchesH = DEMO_WINDOWS.reduce((s, w) => s + w.scratchesHeight, 0);
  const totalScaleH = DEMO_WINDOWS.reduce((s, w) => s + w.scaleHeight, 0);
  const totalChanges = DEMO_WINDOWS.reduce((s, w) => s + w.changesHeight, 0);
  const totalScratchesG = DEMO_WINDOWS.reduce((s, w) => s + w.scratchesGround, 0);
  const totalScaleG = DEMO_WINDOWS.reduce((s, w) => s + w.scaleGround, 0);
  const totalRemarks = DEMO_WINDOWS.reduce((s, w) => s + w.remarksCount, 0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <div className="flex-1 px-6 py-4 pb-10">
        <h1 className="text-2xl font-light mb-1">Просмотр ведомости</h1>
        <p className="text-sm text-gray-500 mb-6">Кв 123, корп. ЮГ, эт. 12 — 12.01.24</p>

        {/* Header info */}
        <div className="bg-[#f5f5f5] rounded-xl p-4 mb-6 space-y-2 text-sm">
          <Row label="Объект" value="ЖК Царская площадь" />
          <Row label="Исполнитель" value="Бригадиренко С." />
          <Row label="Доступ" value="Ключ" />
          <Row label="Дата дефектовки" value="12.01.24" />
          <Row label="Дата приемки" value="15.01.24" />
          <Row label="Статус" value="Согласовано" />
        </div>

        {/* Summary */}
        <div className="border-b border-[#d9d9d9] pb-4 mb-4">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-bold">{totalArea.toFixed(1)}</span>
            <span className="text-base text-gray-500 mb-1">м²</span>
            <span className="text-sm text-gray-500 mb-1">Общая площадь ({DEMO_WINDOWS.length} ОБ)</span>
          </div>
          {totalRemarks > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#E8820C] flex items-center justify-center text-white text-xs font-bold">{totalRemarks}</div>
              <span className="text-sm text-[#E8820C]">замечаний</span>
            </div>
          )}
        </div>

        {/* Height */}
        <h3 className="text-center text-lg font-semibold mb-3">Высотные работы</h3>
        <div className="space-y-3 mb-6">
          <StatRow icon="(+)" label="Царапины" value={totalScratchesH} unit="м²" isHeight />
          <StatRow icon="(о)" label="Окалины" value={totalScaleH} unit="м²" isHeight />
          <StatRow icon="" label="Смены" value={totalChanges} unit="дней" />
        </div>

        {/* Ground */}
        <h3 className="text-center text-lg font-semibold mb-3">Наземные работы</h3>
        <div className="space-y-3 mb-8">
          <StatRow icon="+,−" label="Царапины" value={totalScratchesG} unit="м²" />
          <StatRow icon="о" label="Окалины" value={totalScaleG} unit="м²" />
        </div>

        {/* Window list */}
        <h3 className="text-lg font-semibold mb-3">Оконные блоки</h3>
        <div className="space-y-3 mb-8">
          {DEMO_WINDOWS.map((w) => (
            <div key={w.id} className="border border-[#d9d9d9] rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">ОБ №{w.number}</span>
                <span className="text-sm text-gray-500">{w.totalArea.toFixed(1)} м²</span>
              </div>
              {w.remarksCount > 0 && (
                <div className="flex items-center gap-1 text-[#E8820C] text-sm">
                  <span>!</span>
                  <span>{w.remarksCount} замечания</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button type="button" className="btn-secondary rounded-xl w-full py-4 flex items-center justify-center gap-3">
            <span className="text-xl">Распечатать</span>
          </button>
          <button type="button" className="btn-secondary rounded-xl w-full py-4 flex items-center justify-center gap-3">
            <span className="text-xl">Экспорт PDF</span>
          </button>
          <button type="button" onClick={() => router.back()} className="btn-primary rounded-xl w-full py-4 text-center text-xl">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function StatRow({ icon, label, value, unit, isHeight = false }: {
  icon: string; label: string; value: number; unit: string; isHeight?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className={`text-base font-medium w-20 ${isHeight ? 'text-red-500' : ''}`}>{label}</span>
      {icon && (
        <span className={`text-xs border rounded-full w-9 h-9 flex items-center justify-center font-bold ${
          isHeight ? 'border-red-400 text-red-400' : 'border-black text-black'
        }`}>
          {icon}
        </span>
      )}
      <span className="text-xl font-light ml-auto">{value.toFixed(2)}</span>
      <span className="text-sm text-gray-500 w-10">{unit}</span>
    </div>
  );
}
