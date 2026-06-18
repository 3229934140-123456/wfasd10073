import { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Label, Select, Textarea } from '../components/ui/Input';
import { Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Modal';
import { getResourceTypeLabel, getStatusLabel, getStatusColor, formatCurrency, cn } from '../utils';
import { Plus, Pencil, Trash2, Search, Filter, Monitor, Users, Building } from 'lucide-react';
import type { Resource, ResourceType } from '../types';

const typeIcons: Record<ResourceType, typeof Monitor> = {
  desk: Monitor,
  office: Building,
  meetingroom: Users,
};

const typeColors: Record<ResourceType, string> = {
  desk: 'bg-blue-50 text-blue-700',
  office: 'bg-purple-50 text-purple-700',
  meetingroom: 'bg-orange-50 text-orange-700',
};

export function ResourcesPage() {
  const { resources, addResource, updateResource, deleteResource } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);

  const [form, setForm] = useState({
    name: '',
    type: 'desk' as ResourceType,
    description: '',
    location: '',
    capacity: 1,
    daily: 0,
    weekly: 0,
    monthly: 0,
    minDuration: 1,
    amenities: '',
    image: '',
    status: 'available' as Resource['status'],
  });

  const filtered = resources.filter((r) => {
    if (search && !r.name.includes(search) && !r.location.includes(search)) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      type: 'desk',
      description: '',
      location: '',
      capacity: 1,
      daily: 0,
      weekly: 0,
      monthly: 0,
      minDuration: 1,
      amenities: '',
      image: '',
      status: 'available',
    });
    setModalOpen(true);
  };

  const openEdit = (r: Resource) => {
    setEditing(r);
    setForm({
      name: r.name,
      type: r.type,
      description: r.description,
      location: r.location,
      capacity: r.capacity,
      daily: r.pricing.daily || 0,
      weekly: r.pricing.weekly || 0,
      monthly: r.pricing.monthly || 0,
      minDuration: r.minDuration,
      amenities: r.amenities.join('，'),
      image: r.image,
      status: r.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const resourceData = {
      name: form.name,
      type: form.type,
      description: form.description,
      location: form.location,
      capacity: form.capacity,
      pricing: {
        daily: form.daily || undefined,
        weekly: form.weekly || undefined,
        monthly: form.monthly || undefined,
      },
      minDuration: form.minDuration,
      amenities: form.amenities.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      image:
        form.image ||
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          form.type === 'desk'
            ? 'modern office workspace desk minimal'
            : form.type === 'office'
            ? 'private office room professional'
            : 'meeting conference room modern'
        )}&image_size=landscape_16_9`,
      status: form.status,
    };

    if (editing) {
      updateResource(editing.id, resourceData);
    } else {
      addResource(resourceData);
    }
    setModalOpen(false);
  };

  const stats = [
    { label: '工位总数', value: resources.filter((r) => r.type === 'desk').length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '独立办公室', value: resources.filter((r) => r.type === 'office').length, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '会议室', value: resources.filter((r) => r.type === 'meetingroom').length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: '可预订', value: resources.filter((r) => r.status === 'available').length, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">资源管理</h1>
          <p className="text-slate-500 mt-1">管理空间内所有可预订的资源</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          添加资源
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', s.bg)}>
                  <Building className={cn('h-5 w-5', s.color)} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
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
              <CardTitle>资源列表</CardTitle>
              <CardDescription>共 {filtered.length} 个资源</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索资源名称/位置"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-56"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full sm:w-32">
                  <option value="all">全部类型</option>
                  <option value="desk">工位</option>
                  <option value="office">办公室</option>
                  <option value="meetingroom">会议室</option>
                </Select>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full sm:w-28">
                  <option value="all">全部状态</option>
                  <option value="available">可预订</option>
                  <option value="occupied">已占用</option>
                  <option value="maintenance">维护中</option>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>资源信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>容量</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>最短租期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const Icon = typeIcons[r.type];
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="h-12 w-16 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{r.name}</p>
                          <p className="text-xs text-slate-500">{r.location}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium', typeColors[r.type])}>
                        <Icon className="h-3.5 w-3.5" />
                        {getResourceTypeLabel(r.type)}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{r.capacity} 人</TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {r.pricing.daily && <p className="text-xs text-slate-600">日 {formatCurrency(r.pricing.daily)}</p>}
                        {r.pricing.weekly && <p className="text-xs text-slate-600">周 {formatCurrency(r.pricing.weekly)}</p>}
                        {r.pricing.monthly && <p className="text-xs text-slate-600">月 {formatCurrency(r.pricing.monthly)}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{r.minDuration} 天/小时</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'available' ? 'success' : r.status === 'occupied' ? 'danger' : 'muted'}>
                        {getStatusLabel(r.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteResource(r.id)} className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>暂无匹配的资源</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑资源' : '添加资源'} size="lg">
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>资源名称 *</Label>
              <Input placeholder="如：A区开放工位001" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>资源类型 *</Label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}>
                <option value="desk">开放工位</option>
                <option value="office">独立办公室</option>
                <option value="meetingroom">会议室</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>位置 *</Label>
              <Input placeholder="如：A区-1F-001" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>容纳人数</Label>
              <Input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="space-y-1.5">
              <Label>最短租期（天/小时）</Label>
              <Input type="number" min="1" value={form.minDuration} onChange={(e) => setForm({ ...form, minDuration: parseInt(e.target.value) || 1 })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>日租价格（元）</Label>
              <Input type="number" min="0" value={form.daily} onChange={(e) => setForm({ ...form, daily: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label>周租价格（元）</Label>
              <Input type="number" min="0" value={form.weekly} onChange={(e) => setForm({ ...form, weekly: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label>月租价格（元）</Label>
              <Input type="number" min="0" value={form.monthly} onChange={(e) => setForm({ ...form, monthly: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>配套设施（逗号分隔）</Label>
            <Input placeholder="如：高速WiFi，电源插座，储物柜" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label>资源描述</Label>
            <Textarea placeholder="详细描述资源特点" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label>图片链接（选填，不填使用默认）</Label>
            <Input placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label>状态</Label>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Resource['status'] })}>
              <option value="available">可预订</option>
              <option value="occupied">已占用</option>
              <option value="maintenance">维护中</option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>取消</Button>
            <Button onClick={handleSubmit}>{editing ? '保存修改' : '添加资源'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
