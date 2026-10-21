'use client';

import React from 'react';
import { Heart, Zap, Bookmark, Share2, ArrowLeft } from 'lucide-react';

export interface DesktopReactionRailProps {
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
}

export function DesktopReactionRail({
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
}: DesktopReactionRailProps) {
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

export default DesktopReactionRail;
