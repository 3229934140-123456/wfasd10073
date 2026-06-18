import { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Label, Select, Textarea } from '../components/ui/Input';
import { Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Modal';
import { cn, getStatusColor, getStatusLabel, formatDateTime } from '../utils';
import { UserPlus, Users, Clock, Bell, Search, UserCheck, CheckCircle, LogOut, Phone, Building2 } from 'lucide-react';
import type { Visitor } from '../types';

export function VisitorsPage() {
  const { visitors, users, createVisitor, updateVisitorStatus } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const residents = users.filter((u) => u.role === 'resident');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    company: '',
    residentId: '',
    purpose: '',
  });

  const filtered = visitors.filter((v) => {
    if (search && !v.name.includes(search) && !v.phone.includes(search)) return false;
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    return true;
  });

  const stats = [
    { label: '今日访客', value: visitors.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '等待接待', value: visitors.filter((v) => v.status === 'waiting').length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: '在场中', value: visitors.filter((v) => v.status === 'checkedin').length, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '已离开', value: visitors.filter((v) => v.status === 'checkedout').length, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.residentId || !form.purpose) return;
    const resident = residents.find((r) => r.id === form.residentId);
    createVisitor({
      ...form,
      residentName: resident?.name || '',
      checkIn: formatDateTime(new Date()),
    });
    setModalOpen(false);
    setForm({ name: '', phone: '', company: '', residentId: '', purpose: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">访客登记</h1>
          <p className="text-slate-500 mt-1">登记访客信息，通知驻场客户接待</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus className="h-4 w-4" />
          新访客登记
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', s.bg)}>
                  <Users className={cn('h-5 w-5', s.color)} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
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
              <CardTitle>访客列表</CardTitle>
              <CardDescription>共 {filtered.length} 位访客</CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索姓名/电话"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-52"
                />
              </div>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-32">
                <option value="all">全部状态</option>
                <option value="waiting">等待接待</option>
                <option value="checkedin">在场中</option>
                <option value="checkedout">已离开</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>访客信息</TableHead>
                <TableHead>被访人</TableHead>
                <TableHead>来访事由</TableHead>
                <TableHead>到访时间</TableHead>
                <TableHead>离开时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="py-12 text-center text-slate-500">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>暂无访客记录</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {v.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{v.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {v.phone}
                          </p>
                          {v.company && (
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {v.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-800">{v.residentName}</p>
                    </TableCell>
                    <TableCell className="text-slate-600">{v.purpose}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Clock className="h-3.5 w-3.5" />
                        {v.checkIn}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{v.checkOut || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        v.status === 'waiting' ? 'warning' :
                        v.status === 'checkedin' ? 'info' : 'muted'
                      }>
                        {v.status === 'waiting' && <Bell className="h-3 w-3 inline mr-1 animate-pulse" />}
                        {getStatusLabel(v.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1 justify-end">
                        {v.status === 'waiting' && (
                          <Button size="sm" variant="success" onClick={() => updateVisitorStatus(v.id, 'checkedin')}>
                            <UserCheck className="h-4 w-4" />
                            接待
                          </Button>
                        )}
                        {v.status === 'checkedin' && (
                          <Button size="sm" variant="outline" onClick={() => updateVisitorStatus(v.id, 'checkedout')}>
                            <LogOut className="h-4 w-4" />
                            签离
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新访客登记" size="md">
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>访客姓名 *</Label>
              <Input placeholder="请输入访客姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>联系电话 *</Label>
              <Input placeholder="请输入手机号" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>所属公司</Label>
            <Input placeholder="选填" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label>被访驻场客户 *</Label>
            <Select value={form.residentId} onChange={(e) => setForm({ ...form, residentId: e.target.value })}>
              <option value="">请选择</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.company ? `(${r.company})` : ''}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>来访事由 *</Label>
            <Textarea
              placeholder="如：商务洽谈、面试、项目合作等"
              rows={2}
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            />
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2">
            <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              提交后系统将自动通知被访的驻场客户前来前台接待
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>
              <CheckCircle className="h-4 w-4" />
              提交登记并通知
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
