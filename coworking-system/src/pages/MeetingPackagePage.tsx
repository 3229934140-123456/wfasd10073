import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import { cn, formatCurrency, formatDate } from '../utils';
import { Users, Clock, Gift, AlertTriangle, FileText, CheckCircle2, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, RotateCcw } from 'lucide-react';

function generateMonthOptions(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}
const monthOptions = generateMonthOptions();

interface FlowEntry {
  id: string;
  type: 'usage' | 'cancel' | 'refund';
  bookingId: string;
  resourceName: string;
  date: string;
  totalHours: number;
  freeHours: number;
  extraHours: number;
  extraFee: number;
  status: string;
}

export function MeetingPackagePage() {
  const { currentUser, meetingPackages, agreements, bookings, resources, payments } = useAppStore();
  const currentMonthStr = formatDate(new Date(), 'yyyy-MM');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  const myPkgs = meetingPackages.filter((p) => p.userId === currentUser?.id);
  const myAgreement = agreements.find((a) => a.userId === currentUser?.id && a.status === 'active');

  const currentPkg = myPkgs.find(p => p.month === selectedMonth);

  const flowEntries = useMemo((): FlowEntry[] => {
    const monthBookings = bookings.filter(
      (b) => b.userId === currentUser?.id && resources.find((r) => r.id === b.resourceId)?.type === 'meetingroom'
    );

    const entries: FlowEntry[] = [];
    for (const b of monthBookings) {
      const bMonth = b.startDate.slice(0, 7);
      const bCancelMonth = b.status === 'cancelled' ? (b.createdAt || b.startDate).slice(0, 7) : null;

      if (bMonth === selectedMonth && b.status !== 'cancelled') {
        entries.push({
          id: b.id + '-usage',
          type: 'usage',
          bookingId: b.id,
          resourceName: b.resourceName || '',
          date: b.startDate,
          totalHours: b.bookingHours || 0,
          freeHours: b.deductedFreeHours || 0,
          extraHours: b.deductedExtraHours || 0,
          extraFee: b.totalPrice || 0,
          status: b.status,
        });
      }

      if (b.status === 'cancelled' && (bMonth === selectedMonth || bCancelMonth === selectedMonth)) {
        entries.push({
          id: b.id + '-cancel',
          type: 'cancel',
          bookingId: b.id,
          resourceName: b.resourceName || '',
          date: b.createdAt || b.startDate,
          totalHours: b.bookingHours || 0,
          freeHours: -(b.deductedFreeHours || 0),
          extraHours: -(b.deductedExtraHours || 0),
          extraFee: -(b.totalPrice || 0),
          status: 'cancelled',
        });
      }
    }

    const monthRefunds = payments.filter(
      p => p.userId === currentUser?.id && p.billMonth === selectedMonth && p.status === 'refunded'
    );
    for (const p of monthRefunds) {
      entries.push({
        id: p.id + '-refund',
        type: 'refund',
        bookingId: '',
        resourceName: '退款',
        date: p.createdAt,
        totalHours: 0,
        freeHours: 0,
        extraHours: 0,
        extraFee: -p.amount,
        status: 'refunded',
      });
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [bookings, payments, resources, currentUser, selectedMonth]);

  const prevMonth = () => {
    const idx = monthOptions.indexOf(selectedMonth);
    if (idx > 0) setSelectedMonth(monthOptions[idx - 1]);
  };
  const nextMonth = () => {
    const idx = monthOptions.indexOf(selectedMonth);
    if (idx < monthOptions.length - 1) setSelectedMonth(monthOptions[idx + 1]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">会议室次数包</h1>
          <p className="text-slate-500 mt-1">驻场客户专属，免费会议室额度与使用管理</p>
          {myAgreement && (
            <Badge variant="success" className="mt-2 inline-flex items-center gap-1 px-3 py-1.5">
              <Gift className="h-3.5 w-3.5" />
              协议生效中
            </Badge>
          )}
        </div>
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-white transition-all text-slate-600"><ChevronLeft className="h-4 w-4" /></button>
          <Select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-32 border-0 bg-transparent py-1 text-center font-medium focus:ring-0">
            {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-white transition-all text-slate-600"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {myPkgs.length === 0 || !myAgreement ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-700 mb-2">暂无会议室次数包</p>
            <p className="text-slate-500 mb-6">签订月度协议后，您将自动获得每月免费会议室使用额度</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myPkgs.filter(p => p.month === selectedMonth).map((pkg) => {
              const percent = Math.min((pkg.usedHours / pkg.freeHours) * 100, 100);
              const isNearLimit = percent >= 80;
              const remaining = Math.max(0, pkg.freeHours - pkg.usedHours);
              const extraCost = pkg.extraHours * pkg.extraHourRate;

              return (
                <Card key={pkg.id} className={cn('overflow-hidden', isNearLimit && remaining <= 2 && 'border-orange-300')}>
                  <div className={cn('h-2', percent < 60 ? 'bg-green-500' : percent < 85 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${percent}%` }} />
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">{pkg.month} 使用概览</p>
                        <Badge variant={isNearLimit ? 'warning' : 'success'}>{isNearLimit ? '接近上限' : '额度充足'}</Badge>
                      </div>
                      <div className="mt-3 flex items-end gap-1">
                        <span className="text-4xl font-bold text-slate-900">{pkg.usedHours}</span>
                        <span className="text-lg text-slate-400 mb-1">/ {pkg.freeHours} 小时</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', percent < 60 ? 'bg-green-500' : percent < 85 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{remaining}</p>
                        <p className="text-xs text-slate-500 mt-0.5">剩余(h)</p>
                      </div>
                      <div className="text-center border-x border-slate-100">
                        <p className="text-2xl font-bold text-orange-600">{pkg.extraHours}</p>
                        <p className="text-xs text-slate-500 mt-0.5">超额(h)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary-600">{formatCurrency(extraCost)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">超额费用</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between"><span>超额单价</span><span className="font-medium">{formatCurrency(pkg.extraHourRate)}/小时</span></div>
                      <div className="flex justify-between"><span>使用比例</span><span className="font-medium">{percent.toFixed(1)}%</span></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {myPkgs.filter(p => p.month === selectedMonth).length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-slate-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{selectedMonth} 暂无会议室额度数据</p>
                  <p className="text-sm text-slate-400 mt-1">请选择其他月份查看</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                {selectedMonth} 会议室使用流水
              </CardTitle>
              <CardDescription>共 {flowEntries.length} 条记录</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {flowEntries.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>该月暂无会议室使用记录</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {flowEntries.map((entry) => (
                    <div key={entry.id} className={cn(
                      'p-4 flex items-center gap-4 transition-colors',
                      entry.type === 'cancel' ? 'bg-red-50/50' : entry.type === 'refund' ? 'bg-green-50/50' : 'hover:bg-slate-50'
                    )}>
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                        entry.type === 'usage' ? 'bg-primary-100 text-primary-600' :
                        entry.type === 'cancel' ? 'bg-red-100 text-red-600' :
                        'bg-green-100 text-green-600'
                      )}>
                        {entry.type === 'usage' ? <ArrowUpRight className="h-5 w-5" /> :
                         entry.type === 'cancel' ? <RotateCcw className="h-5 w-5" /> :
                         <ArrowDownLeft className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-slate-900 truncate">{entry.resourceName}</p>
                          {entry.type === 'usage' && entry.freeHours > 0 && (
                            <Badge variant="success" className="flex items-center gap-0.5">
                              <Gift className="h-3 w-3" /> 免费 {entry.freeHours}h
                            </Badge>
                          )}
                          {entry.type === 'usage' && entry.extraHours > 0 && (
                            <Badge variant="warning">超额 {entry.extraHours}h</Badge>
                          )}
                          {entry.type === 'cancel' && (
                            <Badge variant="danger" className="flex items-center gap-0.5">
                              <RotateCcw className="h-3 w-3" /> 已取消回退
                            </Badge>
                          )}
                          {entry.type === 'refund' && (
                            <Badge variant="success" className="flex items-center gap-0.5">
                              <ArrowDownLeft className="h-3 w-3" /> 退款
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {entry.date}
                          {entry.type === 'usage' && entry.totalHours > 0 && ` · 共 ${entry.totalHours} 小时`}
                          {entry.type === 'cancel' && entry.freeHours < 0 && ` · 回退免费 ${Math.abs(entry.freeHours)}h`}
                          {entry.type === 'cancel' && entry.extraHours < 0 && ` · 回退超额 ${Math.abs(entry.extraHours)}h`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn(
                          'font-semibold',
                          entry.extraFee > 0 ? 'text-orange-600' :
                          entry.extraFee < 0 ? 'text-green-600' :
                          'text-green-600'
                        )}>
                          {entry.extraFee > 0 ? `+${formatCurrency(entry.extraFee)}` :
                           entry.extraFee < 0 ? formatCurrency(entry.extraFee) :
                           '免费'}
                        </p>
                        {entry.type === 'usage' && entry.status && (
                          <p className={cn('text-xs mt-0.5', entry.status === 'confirmed' || entry.status === 'paid' ? 'text-green-600' : 'text-slate-400')}>
                            {entry.status === 'confirmed' || entry.status === 'paid' ? (
                              <span className="inline-flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> 已确认</span>
                            ) : entry.status}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {myAgreement && myAgreement.usedMeetingHours / myAgreement.freeMeetingHours > 0.85 && selectedMonth === currentMonthStr && (
            <Card className="border-orange-300 bg-orange-50">
              <CardContent className="p-5 flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900">会议室额度已接近上限</p>
                  <p className="text-sm text-orange-700 mt-1">
                    本月已使用 {myAgreement.usedMeetingHours} / {myAgreement.freeMeetingHours} 小时，超出部分将按 {formatCurrency(myPkgs[0]?.extraHourRate || 100)}/小时 额外计费。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
