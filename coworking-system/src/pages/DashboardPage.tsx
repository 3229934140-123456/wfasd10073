import { useMemo } from 'react';
import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  Calendar,
  CreditCard,
  UserCheck,
  FileText,
  ArrowRight,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn, formatCurrency, formatDateTime, getRoleLabel } from '../utils';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    resources,
    bookings,
    payments,
    users,
    visitors,
    agreements,
    dailyAnalytics,
    resourceOccupancy,
  } = useAppStore();

  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => b.startDate <= today && b.endDate >= today);
  const todayVisitors = visitors.filter((v) => v.checkIn.slice(0, 10) === today);
  const waitingVisitors = visitors.filter((v) => v.status === 'waiting');
  const pendingPayments = payments.filter((p) => p.status === 'pending');

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const avgOccupancy = resourceOccupancy.length
    ? (resourceOccupancy.reduce((s, r) => s + r.occupancyRate, 0) / resourceOccupancy.length).toFixed(1)
    : '0';

  const recentBookings = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentPayments = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const newUsers = [...users].filter((u) => u.role === 'customer' || u.role === 'resident').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const quickStats = [
    {
      label: '可用资源',
      value: resources.filter((r) => r.status === 'available').length,
      total: resources.length,
      icon: Building2,
      color: 'from-blue-500 to-primary-600',
      path: '/resources',
    },
    {
      label: '今日预订',
      value: todayBookings.length,
      total: bookings.length,
      icon: Calendar,
      color: 'from-green-500 to-emerald-600',
      path: '/booking',
    },
    {
      label: '活跃协议',
      value: agreements.filter((a) => a.status === 'active').length,
      total: agreements.length,
      icon: FileText,
      color: 'from-purple-500 to-indigo-600',
      path: '/agreements',
    },
    {
      label: '注册用户',
      value: users.filter((u) => u.role === 'customer' || u.role === 'resident').length,
      total: users.length,
      icon: Users,
      color: 'from-orange-500 to-amber-600',
    },
  ];

  const chartData = dailyAnalytics.slice(-14).map((d) => ({
    ...d,
    date: d.date.slice(5),
  }));

  const lowOccupancy = useMemo(
    () => resourceOccupancy.filter((r) => r.occupancyRate < 30).length,
    [resourceOccupancy]
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              您好，{currentUser?.name} 👋
            </h1>
            <p className="text-slate-500 mt-1">
              欢迎回来，今天是 {formatDateTime(new Date()).slice(0, 10)}，让我们看看今日运营情况。
            </p>
          </div>
          <Badge variant="default" className="self-start px-3 py-1.5 text-xs">
            <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
            {getRoleLabel(currentUser?.role || '')} 控制台
          </Badge>
        </div>
      </div>

      {(waitingVisitors.length > 0 || pendingPayments.length > 0 || lowOccupancy > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {waitingVisitors.length > 0 && (
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-orange-900">{waitingVisitors.length} 位访客等待接待</p>
                <p className="text-xs text-orange-700 mt-0.5">请及时通知驻场客户</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/visitors')}>
                  查看详情 <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          {pendingPayments.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-blue-900">{pendingPayments.length} 笔待支付</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  共 {formatCurrency(pendingPayments.reduce((s, p) => s + p.amount, 0))} 待确认
                </p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/analytics')}>
                  运营分析 <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          {lowOccupancy > 0 && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-purple-900">{lowOccupancy} 个资源出租率偏低</p>
                <p className="text-xs text-purple-700 mt-0.5">建议调整定价或推出优惠</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/analytics')}>
                  查看详情 <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((s) => (
          <Card
            key={s.label}
            className={cn('cursor-pointer transition-all hover:shadow-md', s.path && 'hover:-translate-y-0.5')}
            onClick={() => s.path && navigate(s.path)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">共 {s.total} 个</p>
                </div>
                <div className={cn('h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md', s.color)}>
                  <s.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  收入趋势（近14天）
                </CardTitle>
                <CardDescription>每日收入变化情况</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
                详情 <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-72 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(v: number) => [formatCurrency(v), '收入']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                关键指标
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <span className="text-sm text-slate-600">累计收入</span>
                <span className="text-lg font-bold text-green-700">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                <span className="text-sm text-slate-600">平均出租率</span>
                <span className="text-lg font-bold text-blue-700">{avgOccupancy}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                <span className="text-sm text-slate-600">今日访客</span>
                <span className="text-lg font-bold text-orange-700">{todayVisitors.length} 人</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                <span className="text-sm text-slate-600">平均空置率</span>
                <span className="text-lg font-bold text-purple-700">{(100 - parseFloat(avgOccupancy)).toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-600" />
                最近预订
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/resources')}>
                管理资源
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-0">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">暂无预订</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBookings.map((b) => (
                  <div key={b.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{b.resourceName}</p>
                      <p className="text-xs text-slate-500">
                        {b.userName} · {b.startDate} ~ {b.endDate}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-slate-900 text-sm">
                        {b.totalPrice === 0 ? '免费' : formatCurrency(b.totalPrice)}
                      </p>
                      <Badge variant={
                        b.status === 'paid' ? 'success' :
                        b.status === 'confirmed' ? 'info' :
                        b.status === 'pending' ? 'warning' : 'muted'
                      } className="mt-0.5">
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                最近支付
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-0">
            {recentPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">暂无支付记录</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPayments.map((p) => (
                  <div key={p.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      p.status === 'paid' ? 'bg-green-50' : p.status === 'pending' ? 'bg-yellow-50' : 'bg-red-50'
                    )}>
                      {p.status === 'paid' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{p.description}</p>
                      <p className="text-xs text-slate-500">{p.userName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        'font-semibold text-sm',
                        p.status === 'paid' ? 'text-green-700' : p.status === 'pending' ? 'text-yellow-700' : 'text-red-700'
                      )}>
                        {formatCurrency(p.amount)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.paidAt ? p.paidAt.slice(5, 16) : p.createdAt.slice(5, 16)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
