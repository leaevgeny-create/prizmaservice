export type Role =
  | 'AGGREGATOR_ADMIN'
  | 'AGGREGATOR_MANAGER'
  | 'AGGREGATOR_FINANCE'
  | 'AGGREGATOR_SECURITY'
  | 'CUSTOMER_ADMIN'
  | 'CUSTOMER_MANAGER'
  | 'CUSTOMER_SAFETY'
  | 'EXECUTOR_COMPANY'
  | 'EXECUTOR_IP'
  | 'EXECUTOR_SELF_EMPLOYED'
  | 'EXPERT';

export type OrderStatus =
  | 'DRAFT' | 'PUBLISHED' | 'EXECUTOR_SEARCH' | 'NEGOTIATION'
  | 'CONTRACT_SIGNED' | 'IN_PROGRESS' | 'ACCEPTANCE' | 'COMPLETED'
  | 'DISPUTED' | 'CANCELLED';

export type WorkType = 'GLASS_GRINDING' | 'PAINTING' | 'GLASS_CLEANING' | 'FACADE_WORKS';

export type DefectStatementStatus =
  | 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'REVISION' | 'APPROVED' | 'REJECTED';

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  GLASS_GRINDING: 'Шлифовка стекла',
  PAINTING: 'Малярные работы',
  GLASS_CLEANING: 'Мойка стекла',
  FACADE_WORKS: 'Фасадные работы',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'Черновик',
  PUBLISHED: 'Опубликована',
  EXECUTOR_SEARCH: 'Поиск исполнителя',
  NEGOTIATION: 'Согласование',
  CONTRACT_SIGNED: 'Договор подписан',
  IN_PROGRESS: 'В работе',
  ACCEPTANCE: 'На приёмке',
  COMPLETED: 'Завершён',
  DISPUTED: 'Спор',
  CANCELLED: 'Отменён',
};

export const ROLE_LABELS: Record<Role, string> = {
  AGGREGATOR_ADMIN: 'Администратор (Призма Сервис)',
  AGGREGATOR_MANAGER: 'Менеджер',
  AGGREGATOR_FINANCE: 'Финансист',
  AGGREGATOR_SECURITY: 'СБ Агрегатора',
  CUSTOMER_ADMIN: 'Заказчик (руководитель)',
  CUSTOMER_MANAGER: 'Менеджер заказчика',
  CUSTOMER_SAFETY: 'СБ Заказчика',
  EXECUTOR_COMPANY: 'Исполнитель (ООО/АО)',
  EXECUTOR_IP: 'Исполнитель (ИП)',
  EXECUTOR_SELF_EMPLOYED: 'Самозанятый',
  EXPERT: 'Эксперт / Технадзор',
};

export interface User {
  id: string;
  email: string;
  role: Role;
  status: string;
  profile?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    photoUrl?: string;
  };
}

export interface Order {
  id: string;
  objectId: string;
  customerId: string;
  executorId?: string;
  status: OrderStatus;
  workTypes: WorkType[];
  executorsNeeded: number;
  description?: string;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  contractAmount?: number;
  object: ConstructionObject;
  customer?: Pick<User, 'id' | 'profile'>;
  executor?: Pick<User, 'id' | 'profile'>;
}

export interface ConstructionObject {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  status: string;
}

export interface DefectItem {
  id?: string;
  lineNumber: number;
  location: string;
  workType: WorkType;
  description: string;
  unit: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  photos?: Photo[];
}

export interface DefectStatement {
  id: string;
  orderId: string;
  version: number;
  status: DefectStatementStatus;
  items: DefectItem[];
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
}

export interface MaterialStock {
  id: string;
  name: string;
  article?: string;
  unit: string;
  quantity: number;
}

export interface WorkAcceptance {
  id: string;
  orderId: string;
  status: string;
  biometricVerified: boolean;
  items: AcceptanceItem[];
  remarks: AcceptanceRemark[];
  acts: Act[];
}

export interface AcceptanceItem {
  id: string;
  description: string;
  unit: string;
  planned: number;
  actual: number;
  approved: boolean;
}

export interface AcceptanceRemark {
  id: string;
  description: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  resolvedAt?: string;
}

export interface Act {
  id: string;
  type: 'KS2' | 'KS3';
  number: string;
  date: string;
  amount: number;
  totalAmount: number;
  documentUrl?: string;
  signedByAll: boolean;
}

export interface ExecutorRatingSummary {
  overallScore: number | null;
  onTimeScore: number;
  qualityScore: number;
  customerScore: number | null;
  ordersCount: number;
  remarksAvg: number;
}
