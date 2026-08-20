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
      .catch(() => {});
  }, []);

  return (
    <aside>
      {/* Trending section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: 700,
            fontSize: '15px',
            color: '#08090a',
          }}
        >
          #walaloo-filatamaa
        </div>

        {trending.length === 0 ? (
          <div style={{ padding: '16px', fontSize: '14px', color: '#9ca3af' }}>
            Barruuwwan hin jiran.
          </div>
        ) : (
          trending.map((article, i) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              style={{
                display: 'block',
                padding: '12px 16px',
                textDecoration: 'none',
                borderBottom: i < trending.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background 0.1s',
              }}
              className="hover:bg-gray-50"
            >
              <div
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '4px',
                  fontWeight: 500,
                }}
              >
                {article.author.name}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#08090a',
                  lineHeight: 1.4,
                  marginBottom: '4px',
                }}
              >
                {article.title}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                ❤️ {article._count.reactions} simsiree · 💬 {article._count.comments} yaada
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Studio spot card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          padding: '20px',
          color: '#ffffff',
          marginBottom: '16px',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', opacity: 0.8 }}>
          MIJUU STUDIO SPOT
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.3 }}>
          Barruu Kee Publish Godhi
        </h3>
        <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.6, margin: '0 0 14px' }}>
          Yaada kee dubbistoota kuma hedduuf hirmaachisi. Amma barreessuu jalqabi!
        </p>
        <Link
          href="/write"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            color: '#7c3aed',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          Barreessi Amma →
        </Link>
      </div>

      {/* Popular categories */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: 700,
            fontSize: '15px',
            color: '#08090a',
          }}
        >
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
            style={{
              display: 'block',
              padding: '10px 16px',
              textDecoration: 'none',
              borderBottom: '1px solid #f3f4f6',
              transition: 'background 0.1s',
            }}
            className="hover:bg-gray-50"
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#08090a' }}>{cat.label}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{cat.desc}</div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
