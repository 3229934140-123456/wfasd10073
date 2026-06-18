import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Modal';
import { Select } from '../components/ui/Input';
import { cn, formatCurrency, formatDate, formatDateTime, getStatusLabel, getSettlementStatusLabel, getSettlementStatusVariant } from '../utils';
import { CreditCard, TrendingUp, FileText, DollarSign, Receipt, Calendar, Clock, Users, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { MonthlyBill } from '../types';

function generateMonthOptions(): string[] {
  const months: string[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  for (let i = 1; i <= 3; i++) {
    const d = new Date(currentYear, currentMonth + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

const monthOptions = generateMonthOptions();

export function BillingPage() {
  const { currentUser, payments, agreements, meetingPackages, monthlyBills } = useAppStore();
  const [tab, setTab] = useState<'payments' | 'monthly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions.find(m => m === formatDate(new Date(), 'yyyy-MM')) || monthOptions[0]);

  const myPayments = useMemo(
    () => payments.filter((p) => p.userId === currentUser?.id && (!p.billMonth || p.billMonth === selectedMonth))
                 .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [payments, currentUser, selectedMonth]
  );

  const myAllPayments = useMemo(
    () => payments.filter((p) => p.userId === currentUser?.id),
    [payments, currentUser]
  );

  const myAgreements = agreements.filter((a) => a.userId === currentUser?.id && a.status === 'active');
  const myPkgs = meetingPackages.filter((p) => p.userId === currentUser?.id);

  const bills = monthlyBills.filter(b => b.userId === currentUser?.id);
  const currentBill: MonthlyBill | null = bills.find(b => b.month === selectedMonth) || null;

  const monthPkg = myPkgs.find(p => p.month === selectedMonth);
  const monthPaid = myPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const monthPendingAll = myPayments.filter(p => p.status === 'pending');
  const monthPending = monthPendingAll.filter(p => !!p.bookingId).reduce((s, p) => s + p.amount, 0);

  const totalPaidAll = myAllPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPendingAll = myAllPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const monthlyFee = myAgreements.reduce((s, a) => s + a.monthlyFee, 0);

  const baseFee = currentBill ? currentBill.baseFee : 0;
  const meetingExtraFee = currentBill ? currentBill.meetingExtraFee : (monthPkg ? monthPkg.extraHours * monthPkg.extraHourRate : 0);
  const adhocFee = currentBill ? currentBill.adhocBookingFee : monthPending;
  const monthTotal = currentBill ? currentBill.totalAmount : baseFee + meetingExtraFee + adhocFee;
  const monthPaidAmount = currentBill ? currentBill.paidAmount : monthPaid;
  const monthUnpaid = Math.max(0, monthTotal - monthPaidAmount);
  const settlementStatus = currentBill ? currentBill.settlementStatus : 'pending';

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
          <h1 className="text-2xl font-bold text-slate-900">我的账单</h1>
          <p className="text-slate-500 mt-1">查看支付记录和月度账单明细</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-600">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-32 border-0 bg-transparent py-1 text-center font-medium text-slate-900 focus:ring-0"
            >
              {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-600">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">累计已支付</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaidAll)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{selectedMonth} 待付款</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(monthUnpaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{selectedMonth} 固定费用</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(baseFee)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{selectedMonth} 账单合计</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-primary-600">{formatCurrency(monthTotal)}</p>
                  <Badge variant={getSettlementStatusVariant(settlementStatus)}>
                    {getSettlementStatusLabel(settlementStatus)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="inline-flex p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setTab('payments')}
          className={cn(
            'px-5 py-2 text-sm font-medium rounded-md transition-all',
            tab === 'payments' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            支付记录 ({myPayments.length})
          </span>
        </button>
        <button
          onClick={() => setTab('monthly')}
          className={cn(
            'px-5 py-2 text-sm font-medium rounded-md transition-all',
            tab === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            月度账单
          </span>
        </button>
      </div>

      {tab === 'payments' ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedMonth} 支付记录</CardTitle>
            <CardDescription>共 {myPayments.length} 条记录，已支付 {formatCurrency(monthPaid)}，待支付 {formatCurrency(myPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0))}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>编号</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>方式</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>支付状态</TableHead>
                  <TableHead>结算状态</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-16 text-center text-slate-500">
                        <FileText className="h-14 w-14 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">该月暂无支付记录</p>
                        <p className="text-sm text-slate-400 mt-1">请切换到其他月份查看</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  myPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-500">{p.id}</span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">{p.description}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          {p.method === 'online' ? (
                            <><CreditCard className="h-4 w-4 text-blue-500" />在线支付</>
                          ) : (
                            <><Calendar className="h-4 w-4 text-purple-500" />月度结算</>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900">{formatCurrency(p.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          p.status === 'paid' ? 'success' :
                          p.status === 'failed' ? 'danger' :
                          p.status === 'refunded' ? 'muted' : 'warning'
                        }>
                          {getStatusLabel(p.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.settlementStatus ? (
                          <Badge variant={getSettlementStatusVariant(p.settlementStatus)}>
                            {getSettlementStatusLabel(p.settlementStatus)}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {p.paidAt ? formatDateTime(p.paidAt) : formatDateTime(p.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {!currentBill && myAgreements.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-slate-500">
                <FileText className="h-14 w-14 mx-auto mb-4 opacity-50" />
                <p className="text-lg">暂无月度协议</p>
                <p className="text-sm text-slate-400 mt-1">如需长期驻场办公，请联系运营方签订协议</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {!currentBill && myAgreements.length > 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-slate-500">
                    <AlertCircle className="h-14 w-14 mx-auto mb-4 text-yellow-500" />
                    <p className="text-lg">{selectedMonth} 账单暂未生成</p>
                    <p className="text-sm text-slate-400 mt-1">请选择其他月份或联系运营方生成</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary-600" />
                          月度账单 - {selectedMonth}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          协议期：{currentBill ? myAgreements.find(a => a.id === currentBill.agreementId)?.startDate : '-'} ~ {currentBill ? myAgreements.find(a => a.id === currentBill.agreementId)?.endDate : '-'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="success">协议生效中</Badge>
                        <Badge variant={getSettlementStatusVariant(settlementStatus)}>
                          {getSettlementStatusLabel(settlementStatus)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">承租资源</p>
                            <p className="font-medium text-slate-900 mt-0.5">{currentBill ? myAgreements.find(a => a.id === currentBill.agreementId)?.resourceName : '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">使用人</p>
                            <p className="font-medium text-slate-900 mt-0.5">{currentBill?.userName} ({currentBill?.company})</p>
                          </div>
                          <div>
                            <p className="text-slate-500">账单确认</p>
                            <p className="font-medium text-slate-900 mt-0.5 flex items-center gap-1.5">
                              {currentBill?.confirmedAt ? (
                                <><CheckCircle2 className="h-4 w-4 text-green-600" /> {formatDateTime(currentBill.confirmedAt)}</>
                              ) : (
                                <><Clock className="h-4 w-4 text-yellow-500" /> 运营方确认中</>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">已收款</p>
                            <p className="font-medium text-slate-900 mt-0.5">
                              {formatCurrency(monthPaidAmount)} {currentBill?.paidAt && <span className="text-green-600 text-xs">· {formatDateTime(currentBill.paidAt)}</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {currentBill ? (
                          currentBill.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100">
                              <div className="text-slate-600">
                                {item.description}
                                {item.quantity !== undefined && item.unitPrice !== undefined && (
                                  <span className="text-xs text-slate-400 ml-2">
                                    ({item.quantity} × {formatCurrency(item.unitPrice)})
                                  </span>
                                )}
                              </div>
                              <span className={cn('font-medium', item.type === 'meeting_extra' ? 'text-orange-600' : 'text-slate-900')}>
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <div className="flex items-center gap-2 text-slate-600">
                                <FileText className="h-4 w-4" />
                                基础月租
                              </div>
                              <span className="font-medium">{formatCurrency(baseFee)}</span>
                            </div>
                            {monthPkg && monthPkg.extraHours > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div className="text-slate-600">
                                  会议室超额使用 {monthPkg.extraHours}h × {formatCurrency(monthPkg.extraHourRate)}
                                </div>
                                <span className="font-medium text-orange-600">{formatCurrency(meetingExtraFee)}</span>
                              </div>
                            )}
                            {adhocFee > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div className="text-slate-600">临时预订（非月度资源）</div>
                                <span className="font-medium">{formatCurrency(adhocFee)}</span>
                              </div>
                            )}
                          </>
                        )}

                        <div className="flex justify-between items-center pt-4 mt-2 bg-slate-900 -mx-4 -mb-4 px-4 py-5 rounded-b-xl text-white">
                          <div>
                            <p className="text-sm text-slate-300">{selectedMonth} 应付合计</p>
                            {monthUnpaid > 0 && <p className="text-xs text-yellow-400 mt-0.5">还需支付 {formatCurrency(monthUnpaid)}</p>}
                            {monthUnpaid === 0 && settlementStatus === 'paid' && (
                              <p className="text-xs text-green-400 mt-0.5">✓ 账单已结清</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-400">已付 {formatCurrency(monthPaidAmount)}</p>
                            <p className="text-3xl font-bold text-green-400">{formatCurrency(monthTotal)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {bills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>历史账单</CardTitle>
                    <CardDescription>过去 12 个月账单记录</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>月份</TableHead>
                          <TableHead>基础月租</TableHead>
                          <TableHead>会议超额</TableHead>
                          <TableHead>临时预订</TableHead>
                          <TableHead>账单总额</TableHead>
                          <TableHead>已支付</TableHead>
                          <TableHead>状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bills.sort((a, b) => b.month.localeCompare(a.month)).map((b) => (
                          <TableRow key={b.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedMonth(b.month)}>
                            <TableCell className="font-medium text-slate-800">{b.month}</TableCell>
                            <TableCell>{formatCurrency(b.baseFee)}</TableCell>
                            <TableCell className={b.meetingExtraFee > 0 ? 'text-orange-600' : 'text-slate-500'}>
                              {formatCurrency(b.meetingExtraFee)}
                            </TableCell>
                            <TableCell>{formatCurrency(b.adhocBookingFee)}</TableCell>
                            <TableCell className="font-semibold text-slate-900">{formatCurrency(b.totalAmount)}</TableCell>
                            <TableCell className="text-green-600 font-medium">{formatCurrency(b.paidAmount)}</TableCell>
                            <TableCell>
                              <Badge variant={getSettlementStatusVariant(b.settlementStatus)}>
                                {getSettlementStatusLabel(b.settlementStatus)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
