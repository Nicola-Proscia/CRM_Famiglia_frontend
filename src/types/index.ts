export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ExtraIncome {
  id: string;
  familyMemberId: string;
  name: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role?: string;
  salary: number;
  phone?: string;
  extraIncomes: ExtraIncome[];
  createdAt: string;
  updatedAt: string;
}

export type ExpenseFrequency = 'MONTHLY' | 'BIMONTHLY' | 'CUSTOM';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: ExpenseFrequency;
  category: string;
  dayOfMonth?: number;
  date?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RenovationStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface RenovationItem {
  id: string;
  projectId: string;
  name: string;
  company?: string;
  totalPrice: number;
  paidAmount: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface RenovationProject {
  id: string;
  name: string;
  company?: string;
  status: RenovationStatus;
  startDate?: string;
  endDate?: string;
  items: RenovationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RenovationSummary {
  projects: {
    id: string;
    name: string;
    status: RenovationStatus;
    totalCost: number;
    totalPaid: number;
    totalRemaining: number;
    itemCount: number;
  }[];
  totals: {
    totalCost: number;
    totalPaid: number;
    totalRemaining: number;
  };
}

export interface DashboardSummary {
  income: {
    totalSalaries: number;
    totalExtraIncomes: number;
    total: number;
    memberCount: number;
  };
  expenses: {
    totalMonthly: number;
    count: number;
    byCategory: { category: string; amount: number }[];
  };
  renovation: {
    totalCost: number;
    totalPaid: number;
    totalRemaining: number;
  };
  balance: number;
  period: { from: string; to: string };
}

export interface TrendPoint {
  label: string;
  income: number;
  expenses: number;
  balance: number;
}

export type NotificationChannel = 'SMS' | 'WHATSAPP';

export interface AppointmentNotification {
  id: string;
  appointmentId: string;
  minutesBefore: number;
  channel: NotificationChannel;
  recipientPhone: string;
  sent: boolean;
  sentAt?: string;
  error?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  category: string;
  memberId?: string;
  member?: Pick<FamilyMember, 'id' | 'name' | 'phone'>;
  notifications: AppointmentNotification[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  id: string;
  defaultPhone?: string;
  defaultChannel: NotificationChannel;
  defaultMinutes: number;
  timezone: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
}
