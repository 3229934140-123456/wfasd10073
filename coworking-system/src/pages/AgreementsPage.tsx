import { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Label, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { cn, formatCurrency, getStatusColor, getStatusLabel } from '../utils';
import { FileText, Plus, Calendar, Building, Users, CreditCard, Clock } from 'lucide-react';
import type { MonthlyAgreement } from '../types';
import { formatDate } from '../utils';

export function AgreementsPage() {
  const { currentUser, agreements, resources, users, createAgreement } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const isOperator = currentUser?.role === 'operator';

  const myAgreements = isOperator ? agreements : agreements.filter((a) => a.userId === currentUser?.id);

  const [form, setForm] = useState({
    userId: '',
    resourceId: '',
    monthlyFee: 0,
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date(Date.now() + 180 * 86400000)),
    freeMeetingHours: 20,
  });

  const handleSubmit = () => {
    if (!form.userId || !form.resourceId) return;
    const user = users.find((u) => u.id === form.userId);
    const resource = resources.find((r) => r.id === form.resourceId);
    createAgreement({
      userId: form.userId,
      userName: user?.name || '',
      company: user?.company,
      resourceId: form.resourceId,
      resourceName: resource?.name || '',
      monthlyFee: form.monthlyFee || (resource?.pricing.monthly ?? 0),
      startDate: form.startDate,
      endDate: form.endDate,
      freeMeetingHours: form.freeMeetingHours,
      usedMeetingHours: 0,
    });
    setModalOpen(false);
  };

  const activeCount = myAgreements.filter((a) => a.status === 'active').length;
  const totalMonthlyRevenue = myAgreements.filter((a) => a.status === 'active').reduce((s, a) => s + a.monthlyFee, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">月度协议管理</h1>
          <p className="text-slate-500 mt-1">驻场客户长期租赁协议管理</p>
        </div>
        {isOperator && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            创建新协议
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">协议总数</p>
                <p className="text-2xl font-bold text-primary-600">{myAgreements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">生效中</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">月收入合计</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalMonthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {myAgreements.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-700 mb-2">暂无月度协议</p>
            <p className="text-slate-500">
              {isOperator ? '点击右上角创建新的月度协议' : '请联系运营方签订长期租赁协议'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myAgreements.map((a: MonthlyAgreement) => {
            const resource = resources.find((r) => r.id === a.resourceId);
            const today = new Date();
            const endDate = new Date(a.endDate);
            const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
            const isNearEnd = daysLeft > 0 && daysLeft <= 30;

            return (
              <Card key={a.id} className={cn(
                'overflow-hidden transition-all hover:shadow-lg',
                isNearEnd && a.status === 'active' && 'border-orange-300'
              )}>
                <div className="h-1.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant={a.status === 'active' ? 'success' : 'muted'}>
                          {getStatusLabel(a.status)}
                        </Badge>
                        {isNearEnd && a.status === 'active' && (
                          <Badge variant="warning">
                            <Clock className="h-3 w-3 mr-1 inline" />
                            剩 {daysLeft} 天
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary-600" />
                        {a.resourceName}
                      </CardTitle>
                      <CardDescription className="mt-1">{a.userName} {a.company ? `· ${a.company}` : ''}</CardDescription>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-primary-600">{formatCurrency(a.monthlyFee)}</p>
                      <p className="text-xs text-slate-500">/ 月</p>
                    </div>
                  </div>
                </CardHeader>

                {resource && (
                  <div className="mx-6 mb-4">
                    <img
                      src={resource.image}
                      alt=""
                      className="w-full h-32 rounded-xl object-cover"
                    />
                  </div>
                )}

                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        开始日期
                      </div>
                      <p className="font-medium text-slate-900">{a.startDate}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Calendar className="h-3.5 w-3.5" />
                        结束日期
                      </div>
                      <p className="font-medium text-slate-900">{a.endDate}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">会议室免费额度</p>
                          <p className="text-xs text-green-700 mt-0.5">
                            已使用 {a.usedMeetingHours} / {a.freeMeetingHours} 小时
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-700">
                          {((a.usedMeetingHours / a.freeMeetingHours) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-green-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${Math.min((a.usedMeetingHours / a.freeMeetingHours) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      查看账单
                    </Button>
                    {a.status === 'active' && isOperator && (
                      <Button variant="success" className="flex-1" size="sm">
                        续约
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="创建月度协议" size="lg">
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label>选择驻场客户 *</Label>
            <Select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
              <option value="">请选择客户</option>
              {users.filter((u) => u.role === 'resident' || u.role === 'customer').map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.company ? `(${u.company})` : ''}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>选择资源 *</Label>
            <Select
              value={form.resourceId}
              onChange={(e) => {
                const r = resources.find((x) => x.id === e.target.value);
                setForm({
                  ...form,
                  resourceId: e.target.value,
                  monthlyFee: r?.pricing.monthly || form.monthlyFee,
                });
              }}
            >
              <option value="">请选择资源（工位/独立办公室）</option>
              {resources.filter((r) => r.type !== 'meetingroom').map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - {r.location} {r.pricing.monthly ? `(¥${r.pricing.monthly}/月)` : ''}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>月租金（元）*</Label>
              <Input
                type="number"
                min="0"
                value={form.monthlyFee}
                onChange={(e) => setForm({ ...form, monthlyFee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>每月免费会议室小时数</Label>
              <Input
                type="number"
                min="0"
                value={form.freeMeetingHours}
                onChange={(e) => setForm({ ...form, freeMeetingHours: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>协议开始日期</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>协议结束日期</Label>
              <Input
                type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>创建协议</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
