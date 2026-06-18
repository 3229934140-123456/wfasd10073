import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Building2, Mail, Lock, ArrowRight, Eye, EyeOff, User, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { cn } from '../../utils';

const testAccounts = [
  { email: 'zhangsan@example.com', role: '运营方', desc: '查看所有数据和管理功能' },
  { email: 'lisi@example.com', role: '前台', desc: '访客登记与接待管理' },
  { email: 'wangwu@example.com', role: '驻场客户', desc: '月度协议 + 会议室次数包' },
  { email: 'qianqi@example.com', role: '普通客户', desc: '日租/周租预订' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, currentUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    const defaultPaths: Record<string, string> = {
      operator: '/dashboard',
      receptionist: '/visitors',
      resident: '/my-bookings',
      customer: '/booking',
    };
    return <Navigate to={defaultPaths[currentUser.role] || '/booking'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const user = login(email, password);
    if (user) {
      const defaultPaths: Record<string, string> = {
        operator: '/dashboard',
        receptionist: '/visitors',
        resident: '/my-bookings',
        customer: '/booking',
      };
      navigate(defaultPaths[user.role] || '/booking');
    }
    setLoading(false);
  };

  const fillAccount = (acc: { email: string }) => {
    setEmail(acc.email);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
        <div className="relative z-10 w-full flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">共创空间</h1>
              <p className="text-white/70 text-sm mt-1">智能共享办公运营管理平台</p>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">让办公空间更高效</h2>
              <p className="text-white/80 leading-relaxed">
                一站式空间资源管理、预订结算、门禁对接、社区运营，助力联合办公空间数字化升级。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Briefcase, title: '灵活预订', desc: '日租/周租/月租' },
                { icon: User, title: '门禁对接', desc: '时效二维码' },
                { icon: Building2, title: '运营分析', desc: '出租率与收入' },
                { icon: Mail, title: '社区互动', desc: '招聘与合作' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                  <item.icon className="h-6 w-6 text-white mb-2" />
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">共创空间</span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-slate-900">欢迎回来 👋</h1>
            <p className="text-slate-500">登录您的账户，开始使用系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">邮箱地址</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-slate-400 mb-3 text-center">体验账号（密码均为 123456）</p>
            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => fillAccount(acc)}
                  className={cn(
                    'text-left p-3 rounded-lg border transition-all',
                    email === acc.email
                      ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <p className="text-sm font-medium text-slate-700">{acc.role}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            还没有账号？
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium ml-1">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
