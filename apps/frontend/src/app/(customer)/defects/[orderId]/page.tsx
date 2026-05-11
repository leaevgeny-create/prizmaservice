'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { defectsApi } from '../../../../lib/api';
import { DefectItem, WorkType, WORK_TYPE_LABELS } from '../../../../types';
import { Plus, Trash2, Upload, CheckCircle, AlertCircle, Image } from 'lucide-react';

const UNITS = ['кв.м', 'пог.м', 'шт.', 'кг', 'л', 'м³'];

export default function DefectStatementPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();

  const { data: statements } = useQuery({
    queryKey: ['defects', orderId],
    queryFn: () => defectsApi.findByOrder(orderId).then((r) => r.data),
  });

  const [items, setItems] = useState<Omit<DefectItem, 'id'>[]>([
    { lineNumber: 1, location: '', workType: 'GLASS_GRINDING', description: '', unit: 'кв.м', quantity: 0 },
  ]);
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<number, string[]>>({});

  const createMutation = useMutation({
    mutationFn: () =>
      defectsApi.create(orderId, {
        items: items.map((item, i) => ({ ...item, lineNumber: i + 1 })),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects', orderId] }),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => defectsApi.submit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defects', orderId] }),
  });

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      { lineNumber: prev.length + 1, location: '', workType: 'GLASS_GRINDING', description: '', unit: 'кв.м', quantity: 0 },
    ]);

  const removeRow = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx).map((item, i) => ({ ...item, lineNumber: i + 1 })));

  const updateRow = <K extends keyof Omit<DefectItem, 'id'>>(idx: number, field: K, value: Omit<DefectItem, 'id'>[K]) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const totalArea = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const onDropPhoto = useCallback(
    async (files: File[], rowIdx: number, statementItemId?: string) => {
      if (!statementItemId) return;
      for (const file of files) {
        const res = await defectsApi.uploadPhoto(statementItemId, file);
        setUploadingPhotos((prev) => ({
          ...prev,
          [rowIdx]: [...(prev[rowIdx] || []), res.data.url],
        }));
      }
    },
    [],
  );

  const latestStatement = statements?.[statements.length - 1];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ведомость дефектов и объёмов работ</h1>
        <p className="text-gray-500 mt-1">Заявка #{orderId}</p>
      </div>

      {/* История ведомостей */}
      {statements && statements.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">История версий</h2>
          <div className="space-y-2">
            {statements.map((stmt: any) => (
              <div key={stmt.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="font-medium">Версия {stmt.version}</span>
                  <span className="text-gray-400 text-sm ml-3">
                    {new Date(stmt.createdAt).toLocaleDateString('ru')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {stmt.status === 'APPROVED' && (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" /> Согласована
                    </span>
                  )}
                  {stmt.status === 'REVISION' && (
                    <span className="flex items-center gap-1 text-orange-600 text-sm">
                      <AlertCircle className="w-4 h-4" /> Доработка: {stmt.comment}
                    </span>
                  )}
                  {stmt.status === 'SUBMITTED' && (
                    <span className="text-blue-600 text-sm">На согласовании</span>
                  )}
                  {stmt.status === 'DRAFT' && (
                    <button
                      onClick={() => submitMutation.mutate(stmt.id)}
                      className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                    >
                      Отправить на согласование
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Форма новой ведомости */}
      <div className="bg-white rounded-xl border">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Новая ведомость (Версия {(statements?.length ?? 0) + 1})
          </h2>
          <span className="text-sm text-gray-500">Итого: {totalArea.toFixed(2)} кв.м</span>
        </div>

        {/* Таблица дефектов */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3 w-10">№</th>
                <th className="px-4 py-3">Место (этаж/секция)</th>
                <th className="px-4 py-3">Вид работ</th>
                <th className="px-4 py-3">Описание дефекта</th>
                <th className="px-4 py-3 w-20">Ед. изм.</th>
                <th className="px-4 py-3 w-24">Объём</th>
                <th className="px-4 py-3 w-20">Фото</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, idx) => (
                <DefectRow
                  key={idx}
                  item={item}
                  idx={idx}
                  photos={uploadingPhotos[idx] || []}
                  onUpdate={updateRow}
                  onRemove={removeRow}
                  onDropPhoto={onDropPhoto}
                  canRemove={items.length > 1}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Добавить строку */}
        <div className="p-4 border-t">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 text-blue-600 text-sm hover:text-blue-800 font-medium"
          >
            <Plus className="w-4 h-4" />
            Добавить строку
          </button>
        </div>

        {/* Кнопки */}
        <div className="p-5 border-t flex gap-3 justify-end">
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 hover:bg-gray-50"
          >
            Сохранить черновик
          </button>
          <button
            onClick={async () => {
              const res = await createMutation.mutateAsync();
              await submitMutation.mutateAsync(res.data.id);
            }}
            disabled={createMutation.isPending || submitMutation.isPending}
            className="bg-blue-600 text-white rounded-lg px-5 py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            Сохранить и отправить на согласование
          </button>
        </div>
      </div>
    </div>
  );
}

function DefectRow({
  item, idx, photos, onUpdate, onRemove, onDropPhoto, canRemove,
}: {
  item: Omit<DefectItem, 'id'>;
  idx: number;
  photos: string[];
  onUpdate: (idx: number, field: any, value: any) => void;
  onRemove: (idx: number) => void;
  onDropPhoto: (files: File[], idx: number, id?: string) => void;
  canRemove: boolean;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => onDropPhoto(files, idx),
  });

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 text-gray-400 text-sm">{idx + 1}</td>
      <td className="px-2 py-2">
        <input
          value={item.location}
          onChange={(e) => onUpdate(idx, 'location', e.target.value)}
          placeholder="Эт. 3, секция B"
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
        />
      </td>
      <td className="px-2 py-2">
        <select
          value={item.workType}
          onChange={(e) => onUpdate(idx, 'workType', e.target.value as WorkType)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
        >
          {(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((wt) => (
            <option key={wt} value={wt}>{WORK_TYPE_LABELS[wt]}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <input
          value={item.description}
          onChange={(e) => onUpdate(idx, 'description', e.target.value)}
          placeholder="Царапины, сколы стекла..."
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
        />
      </td>
      <td className="px-2 py-2">
        <select
          value={item.unit}
          onChange={(e) => onUpdate(idx, 'unit', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
        >
          {['кв.м', 'пог.м', 'шт.', 'м²'].map((u) => <option key={u}>{u}</option>)}
        </select>
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={item.quantity}
          min={0}
          step={0.01}
          onChange={(e) => onUpdate(idx, 'quantity', parseFloat(e.target.value) || 0)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 text-right"
        />
      </td>
      <td className="px-2 py-2">
        <div
          {...getRootProps()}
          className={`flex items-center justify-center w-16 h-9 border-2 border-dashed rounded cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          {photos.length > 0 ? (
            <span className="text-xs text-blue-600 font-medium">{photos.length}</span>
          ) : (
            <Image className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </td>
      <td className="px-2 py-2">
        {canRemove && (
          <button onClick={() => onRemove(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}
