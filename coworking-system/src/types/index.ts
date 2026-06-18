export type UserRole = 'customer' | 'operator' | 'receptionist' | 'resident';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  company?: string;
  avatar?: string;
  createdAt: string;
}

export type ResourceType = 'desk' | 'office' | 'meetingroom';
export type PricingModel = 'daily' | 'weekly' | 'monthly';

export interface Pricing {
  daily?: number;
  weekly?: number;
  monthly?: number;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  location: string;
  capacity: number;
  pricing: Pricing;
  minDuration: number;
  amenities: string[];
  image: string;
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  resourceId: string;
  resourceName?: string;
  userId: string;
  userName?: string;
  startDate: string;
  endDate: string;
  pricingModel: PricingModel;
  totalPrice: number;
  status: BookingStatus;
  accessCode?: string;
  freeUsageUsed?: boolean;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'online' | 'monthly';

export interface Payment {
  id: string;
  bookingId?: string;
  userId: string;
  userName?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string;
  paidAt?: string;
  createdAt: string;
}

export interface MonthlyAgreement {
  id: string;
  userId: string;
  userName?: string;
  company?: string;
  resourceId: string;
  resourceName?: string;
  monthlyFee: number;
  startDate: string;
  endDate: string;
  freeMeetingHours: number;
  usedMeetingHours: number;
  status: 'active' | 'expired' | 'terminated';
  createdAt: string;
}

export interface AccessQRCode {
  id: string;
  bookingId: string;
  userId: string;
  code: string;
  expiresAt: string;
  createdAt: string;
}

export interface MeetingPackage {
  id: string;
  userId: string;
  userName?: string;
  agreementId: string;
  freeHours: number;
  usedHours: number;
  extraHours: number;
  extraHourRate: number;
  month: string;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  company?: string;
  residentId: string;
  residentName?: string;
  purpose: string;
  checkIn: string;
  checkOut?: string;
  status: 'waiting' | 'checkedin' | 'checkedout';
  notified: boolean;
  createdAt: string;
}

export type CommunityPostType = 'recruitment' | 'cooperation';

export interface CommunityPost {
  id: string;
  userId: string;
  userName?: string;
  company?: string;
  type: CommunityPostType;
  title: string;
  content: string;
  contactInfo: string;
  tags: string[];
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
}

export interface DailyAnalytics {
  date: string;
  revenue: number;
  bookings: number;
}

export interface ResourceOccupancy {
  resourceId: string;
  resourceName: string;
  type: ResourceType;
  occupiedDays: number;
  totalDays: number;
  occupancyRate: number;
  vacancyRate: number;
  revenue: number;
}
