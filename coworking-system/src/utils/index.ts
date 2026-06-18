import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, addDays, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import type { PricingModel, Pricing, ResourceType, Booking } from '../types';

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

export function calculateHours(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMinutes = differenceInMinutes(end, start);
  if (diffMinutes <= 0) return 0;
  return Math.max(1, Math.ceil(diffMinutes / 60));
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
  return Math.max(1, differenceInDays(end, start) + 1);
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

export function isDateRangeOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();
  return aS <= bE && bS <= aE;
}

export function generateAccessCode(resourceId: string, date: string): string {
  const datePart = date.replace(/-/g, '');
  const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `AC-${resourceId.toUpperCase().slice(-3)}-${datePart}-${randomPart}`;
}

export function validateMinDuration(
  resourceType: ResourceType,
  minDuration: number,
  pricingModel: PricingModel,
  startDate: string,
  endDate: string
): { valid: boolean; message: string } {
  if (resourceType === 'meetingroom') {
    const hours = calculateHours(startDate, endDate);
    if (hours < minDuration) {
      return {
        valid: false,
        message: `会议室最短使用时长为 ${minDuration} 小时，当前选择时长为 ${hours} 小时，请调整时间`
      };
    }
    return { valid: true, message: '' };
  }

  const days = calculateDays(startDate, endDate);
  if (pricingModel === 'daily') {
    if (days < minDuration) {
      return {
        valid: false,
        message: `该资源最短租期为 ${minDuration} 天，当前选择 ${days} 天，请延长租期或选择其他资源`
      };
    }
  } else if (pricingModel === 'weekly') {
    const minWeeks = Math.ceil(minDuration / 7);
    const weeks = Math.ceil(days / 7);
    if (weeks < minWeeks) {
      return {
        valid: false,
        message: `按周计费最短需 ${minWeeks} 周（约 ${minDuration} 天），当前仅 ${weeks} 周`
      };
    }
  }
  return { valid: true, message: '' };
}

export function findConflictingBooking(
  bookings: Booking[],
  resourceId: string,
  startDate: string,
  endDate: string,
  excludeBookingId?: string
): Booking | null {
  for (const b of bookings) {
    if (b.id === excludeBookingId) continue;
    if (b.status === 'cancelled') continue;
    if (b.resourceId !== resourceId) continue;
    if (isDateRangeOverlap(startDate, endDate, b.startDate, b.endDate)) {
      return b;
    }
  }
  return null;
}

export function isResourceAvailable(
  bookings: Booking[],
  resourceId: string,
  startDate: string,
  endDate: string
): { available: boolean; conflict?: Booking } {
  const conflict = findConflictingBooking(bookings, resourceId, startDate, endDate);
  return { available: !conflict, conflict };
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
