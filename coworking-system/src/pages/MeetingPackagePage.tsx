import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn, formatCurrency } from '../utils';
import { Users, Clock, Gift, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

export function MeetingPackagePage() {
  const { currentUser, meetingPackages, agreements, bookings, resources } = useAppStore();

  const myPkgs = meetingPackages.filter((p) => p.userId === currentUser?.id);
  const myBookings = bookings.filter(
    (b) => b.userId === currentUser?.id && resources.find((r) => r.id === b.resourceId)?.type === 'meetingroom'
  );
  const myAgreement = agreements.find((a) => a.userId === currentUser?.id && a.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">会议室次数包</h1>
          <p className="text-slate-500 mt-1">驻场客户专属，免费会议室额度与使用管理</p>
        </div>
        {myAgreement && (
          <Badge variant="success" className="flex items-center gap-1 px-3 py-1.5">
            <Gift className="h-3.5 w-3.5" />
            协议生效中
          </Badge>
        )}
      </div>

      {myPkgs.length === 0 || !myAgreement ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-700 mb-2">暂无会议室次数包</p>
            <p className="text-slate-500 mb-6">
              签订月度协议后，您将自动获得每月免费会议室使用额度
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myPkgs.map((pkg) => {
              const percent = Math.min((pkg.usedHours / pkg.freeHours) * 100, 100);
              const isNearLimit = percent >= 80;
              const remaining = pkg.freeHours - pkg.usedHours;
              const extraCost = pkg.extraHours * pkg.extraHourRate;

              return (
                <Card
                  key={pkg.id}
                  className={cn('overflow-hidden', isNearLimit && remaining <= 2 && 'border-orange-300')}
                >
                  <div className={cn(
                    'h-2',
                    percent < 60 ? 'bg-green-500' : percent < 85 ? 'bg-yellow-500' : 'bg-red-500'
                  )} style={{ width: `${percent}%` }} />
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">{pkg.month} 使用概览</p>
                        <Badge variant={isNearLimit ? 'warning' : 'success'}>
                          {isNearLimit ? '接近上限' : '额度充足'}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-end gap-1">
                        <span className="text-4xl font-bold text-slate-900">{pkg.usedHours}</span>
                        <span className="text-lg text-slate-400 mb-1">/ {pkg.freeHours} 小时</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            percent < 60 ? 'bg-green-500' : percent < 85 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${percent}%` }}
                        />
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
                      <div className="flex justify-between">
                        <span>超额单价</span>
                        <span className="font-medium">{formatCurrency(pkg.extraHourRate)}/小时</span>
                      </div>
                      <div className="flex justify-between">
                        <span>使用比例</span>
                        <span className="font-medium">{percent.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {myAgreement && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  协议详情
                </CardTitle>
                <CardDescription>您的月度协议与会务权益说明</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-blue-50">
                    <p className="text-xs text-slate-500">承租资源</p>
                    <p className="font-semibold text-slate-900 mt-1">{myAgreement.resourceName}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                    <p className="text-xs text-slate-500">每月免费额度</p>
                    <p className="font-semibold text-green-700 mt-1 text-xl">{myAgreement.freeMeetingHours} 小时</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50">
                    <p className="text-xs text-slate-500">本月已使用</p>
                    <p className="font-semibold text-purple-700 mt-1 text-xl">{myAgreement.usedMeetingHours} 小时</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50">
                    <p className="text-xs text-slate-500">协议周期</p>
                    <p className="font-semibold text-orange-700 mt-1 text-sm">
                      {myAgreement.startDate}
                      <br />至 {myAgreement.endDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                会议室使用记录
              </CardTitle>
              <CardDescription>共 {myBookings.length} 条会议室预订记录</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {myBookings.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无会议室使用记录</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myBookings.map((b) => {
                    const resource = resources.find((r) => r.id === b.resourceId);
                    const isFree = b.freeUsageUsed || b.totalPrice === 0;
                    return (
                      <div key={b.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <img
                          src={resource?.image}
                          alt=""
                          className="h-14 w-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-slate-900 truncate">{b.resourceName}</p>
                            {isFree ? (
                              <Badge variant="success" className="flex items-center gap-0.5">
                                <Gift className="h-3 w-3" />
                                免费额度
                              </Badge>
                            ) : (
                              <Badge variant="warning">额外计费</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {b.startDate} ~ {b.endDate}
                            {b.pricingModel === 'daily' && ' · 按日计费'}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {b.totalPrice === 0 ? (
                            <p className="font-semibold text-green-600">免费</p>
                          ) : (
                            <p className="font-semibold text-slate-900">{formatCurrency(b.totalPrice)}</p>
                          )}
                          <p className={cn(
                            'text-xs mt-0.5',
                            b.status === 'paid' || b.status === 'confirmed' ? 'text-green-600' : 'text-slate-400'
                          )}>
                            {b.status === 'paid' || b.status === 'confirmed' ? (
                              <span className="inline-flex items-center gap-0.5">
                                <CheckCircle2 className="h-3 w-3" />
                                已确认
                              </span>
                            ) : (
                              b.status
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {myAgreement && myAgreement.usedMeetingHours / myAgreement.freeMeetingHours > 0.85 && (
            <Card className="border-orange-300 bg-orange-50">
              <CardContent className="p-5 flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900">会议室额度已接近上限</p>
                  <p className="text-sm text-orange-700 mt-1">
                    本月已使用 {myAgreement.usedMeetingHours} / {myAgreement.freeMeetingHours} 小时，超出部分将按 {formatCurrency(myPkgs[0]?.extraHourRate || 100)}/小时 额外计费。
                    如需增加额度，请联系运营方。
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
