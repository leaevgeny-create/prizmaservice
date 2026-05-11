'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Star } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function CustomerAnalyticsPage() {
  const { user } = useAuthStore();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', 'customer', user?.id],
    queryFn: () => analyticsApi.customerDashboard(user!.id).then((r) => r.data),
    enabled: !!user?.id,
    // Обновляем каждые 30 секунд для "реального времени"
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="p-8 text-center text-gray-400">Загрузка аналитики...</div>;

  const progressData = analytics?.monthlyProgress || [
    { month: 'Янв', planned: 800, actual: 720 },
    { month: 'Фев', planned: 950, actual: 910 },
    { month: 'Мар', planned: 1100, actual: 1050 },
    { month: 'Апр', planned: 900, actual: 870 },
    { month: 'Май', planned: 1200, actual: 1180 },
  ];

  const workTypeData = analytics?.workTypeBreakdown || [
    { name: 'Шлифовка стекла', value: 45 },
    { name: 'Малярные работы', value: 35 },
    { name: 'Мойка стекла', value: 12 },
    { name: 'Фасадные работы', value: 8 },
  ];

  const executorRatings = analytics?.topExecutors || [
    { name: 'Петров С.В.', rating: 9.2, orders: 8 },
    { name: 'Сидоров А.А.', rating: 8.8, orders: 5 },
    { name: 'ООО СтеклоМастер', rating: 8.5, orders: 12 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Аналитика объектов</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Обновлено {new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
          {' · '}
          <span className="inline-flex items-center gap-1 text-green-600">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
            Реальное время
          </span>
        </p>
      </div>

      {/* KPI карточки */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Выполнено объёмов',
            value: `${analytics?.totalCompletedArea ?? 2840} кв.м`,
            change: '+12%',
            up: true,
            icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          },
          {
            label: 'Средний рейтинг бригад',
            value: analytics?.avgExecutorRating?.toFixed(1) ?? '8.7',
            change: '+0.3',
            up: true,
            icon: <Star className="w-5 h-5 text-yellow-500" />,
          },
          {
            label: 'Исполнителей сейчас',
            value: analytics?.executorsOnSite ?? 14,
            change: '-2',
            up: false,
            icon: <Users className="w-5 h-5 text-blue-500" />,
          },
          {
            label: 'Замечаний за месяц',
            value: analytics?.remarksThisMonth ?? 3,
            change: '-40%',
            up: true,
            icon: <TrendingDown className="w-5 h-5 text-purple-500" />,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className={`text-xs mt-1 ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
              {kpi.change} к прошлому месяцу
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* График выполнения по месяцам */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-5">Выполненные объёмы (кв.м)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" name="По плану" fill="#dbeafe" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Фактически" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Разбивка по видам работ */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-5">Виды работ</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={workTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {workTypeData.map((_: any, idx: number) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Топ исполнителей */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Рейтинг исполнителей на объектах</h2>
        <div className="space-y-3">
          {executorRatings.map((exec: any, idx: number) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="text-gray-400 text-sm w-5 text-right">{idx + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900">{exec.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-sm">{exec.rating}</span>
                    <span className="text-gray-400 text-xs ml-1">· {exec.orders} заявок</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-yellow-400 h-1.5 rounded-full"
                    style={{ width: `${(exec.rating / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
