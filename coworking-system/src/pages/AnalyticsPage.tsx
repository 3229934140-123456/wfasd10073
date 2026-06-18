import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import { cn, formatCurrency, getResourceTypeLabel } from '../utils';
import {
  TrendingUp,
  DollarSign,
  Building,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';

export function AnalyticsPage() {
  const { dailyAnalytics, resourceOccupancy, resources, bookings, payments, users } = useAppStore();
  const [period, setPeriod] = useState('month');
  const [typeFilter, setTypeFilter] = useState('all');

  const now = new Date();
  const last30Days = dailyAnalytics;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalRevenue = last30Days.reduce((s, d) => s + d.revenue, 0);
  const avgDailyRevenue = Math.round(totalRevenue / last30Days.length);
  const totalBookings = bookings.length;
  const paidBookings = payments.filter((p) => p.status === 'paid').length;

  const occupancyData = resourceOccupancy.filter((r) => {
    if (typeFilter !== 'all') return r.type === typeFilter;
    return true;
  });

  const avgOccupancy = occupancyData.length
    ? (occupancyData.reduce((s, r) => s + r.occupancyRate, 0) / occupancyData.length).toFixed(1)
    : 0;
  const totalResourceRevenue = occupancyData.reduce((s, r) => s + r.revenue, 0);

  const typeRevenue = useMemo(() => {
    const byType: Record<string, number> = {};
    resourceOccupancy.forEach((r) => {
      byType[r.type] = (byType[r.type] || 0) + r.revenue;
    });
    return Object.entries(byType).map(([type, value]) => ({
      name: getResourceTypeLabel(type),
      value,
    }));
  }, [resourceOccupancy]);

  const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316'];

  const lowOccupancy = resourceOccupancy
    .filter((r) => r.occupancyRate < 30)
    .sort((a, b) => a.occupancyRate - b.occupancyRate);

  const highOccupancy = resourceOccupancy
    .filter((r) => r.occupancyRate >= 80)
    .sort((a, b) => b.occupancyRate - a.occupancyRate);

  const chartData = last30Days.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }));

  const typeDistribution = [
    { name: '工位', value: resources.filter((r) => r.type === 'desk').length },
    { name: '独立办公室', value: resources.filter((r) => r.type === 'office').length },
    { name: '会议室', value: resources.filter((r) => r.type === 'meetingroom').length },
  ];

  const stats = [
    {
      label: '月度总收入',
      value: formatCurrency(totalRevenue),
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      text: 'text-green-600',
    },
    {
      label: '平均出租率',
      value: `${avgOccupancy}%`,
      change: '+5.2%',
      icon: Building,
      color: 'from-blue-500 to-primary-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      label: '本月预订数',
      value: totalBookings,
      change: '+8',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-600',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
    {
      label: '已收款订单',
      value: paidBookings,
      change: '+6',
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">运营分析</h1>
          <p className="text-slate-500 mt-1">收入、出租率、空置率等关键运营指标</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-32">
            <option value="week">近7天</option>
            <option value="month">近30天</option>
            <option value="quarter">本季度</option>
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-32">
            <option value="all">全部类型</option>
            <option value="desk">工位</option>
            <option value="office">办公室</option>
            <option value="meetingroom">会议室</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
                </div>
                <div className={cn('h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', s.color)}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-600 font-medium">{s.change}</span>
                <span className="text-slate-400">较上月</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <CardTitle>收入与预订趋势</CardTitle>
            </div>
            <CardDescription>最近30天每日收入和预订数量变化</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="收入(元)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                <Line yAxisId="right" type="monotone" dataKey="bookings" name="预订数" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <CardTitle>资源收入结构</CardTitle>
            </div>
            <CardDescription>各类型资源收入占比</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="75%">
              <RePieChart>
                <Pie
                  data={typeRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {typeRevenue.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {typeRevenue.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-sm">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-slate-600">{item.name}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {lowOccupancy.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle>定价调整建议 - 低出租率资源</CardTitle>
              </div>
              <CardDescription>以下资源出租率低于30%，建议调整定价或推出优惠</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowOccupancy.slice(0, 5).map((r) => (
                <div key={r.resourceId} className="flex items-center gap-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="w-20 flex-shrink-0">
                    <Badge variant="warning">{getResourceTypeLabel(r.type)}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{r.resourceName}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-orange-200 overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${r.occupancyRate}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-orange-600">{r.occupancyRate}%</p>
                    <p className="text-xs text-slate-500">收入 {formatCurrency(r.revenue)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {highOccupancy.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle>高需求资源</CardTitle>
              </div>
              <CardDescription>以下资源出租率高于80%，可考虑提价或增加供给</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {highOccupancy.slice(0, 5).map((r) => (
                <div key={r.resourceId} className="flex items-center gap-4 p-3 rounded-xl bg-green-50 border border-green-100">
                  <div className="w-20 flex-shrink-0">
                    <Badge variant="success">{getResourceTypeLabel(r.type)}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{r.resourceName}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-green-200 overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${r.occupancyRate}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-green-600">{r.occupancyRate}%</p>
                    <p className="text-xs text-slate-500">收入 {formatCurrency(r.revenue)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <CardTitle>各资源出租率与空置率详情</CardTitle>
          </div>
          <CardDescription>按资源类型汇总 {formatCurrency(totalResourceRevenue)} 累计收入</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancyData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="resourceName" angle={-35} textAnchor="end" height={80} stroke="#94a3b8" fontSize={11} interval={0} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number, name: string) => [
                name === 'occupancyRate' ? `${v}%` : name === 'vacancyRate' ? `${v}%` : formatCurrency(v),
                name === 'occupancyRate' ? '出租率' : name === 'vacancyRate' ? '空置率' : '收入'
              ]} />
              <Legend />
              <Bar dataKey="occupancyRate" name="出租率(%)" fill="#22c55e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="vacancyRate" name="空置率(%)" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>资源明细</CardTitle>
          <CardDescription>每个资源的详细运营数据</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="h-12 px-4 text-left font-medium text-slate-500">资源名称</th>
                <th className="h-12 px-4 text-left font-medium text-slate-500">类型</th>
                <th className="h-12 px-4 text-left font-medium text-slate-500">出租天数</th>
                <th className="h-12 px-4 text-left font-medium text-slate-500">出租率</th>
                <th className="h-12 px-4 text-left font-medium text-slate-500">空置率</th>
                <th className="h-12 px-4 text-right font-medium text-slate-500">月收入</th>
              </tr>
            </thead>
            <tbody>
              {occupancyData.map((r) => (
                <tr key={r.resourceId} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-800">{r.resourceName}</td>
                  <td className="p-4">
                    <Badge variant="muted">{getResourceTypeLabel(r.type)}</Badge>
                  </td>
                  <td className="p-4 text-slate-600">{r.occupiedDays} / {r.totalDays} 天</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            r.occupancyRate >= 80 ? 'bg-green-500' :
                            r.occupancyRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${r.occupancyRate}%` }}
                        />
                      </div>
                      <span className={cn(
                        'text-sm font-semibold',
                        r.occupancyRate >= 80 ? 'text-green-600' :
                        r.occupancyRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                      )}>
                        {r.occupancyRate}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{r.vacancyRate}%</td>
                  <td className="p-4 text-right font-semibold text-slate-900">{formatCurrency(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
