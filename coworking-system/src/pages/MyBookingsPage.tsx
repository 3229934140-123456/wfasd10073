import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Modal';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel, calculateDays } from '../utils';
import { Calendar, FileText, Clock, CreditCard, CheckCircle2, XCircle, QrCode } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Booking } from '../types';

export function MyBookingsPage() {
  const { currentUser, bookings, resources, cancelBooking, payBooking } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'history'>('all');
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);

  const myBookings = bookings.filter((b) => b.userId === currentUser?.id);
  const now = new Date();

  const filtered = myBookings.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return new Date(b.endDate) >= now && b.status !== 'cancelled';
    }
    return new Date(b.endDate) < now || b.status === 'cancelled';
  });

  const stats = [
    { label: '全部预订', value: myBookings.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '进行中', value: myBookings.filter((b) => new Date(b.endDate) >= now && b.status !== 'cancelled').length, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '待支付', value: myBookings.filter((b) => (b.status === 'confirmed' || b.status === 'pending') && b.totalPrice > 0).length, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: '累计花费', value: myBookings.reduce((s, b) => s + b.totalPrice, 0), color: 'text-primary-600', bg: 'bg-primary-50', showCurrency: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">我的预订</h1>
        <p className="text-slate-500 mt-1">查看您所有的空间资源预订记录</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', s.bg)}>
                  {s.icon && <s.icon className={cn('h-5 w-5', s.color)} />}
                  {!s.icon && <CreditCard className={cn('h-5 w-5', s.color)} />}
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={cn('text-xl font-bold', s.color)}>
                    {s.showCurrency ? formatCurrency(s.value as number) : s.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>预订记录</CardTitle>
              <CardDescription>共 {filtered.length} 条记录</CardDescription>
            </div>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg">
              {(['all', 'active', 'history'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-all',
                    filter === f ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {f === 'all' ? '全部' : f === 'active' ? '进行中' : '历史记录'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>资源</TableHead>
                <TableHead>使用时间</TableHead>
                <TableHead>方式</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="py-12 text-center text-slate-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>暂无预订记录</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => {
                  const resource = resources.find((r) => r.id === b.resourceId);
                  const days = calculateDays(b.startDate, b.endDate);
                  const canCancel = b.status !== 'cancelled' && b.status !== 'completed' && new Date(b.startDate) > now;
                  const canPay = (b.status === 'confirmed' || b.status === 'pending') && b.totalPrice > 0 && currentUser?.role !== 'resident';
                  const showQr = (b.status === 'confirmed' || b.status === 'paid') && new Date(b.endDate) >= new Date(formatDate(new Date()));

                  return (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {resource && (
                            <img src={resource.image} alt="" className="h-12 w-16 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{b.resourceName}</p>
                            <p className="text-xs text-slate-500">{b.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-sm text-slate-700">{b.startDate} ~ {b.endDate}</p>
                          <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {b.pricingModel === 'monthly' ? '月度' : `${days}天`}
                            {b.freeUsageUsed && <Badge variant="success" className="ml-1">免费</Badge>}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                          {b.pricingModel === 'daily' && '日租'}
                          {b.pricingModel === 'weekly' && '周租'}
                          {b.pricingModel === 'monthly' && '月租'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn('font-semibold', b.totalPrice === 0 ? 'text-green-600' : 'text-slate-900')}>
                          {b.totalPrice === 0 ? '免费' : formatCurrency(b.totalPrice)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          b.status === 'paid' ? 'success' :
                          b.status === 'confirmed' ? 'info' :
                          b.status === 'cancelled' ? 'danger' :
                          b.status === 'completed' ? 'muted' : 'warning'
                        }>
                          {getStatusLabel(b.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1 justify-end">
                          {showQr && b.accessCode && (
                            <Button variant="outline" size="sm" onClick={() => setQrBooking(b)}>
                              <QrCode className="h-4 w-4" />
                              门禁码
                            </Button>
                          )}
                          {canPay && (
                            <Button size="sm" variant="success" onClick={() => payBooking(b.id)}>
                              <CreditCard className="h-4 w-4" />
                              支付
                            </Button>
                          )}
                          {canCancel && (
                            <Button size="sm" variant="ghost" onClick={() => cancelBooking(b.id)} className="text-red-600 hover:bg-red-50">
                              <XCircle className="h-4 w-4" />
                              取消
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={!!qrBooking} onClose={() => setQrBooking(null)} title="门禁二维码">
        {qrBooking && (
          <div className="p-8 flex flex-col items-center space-y-6">
            <div className="p-6 bg-white rounded-2xl shadow-lg border-4 border-primary-100">
              <QRCodeSVG
                value={JSON.stringify({
                  code: qrBooking.accessCode,
                  bookingId: qrBooking.id,
                  resourceId: qrBooking.resourceId,
                  userId: currentUser?.id,
                  validFrom: qrBooking.startDate,
                  validUntil: qrBooking.endDate,
                })}
                size={240}
                level="H"
                includeMargin
              />
            </div>

            <div className="w-full space-y-3 text-center">
              <div>
                <p className="text-sm text-slate-500">门禁编号</p>
                <p className="text-lg font-mono font-bold text-slate-900 tracking-wider">{qrBooking.accessCode}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">使用资源</span>
                  <span className="font-medium text-slate-900">{qrBooking.resourceName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">有效期</span>
                  <span className="font-medium text-slate-900">{qrBooking.startDate} ~ {qrBooking.endDate}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                二维码在有效期内均可使用，过期自动失效
              </div>
            </div>

            <Button variant="outline" onClick={() => setQrBooking(null)} className="w-full mt-2">
              关闭
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
