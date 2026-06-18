import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, addDays, differenceInDays, differenceInHours } from 'date-fns';
import { PricingModel, Pricing } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: string | Date, fmt: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm');
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateTotalPrice(
  pricing: Pricing,
  pricingModel: PricingModel,
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = differenceInDays(end, start) + 1;

  switch (pricingModel) {
    case 'daily':
      return (pricing.daily || 0) * days;
    case 'weekly':
      const weeks = Math.ceil(days / 7);
      return (pricing.weekly || 0) * weeks;
    case 'monthly':
      return pricing.monthly || 0;
    default:
      return 0;
  }
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return differenceInDays(end, start) + 1;
}

export function addDaysToDate(date: string, days: number): string {
  const d = new Date(date);
  return format(addDays(d, days), 'yyyy-MM-dd');
}

export function isDateExpired(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date < now;
}

export function generateAccessCode(resourceId: string, date: string): string {
  const datePart = date.replace(/-/g, '');
  const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `AC-${resourceId.toUpperCase().slice(-3)}-${datePart}-${randomPart}`;
}

export function getResourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    desk: '开放工位',
    office: '独立办公室',
    meetingroom: '会议室'
  };
  return labels[type] || type;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: '可预订',
    occupied: '已占用',
    maintenance: '维护中',
    pending: '待确认',
    confirmed: '已确认',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    waiting: '等待接待',
    checkedin: '已登记',
    checkedout: '已离开',
    active: '生效中',
    expired: '已过期',
    terminated: '已终止'
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    maintenance: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    waiting: 'bg-orange-100 text-orange-800',
    checkedin: 'bg-blue-100 text-blue-800',
    checkedout: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    customer: '普通客户',
    resident: '驻场客户',
    operator: '运营方',
    receptionist: '前台'
  };
  return labels[role] || role;
}

export function getPostTypeLabel(type: string): string {
  return type === 'recruitment' ? '招聘信息' : '合作需求';
}
