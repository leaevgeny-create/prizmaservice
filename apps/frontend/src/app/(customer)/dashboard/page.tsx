'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi, objectsApi, analyticsApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import { Order, ORDER_STATUS_LABELS, WORK_TYPE_LABELS } from '../../../types';
import { Plus, MapPin, Calendar, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { OrderCard } from '../../../components/orders/OrderCard';

export default function CustomerDashboard() {
  const { user } = useAuthStore();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => ordersApi.findMy().then((r) => r.data as Order[]),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'customer', user?.id],
    queryFn: () => analyticsApi.customerDashboard(user!.id).then((r) => r.data),
    enabled: !!user?.id,
  });

  const activeOrders = orders?.filter((o) => ['IN_PROGRESS', 'ACCEPTANCE'].includes(o.status)) || [];
  const pendingOrders = orders?.filter((o) => ['DRAFT', 'PUBLISHED', 'EXECUTOR_SEARCH', 'NEGOTIATION'].includes(o.status)) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Приветствие */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Добрый день, {user?.profile?.firstName}
          </h1>
          <p className="text-gray-500 mt-1">Личный кабинет заказчика — ООО «Призма Сервис»</p>
        </div>
        <Link
          href="/customer/objects/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Новая заявка
        </Link>
      </div>

      {/* Сводные показатели */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Активных заявок', value: activeOrders.length, icon: <TrendingUp className="w-5 h-5 text-blue-500" />, color: 'blue' },
          { label: 'Исполнителей на объектах', value: analytics?.executorsOnSite ?? '—', icon: <Users className="w-5 h-5 text-green-500" />, color: 'green' },
          { label: 'Ожидают приёмки', value: orders?.filter((o) => o.status === 'ACCEPTANCE').length ?? 0, icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, color: 'orange' },
          { label: 'Завершено в этом месяце', value: analytics?.completedThisMonth ?? '—', icon: <Calendar className="w-5 h-5 text-purple-500" />, color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">{stat.label}</span>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Активные заявки */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Активные заявки</h2>
          <Link href="/customer/orders" className="text-blue-600 text-sm hover:underline">
            Все заявки
          </Link>
        </div>

        {ordersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse h-40" />
            ))}
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Нет активных заявок</p>
            <Link href="/customer/orders/new" className="text-blue-600 text-sm mt-2 inline-block">
              Создать первую заявку →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      {/* На рассмотрении */}
      {pendingOrders.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">На рассмотрении</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
