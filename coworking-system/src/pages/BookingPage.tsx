import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Label, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { cn, formatCurrency, getResourceTypeLabel, getStatusColor, getStatusLabel, calculateTotalPrice, calculateDays, formatDate } from '../utils';
import type { Resource, ResourceType, PricingModel } from '../types';
import {
  Search,
  Filter,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  Monitor,
  Building,
  Clock,
  Sparkles,
} from 'lucide-react';

export function BookingPage() {
  const { resources, currentUser, agreements, meetingPackages, createBooking, updateBookingStatus, payBooking } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

  const today = formatDate(new Date());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(formatDate(new Date(Date.now() + 86400000)));
  const [pricingModel, setPricingModel] = useState<PricingModel>('daily');
  const [confirming, setConfirming] = useState(false);

  const userAgreement = agreements.find(
    (a) => a.userId === currentUser?.id && a.status === 'active'
  );
  const userPkg = meetingPackages.find(
    (p) => p.userId === currentUser?.id && p.month === formatDate(new Date(), 'yyyy-MM')
  );
  const hasFreeHours = selectedResource?.type === 'meetingroom' &&
    currentUser?.role === 'resident' &&
    userPkg &&
    userPkg.usedHours < userPkg.freeHours;

  const filteredResources = useMemo(() => {
    let list = resources.filter((r) => r.status !== 'maintenance');
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(s) || r.location.toLowerCase().includes(s) || r.description.toLowerCase().includes(s));
    }
    if (filterType !== 'all') list = list.filter((r) => r.type === filterType);
    if (filterPrice === 'low') list = list.filter((r) => (r.pricing.daily || 0) <= 100);
    if (filterPrice === 'mid') list = list.filter((r) => (r.pricing.daily || 0) > 100 && (r.pricing.daily || 0) <= 500);
    if (filterPrice === 'high') list = list.filter((r) => (r.pricing.daily || 0) > 500);

    if (sortBy === 'price') list = [...list].sort((a, b) => (a.pricing.daily || 0) - (b.pricing.daily || 0));
    if (sortBy === 'capacity') list = [...list].sort((a, b) => b.capacity - a.capacity);
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [resources, search, filterType, filterPrice, sortBy]);

  const totalDays = calculateDays(startDate, endDate);
  const estimatedPrice = selectedResource ? calculateTotalPrice(selectedResource.pricing, pricingModel, startDate, endDate) : 0;
  const finalPrice = hasFreeHours ? 0 : estimatedPrice;

  const openBooking = (r: Resource) => {
    setSelectedResource(r);
    setBookingModal(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedResource) return;
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 600));
    const booking = createBooking({
      resourceId: selectedResource.id,
      startDate,
      endDate,
      pricingModel,
    });
    updateBookingStatus(booking.id, 'confirmed');
    if (finalPrice > 0 && currentUser?.role !== 'resident') {
      payBooking(booking.id);
    }
    setConfirming(false);
    setBookingModal(false);
  };

  const typeCounts = [
    { label: '全部', value: 'all', icon: Filter, count: resources.filter((r) => r.status !== 'maintenance').length },
    { label: '工位', value: 'desk', icon: Monitor, count: resources.filter((r) => r.type === 'desk' && r.status !== 'maintenance').length },
    { label: '独立办公室', value: 'office', icon: Building, count: resources.filter((r) => r.type === 'office' && r.status !== 'maintenance').length },
    { label: '会议室', value: 'meetingroom', icon: Users, count: resources.filter((r) => r.type === 'meetingroom' && r.status !== 'maintenance').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">预订空间资源</h1>
          <p className="text-slate-500 mt-1">浏览并预订适合您的办公空间</p>
          {userAgreement && (
            <div className="mt-3 inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              您是驻场客户，会议室享有免费使用额度
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜索资源..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-32">
            <option value="name">按名称</option>
            <option value="price">按价格</option>
            <option value="capacity">按容量</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeCounts.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                filterType === t.value
                  ? 'bg-primary-50 text-primary-700 border-primary-300 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              <span className={cn('text-xs px-1.5 py-0.5 rounded', filterType === t.value ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500')}>
                {t.count}
              </span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <Select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="w-32">
            <option value="all">全部价位</option>
            <option value="low">¥0-100/日</option>
            <option value="mid">¥100-500/日</option>
            <option value="high">¥500+/日</option>
          </Select>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Filter className="h-14 w-14 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 text-lg">暂无可预订的资源</p>
            <p className="text-slate-400 text-sm mt-1">请尝试调整筛选条件</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((r) => (
            <Card key={r.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={r.image}
                  alt={r.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={r.status === 'available' ? 'success' : 'danger'} className="shadow">
                    {getStatusLabel(r.status)}
                  </Badge>
                  <Badge variant="info" className="shadow">{getResourceTypeLabel(r.type)}</Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{r.name}</CardTitle>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {r.location}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {r.pricing.daily && <p className="text-lg font-bold text-primary-600">{formatCurrency(r.pricing.daily)}</p>}
                    <p className="text-xs text-slate-400">起 / 日</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {r.capacity}人
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    最短{r.minDuration}天
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {r.amenities.slice(0, 4).map((a) => (
                    <span key={a} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {a}
                    </span>
                  ))}
                  {r.amenities.length > 4 && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      +{r.amenities.length - 4}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedResource(r); setDetailModal(true); }}>
                  详情
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => openBooking(r)}
                  disabled={r.status !== 'available'}
                >
                  {r.status === 'available' ? '立即预订' : '已占用'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Modal open={detailModal} onClose={() => setDetailModal(false)} size="lg" title={selectedResource?.name}>
        {selectedResource && (
          <div>
            <div className="h-64 bg-slate-100 overflow-hidden">
              <img src={selectedResource.image} alt={selectedResource.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(selectedResource.status)}>{getStatusLabel(selectedResource.status)}</Badge>
                    <Badge variant="info">{getResourceTypeLabel(selectedResource.type)}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{selectedResource.location}</p>
                </div>
                <div className="text-right">
                  {selectedResource.pricing.monthly && (
                    <p className="text-sm text-slate-500">月租 {formatCurrency(selectedResource.pricing.monthly)}</p>
                  )}
                  {selectedResource.pricing.daily && (
                    <p className="text-2xl font-bold text-primary-600">{formatCurrency(selectedResource.pricing.daily)}<span className="text-sm font-normal text-slate-500">/日</span></p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <Users className="h-5 w-5 text-slate-400 mb-1" />
                  <p className="text-xs text-slate-500">容纳人数</p>
                  <p className="text-lg font-semibold">{selectedResource.capacity}人</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <Clock className="h-5 w-5 text-slate-400 mb-1" />
                  <p className="text-xs text-slate-500">最短租期</p>
                  <p className="text-lg font-semibold">{selectedResource.minDuration}天</p>
                </div>
                {selectedResource.pricing.weekly && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <Calendar className="h-5 w-5 text-slate-400 mb-1" />
                    <p className="text-xs text-slate-500">周租价格</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedResource.pricing.weekly)}</p>
                  </div>
                )}
                {selectedResource.pricing.monthly && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <Building className="h-5 w-5 text-slate-400 mb-1" />
                    <p className="text-xs text-slate-500">月租价格</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedResource.pricing.monthly)}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">资源描述</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedResource.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">配套设施</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={selectedResource.status !== 'available'}
                onClick={() => { setDetailModal(false); setBookingModal(true); }}
              >
                {selectedResource.status === 'available' ? '立即预订' : '该资源不可预订'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={bookingModal} onClose={() => !confirming && setBookingModal(false)} title="确认预订" size="md">
        {selectedResource && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <img src={selectedResource.image} alt="" className="h-20 w-28 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{selectedResource.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedResource.location} · {getResourceTypeLabel(selectedResource.type)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold text-primary-600">{formatCurrency(finalPrice)}</span>
                  {hasFreeHours && <Badge variant="success">使用免费额度</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>开始日期</Label>
                  <Input type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>结束日期</Label>
                  <Input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>计费方式</Label>
                <Select value={pricingModel} onChange={(e) => setPricingModel(e.target.value as PricingModel)}>
                  {selectedResource.pricing.daily && <option value="daily">日租</option>}
                  {selectedResource.pricing.weekly && <option value="weekly">周租</option>}
                  {selectedResource.pricing.monthly && <option value="monthly">月租</option>}
                </Select>
              </div>
            </div>

            {pricingModel !== 'monthly' && (
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                共 {totalDays} 天
              </div>
            )}

            {hasFreeHours && userPkg && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">您的免费会议室额度</p>
                  <p className="text-xs text-green-700 mt-0.5">
                    本月已使用 {userPkg.usedHours} / {userPkg.freeHours} 小时，剩余 {userPkg.freeHours - userPkg.usedHours} 小时
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>预订时长</span>
                <span>{pricingModel === 'daily' ? `${totalDays}天` : pricingModel === 'weekly' ? `${Math.ceil(totalDays / 7)}周` : '1个月'}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-300">
                <span>{hasFreeHours ? '免费额度抵扣' : '单价'}</span>
                <span>{hasFreeHours ? '-' : formatCurrency(
                  pricingModel === 'daily' ? (selectedResource.pricing.daily || 0) :
                  pricingModel === 'weekly' ? (selectedResource.pricing.weekly || 0) :
                  (selectedResource.pricing.monthly || 0)
                )}</span>
              </div>
              <div className="border-t border-slate-700 my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium">应付金额</span>
                <span className="text-2xl font-bold text-green-400">{formatCurrency(finalPrice)}</span>
              </div>
            </div>

            {currentUser?.role === 'resident' && finalPrice > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
                💡 作为驻场客户，本次费用将计入您的月度账单，月底统一结算。
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setBookingModal(false)} disabled={confirming}>取消</Button>
              <Button className="flex-1" onClick={handleSubmitBooking} disabled={confirming}>
                {confirming ? '处理中...' : finalPrice > 0 && currentUser?.role !== 'resident' ? '确认并支付' : '确认预订'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
