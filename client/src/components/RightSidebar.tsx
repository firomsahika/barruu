'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Article } from '@/types';

export default function RightSidebar() {
  const [trending, setTrending] = useState<Article[]>([]);

  useEffect(() => {
    api.get('/articles?sort=top&limit=5')
      .then((res) => setTrending(res.data.articles || []))
      .catch(() => { });
  }, []);

  return (
    <aside>
      {/* Trending section */}
      <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
          Filatamoo har&apos;aa
        </div>

        {trending.length === 0 ? (
            <div className="p-4 text-[13px] text-gray-400">
            Barruuwwan hin jiran.
          </div>
        ) : (
          trending.map((article, i) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className={`block px-4 py-3.5 no-underline transition-colors duration-100 hover:bg-slate-50 ${i < trending.length - 1 ? 'border-b border-gray-100' : ''
                }`}
            >
              <div className="mb-1 text-[12px] font-medium text-gray-500">
                {article.author.name}
              </div>
              <div className="mb-1 text-[14px] font-bold leading-snug text-[#08090a]">
                {article.title}
              </div>
              <div className="text-[12px] text-gray-400">
                ❤️ {article._count.reactions} simsiree · 💬 {article._count.comments} yaada
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Studio spot card */}
      <div className="mb-4 rounded-lg bg-[#172554] p-5 text-white shadow-sm">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">
          BARREESSAA TA&apos;I
        </div>
        <h3 className="mb-2 text-xs font-extrabold leading-snug">
          Barruu Kee Publish Godhi
        </h3>
        <p className="mb-3.5 text-[13px] leading-relaxed text-blue-100">
          Yaada kee dubbistoota kuma hedduuf hirmaachisi. Amma barreessuu jalqabi!
        </p>
        <Link
          href="/write"
          className="inline-block rounded-md bg-white px-4 py-2 text-[13px] font-bold text-blue-900 no-underline transition-opacity hover:opacity-95"
        >
          Barreessi Amma →
        </Link>
      </div>

      {/* Popular categories */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
          Akaakuuwwan Barruutii
        </div>
        {[
          { label: '📜 Walaloo', href: '/walaloo', desc: 'Gabatee walaloo' },
          { label: '🌿 Durdurii', href: '/durdurii', desc: 'Aadaa fi seenaa' },
          { label: '📖 Asoosama', href: '/asoosama', desc: 'Novelaa fi gabaabaa' },
          { label: '🎓 Oolmaa', href: '/oolmaa', desc: 'Beekumsa fi barsiisa' },
          { label: '🎙️ Sagalee', href: '/sagalee', desc: 'Sagalee fi oduu' },
        ].map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="block border-b border-gray-100 px-4 py-3 no-underline transition-colors duration-100 hover:bg-slate-50 last:border-b-0"
          >
            <div className="text-[13px] font-bold text-[#08090a]">{cat.label}</div>
            <div className="mt-0.5 text-[12px] text-gray-400">{cat.desc}</div>
          </Link>
        ))}
      </div>
    </aside>
  );
}