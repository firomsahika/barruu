'use client';

import Link from 'next/link';
import { Author, getAvatarUrl, formatDate } from '@/types';

export default function AuthorCard({ author }: { author: Author }) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}
    >
      <div style={{ height: '60px', background: 'linear-gradient(135deg, #3b49df, #7c3aed)' }} />
      <div style={{ padding: '0 16px 16px', marginTop: '-28px' }}>
        <Link href={`/user/${author.username}`}>
          <img
            src={getAvatarUrl(author)}
            alt={author.name}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #ffffff',
            }}
          />
        </Link>
        <Link
          href={`/user/${author.username}`}
          style={{ display: 'block', fontSize: '16px', fontWeight: 700, color: '#08090a', textDecoration: 'none', marginTop: '8px' }}
        >
          {author.name}
        </Link>
        {author.bio && (
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 12px', lineHeight: 1.5 }}>
            {author.bio}
          </p>
        )}
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
          Seenaa: {formatDate(author.createdAt || '')}
        </div>
        <Link
          href={`/user/${author.username}`}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '8px',
            backgroundColor: '#3b49df',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Fuula Ilaalaa
        </Link>
      </div>
    </div>
  );
}