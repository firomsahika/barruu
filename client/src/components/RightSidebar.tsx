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
      <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3 text-sm font-bold text-[#08090a]">
          #Walaloo-filatamaa
        </div>

        {trending.length === 0 ? (
          <div className="p-4 text-xs text-gray-400">
            Barruuwwan hin jiran.
          </div>
        ) : (
          trending.map((article, i) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className={`block px-4 py-3 no-underline transition-colors duration-100 hover:bg-gray-50 ${i < trending.length - 1 ? 'border-b border-gray-100' : ''
                }`}
            >
              <div className="mb-1 text-[13px] font-medium text-gray-500">
                {article.author.name}
              </div>
              <div className="mb-1 text-sm font-bold leading-snug text-[#08090a]">
                {article.title}
              </div>
              <div className="text-xs text-gray-400">
                ❤️ {article._count.reactions} simsiree · 💬 {article._count.comments} yaada
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Studio spot card */}
      <div className="mb-4 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5 text-white">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider opacity-80">
          MIJUU STUDIO SPOT
        </div>
        <h3 className="mb-2 text-base font-extrabold leading-snug">
          Barruu Kee Publish Godhi
        </h3>
        <p className="mb-3.5 text-[13px] leading-relaxed opacity-90">
          Yaada kee dubbistoota kuma hedduuf hirmaachisi. Amma barreessuu jalqabi!
        </p>
        <Link
          href="/write"
          className="inline-block rounded-md bg-white px-4 py-2 text-[13px] font-bold text-purple-700 no-underline transition-opacity hover:opacity-95"
        >
          Barreessi Amma →
        </Link>
      </div>

      {/* Popular categories */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3 text-xs font-bold text-[#08090a]">
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
            className="block border-b border-gray-100 px-4 py-2.5 no-underline transition-colors duration-100 hover:bg-gray-50 last:border-b-0"
          >
            <div className="text-xs font-bold text-[#08090a]">{cat.label}</div>
            <div className="text-xs text-gray-400">{cat.desc}</div>
          </Link>
        ))}
      </div>
    </aside>
  );
}