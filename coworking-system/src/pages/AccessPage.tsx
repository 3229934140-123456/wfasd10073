import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn, formatDate, formatDateTime, getStatusColor, getStatusLabel, isDateExpired } from '../utils';
import { QrCode, Calendar, AlertTriangle, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import type { Booking } from '../types';

export function AccessPage() {
  const { currentUser, bookings, resources } = useAppStore();
  const today = formatDate(new Date());

  const activeBookings = bookings.filter(
    (b) =>
      b.userId === currentUser?.id &&
      (b.status === 'confirmed' || b.status === 'paid') &&
      !isDateExpired(b.endDate + ' 23:59')
  );

  const [selected, setSelected] = useState<Booking | null>(activeBookings[0] || null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">门禁二维码</h1>
        <p className="text-slate-500 mt-1">凭此二维码进入已预订的办公空间，过期自动失效</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-primary-200 shadow-sm">
            <CardContent className="p-8">
              {!selected || !selected.accessCode ? (
                <div className="py-20 text-center">
                  <QrCode className="h-20 w-20 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium text-slate-700 mb-2">暂无有效的门禁码</p>
                  <p className="text-sm text-slate-500">请先完成空间资源的预订</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'p-5 rounded-2xl shadow-lg transition-all',
                      isDateExpired(selected.endDate + ' 23:59')
                        ? 'bg-slate-100 border-4 border-slate-300 grayscale'
                        : 'bg-white border-4 border-green-200'
                    )}>
                      <QRCodeSVG
                        value={JSON.stringify({
                          code: selected.accessCode,
                          bookingId: selected.id,
                          resourceId: selected.resourceId,
                          userId: currentUser?.id,
                          userName: currentUser?.name,
                          validFrom: selected.startDate,
                          validUntil: selected.endDate,
                          generatedAt: new Date().toISOString(),
                        })}
                        size={260}
                        level="H"
                        includeMargin
                        imageSettings={undefined}
                      />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-slate-900">{selected.resourceName}</h3>
                        <Badge variant={isDateExpired(selected.endDate + ' 23:59') ? 'muted' : 'success'}>
                          {isDateExpired(selected.endDate + ' 23:59') ? '已过期' : '有效'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{resources.find((r) => r.id === selected.resourceId)?.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">开始日期</span>
                        </div>
                        <p className="font-semibold text-slate-800">{selected.startDate}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs">结束日期</span>
                        </div>
                        <p className="font-semibold text-slate-800">{selected.endDate}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">门禁编号</span>
                        <span className="font-mono font-bold text-green-400 tracking-wider">{selected.accessCode}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className={cn(
                        'p-3 rounded-lg border flex items-start gap-2',
                        isDateExpired(selected.endDate + ' 23:59')
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-200'
                      )}>
                        {isDateExpired(selected.endDate + ' 23:59') ? (
                          <>
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-900">二维码已过期</p>
                              <p className="text-xs text-red-700 mt-0.5">请重新预订或联系管理员</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-green-900">二维码可正常使用</p>
                              <p className="text-xs text-green-700 mt-0.5">
                                在有效期内可反复扫描，门禁系统会自动核验权限
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">有效门禁列表</CardTitle>
              <CardDescription>{activeBookings.length} 个可用</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeBookings.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  暂无有效的预订
                </div>
              ) : (
                activeBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className={cn(
                      'w-full p-3 rounded-xl border text-left transition-all',
                      selected?.id === b.id
                        ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200'
                        : 'border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 text-sm truncate">{b.resourceName}</p>
                        <p className="text-xs text-slate-500 mt-1">{b.startDate} ~ {b.endDate}</p>
                      </div>
                      <QrCode className={cn('h-5 w-5 flex-shrink-0', selected?.id === b.id ? 'text-primary-600' : 'text-slate-400')} />
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-sm text-slate-600">到达空间入口处，找到门禁扫码设备</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-sm text-slate-600">将上方二维码对准扫描区域</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-sm text-slate-600">验证通过后，门禁将自动解锁</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  !
                </div>
                <p className="text-sm text-slate-600">
                  二维码具有时效性，仅限本人使用，请勿转发
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-5">
              <p className="text-xs text-slate-400 mb-1">生成时间</p>
              <p className="text-sm font-medium">{formatDateTime(new Date())}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
