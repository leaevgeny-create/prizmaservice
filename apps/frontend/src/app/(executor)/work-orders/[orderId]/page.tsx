'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersApi } from '../../../../lib/api';
import { AlertTriangle, CheckCircle, Clock, Fingerprint, Shield, Users } from 'lucide-react';
import dayjs from 'dayjs';

export default function WorkOrdersPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();
  const [signingId, setSigningId] = useState<string | null>(null);

  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['work-orders', orderId],
    queryFn: () => workOrdersApi.findByOrder(orderId).then((r) => r.data),
  });

  const signMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      workOrdersApi.sign(id, 'mock_biometric_token'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', orderId] });
      setSigningId(null);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SIGNED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ISSUED': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'EXPIRED': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => ({
    DRAFT: 'Черновик',
    ISSUED: 'Выдан (ожидает подписей)',
    SIGNED: 'Подписан',
    CLOSED: 'Закрыт',
    EXPIRED: 'Просрочен',
  }[status] || status);

  const getWorkOrderTypeLabel = (type: string) => ({
    HEIGHT_WORK: 'Работы на высоте',
    FACADE_WORK: 'Фасадные работы',
    GENERAL: 'Общий наряд-допуск',
  }[type] || type);

  if (isLoading) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Наряд-допуски</h1>
        <p className="text-gray-500 mt-1">Заявка #{orderId} · Электронные наряд-допуски и журналы ТБ</p>
      </div>

      {/* Информационный баннер */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Требование по технике безопасности</p>
          <p>Каждый член бригады обязан лично подписать наряд-допуск до начала работ. Подпись подтверждается биометрической верификацией.</p>
        </div>
      </div>

      {/* Список наряд-допусков */}
      <div className="space-y-4">
        {workOrders?.length === 0 && (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Наряд-допуски не выданы</p>
          </div>
        )}

        {workOrders?.map((wo: any) => (
          <div key={wo.id} className="bg-white rounded-xl border overflow-hidden">
            {/* Заголовок */}
            <div className="p-5 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(wo.status)}
                    <h3 className="font-semibold text-gray-900">
                      Наряд-допуск № {wo.number}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {getWorkOrderTypeLabel(wo.type)} · {getStatusLabel(wo.status)}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>с {dayjs(wo.validFrom).format('DD.MM.YYYY HH:mm')}</p>
                  <p>по {dayjs(wo.validTo).format('DD.MM.YYYY HH:mm')}</p>
                </div>
              </div>
            </div>

            {/* Детали */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Место производства работ</p>
                <p className="font-medium">{wo.location}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Описание работ</p>
                <p className="font-medium">{wo.workDescription}</p>
              </div>
            </div>

            {/* Подписи */}
            <div className="px-5 pb-5">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Подписи членов бригады
              </h4>
              <div className="space-y-2">
                {wo.signatures?.map((sig: any) => (
                  <div key={sig.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sig.user?.profile?.lastName} {sig.user?.profile?.firstName}
                      </p>
                      <p className="text-xs text-gray-400">{sig.role}</p>
                    </div>
                    {sig.biometricVerified ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Подписано
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-xs">Ожидает подписи</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Кнопка подписи для текущего исполнителя */}
              {wo.status === 'ISSUED' && wo.signatures?.some((s: any) => !s.biometricVerified) && (
                <button
                  onClick={() => {
                    setSigningId(wo.id);
                    signMutation.mutate({ id: wo.id });
                  }}
                  disabled={signMutation.isPending && signingId === wo.id}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  <Fingerprint className="w-5 h-5" />
                  {signMutation.isPending && signingId === wo.id
                    ? 'Верификация...'
                    : 'Подписать (биометрия)'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
