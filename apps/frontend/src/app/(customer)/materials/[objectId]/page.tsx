'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsApi } from '../../../../lib/api';
import { MaterialStock } from '../../../../types';
import { Package, ArrowDownLeft, ArrowUpRight, Minus, Plus } from 'lucide-react';

const MOVEMENT_TYPES = [
  { value: 'ISSUE', label: 'Выдача исполнителю', icon: <ArrowDownLeft className="w-4 h-4 text-orange-500" /> },
  { value: 'RETURN', label: 'Возврат от исполнителя', icon: <ArrowUpRight className="w-4 h-4 text-blue-500" /> },
  { value: 'WRITEOFF', label: 'Списание', icon: <Minus className="w-4 h-4 text-red-500" /> },
];

export default function MaterialsPage() {
  const { objectId } = useParams<{ objectId: string }>();
  const queryClient = useQueryClient();
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MaterialStock | null>(null);
  const [movementForm, setMovementForm] = useState({ type: 'ISSUE', quantity: '', orderId: '' });

  const { data: stocks, isLoading } = useQuery<MaterialStock[]>({
    queryKey: ['materials', objectId],
    queryFn: () => materialsApi.findByObject(objectId).then((r) => r.data),
  });

  const createMovement = useMutation({
    mutationFn: () =>
      materialsApi.createMovement({
        stockId: selectedStock!.id,
        type: movementForm.type,
        quantity: parseFloat(movementForm.quantity),
        orderId: movementForm.orderId,
        date: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', objectId] });
      setShowMovementModal(false);
    },
  });

  const { data: movements } = useQuery({
    queryKey: ['material-movements', selectedStock?.id],
    queryFn: () => materialsApi.findMovements(selectedStock!.id).then((r) => r.data),
    enabled: !!selectedStock,
  });

  if (isLoading) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Давальческие материалы</h1>
          <p className="text-gray-500 mt-1">Учёт и движение материалов на объекте</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-4 h-4" />
          Добавить материал
        </button>
      </div>

      {/* Сводка остатков */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stocks?.map((stock) => (
          <div
            key={stock.id}
            onClick={() => setSelectedStock(selectedStock?.id === stock.id ? null : stock)}
            className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
              selectedStock?.id === stock.id ? 'border-blue-400 shadow-sm' : 'hover:border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{stock.name}</p>
                {stock.article && <p className="text-xs text-gray-400">Арт. {stock.article}</p>}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Number(stock.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">{stock.unit} — остаток</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStock(stock);
                  setShowMovementModal(true);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Движение
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* История движений для выбранного материала */}
      {selectedStock && movements && (
        <div className="bg-white rounded-xl border">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-gray-900">История движений: {selectedStock.name}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-5 py-3">Тип операции</th>
                  <th className="px-5 py-3">Дата</th>
                  <th className="px-5 py-3 text-right">Количество</th>
                  <th className="px-5 py-3">Накладная</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movements.map((mv: any) => {
                  const type = MOVEMENT_TYPES.find((t) => t.value === mv.type);
                  return (
                    <tr key={mv.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2">
                          {type?.icon}
                          {type?.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {new Date(mv.date).toLocaleDateString('ru')}
                      </td>
                      <td className={`px-5 py-3 text-right font-medium ${
                        mv.type === 'ISSUE' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {mv.type === 'ISSUE' ? '-' : '+'}{Number(mv.quantity).toFixed(2)} {selectedStock.unit}
                      </td>
                      <td className="px-5 py-3">
                        {mv.invoiceUrl ? (
                          <a href={mv.invoiceUrl} className="text-blue-600 hover:underline text-xs">
                            Скачать
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Модальное окно движения материала */}
      {showMovementModal && selectedStock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Движение материала</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedStock.name} · Остаток: {selectedStock.quantity} {selectedStock.unit}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип операции</label>
                <select
                  value={movementForm.type}
                  onChange={(e) => setMovementForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {MOVEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество ({selectedStock.unit})
                </label>
                <input
                  type="number"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm((p) => ({ ...p, quantity: e.target.value }))}
                  min={0}
                  step={0.01}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2.5 text-gray-700"
                >
                  Отмена
                </button>
                <button
                  onClick={() => createMovement.mutate()}
                  disabled={!movementForm.quantity || createMovement.isPending}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
