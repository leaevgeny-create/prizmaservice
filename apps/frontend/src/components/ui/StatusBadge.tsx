import { clsx } from 'clsx';
import { OrderStatus, ORDER_STATUS_LABELS } from '../../types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-blue-100 text-blue-700',
  EXECUTOR_SEARCH: 'bg-yellow-100 text-yellow-700',
  NEGOTIATION: 'bg-orange-100 text-orange-700',
  CONTRACT_SIGNED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-green-100 text-green-700',
  ACCEPTANCE: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  DISPUTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

interface Props {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  return (
    <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap', STATUS_COLORS[status], className)}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
