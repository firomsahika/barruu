'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Volume2,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

import Header from '@/components/Header';
import api, { getApiErrorMessage } from '@/lib/api';
import {
  Article,
  Comment,
  getAvatarUrl,
  formatDate,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/types';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

import ReactionBar from '@/components/article/ReactionBar';
import DesktopReactionRail from '@/components/article/DesktopReactionRail';
import AuthorSidebar from '@/components/article/AuthorSidebar';
import CommentSection from '@/components/article/CommentSection';

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <div className="h-48 animate-pulse bg-slate-100 sm:h-72 lg:h-96" />
          <div className="space-y-5 p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-full bg-slate-100" />
              <div className="space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-8 w-11/12 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="space-y-3 pt-4">
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-9/12 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [unicorned, setUnicorned] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [unicornCount, setUnicornCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/articles/${slug}`);
        const data: Article = response.data;

        setArticle(data);
        setLiked(data.userReactions?.liked || false);
        setUnicorned(data.userReactions?.unicorned || false);
        setBookmarked(
          (data as Article & { userBookmarked?: boolean }).userBookmarked || false
        );
        setLikeCount(
          data.reactionCounts?.likes ?? data._count.reactions ?? 0
        );
        setUnicornCount(data.reactionCounts?.unicorns ?? 0);
        setComments(data.comments || []);
      } catch {
        toast.error('Barruu hin argamne');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug, router, user?.id]);

  const handleReact = async (type: 'LIKE' | 'UNICORN') => {
    if (!user) {
      toast.error('Simsiruuf seeni');
      return;
    }

    if (!article || isReacting) return;
    setIsReacting(true);

    try {
      const { data } = await api.post(`/articles/${article.id}/react`, { type });
      if (type === 'LIKE') {
        setLiked(data.reacted);
        setLikeCount((count) => (data.reacted ? count + 1 : Math.max(0, count - 1)));
      } else {
        setUnicorned(data.reacted);
        setUnicornCount((count) => (data.reacted ? count + 1 : Math.max(0, count - 1)));
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Dogoggori uumame'));
    } finally {
      setIsReacting(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Kuusuuf seeni');
      return;
    }

    if (!article || isBookmarking) return;
    setIsBookmarking(true);

    try {
      await api.post(`/articles/${article.id}/bookmark`);
      setBookmarked((prev) => !prev);
      toast.success(
        bookmarked ? 'Kitaaboo keessaa haqame' : 'Kitaaboo keessatti kuufame'
      );
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Dogoggori uumame'));
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && article) {
        await navigator.share({
          title: article.title,
          url: window.location.href,
        });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link harka kee keessa jira!');
    } catch {
      // User cancelled native share
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Yaada dabaaluuf seeni');
      return;
    }
    if (!article || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await api.post(`/articles/${article.id}/comments`, {
        content: commentText.trim(),
      });
      setComments((prev) => [response.data, ...prev]);
      setCommentText('');
      toast.success('Yaanni keessan dabalameera');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Yaada dabalaluu hin dandeenye'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    if (!confirm('Barruu kana haquu akka barbaaddu mirkaneeffadhu?')) return;

    try {
      await api.delete(`/articles/${article.id}`);
      toast.success('Barruun haqameera');
      router.push('/');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Barruu haquu hin dandeenye'));
    }
  };

  if (isLoading) return <ArticleSkeleton />;
  if (!article) return null;

  const isAuthor = Boolean(user && article.author && user.id === article.author.id);
  const tags = article.tags?.map((t) => t.tag) || [];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[64px_minmax(0,1fr)_340px]">
          {/* Desktop Reaction Rail */}
          <DesktopReactionRail
            liked={liked}
            unicorned={unicorned}
            bookmarked={bookmarked}
            likeCount={likeCount}
            unicornCount={unicornCount}
            isReacting={isReacting}
            onLike={() => handleReact('LIKE')}
            onUnicorn={() => handleReact('UNICORN')}
            onBookmark={handleBookmark}
            onShare={handleShare}
            onBack={() => router.back()}
          />

          {/* Main Article Content Column */}
          <main className="min-w-0">
            {/* Mobile Top Back Navigation */}
            <div className="mb-4 flex items-center justify-between xl:hidden">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Deebi&apos;i
              </button>

              <span className="text-xs text-slate-400">
                {article.readingTime} min read
              </span>
            </div>

            {/* Article Card */}
            <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              {article.coverImageUrl && (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 sm:aspect-[21/9]">
                  <img
                    src={article.coverImageUrl}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="p-5 sm:p-8 lg:p-10">
                {/* Author row & category */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${article.author.username}`}>
                      <img
                        src={getAvatarUrl(article.author)}
                        alt={article.author.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 sm:h-11 sm:w-11"
                      />
                    </Link>

                    <div>
                      <Link
                        href={`/user/${article.author.username}`}
                        className="block text-sm font-bold text-slate-900 hover:text-slate-600"
                      >
                        {article.author.name}
                      </Link>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{formatDate(article.createdAt)}</span>
                        <span>•</span>
                        <span>{article.readingTime} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Category */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        CATEGORY_COLORS[article.category] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {CATEGORY_LABELS[article.category] || article.category}
                    </span>

                    {isAuthor && (
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <Link
                          href={`/write?edit=${article.slug}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="Gulaali"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={handleDelete}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          title="Haqi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                  {article.title}
                </h1>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Audio player if available */}
                {article.audioUrl && (
                  <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-indigo-700">
                      <Volume2 className="h-4 w-4 text-indigo-600" />
                      Sagalee — Audio Narration
                    </div>
                    <audio controls className="h-9 w-full" src={article.audioUrl} />
                  </div>
                )}

                {/* Article body */}
                <div
                  className="article-content prose mt-8 max-w-none prose-slate prose-headings:font-extrabold prose-headings:tracking-tight prose-p:text-[16px] prose-p:leading-[1.8] prose-p:text-slate-700"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Mobile Reaction Bar */}
                <div className="mt-8 border-t border-slate-100 pt-4 xl:hidden">
                  <ReactionBar
                    liked={liked}
                    unicorned={unicorned}
                    bookmarked={bookmarked}
                    likeCount={likeCount}
                    unicornCount={unicornCount}
                    isReacting={isReacting}
                    onLike={() => handleReact('LIKE')}
                    onUnicorn={() => handleReact('UNICORN')}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                  />
                </div>
              </div>
            </article>

            {/* Mobile Author Drawer Toggle */}
            <div className="mt-4 xl:hidden">
              <button
                type="button"
                onClick={() => setShowMobileInfo((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left shadow-sm"
              >
                <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  Waa&apos;ee barreessaa fi barruu
                </span>
                {showMobileInfo ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {showMobileInfo && (
                <div className="mt-2">
                  <AuthorSidebar article={article} />
                </div>
              )}
            </div>

            {/* Comments Section */}
            <CommentSection
              comments={comments}
              user={user}
              commentText={commentText}
              setCommentText={setCommentText}
              isSubmittingComment={isSubmittingComment}
              onComment={handleComment}
            />
          </main>

          {/* Desktop Right Sidebar */}
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <AuthorSidebar article={article} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
