'use client';

import React from 'react';
import { Heart, Zap, Bookmark, Share2 } from 'lucide-react';

export function ActionButton({
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
      {label && <span className="hidden sm:inline">{label}</span>}
      {typeof count === 'number' && (
        <span className={active ? 'font-semibold' : ''}>{count}</span>
      )}
    </button>
  );
}

export interface ReactionBarProps {
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
}

export function ReactionBar({
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
}: ReactionBarProps) {
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
          icon={<Share2 className="h-[18px] w-[18px]" />}
        />
      </div>
    </div>
  );
}

export default ReactionBar;
