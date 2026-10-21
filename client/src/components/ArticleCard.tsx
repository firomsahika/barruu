'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Zap,
  ArrowUpRight,
  Clock3,
} from 'lucide-react';
import {
  Article,
  Comment,
  getAvatarUrl,
  formatRelativeDate,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/types';
import { useAuthStore } from '@/store/authStore';
import api, { getApiErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'MAMMAAKSA': return '💬';
    case 'SEENAA': return '🏛️';
    case 'WALALOO': return '📜';
    case 'DURDURII': return '🌿';
    case 'ASOOSAMA': return '📖';
    case 'SAGALEE': return '🎙️';
    default: return '🎓';
  }
}

function CommentPreview({ comments, slug }: { comments: Comment[]; slug: string }) {
  if (!comments?.length) return null;

  return (
    <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
      <div className="space-y-3">
        {comments.slice(0, 2).map((comment) => (
          <div key={comment.id} className="flex items-start gap-2.5">
            <img
              src={getAvatarUrl(comment.author)}
              alt={comment.author.name}
              className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-white"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className="truncate text-xs font-semibold text-slate-900">
                  {comment.author.name}
                </span>
                <span className="shrink-0 text-[10px] text-slate-400">
                  {formatRelativeDate(comment.createdAt)}
                </span>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href={`/article/${slug}#yaadawwan`}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-950"
      >
        Yaada hunda ilaali
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function ActionButton({
  active,
  onClick,
  icon,
  label,
  activeClassName,
  disabled = false,
}: {
  active?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  label?: React.ReactNode;
  activeClassName?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      data-button-unstyled
      onClick={onClick}
      disabled={disabled}
      className={[
        'group inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 py-1.5',
        'text-xs font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
        'disabled:pointer-events-none disabled:opacity-50',
        active
          ? activeClassName
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
      ].join(' ')}
    >
      {icon}
      {label !== undefined && <span>{label}</span>}
    </button>
  );
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [liked, setLiked] = useState(article.userReactions?.liked || false);
  const [unicorned, setUnicorned] = useState(article.userReactions?.unicorned || false);
  const [bookmarked, setBookmarked] = useState(article.userBookmarked || false);
  const [likeCount, setLikeCount] = useState(
    article.reactionCounts?.likes ?? article._count?.reactions ?? 0
  );
  const [unicornCount, setUnicornCount] = useState(
    article.reactionCounts?.unicorns ?? 0
  );
  const [isReacting, setIsReacting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const tags = article.tags?.map((at) => at.tag) || [];
  const preview = (article.excerpt || article.content)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const categoryColor = CATEGORY_COLORS[article.category] || '#3b49df';

  const handleReact = async (type: 'LIKE' | 'UNICORN') => {
    if (!user) {
      toast.error('Simsiruuf seeni');
      return;
    }
    if (isReacting) return;
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
      await queryClient.invalidateQueries({ queryKey: ['articles'] });
      router.refresh();
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
    if (isBookmarking) return;
    setIsBookmarking(true);

    try {
      await api.post(`/articles/${article.id}/bookmark`);
      setBookmarked((prev) => !prev);
      toast.success(
        bookmarked ? 'Kitaaboo keessaa haqame' : 'Kitaaboo keessatti kuufame'
      );
      await queryClient.invalidateQueries({ queryKey: ['articles'] });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Dogoggori uumame'));
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <article
      className={[
        'group relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg',
        featured ? 'mb-6 sm:p-7' : 'p-5 sm:p-6',
      ].join(' ')}
    >
      {/* Featured Cover Banner */}
      {featured && (
        <Link href={`/article/${article.slug}`} className="relative -mx-5 -mt-5 mb-5 block overflow-hidden sm:-mx-7 sm:-mt-7">
          <div className="relative h-56 w-full overflow-hidden bg-slate-100 sm:h-72">
            {article.coverImageUrl ? (
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div
                className="relative flex h-full w-full items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${categoryColor} 0%, #111827 100%)`,
                }}
              >
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-5xl shadow-2xl backdrop-blur-md">
                  {getCategoryIcon(article.category)}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute left-5 top-5">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-md">
                {CATEGORY_LABELS[article.category]}
              </span>
            </div>
            <div className="absolute bottom-5 left-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                <Clock3 className="h-3.5 w-3.5" /> {article.readingTime} daqiiqaa dubbisi
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Header Info */}
      <div className="flex items-center gap-3">
        <Link href={`/user/${article.author.username}`} className="shrink-0">
          <img
            src={getAvatarUrl(article.author)}
            alt={article.author.name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
          />
        </Link>

        <div className="min-w-0">
          <Link
            href={`/user/${article.author.username}`}
            className="block truncate text-sm font-semibold text-slate-900 hover:text-slate-600"
          >
            {article.author.name}
          </Link>
          <span className="text-xs text-slate-400">
            {formatRelativeDate(article.createdAt)} · {article.readingTime} min
          </span>
        </div>

        {!featured && (
          <div className="ml-auto">
            <span
              className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{
                color: categoryColor,
                borderColor: `${categoryColor}30`,
                backgroundColor: `${categoryColor}0D`,
              }}
            >
              {CATEGORY_LABELS[article.category]}
            </span>
          </div>
        )}
      </div>

      {/* Title & Preview */}
      <div className="mt-4">
        <Link href={`/article/${article.slug}`} className="block">
          <h2
            className={[
              'font-serif font-semibold leading-snug tracking-tight text-slate-950 hover:text-[#176b4d]',
              featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl',
            ].join(' ')}
          >
            {article.title}
          </h2>
        </Link>

        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-500">
          {preview}
        </p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 5).map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:border-[#176b4d]/30 hover:bg-[#e7f3eb] hover:text-[#176b4d]"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Comments Preview if available */}
      {article.comments && article.comments.length > 0 && (
        <CommentPreview comments={article.comments} slug={article.slug} />
      )}

      {/* Footer Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1">
          <ActionButton
            onClick={() => handleReact('LIKE')}
            disabled={isReacting}
            active={liked}
            activeClassName="bg-red-50 text-red-500"
            icon={<Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />}
            label={likeCount}
          />

          <ActionButton
            onClick={() => handleReact('UNICORN')}
            disabled={isReacting}
            active={unicorned}
            activeClassName="bg-emerald-50 text-emerald-600"
            icon={<Zap className="h-4 w-4" fill={unicorned ? 'currentColor' : 'none'} />}
            label={unicornCount}
          />

          <Link
            href={`/article/${article.slug}#yaadawwan`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{article._count?.comments ?? 0}</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={handleBookmark}
          disabled={isBookmarking}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
          className={[
            'rounded-lg p-2 text-xs transition-colors',
            bookmarked
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700',
          ].join(' ')}
        >
          <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
}
