'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AppHeader } from '../../../../../components/layout/AppHeader';
import { defectsApi } from '../../../../../lib/api';

interface FormData {
  corps: string;
  floor: string;
  room: string;
  executorName: string;
  access: string;
  accessContact: string;
  defectDate: string;
  acceptDate: string;
  onlyHeight: boolean;
  onlyGround: boolean;
}

const ACCESS_OPTIONS = ['Ключ', 'Код', 'Карта доступа', 'Открыто', 'Другое'];

export default function NewStatementPage() {
  const { objectId } = useParams<{ objectId: string }>();
  const router = useRouter();
  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      defectDate: new Date().toLocaleDateString('ru').replace(/\./g, '.'),
      acceptDate: new Date(Date.now() + 3 * 86400000).toLocaleDateString('ru'),
      onlyHeight: false,
      onlyGround: false,
    },
  });

  const [showAccessDropdown, setShowAccessDropdown] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onlyHeight = watch('onlyHeight');
  const onlyGround = watch('onlyGround');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await defectsApi.create(objectId, {
        ...data,
        access: selectedAccess,
      });
      router.push(`/objects/${objectId}/statements/in_work/${res.data.id}/windows`);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 px-8 py-4">
        <h1 className="text-2xl font-light mb-6">Дефектная ведомость</h1>

        <div className="space-y-5">
          {/* Объект (dropdown — заглушка) */}
          <div>
            <label className="block text-lg mb-2">Объект</label>
            <div className="field-input flex items-center justify-between cursor-pointer">
              <span className="text-gray-400">-Выбрать-</span>
              <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                <path d="M1 1 L7 8 L13 1" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Корпус */}
          <div>
            <label className="block text-lg mb-2">Корпус</label>
            <input {...register('corps')} className="field-input" placeholder="" />
          </div>

          {/* Этаж */}
          <div>
            <label className="block text-lg mb-2">Этаж</label>
            <input {...register('floor')} type="number" className="field-input" inputMode="numeric" />
          </div>

          {/* Номер помещения */}
          <div>
            <label className="block text-lg mb-2">Номер помещения</label>
            <input {...register('room')} className="field-input" />
          </div>

          {/* Доступ в помещение */}
          <div className="relative">
            <label className="block text-lg mb-2">Доступ в помещение</label>
            <div
              className="field-input flex items-center justify-between cursor-pointer"
              onClick={() => setShowAccessDropdown(!showAccessDropdown)}
            >
              <span className={selectedAccess ? 'text-black' : 'text-gray-400'}>
                {selectedAccess || '-Изменить-'}
              </span>
              <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                <path d="M1 1 L7 8 L13 1" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            {showAccessDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1">
                {ACCESS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className="w-full text-left px-4 py-3 text-lg hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    onClick={() => {
                      setSelectedAccess(opt);
                      setShowAccessDropdown(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Другой контакт для доступа */}
          <div>
            <label className="block text-lg mb-2">Другой контакт для доступа</label>
            <input
              {...register('accessContact')}
              type="tel"
              className="field-input"
              placeholder="+7 __________"
              inputMode="tel"
            />
          </div>

          {/* ФИО исполнителя */}
          <div>
            <label className="block text-lg mb-2">ФИО исполнителя</label>
            <input {...register('executorName')} className="field-input" />
          </div>

          {/* Дата дефектовки */}
          <div>
            <label className="block text-lg mb-2">Дата дефектовки</label>
            <div className="field-input text-center text-xl">
              {new Date().toLocaleDateString('ru')}
            </div>
          </div>

          {/* Дата приемки */}
          <div>
            <label className="block text-lg mb-2">Дата приемки</label>
            <div className="field-input text-center text-xl">
              {new Date(Date.now() + 3 * 86400000).toLocaleDateString('ru')}
            </div>
          </div>

          {/* Переключатели */}
          <div className="space-y-3">
            <Toggle
              label="Ведомость только для высотных работ"
              checked={onlyHeight}
              onChange={(v) => {
                setValue('onlyHeight', v);
                if (v) setValue('onlyGround', false);
              }}
            />
            <Toggle
              label="Ведомость только для наземных работ"
              checked={onlyGround}
              onChange={(v) => {
                setValue('onlyGround', v);
                if (v) setValue('onlyHeight', false);
              }}
            />
          </div>

          {/* Кнопка перехода к оконным блокам */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-4 disabled:opacity-50"
          >
            Оконные блоки
          </button>
        </div>
      </form>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-base leading-snug flex-1">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-[#888888]' : 'bg-[#d9d9d9]'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
