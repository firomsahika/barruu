'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, Clock3, Eye, Heart } from 'lucide-react';
import { Article, getAvatarUrl, formatDate } from '@/types';

export function InfoRow({
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

export function AuthorSidebar({ article }: { article: Article }) {
  return (
    <div className="space-y-4">
      {/* Author Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="h-16 bg-slate-950" />

        <div className="px-5 pb-5">
          <div className="-mt-8">
            <Link href={`/user/${article.author.username}`}>
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

export default AuthorSidebar;
