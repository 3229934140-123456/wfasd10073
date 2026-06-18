import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Modal';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Input';
import { cn, formatCurrency, formatDateTime, getSettlementStatusLabel, getSettlementStatusVariant } from '../utils';
import { FileText, DollarSign, Users, Calendar, CheckCircle2, CreditCard, Search, Filter, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MonthlyBill } from '../types';

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

export function OperatorBillingPage() {
  const { monthlyBills, agreements, users, payments, meetingPackages, generateMonthlyBill, confirmSettlement, markBillPaid } = useAppStore();
  const [filterMonth, setFilterMonth] = useState(monthOptions.find(m => m === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`) || monthOptions[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [detailBill, setDetailBill] = useState<MonthlyBill | null>(null);
  const [confirmingId, setConfirmingId] = useState('');
  const [payingId, setPayingId] = useState('');

  const residentUsers = users.filter(u => u.role === 'resident');
  const activeAgreements = agreements.filter(a => a.status === 'active');

  const filteredBills = useMemo(() => {
    let list = [...monthlyBills];
    if (filterMonth !== 'all') list = list.filter(b => b.month === filterMonth);
    if (filterStatus !== 'all') list = list.filter(b => b.settlementStatus === filterStatus);
    if (filterClient !== 'all') list = list.filter(b => b.userId === filterClient);
    if (searchText) {
      const s = searchText.toLowerCase();
      list = list.filter(b => (b.userName || '').toLowerCase().includes(s) || (b.company || '').toLowerCase().includes(s));
    }
    return list.sort((a, b) => b.month.localeCompare(a.month));
  }, [monthlyBills, filterMonth, filterStatus, filterClient, searchText]);

  const totalAmount = filteredBills.reduce((s, b) => s + b.totalAmount, 0);
  const totalPaid = filteredBills.reduce((s, b) => s + b.paidAmount, 0);
  const totalUnpaid = totalAmount - totalPaid;
  const pendingCount = filteredBills.filter(b => b.settlementStatus === 'pending').length;
  const paidCount = filteredBills.filter(b => b.settlementStatus === 'paid').length;

  const handleConfirm = (billId: string) => {
    setConfirmingId(billId);
    setTimeout(() => {
      confirmSettlement(billId);
      setConfirmingId('');
    }, 300);
  };

  const handleMarkPaid = (billId: string) => {
    setPayingId(billId);
    setTimeout(() => {
      markBillPaid(billId);
      setPayingId('');
    }, 300);
  };

  const handleGenerateBill = (agreementId: string) => {
    generateMonthlyBill(agreementId, filterMonth);
  };

  const detailPayments = detailBill ? payments.filter(p => p.userId === detailBill.userId && p.billMonth === detailBill.month) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">月结对账</h1>
          <p className="text-slate-500 mt-1">管理驻场客户月度结算与收款</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={() => { const idx = monthOptions.indexOf(filterMonth); if (idx > 0) setFilterMonth(monthOptions[idx - 1]); }} className="p-1.5 rounded-md hover:bg-white transition-all text-slate-600"><ChevronLeft className="h-4 w-4" /></button>
            <Select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-32 border-0 bg-transparent py-1 text-center font-medium focus:ring-0">
              <option value="all">全部月份</option>
              {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
            <button onClick={() => { const idx = monthOptions.indexOf(filterMonth); if (idx < monthOptions.length - 1) setFilterMonth(monthOptions[idx + 1]); }} className="p-1.5 rounded-md hover:bg-white transition-all text-slate-600"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-28">
            <option value="all">全部状态</option>
            <option value="pending">待结算</option>
            <option value="confirmed">已确认</option>
            <option value="paid">已付款</option>
          </Select>
          <Select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="w-36">
            <option value="all">全部客户</option>
            {residentUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.company})</option>)}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center"><DollarSign className="h-5 w-5 text-primary-600" /></div>
              <div>
                <p className="text-xs text-slate-500">账单总额</p>
                <p className="text-xl font-bold text-primary-600">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-slate-500">已收款</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center"><CreditCard className="h-5 w-5 text-orange-600" /></div>
              <div>
                <p className="text-xs text-slate-500">待收款</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(totalUnpaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center"><FileText className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-xs text-slate-500">账单数</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-purple-600">{filteredBills.length}</span>
                  <span className="text-xs text-orange-500">{pendingCount}待处理</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {filterMonth !== 'all' && activeAgreements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{filterMonth} 账单生成</CardTitle>
            <CardDescription>为未生成账单的活跃协议创建月度账单</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {activeAgreements.filter(a => !monthlyBills.find(b => b.agreementId === a.id && b.month === filterMonth)).map(a => {
                const user = users.find(u => u.id === a.userId);
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user?.name} ({user?.company})</p>
                      <p className="text-xs text-slate-500">{a.resourceName} · 月租 {formatCurrency(a.monthlyFee)}</p>
                    </div>
                    <Button size="sm" onClick={() => handleGenerateBill(a.id)}>生成账单</Button>
                  </div>
                );
              })}
              {activeAgreements.filter(a => !monthlyBills.find(b => b.agreementId === a.id && b.month === filterMonth)).length === 0 && (
                <p className="text-sm text-slate-500 py-2">{filterMonth} 所有活跃协议的账单已生成</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>月结账单列表</CardTitle>
              <CardDescription>共 {filteredBills.length} 条账单</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>客户</TableHead>
                <TableHead>月份</TableHead>
                <TableHead>基础月租</TableHead>
                <TableHead>会议超额</TableHead>
                <TableHead>临时预订</TableHead>
                <TableHead>账单总额</TableHead>
                <TableHead>已收款</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="py-16 text-center text-slate-500">
                      <FileText className="h-14 w-14 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">暂无账单</p>
                      <p className="text-sm text-slate-400 mt-1">请调整筛选条件或生成账单</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{b.userName}</p>
                        <p className="text-xs text-slate-500">{b.company}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{b.month}</TableCell>
                    <TableCell>{formatCurrency(b.baseFee)}</TableCell>
                    <TableCell className={b.meetingExtraFee > 0 ? 'text-orange-600 font-medium' : 'text-slate-400'}>
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
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setDetailBill(b)}>详情</Button>
                        {b.settlementStatus === 'pending' && (
                          <Button size="sm" variant="success" onClick={() => handleConfirm(b.id)} disabled={confirmingId === b.id}>
                            {confirmingId === b.id ? '处理中' : '确认'}
                          </Button>
                        )}
                        {(b.settlementStatus === 'confirmed' || b.settlementStatus === 'pending') && b.paidAmount < b.totalAmount && (
                          <Button size="sm" onClick={() => handleMarkPaid(b.id)} disabled={payingId === b.id}>
                            {payingId === b.id ? '处理中' : '收款'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={!!detailBill} onClose={() => setDetailBill(null)} size="lg" title={detailBill ? `${detailBill.userName} - ${detailBill.month} 月度账单` : ''}>
        {detailBill && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">客户</p>
                <p className="font-semibold text-slate-900">{detailBill.userName}</p>
                <p className="text-xs text-slate-500">{detailBill.company}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">账单状态</p>
                <Badge variant={getSettlementStatusVariant(detailBill.settlementStatus)} className="mt-1">
                  {getSettlementStatusLabel(detailBill.settlementStatus)}
                </Badge>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">确认时间</p>
                <p className="font-medium text-sm">{detailBill.confirmedAt ? formatDateTime(detailBill.confirmedAt) : '未确认'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">收款时间</p>
                <p className="font-medium text-sm">{detailBill.paidAt ? formatDateTime(detailBill.paidAt) : '未收款'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3">费用拆分</h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                {detailBill.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center px-4 py-3 border-b border-slate-100 last:border-b-0">
                    <div>
                      <p className="text-slate-700 font-medium">{item.description}</p>
                      {item.quantity !== undefined && item.unitPrice !== undefined && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                      )}
                    </div>
                    <span className={cn('font-semibold', item.type === 'meeting_extra' ? 'text-orange-600' : 'text-slate-900')}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-4 bg-slate-900 text-white">
                  <span className="font-medium">账单总额</span>
                  <span className="text-2xl font-bold text-green-400">{formatCurrency(detailBill.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3">收款记录</h4>
              {detailPayments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">暂无收款记录</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>描述</TableHead>
                      <TableHead>方式</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailPayments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-slate-700">{p.description}</TableCell>
                        <TableCell>{p.method === 'online' ? '在线支付' : '月度结算'}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(p.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'paid' ? 'success' : p.status === 'refunded' ? 'muted' : 'warning'}>
                            {p.status === 'paid' ? '已支付' : p.status === 'refunded' ? '已退款' : '待支付'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{p.paidAt ? formatDateTime(p.paidAt) : formatDateTime(p.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                已收款 <span className="font-semibold text-green-600">{formatCurrency(detailBill.paidAmount)}</span>
                {' / '}
                待收款 <span className="font-semibold text-orange-600">{formatCurrency(detailBill.totalAmount - detailBill.paidAmount)}</span>
              </div>
              <div className="flex gap-2">
                {detailBill.settlementStatus === 'pending' && (
                  <Button variant="success" onClick={() => { handleConfirm(detailBill.id); setDetailBill({...detailBill, settlementStatus: 'confirmed', confirmedAt: new Date().toISOString()}); }}>确认结算</Button>
                )}
                {detailBill.paidAmount < detailBill.totalAmount && (
                  <Button onClick={() => { handleMarkPaid(detailBill.id); setDetailBill({...detailBill, paidAmount: detailBill.totalAmount, settlementStatus: 'paid', paidAt: new Date().toISOString()}); }}>标记已收款</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
