
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  Zap,
  Bookmark,
  MessageCircle,
  Share2,
  ArrowLeft,
  Volume2,
  MoreHorizontal,
  Clock3,
  Eye,
  CalendarDays,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Send,
} from 'lucide-react';

import Header from '@/components/Header';
import api, { getApiErrorMessage } from '@/lib/api';
import {
  Article,
  Comment,
  getAvatarUrl,
  formatDate,
  formatRelativeDate,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/types';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

/* ========================================================================== */
/* Reusable Action Button                                                     */
/* ========================================================================== */

function ActionButton({
  icon,
  label,
  count,
  active = false,
  activeClassName = '',
  onClick,
  disabled = false,
  title,
}: {
  icon: React.ReactNode;
  label?: string;
  count?: number;
  active?: boolean;
  activeClassName?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title || label}
      disabled={disabled}
      onClick={onClick}
      className={[
        'group inline-flex min-h-10 items-center justify-center gap-2 rounded-xl',
        'px-3 text-sm font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
        'disabled:pointer-events-none disabled:opacity-50',
        active
          ? activeClassName
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      ].join(' ')}
    >
      {icon}

      {label && (
        <span className="hidden sm:inline">
          {label}
        </span>
      )}

      {typeof count === 'number' && (
        <span className={active ? 'font-semibold' : ''}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ========================================================================== */
/* Reaction Bar                                                               */
/* ========================================================================== */

function ReactionBar({
  liked,
  unicorned,
  bookmarked,
  likeCount,
  unicornCount,
  isReacting,
  onLike,
  onUnicorn,
  onBookmark,
  onShare,
}: {
  liked: boolean;
  unicorned: boolean;
  bookmarked: boolean;
  likeCount: number;
  unicornCount: number;
  isReacting: boolean;
  onLike: () => void;
  onUnicorn: () => void;
  onBookmark: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <ActionButton
          title="Simsiruu"
          onClick={onLike}
          disabled={isReacting}
          active={liked}
          activeClassName="bg-red-50 text-red-500"
          icon={
            <Heart
              className="h-[18px] w-[18px]"
              fill={liked ? 'currentColor' : 'none'}
            />
          }
          count={likeCount}
        />

        <ActionButton
          title="Unicorn"
          onClick={onUnicorn}
          disabled={isReacting}
          active={unicorned}
          activeClassName="bg-emerald-50 text-emerald-600"
          icon={
            <Zap
              className="h-[18px] w-[18px]"
              fill={unicorned ? 'currentColor' : 'none'}
            />
          }
          count={unicornCount}
        />
      </div>

      <div className="flex items-center gap-1">
        <ActionButton
          title="Kuusi"
          onClick={onBookmark}
          active={bookmarked}
          activeClassName="bg-slate-100 text-slate-900"
          icon={
            <Bookmark
              className="h-[18px] w-[18px]"
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          }
        />

        <ActionButton
          title="Qoodi"
          onClick={onShare}
          icon={
            <Share2 className="h-[18px] w-[18px]" />
          }
        />
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Desktop Reaction Rail                                                     */
/* ========================================================================== */

function DesktopReactionRail({
  liked,
  unicorned,
  bookmarked,
  likeCount,
  unicornCount,
  isReacting,
  onLike,
  onUnicorn,
  onBookmark,
  onShare,
  onBack,
}: {
  liked: boolean;
  unicorned: boolean;
  bookmarked: boolean;
  likeCount: number;
  unicornCount: number;
  isReacting: boolean;
  onLike: () => void;
  onUnicorn: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onBack: () => void;
}) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 flex flex-col items-center gap-3">
        {/* Back */}

        <button
          type="button"
          onClick={onBack}
          title="Deebi'i"
          className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Reactions */}

        <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={onLike}
            disabled={isReacting}
            title="Simsiruu"
            className={[
              'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
              liked
                ? 'bg-red-50 text-red-500'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
            ].join(' ')}
          >
            <Heart
              className="h-[18px] w-[18px]"
              fill={liked ? 'currentColor' : 'none'}
            />
          </button>

          <span className="pb-1 text-[10px] font-semibold text-slate-400">
            {likeCount}
          </span>

          <button
            type="button"
            onClick={onUnicorn}
            disabled={isReacting}
            title="Unicorn"
            className={[
              'mt-1 flex h-10 w-10 items-center justify-center rounded-xl transition-all',
              unicorned
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
            ].join(' ')}
          >
            <Zap
              className="h-[18px] w-[18px]"
              fill={unicorned ? 'currentColor' : 'none'}
            />
          </button>

          <span className="pb-1 text-[10px] font-semibold text-slate-400">
            {unicornCount}
          </span>

          <div className="my-2 h-px w-6 bg-slate-100" />

          <button
            type="button"
            onClick={onBookmark}
            title="Kuusi"
            className={[
              'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
              bookmarked
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
            ].join(' ')}
          >
            <Bookmark
              className="h-[18px] w-[18px]"
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </button>

          <button
            type="button"
            onClick={onShare}
            title="Qoodi"
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ========================================================================== */
/* Author Sidebar                                                             */
/* ========================================================================== */

function AuthorSidebar({
  article,
}: {
  article: Article;
}) {
  return (
    <div className="space-y-4">
      {/* Author */}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="h-16 bg-slate-950" />

        <div className="px-5 pb-5">
          <div className="-mt-8">
            <Link
              href={`/user/${article.author.username}`}
            >
              <img
                src={getAvatarUrl(article.author)}
                alt={article.author.name}
                className="h-16 w-16 rounded-2xl border-4 border-white object-cover shadow-sm"
              />
            </Link>
          </div>

          <Link
            href={`/user/${article.author.username}`}
            className="mt-3 block text-base font-bold tracking-tight text-slate-950 hover:text-slate-600"
          >
            {article.author.name}
          </Link>

          {article.author.bio && (
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              {article.author.bio}
            </p>
          )}

          <Link
            href={`/user/${article.author.username}`}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-800"
          >
            Fuula isaa ilaali
          </Link>
        </div>
      </div>

      {/* Article information */}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-slate-950">
          Waa&apos;ee barruu
        </h3>

        <div className="space-y-3">
          <InfoRow
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Maxxansame"
            value={formatDate(article.createdAt)}
          />

          <InfoRow
            icon={<Clock3 className="h-3.5 w-3.5" />}
            label="Dubbisa"
            value={`daqiiqaa ${article.readingTime}`}
          />

          <InfoRow
            icon={<Eye className="h-3.5 w-3.5" />}
            label="Ilaalame"
            value={`${article.viewCount} yeroo`}
          />

          <InfoRow
            icon={<Heart className="h-3.5 w-3.5" />}
            label="Simsiree"
            value={`${article._count.reactions}`}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {icon}
        <span>{label}</span>
      </div>

      <span className="text-right text-xs font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
}

/* ========================================================================== */
/* Comment                                                                    */
/* ========================================================================== */

function CommentItem({
  comment,
}: {
  comment: Comment;
}) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="flex gap-3">
      <Link
        href={`/user/${comment.author.username}`}
        className="shrink-0"
      >
        <img
          src={getAvatarUrl(comment.author)}
          alt={comment.author.name}
          className="h-9 w-9 rounded-full object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link
              href={`/user/${comment.author.username}`}
              className="text-xs font-bold text-slate-900 hover:text-slate-600"
            >
              {comment.author.name}
            </Link>

            <span className="text-[10px] text-slate-400">
              {formatRelativeDate(comment.createdAt)}
            </span>
          </div>

          <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-6 text-slate-600">
            {comment.content}
          </p>
        </div>

        {/* Replies */}

        {comment.replies &&
          comment.replies.length > 0 && (
            <div className="ml-2 mt-2 border-l-2 border-slate-100 pl-3">
              <button
                type="button"
                onClick={() =>
                  setShowReplies((previous) => !previous)
                }
                className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900"
              >
                {showReplies ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}

                {comment.replies.length} deebii
              </button>

              {showReplies && (
                <div className="space-y-2">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="flex gap-2.5"
                    >
                      <img
                        src={getAvatarUrl(
                          reply.author
                        )}
                        alt={reply.author.name}
                        className="h-7 w-7 shrink-0 rounded-full object-cover"
                      />

                      <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-900">
                            {reply.author.name}
                          </span>

                          <span className="text-[10px] text-slate-400">
                            {formatRelativeDate(
                              reply.createdAt
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Loading Skeleton                                                           */
/* ========================================================================== */

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

/* ========================================================================== */
/* Main Page                                                                  */
/* ========================================================================== */

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [article, setArticle] =
    useState<Article | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [liked, setLiked] = useState(false);
  const [unicorned, setUnicorned] =
    useState(false);
  const [bookmarked, setBookmarked] =
    useState(false);

  const [likeCount, setLikeCount] =
    useState(0);

  const [unicornCount, setUnicornCount] =
    useState(0);

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [commentText, setCommentText] =
    useState('');

  const [isSubmittingComment, setIsSubmittingComment] =
    useState(false);

  const [isReacting, setIsReacting] =
    useState(false);

  const [isBookmarking, setIsBookmarking] =
    useState(false);

  const [showMobileInfo, setShowMobileInfo] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Fetch article                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);

        const response = await api.get(
          `/articles/${slug}`
        );

        const data: Article = response.data;

        setArticle(data);

        setLiked(
          data.userReactions?.liked || false
        );

        setUnicorned(
          data.userReactions?.unicorned || false
        );

        setBookmarked(
          (data as Article & {
            userBookmarked?: boolean;
          }).userBookmarked || false
        );

        setLikeCount(
          data.reactionCounts?.likes ??
            data._count.reactions ??
            0
        );

        setUnicornCount(
          data.reactionCounts?.unicorns ?? 0
        );

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

  /* ------------------------------------------------------------------------ */
  /* React                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleReact = async (
    type: 'LIKE' | 'UNICORN'
  ) => {
    if (!user) {
      toast.error('Simsiruuf seeni');
      return;
    }

    if (!article || isReacting) return;

    setIsReacting(true);

    try {
      const { data } = await api.post(
        `/articles/${article.id}/react`,
        { type }
      );

      if (type === 'LIKE') {
        setLiked(data.reacted);

        setLikeCount((count) =>
          data.reacted
            ? count + 1
            : Math.max(0, count - 1)
        );
      } else {
        setUnicorned(data.reacted);

        setUnicornCount((count) =>
          data.reacted
            ? count + 1
            : Math.max(0, count - 1)
        );
      }
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          'Dogoggori uumame'
        )
      );
    } finally {
      setIsReacting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Bookmark                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Kuusuuf seeni');
      return;
    }

    if (!article || isBookmarking) return;

    setIsBookmarking(true);

    try {
      await api.post(
        `/articles/${article.id}/bookmark`
      );

      setBookmarked((previous) => !previous);

      toast.success(
        bookmarked
          ? 'Kitaaboo keessaa haqame'
          : 'Kitaaboo keessatti kuufame'
      );
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          'Dogoggori uumame'
        )
      );
    } finally {
      setIsBookmarking(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Share                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleShare = async () => {
    try {
      if (
        navigator.share &&
        article
      ) {
        await navigator.share({
          title: article.title,
          url: window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      toast.success(
        'Link harka kee keessa jira!'
      );
    } catch {
      // User cancelled native share.
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Comment                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleComment = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      toast.error(
        'Yaada dabaaluuf seeni'
      );
      return;
    }

    if (!article || !commentText.trim()) {
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await api.post(
        `/articles/${article.id}/comments`,
        {
          content: commentText.trim(),
        }
      );

      setComments((previous) => [
        response.data,
        ...previous,
      ]);

      setCommentText('');

      toast.success(
        'Yaadni kee dabalame!'
      );
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          'Yaadi hin dabalamine'
        )
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete article                                                           */
  /* ------------------------------------------------------------------------ */

  const handleDeleteArticle = async () => {
    if (!article) return;

    const confirmed = window.confirm(
      'Barruu kana haquu barbaaddaa?'
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/articles/${article.id}`
      );

      toast.success(
        'Barruun haqame.'
      );

      router.push('/');
    } catch {
      toast.error(
        'Barruu haquu hin dandeenye.'
      );
    }
  };

  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (!article) {
    return null;
  }

  const tags =
    article.tags?.map((at) => at.tag) || [];

  const categoryColor =
    CATEGORY_COLORS[article.category] ||
    '#3b49df';

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      {/* ================================================================== */}
      {/* Main responsive layout                                             */}
      {/* ================================================================== */}

      <div className="mx-auto max-w-[1240px] px-3 py-4 sm:px-5 sm:py-6 lg:px-6 xl:py-8">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[56px_minmax(0,720px)_280px] xl:gap-6">
          {/* ================================================================ */}
          {/* Desktop reaction rail                                           */}
          {/* ================================================================ */}

          <DesktopReactionRail
            liked={liked}
            unicorned={unicorned}
            bookmarked={bookmarked}
            likeCount={likeCount}
            unicornCount={unicornCount}
            isReacting={isReacting}
            onLike={() =>
              handleReact('LIKE')
            }
            onUnicorn={() =>
              handleReact('UNICORN')
            }
            onBookmark={handleBookmark}
            onShare={handleShare}
            onBack={() => router.back()}
          />

          {/* ================================================================ */}
          {/* Main content                                                      */}
          {/* ================================================================ */}

          <main className="min-w-0">
            {/* Mobile / tablet back button */}

            <button
              type="button"
              onClick={() => router.back()}
              className="mb-3 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-white hover:text-slate-900 xl:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Deebi&apos;i
            </button>

            {/* ============================================================ */}
            {/* Article                                                       */}
            {/* ============================================================ */}

            <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              {/* ---------------------------------------------------------- */}
              {/* Cover                                                       */}
              {/* ---------------------------------------------------------- */}

              {article.coverImageUrl ? (
                <div className="relative aspect-[16/8] w-full overflow-hidden bg-slate-100 sm:aspect-[16/8.5] lg:aspect-[16/8]">
                  <img
                    src={article.coverImageUrl}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4">
                    <span
                      className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md"
                    >
                      {CATEGORY_LABELS[
                        article.category
                      ]}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="relative flex h-28 items-end overflow-hidden px-5 pb-5 sm:h-36 sm:px-7 sm:pb-6"
                  style={{
                    background: `linear-gradient(135deg, ${categoryColor} 0%, #111827 100%)`,
                  }}
                >
                  <div className="absolute -right-10 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                  <span className="relative rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    {CATEGORY_LABELS[
                      article.category
                    ]}
                  </span>
                </div>
              )}

              {/* ---------------------------------------------------------- */}
              {/* Article body                                                 */}
              {/* ---------------------------------------------------------- */}

              <div className="p-5 sm:p-7 lg:p-8">
                {/* Author header */}

                <div className="flex items-start gap-3">
                  <Link
                    href={`/user/${article.author.username}`}
                    className="shrink-0"
                  >
                    <img
                      src={getAvatarUrl(
                        article.author
                      )}
                      alt={
                        article.author.name
                      }
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 sm:h-11 sm:w-11"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/user/${article.author.username}`}
                      className="block truncate text-sm font-bold text-slate-950 hover:text-slate-600"
                    >
                      {article.author.name}
                    </Link>

                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                      <span>
                        {formatDate(
                          article.createdAt
                        )}
                      </span>

                      <span className="text-slate-200">
                        •
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {article.readingTime} min
                      </span>
                    </div>
                  </div>

                  {/* Author actions */}

                  {user?.id ===
                    article.author.id && (
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/write?slug=${encodeURIComponent(
                          article.slug
                        )}`}
                        title="Gulaali"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:w-auto sm:px-3"
                      >
                        <Pencil className="h-4 w-4" />

                        <span className="ml-1.5 hidden text-xs font-semibold sm:inline">
                          Gulaali
                        </span>
                      </Link>

                      <button
                        type="button"
                        onClick={
                          handleDeleteArticle
                        }
                        title="Haqi"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 sm:w-auto sm:px-3"
                      >
                        <Trash2 className="h-4 w-4" />

                        <span className="ml-1.5 hidden text-xs font-semibold sm:inline">
                          Haqi
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Title */}

                <h1 className="mt-5 text-[28px] font-extrabold leading-[1.18] tracking-[-0.035em] text-slate-950 sm:mt-6 sm:text-4xl sm:leading-[1.18] lg:text-[42px]">
                  {article.title}
                </h1>

                {/* Tags */}

                {tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 sm:text-[11px]"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Audio */}

                {article.audioUrl && (
                  <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 sm:p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Volume2 className="h-3.5 w-3.5" />
                      </div>

                      <span className="text-xs font-bold text-indigo-700">
                        Sagalee — Audio
                        Narration
                      </span>
                    </div>

                    <audio
                      controls
                      className="h-9 w-full"
                      src={article.audioUrl}
                    />
                  </div>
                )}

                {/* ======================================================== */}
                {/* Article content                                           */}
                {/* ======================================================== */}

                <div
                  className={[
                    'article-content prose mt-7 max-w-none',
                    'prose-slate',
                    'prose-headings:font-extrabold prose-headings:tracking-tight',
                    'prose-h2:mt-8 prose-h2:text-2xl',
                    'prose-h3:mt-7 prose-h3:text-xl',
                    'prose-p:text-[16px] prose-p:leading-[1.9] prose-p:text-slate-700',
                    'prose-a:font-semibold prose-a:text-slate-900',
                    'prose-blockquote:border-slate-300 prose-blockquote:text-slate-600',
                    'prose-img:rounded-xl prose-img:shadow-sm',
                    'prose-li:text-slate-700',
                    'sm:prose-p:text-[17px]',
                  ].join(' ')}
                  dangerouslySetInnerHTML={{
                    __html: article.content,
                  }}
                />

                {/* ======================================================== */}
                {/* Mobile/tablet reaction bar                                */}
                {/* ======================================================== */}

                <div className="mt-8 border-t border-slate-100 pt-4 xl:hidden">
                  <ReactionBar
                    liked={liked}
                    unicorned={unicorned}
                    bookmarked={bookmarked}
                    likeCount={likeCount}
                    unicornCount={unicornCount}
                    isReacting={isReacting}
                    onLike={() =>
                      handleReact('LIKE')
                    }
                    onUnicorn={() =>
                      handleReact('UNICORN')
                    }
                    onBookmark={
                      handleBookmark
                    }
                    onShare={handleShare}
                  />
                </div>
              </div>
            </article>

            {/* ============================================================ */}
            {/* Tablet author/info                                             */}
            {/* ============================================================ */}

            <div className="mt-4 xl:hidden">
              <button
                type="button"
                onClick={() =>
                  setShowMobileInfo(
                    (previous) => !previous
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 text-left shadow-sm"
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
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <AuthorSidebar
                    article={article}
                  />
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* Comments                                                       */}
            {/* ============================================================ */}

            <section
              id="yaadawwan"
              className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:mt-5 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
                    Yaadawwan
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {comments.length}{' '}
                    yaada
                  </p>
                </div>

                <MessageCircle className="h-5 w-5 text-slate-300" />
              </div>

              {/* Comment form */}

              {user ? (
                <form
                  onSubmit={handleComment}
                  className="mt-5"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.name}
                      className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
                    />

                    <div className="min-w-0 flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) =>
                          setCommentText(
                            e.target.value
                          )
                        }
                        placeholder="Maal yaadda?"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
                      />

                      <div className="mt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={
                            isSubmittingComment ||
                            !commentText.trim()
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Send className="h-3.5 w-3.5" />

                          {isSubmittingComment
                            ? 'Dabalaa jira...'
                            : 'Yaada Dabaali'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-center text-xs text-slate-500">
                  Yaada dabaluuf{' '}
                  <Link
                    href="/login"
                    className="font-bold text-slate-900 underline underline-offset-2"
                  >
                    seeni
                  </Link>{' '}
                  ykn{' '}
                  <Link
                    href="/register"
                    className="font-bold text-slate-900 underline underline-offset-2"
                  >
                    galmaa&apos;i
                  </Link>
                  .
                </div>
              )}

              {/* Comments list */}

              <div className="mt-7">
                {comments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
                    <MessageCircle className="mx-auto h-7 w-7 text-slate-200" />

                    <p className="mt-2 text-xs text-slate-400">
                      Yaadni hin jiru.
                      Jalqabaa ta&apos;i!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {comments.map(
                      (comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          </main>

          {/* ================================================================ */}
          {/* Desktop right sidebar                                             */}
          {/* ================================================================ */}

          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <AuthorSidebar
                article={article}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

