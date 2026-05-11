'use client';

import Link from 'next/link';
import dayjs from 'dayjs';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Order, WORK_TYPE_LABELS } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  order: Order;
  href?: string;
}

export function OrderCard({ order, href }: Props) {
  const link = href || `/customer/orders/${order.id}`;
  const daysLeft = dayjs(order.endDate).diff(dayjs(), 'day');
  const isOverdue = daysLeft < 0;

  return (
    <Link href={link}>
      <div className="bg-white rounded-xl border hover:border-blue-300 hover:shadow-sm transition-all p-5 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{order.object?.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{order.object?.address}</span>
            </div>
          </div>
          <StatusBadge status={order.status} className="ml-2 flex-shrink-0" />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {order.workTypes.map((wt) => (
            <span key={wt} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {WORK_TYPE_LABELS[wt]}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dayjs(order.startDate).format('DD.MM')} — {dayjs(order.endDate).format('DD.MM.YYYY')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{order.executorsNeeded} чел.</span>
          </div>
        </div>

        {order.status === 'IN_PROGRESS' && (
          <div className="mt-3 pt-3 border-t">
            <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              {isOverdue
                ? `Просрочено на ${Math.abs(daysLeft)} дн.`
                : `До завершения: ${daysLeft} дн.`}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
