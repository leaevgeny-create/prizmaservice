'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptanceApi } from '../../../../lib/api';
import { WorkAcceptance, AcceptanceItem } from '../../../../types';
import { CheckCircle, XCircle, AlertTriangle, Fingerprint, FileText, Download } from 'lucide-react';

export default function AcceptancePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [biometricStep, setBiometricStep] = useState<'idle' | 'required' | 'verified'>('idle');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: acceptance, isLoading } = useQuery<WorkAcceptance>({
    queryKey: ['acceptance', orderId],
    queryFn: () => acceptanceApi.findByOrder(orderId).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, biometricData }: { id: string; biometricData: string }) =>
      acceptanceApi.approve(id, biometricData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acceptance', orderId] });
      setBiometricStep('verified');
    },
  });

  const generateKS2 = useMutation({
    mutationFn: (id: string) => acceptanceApi.generateKS2(id),
    onSuccess: (res) => {
      window.open(res.data.documentUrl, '_blank');
    },
  });

  const handleBiometricVerify = async () => {
    // В реальном приложении здесь вызывается WebAuthn / биометрика устройства
    // Имитация: navigator.credentials.get({ publicKey: ... })
    setBiometricStep('required');
    await new Promise((r) => setTimeout(r, 1500)); // Эмулируем задержку
    if (acceptance) {
      approveMutation.mutate({ id: acceptance.id, biometricData: 'mock_biometric_token' });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;
  if (!acceptance) return <div className="p-8 text-center text-gray-400">Нет данных о приёмке</div>;

  const isCompleted = acceptance.status === 'APPROVED';
  const totalPlanned = acceptance.items.reduce((s, i) => s + Number(i.planned), 0);
  const totalActual = acceptance.items.reduce((s, i) => s + Number(i.actual), 0);
  const completionPct = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Приёмка выполненных работ</h1>
        <p className="text-gray-500 mt-1">Заявка #{orderId}</p>
      </div>

      {/* Прогресс */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Прогресс выполнения</h2>
          <span className={`text-lg font-bold ${completionPct >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
            {completionPct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all ${completionPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(completionPct, 100)}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-500">По ведомости</p>
            <p className="font-semibold">{totalPlanned.toFixed(1)} кв.м</p>
          </div>
          <div>
            <p className="text-gray-500">Фактически</p>
            <p className="font-semibold">{totalActual.toFixed(1)} кв.м</p>
          </div>
          <div>
            <p className="text-gray-500">Замечания</p>
            <p className={`font-semibold ${acceptance.remarks.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {acceptance.remarks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Позиции приёмки */}
      <div className="bg-white rounded-xl border mb-6">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-900">Позиции</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-5 py-3">Наименование работ</th>
                <th className="px-5 py-3">Ед. изм.</th>
                <th className="px-5 py-3 text-right">По договору</th>
                <th className="px-5 py-3 text-right">Факт</th>
                <th className="px-5 py-3 text-center">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {acceptance.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{item.description}</td>
                  <td className="px-5 py-3 text-gray-500">{item.unit}</td>
                  <td className="px-5 py-3 text-right">{Number(item.planned).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-medium">{Number(item.actual).toFixed(2)}</td>
                  <td className="px-5 py-3 text-center">
                    {item.approved ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Замечания */}
      {acceptance.remarks.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Замечания ({acceptance.remarks.length})
          </h2>
          <ul className="space-y-2">
            {acceptance.remarks.map((r) => (
              <li key={r.id} className="flex items-start gap-2 text-sm">
                <span className={`flex-shrink-0 mt-0.5 w-2 h-2 rounded-full ${
                  r.severity === 'CRITICAL' ? 'bg-red-500' :
                  r.severity === 'MAJOR' ? 'bg-orange-500' : 'bg-yellow-400'
                }`} />
                <span className="text-orange-700">{r.description}</span>
                {r.resolvedAt && (
                  <span className="text-green-600 text-xs ml-auto flex-shrink-0">Устранено</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Акты */}
      {acceptance.acts.length > 0 && (
        <div className="bg-white rounded-xl border mb-6 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Закрывающие документы</h2>
          <div className="space-y-2">
            {acceptance.acts.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Акт {act.type} № {act.number}</p>
                    <p className="text-xs text-gray-500">{new Date(act.date).toLocaleDateString('ru')} · {Number(act.totalAmount).toLocaleString('ru')} ₽</p>
                  </div>
                </div>
                {act.documentUrl && (
                  <a href={act.documentUrl} download className="flex items-center gap-1 text-blue-600 text-sm hover:underline">
                    <Download className="w-4 h-4" />
                    Скачать
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      {!isCompleted && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Подписать приёмку</h2>
          <p className="text-sm text-gray-500 mb-4">
            Для подтверждения приёмки требуется биометрическая верификация ответственного лица.
            После подписания будут автоматически сформированы акты КС-2 и КС-3.
          </p>

          {biometricStep === 'verified' ? (
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Биометрия подтверждена. Акты формируются...</span>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleBiometricVerify}
                disabled={biometricStep === 'required' || approveMutation.isPending}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60"
              >
                <Fingerprint className="w-5 h-5" />
                {biometricStep === 'required' ? 'Верификация...' : 'Подписать (биометрия)'}
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="flex items-center gap-2 border border-red-300 text-red-600 px-5 py-3 rounded-lg hover:bg-red-50"
              >
                <XCircle className="w-5 h-5" />
                Отклонить
              </button>

              {acceptance.acts.length === 0 && (
                <button
                  onClick={() => generateKS2.mutate(acceptance.id)}
                  disabled={generateKS2.isPending}
                  className="flex items-center gap-2 border border-blue-300 text-blue-600 px-5 py-3 rounded-lg hover:bg-blue-50"
                >
                  <FileText className="w-5 h-5" />
                  Сформировать КС-2
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-5 text-green-700">
          <CheckCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Работы приняты</p>
            <p className="text-sm">Закрывающие документы подписаны всеми сторонами</p>
          </div>
        </div>
      )}

      {/* Модальное окно отклонения */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Отклонить приёмку</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Укажите причину отклонения и перечень замечаний..."
              className="w-full border rounded-lg p-3 text-sm h-32 resize-none focus:outline-none focus:border-blue-400 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2.5 text-gray-700">
                Отмена
              </button>
              <button
                onClick={() => {
                  // вызов acceptanceApi.reject(...)
                  setShowRejectModal(false);
                }}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-600 text-white rounded-lg py-2.5 font-medium hover:bg-red-700 disabled:opacity-60"
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
