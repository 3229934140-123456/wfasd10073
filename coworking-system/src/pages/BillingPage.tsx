import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Modal';
import { cn, formatCurrency, formatDateTime, getStatusLabel } from '../utils';
import { CreditCard, TrendingUp, FileText, DollarSign, Receipt, Calendar } from 'lucide-react';
import { useState } from 'react';

export function BillingPage() {
  const { currentUser, payments, agreements, meetingPackages } = useAppStore();
  const [tab, setTab] = useState<'payments' | 'monthly'>('payments');

  const myPayments = payments.filter((p) => p.userId === currentUser?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const myAgreements = agreements.filter((a) => a.userId === currentUser?.id && a.status === 'active');
  const myPkgs = meetingPackages.filter((p) => p.userId === currentUser?.id);

  const totalPaid = myPayments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const allPending = myPayments.filter((p) => p.status === 'pending');
  const extraMeetingFee = myPkgs.reduce((s, p) => s + p.extraHours * p.extraHourRate, 0);
  const pendingBookingPayments = allPending.filter((p) => !!p.bookingId);
  const pendingAmount = pendingBookingPayments.reduce((s, p) => s + p.amount, 0);
  const monthlyFee = myAgreements.reduce((s, a) => s + a.monthlyFee, 0);

  const currentMonthBill = monthlyFee + extraMeetingFee + pendingAmount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">我的账单</h1>
        <p className="text-slate-500 mt-1">查看支付记录和月度账单</p>
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
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
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
                <p className="text-xs text-slate-500">待支付金额</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</p>
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
                <p className="text-xs text-slate-500">本月固定费用</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(monthlyFee)}</p>
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
                <p className="text-xs text-slate-500">本月账单合计</p>
                <p className="text-xl font-bold text-primary-600">{formatCurrency(currentMonthBill)}</p>
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
          支付记录
        </button>
        <button
          onClick={() => setTab('monthly')}
          className={cn(
            'px-5 py-2 text-sm font-medium rounded-md transition-all',
            tab === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          月度账单
        </button>
      </div>

      {tab === 'payments' ? (
        <Card>
          <CardHeader>
            <CardTitle>支付记录</CardTitle>
            <CardDescription>共 {myPayments.length} 条支付记录</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>编号</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>方式</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="py-12 text-center text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>暂无支付记录</p>
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
          {myAgreements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>暂无月度协议</p>
              </CardContent>
            </Card>
          ) : (
            myAgreements.map((a) => {
              const pkg = meetingPackages.find((p) => p.agreementId === a.id);
              const meetingExtra = pkg ? pkg.extraHours * pkg.extraHourRate : 0;
              const pendingBooking = pendingBookingPayments.reduce((s, p) => s + p.amount, 0);
              const total = a.monthlyFee + meetingExtra + pendingBooking;
              return (
                <Card key={a.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary-600" />
                          月度账单 - {new Date().toISOString().slice(0, 7)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          协议期：{a.startDate} ~ {a.endDate}
                        </CardDescription>
                      </div>
                      <Badge variant="success">已生效</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">承租资源</p>
                            <p className="font-medium text-slate-900 mt-0.5">{a.resourceName}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">使用人</p>
                            <p className="font-medium text-slate-900 mt-0.5">{a.userName} ({a.company})</p>
                          </div>
                          <div>
                            <p className="text-slate-500">月基础费用</p>
                            <p className="font-medium text-slate-900 mt-0.5">{formatCurrency(a.monthlyFee)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">账单周期</p>
                            <p className="font-medium text-slate-900 mt-0.5">自然月</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <div className="flex items-center gap-2 text-slate-600">
                            <FileText className="h-4 w-4" />
                            基础月租（{a.resourceName}）
                          </div>
                          <span className="font-medium">{formatCurrency(a.monthlyFee)}</span>
                        </div>

                        {pkg && (
                          <>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <div className="text-slate-600">
                                会议室使用
                                <span className="text-xs text-slate-400 ml-2">
                                  {pkg.usedHours}h 免费 / {pkg.freeHours}h 总额度
                                  {pkg.extraHours > 0 && `，超出 ${pkg.extraHours}h × ${formatCurrency(pkg.extraHourRate)}`}
                                </span>
                              </div>
                              <span className={cn('font-medium', meetingExtra > 0 ? 'text-orange-600' : 'text-green-600')}>
                                {meetingExtra > 0 ? formatCurrency(meetingExtra) : '包含在额度内'}
                              </span>
                            </div>
                            {pkg.extraHours > 0 && (
                              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <div className="text-slate-600 text-sm">· 会议室超额费用</div>
                                <span className="font-medium">{formatCurrency(meetingExtra)}</span>
                              </div>
                            )}
                          </>
                        )}

                        {pendingBooking > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <div className="text-slate-600">
                              临时预订（非月度资源）
                            </div>
                            <span className="font-medium">{formatCurrency(pendingBooking)}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 mt-2 bg-slate-900 -mx-4 -mb-4 px-4 py-5 rounded-b-xl text-white">
                          <div>
                            <p className="text-sm text-slate-300">本月应付合计</p>
                            <p className="text-xs text-slate-400 mt-0.5">请于每月 5 日前完成支付</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-green-400">{formatCurrency(total)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
