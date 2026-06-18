import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Resource, Booking, Payment, MonthlyAgreement, MeetingPackage, Visitor, CommunityPost, CommunityComment, PricingModel, DailyAnalytics, ResourceOccupancy, MonthlyBill } from '../types';
import { mockUsers, mockResources, mockBookings, mockPayments, mockAgreements, mockMeetingPackages, mockVisitors, mockPosts, mockComments, mockDailyAnalytics, mockResourceOccupancy, mockMonthlyBills } from '../data/mockData';
import { generateId, calculateTotalPrice, generateAccessCode, formatDate, validateMinDuration, findConflictingBooking, calculateHours } from '../utils';

interface AppState {
  currentUser: User | null;
  users: User[];
  resources: Resource[];
  bookings: Booking[];
  payments: Payment[];
  monthlyBills: MonthlyBill[];
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

  createBooking: (data: { resourceId: string; startDate: string; endDate: string; pricingModel: PricingModel }) => { booking?: Booking; error?: string };
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  cancelBooking: (id: string) => { success: boolean; error?: string };

  payBooking: (bookingId: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;

  createAgreement: (data: Omit<MonthlyAgreement, 'id' | 'createdAt' | 'status'>) => MonthlyAgreement;
  createVisitor: (data: Omit<Visitor, 'id' | 'createdAt' | 'status' | 'notified'>) => Visitor;
  updateVisitorStatus: (id: string, status: Visitor['status']) => void;

  addPost: (data: Omit<CommunityPost, 'id' | 'createdAt'>) => void;
  addComment: (data: Omit<CommunityComment, 'id' | 'createdAt'>) => void;

  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;

  generateMonthlyBill: (agreementId: string, month: string) => MonthlyBill;
  confirmSettlement: (billId: string) => void;
  markBillPaid: (billId: string, amount?: number) => void;
  getBillByMonth: (userId: string, month: string) => MonthlyBill | null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      resources: mockResources,
      bookings: mockBookings,
      payments: mockPayments,
      monthlyBills: mockMonthlyBills,
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
        const { currentUser, resources, agreements, meetingPackages, bookings } = get();
        if (!currentUser) return { error: '请先登录后再预订' };

        const resource = resources.find((r) => r.id === data.resourceId);
        if (!resource) return { error: '资源不存在' };
        if (resource.status === 'maintenance') return { error: '该资源正在维护中，暂时无法预订' };
        if (resource.status === 'occupied') return { error: '该资源已被长期占用' };

        const durationCheck = validateMinDuration(
          resource.type,
          resource.minDuration,
          data.pricingModel,
          data.startDate,
          data.endDate
        );
        if (!durationCheck.valid) return { error: durationCheck.message };

        const conflict = findConflictingBooking(bookings, data.resourceId, data.startDate, data.endDate);
        if (conflict) {
          const conflictUser = conflict.userName || '其他用户';
          const conflictTime = `${conflict.startDate} 至 ${conflict.endDate}`;
          return { error: `该资源在 ${conflictTime} 已被 ${conflictUser} 预订，请选择其他时段` };
        }

        const bookingHours = resource.type === 'meetingroom' ? calculateHours(data.startDate, data.endDate) : undefined;
        let totalPrice = calculateTotalPrice(resource.pricing, data.pricingModel, data.startDate, data.endDate);
        let freeUsageUsed = false;
        let deductedFreeHours = 0;
        let deductedExtraHours = 0;

        if (resource.type === 'meetingroom' && currentUser.role === 'resident' && bookingHours) {
          const currentMonth = formatDate(new Date(), 'yyyy-MM');
          const userAgreement = agreements.find((a) => a.userId === currentUser.id && a.status === 'active');
          let userPkg = meetingPackages.find((p) => p.userId === currentUser.id && p.month === currentMonth);

          if (userAgreement) {
            if (!userPkg) {
              userPkg = {
                id: generateId('mp'),
                userId: currentUser.id,
                userName: currentUser.name,
                agreementId: userAgreement.id,
                freeHours: userAgreement.freeMeetingHours,
                usedHours: 0,
                extraHours: 0,
                extraHourRate: resource.pricing.daily ? Math.round(resource.pricing.daily / 8) : 100,
                month: currentMonth
              };
              set({ meetingPackages: [...get().meetingPackages, userPkg] });
            }

            const remainingHours = Math.max(0, userPkg.freeHours - userPkg.usedHours);
            deductedFreeHours = Math.min(remainingHours, bookingHours);
            deductedExtraHours = Math.max(0, bookingHours - deductedFreeHours);

            const rate = userPkg.extraHourRate;
            if (deductedExtraHours > 0 || deductedFreeHours > 0) {
              freeUsageUsed = deductedFreeHours > 0;
              const extraFee = deductedExtraHours * rate;
              totalPrice = extraFee;

              set({
                meetingPackages: get().meetingPackages.map((p) =>
                  p.id === userPkg!.id
                    ? { ...p, usedHours: p.usedHours + deductedFreeHours, extraHours: p.extraHours + deductedExtraHours }
                    : p
                ),
                agreements: get().agreements.map((a) =>
                  a.id === userAgreement.id ? { ...a, usedMeetingHours: a.usedMeetingHours + deductedFreeHours } : a
                )
              });

              if (deductedExtraHours > 0 && currentUser.role === 'resident') {
                const extraPayment: Payment = {
                  id: generateId('p'),
                  bookingId: undefined,
                  userId: currentUser.id,
                  userName: currentUser.name,
                  amount: extraFee,
                  method: 'monthly',
                  status: 'pending',
                  description: `会议室 ${resource.name} 超额使用 ${deductedExtraHours} 小时（${formatDate(data.startDate)}）`,
                  createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm')
                };
                set({ payments: [...get().payments, extraPayment] });
              }
            }
          }
        }

        const accessCode = generateAccessCode(data.resourceId, data.startDate);
        const newBooking: Booking = {
          id: generateId('b'),
          resourceName: resource.name,
          userId: currentUser.id,
          userName: currentUser.name,
          resourceId: data.resourceId,
          startDate: data.startDate,
          endDate: data.endDate,
          pricingModel: data.pricingModel,
          totalPrice,
          status: 'pending',
          accessCode,
          freeUsageUsed,
          bookingHours,
          deductedFreeHours,
          deductedExtraHours,
          createdAt: formatDate(new Date(), 'yyyy-MM-dd HH:mm')
        };
        set({ bookings: [...get().bookings, newBooking] });

        if (freeUsageUsed && deductedExtraHours > 0) {
          get().addNotification(
            `预订成功！使用免费额度 ${deductedFreeHours} 小时，超额 ${deductedExtraHours} 小时已计入月度账单`,
            'warning'
          );
        } else if (freeUsageUsed) {
          get().addNotification(`预订成功！已使用免费额度 ${deductedFreeHours} 小时`, 'success');
        } else {
          get().addNotification('预订申请已提交，请完成支付', 'success');
        }
        return { booking: newBooking };
      },

      updateBookingStatus: (id, status) => {
        set({
          bookings: get().bookings.map((b) => (b.id === id ? { ...b, status } : b))
        });
      },

      cancelBooking: (id) => {
        const { bookings, meetingPackages, agreements, payments } = get();
        const booking = bookings.find((b) => b.id === id);
        if (!booking) return { success: false, error: '预订不存在' };
        if (booking.status === 'cancelled') return { success: false, error: '该预订已取消' };
        if (booking.status === 'completed') return { success: false, error: '已完成的预订无法取消' };

        const now = new Date();
        const start = new Date(booking.startDate);
        if (start < now && booking.status !== 'pending') {
          return { success: false, error: '已开始的预订无法取消，请联系运营方' };
        }

        const rollbackFree = booking.deductedFreeHours || 0;
        const rollbackExtra = booking.deductedExtraHours || 0;

        if (rollbackFree > 0 || rollbackExtra > 0) {
          const bookingMonth = formatDate(new Date(booking.createdAt || Date.now()), 'yyyy-MM');
          set({
            meetingPackages: meetingPackages.map((p) =>
              p.userId === booking.userId && p.month === bookingMonth
                ? {
                    ...p,
                    usedHours: Math.max(0, p.usedHours - rollbackFree),
                    extraHours: Math.max(0, p.extraHours - rollbackExtra),
                  }
                : p
            ),
            agreements: agreements.map((a) =>
              a.userId === booking.userId ? { ...a, usedMeetingHours: Math.max(0, a.usedMeetingHours - rollbackFree) } : a
            ),
          });
        }

        if (rollbackExtra > 0 && booking.totalPrice > 0) {
          const bookingCreated = new Date(booking.createdAt).getTime();
          set({
            payments: payments.map((p) => {
              if (p.userId !== booking.userId) return p;
              if (p.status !== 'pending') return p;
              if (p.method !== 'monthly') return p;
              if (Math.abs(p.amount - booking.totalPrice) > 0.01) return p;
              const pCreated = new Date(p.createdAt).getTime();
              if (Math.abs(pCreated - bookingCreated) > 5000) return p;
              return { ...p, status: 'refunded' as const };
            })
          });
        }

        set({
          bookings: bookings.map((b) =>
            b.id === id
              ? { ...b, status: 'cancelled' as const, accessCode: undefined }
              : b
          ),
        });

        get().addNotification('预订已取消，资源档期已释放，额度已回退', 'info');
        return { success: true };
      },

      payBooking: (bookingId) => {
        const { bookings, currentUser } = get();
        const booking = bookings.find((b) => b.id === bookingId);
        if (!booking || !currentUser) return;

        const conflict = findConflictingBooking(bookings, booking.resourceId, booking.startDate, booking.endDate, booking.id);
        if (conflict) {
          get().addNotification('该时段已被其他用户预订，支付失败', 'error');
          return;
        }

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
        get().addNotification('支付成功！门禁二维码已生效', 'success');
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
      },

      generateMonthlyBill: (agreementId, month) => {
        const { agreements, meetingPackages, bookings, payments, users } = get();
        const agreement = agreements.find((a) => a.id === agreementId);
        if (!agreement) throw new Error('协议不存在');
        const user = users.find((u) => u.id === agreement.userId);

        const baseFee = agreement.monthlyFee;
        const pkg = meetingPackages.find((p) => p.agreementId === agreementId && p.month === month);
        const meetingExtraFee = pkg ? pkg.extraHours * pkg.extraHourRate : 0;

        const monthBookings = bookings.filter(
          (b) =>
            b.userId === agreement.userId &&
            b.pricingModel !== 'monthly' &&
            b.status !== 'cancelled' &&
            b.startDate.startsWith(month)
        );
        const adhocBookingFee = monthBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);

        const totalAmount = baseFee + meetingExtraFee + adhocBookingFee;
        const paidAmount = payments
          .filter((p) => p.userId === agreement.userId && p.billMonth === month && p.status === 'paid')
          .reduce((s, p) => s + p.amount, 0);

        const items: MonthlyBill['items'] = [];
        items.push({
          id: generateId('bi'),
          type: 'base',
          description: `月度协议租金（${agreement.resourceName || '办公空间'}）`,
          amount: baseFee,
          referenceId: agreementId,
          createdAt: formatDate(new Date())
        });
        if (pkg && pkg.extraHours > 0) {
          items.push({
            id: generateId('bi'),
            type: 'meeting_extra',
            description: `会议室超额使用 ${pkg.extraHours} 小时 × ${formatCurrency(pkg.extraHourRate)}`,
            amount: meetingExtraFee,
            quantity: pkg.extraHours,
            unitPrice: pkg.extraHourRate,
            referenceId: pkg.id,
            createdAt: formatDate(new Date())
          });
        }
        for (const b of monthBookings) {
          if (b.totalPrice > 0) {
            items.push({
              id: generateId('bi'),
              type: 'booking',
              description: `${b.resourceName}（${b.startDate} ~ ${b.endDate}）`,
              amount: b.totalPrice,
              referenceId: b.id,
              createdAt: b.createdAt
            });
          }
        }

        const newBill: MonthlyBill = {
          id: generateId('bill'),
          userId: agreement.userId,
          userName: user?.name,
          company: user?.company,
          agreementId,
          month,
          baseFee,
          meetingExtraFee,
          adhocBookingFee,
          totalAmount,
          paidAmount,
          settlementStatus: paidAmount >= totalAmount ? 'paid' : 'pending',
          items,
          createdAt: formatDate(new Date())
        };

        set({ monthlyBills: [...get().monthlyBills.filter(b => !(b.agreementId === agreementId && b.month === month)), newBill] });
        get().addNotification(`${month} 月度账单已生成`, 'success');
        return newBill;
      },

      confirmSettlement: (billId) => {
        const bill = get().monthlyBills.find((b) => b.id === billId);
        if (!bill) return;
        if (bill.settlementStatus !== 'pending') return;

        const nowStr = formatDate(new Date(), 'yyyy-MM-dd HH:mm');
        set({
          monthlyBills: get().monthlyBills.map((b) =>
            b.id === billId
              ? { ...b, settlementStatus: 'confirmed', confirmedAt: nowStr }
              : b
          ),
          payments: get().payments.map((p) =>
            p.userId === bill.userId && p.billMonth === bill.month && p.status === 'pending'
              ? { ...p, settlementStatus: 'confirmed' }
              : p
          )
        });
        get().addNotification(`已确认 ${bill.month} 月度账单，客户端已同步更新`, 'success');
      },

      markBillPaid: (billId, amount) => {
        const bill = get().monthlyBills.find((b) => b.id === billId);
        if (!bill) return;

        const paidNow = amount ?? bill.totalAmount - bill.paidAmount;
        const newPaidAmount = bill.paidAmount + paidNow;
        const nowStr = formatDate(new Date(), 'yyyy-MM-dd HH:mm');
        const user = get().users.find((u) => u.id === bill.userId);

        const newPayment: Payment = {
          id: generateId('p'),
          userId: bill.userId,
          userName: user?.name,
          amount: paidNow,
          method: 'monthly',
          status: 'paid',
          description: `${bill.month} 月度账单结算`,
          billMonth: bill.month,
          settlementStatus: 'paid',
          paidAt: nowStr,
          createdAt: nowStr
        };

        set({
          monthlyBills: get().monthlyBills.map((b) =>
            b.id === billId
              ? { ...b, paidAmount: newPaidAmount, settlementStatus: newPaidAmount >= b.totalAmount ? 'paid' : b.settlementStatus, paidAt: newPaidAmount >= b.totalAmount ? nowStr : b.paidAt }
              : b
          ),
          payments: [...get().payments, newPayment]
        });
        get().addNotification(`已记录收款 ${formatCurrency(paidNow)}`, 'success');
      },

      getBillByMonth: (userId, month) => {
        return get().monthlyBills.find((b) => b.userId === userId && b.month === month) || null;
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
        monthlyBills: state.monthlyBills,
        agreements: state.agreements,
        meetingPackages: state.meetingPackages,
        visitors: state.visitors,
        posts: state.posts,
        comments: state.comments,
        dailyAnalytics: state.dailyAnalytics,
        resourceOccupancy: state.resourceOccupancy,
      })
    }
  )
);
