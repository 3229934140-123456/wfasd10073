import { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Label, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { cn, getPostTypeLabel, formatDateTime, getRoleLabel } from '../utils';
import type { CommunityPost, CommunityPostType } from '../types';
import {
  MessageSquare,
  Briefcase,
  Handshake,
  Search,
  Plus,
  Send,
  Tag,
  User,
  Building,
  MessageCircle,
  Heart,
  Share2,
  Mail,
} from 'lucide-react';

export function CommunityPage() {
  const { currentUser, posts, comments, users, addPost, addComment } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [postModal, setPostModal] = useState(false);
  const [detailPost, setDetailPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState('');

  const [form, setForm] = useState({
    type: 'recruitment' as CommunityPostType,
    title: '',
    content: '',
    contactInfo: '',
    tags: '',
  });

  const filtered = posts.filter((p) => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(s) ||
        p.content.toLowerCase().includes(s) ||
        p.tags.some((t) => t.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const postComments = detailPost ? comments.filter((c) => c.postId === detailPost.id) : [];
  const author = detailPost ? users.find((u) => u.id === detailPost.userId) : null;

  const handleSubmit = () => {
    if (!form.title || !form.content || !form.contactInfo) return;
    addPost({
      userId: currentUser!.id,
      userName: currentUser!.name,
      company: currentUser?.company,
      type: form.type,
      title: form.title,
      content: form.content,
      contactInfo: form.contactInfo,
      tags: form.tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
    });
    setPostModal(false);
    setForm({ type: 'recruitment', title: '', content: '', contactInfo: '', tags: '' });
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !detailPost) return;
    addComment({
      postId: detailPost.id,
      userId: currentUser!.id,
      userName: currentUser!.name,
      content: commentText.trim(),
    });
    setCommentText('');
  };

  const typeCounts = [
    { label: '全部', value: 'all', count: posts.length, icon: MessageSquare },
    { label: '招聘信息', value: 'recruitment', count: posts.filter((p) => p.type === 'recruitment').length, icon: Briefcase },
    { label: '合作需求', value: 'cooperation', count: posts.filter((p) => p.type === 'cooperation').length, icon: Handshake },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">社区广场 🏢</h1>
          <p className="text-slate-500 mt-1">与入驻企业互动交流，发现招聘机会与合作资源</p>
        </div>
        <Button onClick={() => setPostModal(true)}>
          <Plus className="h-4 w-4" />
          发布信息
        </Button>
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
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                filterType === t.value ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
              )}>
                {t.count}
              </span>
            </button>
          );
        })}
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜索内容..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-56"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-14 w-14 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-700 mb-1">暂无相关帖子</p>
            <p className="text-slate-500">成为第一个分享信息的人吧！</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((p) => {
            const postAuthor = users.find((u) => u.id === p.userId);
            const commentCount = comments.filter((c) => c.postId === p.id).length;
            return (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5"
                onClick={() => setDetailPost(p)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={p.type === 'recruitment' ? 'default' : 'success'} className="text-xs">
                          {p.type === 'recruitment' ? (
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />招聘</span>
                          ) : (
                            <span className="flex items-center gap-1"><Handshake className="h-3 w-3" />合作</span>
                          )}
                        </Badge>
                        {p.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-flex items-center gap-0.5">
                            <Tag className="h-3 w-3" />
                            {t}
                          </span>
                        ))}
                      </div>
                      <CardTitle className="text-lg leading-snug hover:text-primary-600 transition-colors">
                        {p.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line leading-relaxed">
                    {p.content}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                        {postAuthor?.name.charAt(0) || p.userName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {p.userName}
                          {postAuthor?.role && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-600">
                              {getRoleLabel(postAuthor.role)}
                            </span>
                          )}
                        </p>
                        {p.company && <p className="text-xs text-slate-500">{p.company}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {commentCount}
                      </span>
                      <span>{formatDateTime(p.createdAt).slice(5)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={postModal} onClose={() => setPostModal(false)} title="发布新帖" size="lg">
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label>信息类型 *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setForm({ ...form, type: 'recruitment' })}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  form.type === 'recruitment'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Briefcase className={cn('h-6 w-6 mb-2', form.type === 'recruitment' ? 'text-primary-600' : 'text-slate-400')} />
                <p className={cn('font-medium', form.type === 'recruitment' ? 'text-primary-700' : 'text-slate-700')}>招聘信息</p>
                <p className="text-xs text-slate-500 mt-0.5">发布岗位招聘、实习机会</p>
              </button>
              <button
                onClick={() => setForm({ ...form, type: 'cooperation' })}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  form.type === 'cooperation'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Handshake className={cn('h-6 w-6 mb-2', form.type === 'cooperation' ? 'text-green-600' : 'text-slate-400')} />
                <p className={cn('font-medium', form.type === 'cooperation' ? 'text-green-700' : 'text-slate-700')}>合作需求</p>
                <p className="text-xs text-slate-500 mt-0.5">寻找合作、资源共享</p>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>标题 *</Label>
            <Input
              placeholder={form.type === 'recruitment' ? '如：诚聘高级前端工程师' : '如：寻找小程序开发合作伙伴'}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>内容详情 *</Label>
            <Textarea
              placeholder="详细描述招聘要求/合作需求，包括职位要求、项目介绍、联系方式等"
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                联系方式 *
              </Label>
              <Input
                placeholder="邮箱、微信、电话等"
                value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                标签（逗号分隔）
              </Label>
              <Input
                placeholder="如：React, 前端, 招聘"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setPostModal(false)}>取消</Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4" />
              发布
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!detailPost} onClose={() => setDetailPost(null)} size="xl" title={detailPost?.title}>
        {detailPost && (
          <div>
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant={detailPost.type === 'recruitment' ? 'default' : 'success'}>
                  {getPostTypeLabel(detailPost.type)}
                </Badge>
                {detailPost.tags.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                  {detailPost.userName?.charAt(0) || author?.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{detailPost.userName}</p>
                    {author?.role && (
                      <Badge variant="muted">{getRoleLabel(author.role)}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                    {detailPost.company && (
                      <span className="inline-flex items-center gap-1">
                        <Building className="h-3.5 w-3.5" />
                        {detailPost.company}
                      </span>
                    )}
                    <span>{formatDateTime(detailPost.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
                {detailPost.content}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100">
                <div className="flex items-center gap-2 text-sm font-medium text-primary-800 mb-1">
                  <Mail className="h-4 w-4" />
                  联系方式
                </div>
                <p className="text-primary-900 font-medium">{detailPost.contactInfo}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  评论 ({postComments.length})
                </h4>
              </div>

              <div className="flex gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {currentUser?.name.charAt(0) || '?'}
                </div>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="发表您的评论..."
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                      <Send className="h-3.5 w-3.5" />
                      评论
                    </Button>
                  </div>
                </div>
              </div>

              {postComments.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  暂无评论，快来抢沙发吧~
                </div>
              ) : (
                <div className="space-y-4">
                  {postComments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm flex-shrink-0">
                        {c.userName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 text-sm">{c.userName}</span>
                          <span className="text-xs text-slate-400">{formatDateTime(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
