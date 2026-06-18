import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Resource, Booking, Payment, MonthlyAgreement, MeetingPackage, Visitor, CommunityPost, CommunityComment, PricingModel, DailyAnalytics, ResourceOccupancy } from '../types';
import { mockUsers, mockResources, mockBookings, mockPayments, mockAgreements, mockMeetingPackages, mockVisitors, mockPosts, mockComments, mockDailyAnalytics, mockResourceOccupancy } from '../data/mockData';
import { generateId, calculateTotalPrice, generateAccessCode, formatDate } from '../utils';

interface AppState {
  currentUser: User | null;
  users: User[];
  resources: Resource[];
  bookings: Booking[];
  payments: Payment[];
  agreements: MonthlyAgreement[];
  meetingPackages: MeetingPackage[];
  visitors: Visitor[];
  posts: CommunityPost[];
  comments: CommunityComment[];
  dailyAnalytics: DailyAnalytics[];
  resourceOccupancy: ResourceOccupancy[];
  notifications: { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; createdAt: string }[];

  login: (email: string, password: string) => User | null;
  register: (data: Omit<User, 'id' | 'createdAt' | 'role'> & { role?: User['role'] }) => User;
  logout: () => void;

  addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
  updateResource: (id: string, data: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  createBooking: (data: { resourceId: string; startDate: string; endDate: string; pricingModel: PricingModel }) => Booking;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  cancelBooking: (id: string) => void;

  payBooking: (bookingId: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;

  createAgreement: (data: Omit<MonthlyAgreement, 'id' | 'createdAt' | 'status'>) => MonthlyAgreement;
  createVisitor: (data: Omit<Visitor, 'id' | 'createdAt' | 'status' | 'notified'>) => Visitor;
  updateVisitorStatus: (id: string, status: Visitor['status']) => void;

  addPost: (data: Omit<CommunityPost, 'id' | 'createdAt'>) => void;
  addComment: (data: Omit<CommunityComment, 'id' | 'createdAt'>) => void;

  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      resources: mockResources,
      bookings: mockBookings,
      payments: mockPayments,
      agreements: mockAgreements,
      meetingPackages: mockMeetingPackages,
      visitors: mockVisitors,
      posts: mockPosts,
      comments: mockComments,
      dailyAnalytics: mockDailyAnalytics,
      resourceOccupancy: mockResourceOccupancy,
      notifications: [],

      login: (email: string, password: string) => {
        const user = get().users.find((u) => u.email === email && u.password === password);
        if (user) {
          set({ currentUser: user });
          get().addNotification(`欢迎回来，${user.name}！`, 'success');
          return user;
        }
        get().addNotification('邮箱或密码错误', 'error');
        return null;
      },

      register: (data) => {
        const newUser: User = {
          ...data,
          id: generateId('u'),
          role: data.role || 'customer',
          createdAt: formatDate(new Date())
        };
        set({ users: [...get().users, newUser], currentUser: newUser });
        get().addNotification('注册成功！', 'success');
        return newUser;
      },

      logout: () => {
        set({ currentUser: null });
      },

      addResource: (resource) => {
        const newResource: Resource = {
          ...resource,
          id: generateId('r'),
          createdAt: formatDate(new Date())
        };
        set({ resources: [...get().resources, newResource] });
        get().addNotification('资源添加成功！', 'success');
      },

      updateResource: (id, data) => {
        set({
          resources: get().resources.map((r) => (r.id === id ? { ...r, ...data } : r))
        });
        get().addNotification('资源更新成功！', 'success');
      },

      deleteResource: (id) => {
        set({ resources: get().resources.filter((r) => r.id !== id) });
        get().addNotification('资源已删除', 'info');
      },

      createBooking: (data) => {
        const { currentUser, resources, agreements, meetingPackages } = get();
        if (!currentUser) throw new Error('未登录');

        const resource = resources.find((r) => r.id === data.resourceId);
        if (!resource) throw new Error('资源不存在');

        let totalPrice = calculateTotalPrice(resource.pricing, data.pricingModel, data.startDate, data.endDate);
        let freeUsageUsed = false;

        if (resource.type === 'meetingroom' && currentUser.role === 'resident') {
          const userAgreement = agreements.find((a) => a.userId === currentUser.id && a.status === 'active');
          const userPkg = meetingPackages.find((p) => p.userId === currentUser.id && p.month === formatDate(new Date(), 'yyyy-MM'));
          
          if (userAgreement && userPkg && userPkg.usedHours < userPkg.freeHours) {
            freeUsageUsed = true;
            totalPrice = 0;
            set({
              meetingPackages: meetingPackages.map((p) =>
                p.id === userPkg.id ? { ...p, usedHours: p.usedHours + 1 } : p
              )
            });
            set({
              agreements: agreements.map((a) =>
                a.id === userAgreement.id ? { ...a, usedMeetingHours: a.usedMeetingHours + 1 } : a
              )
            });
          }
        }

        const accessCode = generateAccessCode(data.resourceId, data.startDate);
        const newBooking: Booking = {
          id: generateId('b'),
          resourceName: resource.name,
          userId: currentUser.id,
          userName: currentUser.name,
          ...data,
          totalPrice,
          status: 'pending',
          accessCode,
          freeUsageUsed,
          createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm')
        };
        set({ bookings: [...get().bookings, newBooking] });
        get().addNotification(freeUsageUsed ? '预订成功！已使用免费次数包' : '预订申请已提交', 'success');
        return newBooking;
      },

      updateBookingStatus: (id, status) => {
        set({
          bookings: get().bookings.map((b) => (b.id === id ? { ...b, status } : b))
        });
      },

      cancelBooking: (id) => {
        set({
          bookings: get().bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
        });
        get().addNotification('预订已取消', 'info');
      },

      payBooking: (bookingId) => {
        const { bookings, currentUser } = get();
        const booking = bookings.find((b) => b.id === bookingId);
        if (!booking || !currentUser) return;

        const payment: Payment = {
          id: generateId('p'),
          bookingId,
          userId: currentUser.id,
          userName: currentUser.name,
          amount: booking.totalPrice,
          method: currentUser.role === 'resident' ? 'monthly' : 'online',
          status: 'paid',
          description: `${booking.resourceName} ${booking.startDate} 预订付款`,
          paidAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm'),
          createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm')
        };
        set({
          payments: [...get().payments, payment],
          bookings: get().bookings.map((b) => (b.id === bookingId ? { ...b, status: 'paid' } : b))
        });
        get().addNotification('支付成功！', 'success');
      },

      addPayment: (payment) => {
        const newPayment: Payment = {
          ...payment,
          id: generateId('p'),
          createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm')
        };
        set({ payments: [...get().payments, newPayment] });
      },

      createAgreement: (data) => {
        const newAgreement: MonthlyAgreement = {
          ...data,
          id: generateId('a'),
          status: 'active',
          createdAt: formatDate(new Date())
        };
        const newPkg: MeetingPackage = {
          id: generateId('mp'),
          userId: data.userId,
          userName: data.userName,
          agreementId: newAgreement.id,
          freeHours: data.freeMeetingHours,
          usedHours: 0,
          extraHours: 0,
          extraHourRate: data.resourceName?.includes('独立办公室') ? 100 : 80,
          month: formatDate(new Date(), 'yyyy-MM')
        };
        set({
          agreements: [...get().agreements, newAgreement],
          meetingPackages: [...get().meetingPackages, newPkg]
        });
        get().addNotification('月度协议创建成功', 'success');
        return newAgreement;
      },

      createVisitor: (data) => {
        const newVisitor: Visitor = {
          ...data,
          id: generateId('v'),
          status: 'waiting',
          notified: true,
          createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm')
        };
        set({ visitors: [...get().visitors, newVisitor] });
        get().addNotification(`已通知 ${data.residentName} 来接待访客`, 'success');
        return newVisitor;
      },

      updateVisitorStatus: (id, status) => {
        const update: Partial<Visitor> = { status };
        if (status === 'checkedout') {
          update.checkOut = formatDate(new Date(), 'yyyy-MM-dd HH:mm');
        }
        set({
          visitors: get().visitors.map((v) => (v.id === id ? { ...v, ...update } : v))
        });
      },

      addPost: (data) => {
        const { currentUser } = get();
        const newPost: CommunityPost = {
          ...data,
          id: generateId('cp'),
          createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm')
        };
        set({ posts: [newPost, ...get().posts] });
        get().addNotification(currentUser?.role === 'resident' ? '发布成功，邻居们会看到的！' : '发布成功', 'success');
      },

      addComment: (data) => {
        const newComment: CommunityComment = {
          ...data,
          id: generateId('cc'),
          createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm')
        };
        set({ comments: [...get().comments, newComment] });
      },

      addNotification: (message, type = 'info') => {
        const notification = {
          id: generateId('n'),
          message,
          type,
          createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm')
        };
        set({ notifications: [...get().notifications, notification] });
        setTimeout(() => {
          get().removeNotification(notification.id);
        }, 4000);
      },

      removeNotification: (id) => {
        set({ notifications: get().notifications.filter((n) => n.id !== id) });
      }
    }),
    {
      name: 'coworking-system-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        resources: state.resources,
        bookings: state.bookings,
        payments: state.payments,
        agreements: state.agreements,
        meetingPackages: state.meetingPackages,
        visitors: state.visitors,
        posts: state.posts,
        comments: state.comments
      })
    }
  )
);
