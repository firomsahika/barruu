'use client';

import { Article, CATEGORY_LABELS, formatDate } from '@/types';

export default function ArticleMeta({ article }: { article: Article }) {
  const metaList = [
    { label: 'Maxxansame', value: formatDate(article.createdAt) },
    { label: 'Akaaka', value: CATEGORY_LABELS[article.category] },
    { label: 'Dubbiisa', value: `daqiiqaa ${article.readingTime}` },
    { label: 'Simsiree', value: `${article._count.reactions} fayyadamaa` },
    { label: 'Ilaalame', value: `${article.viewCount} yeroo` },
  ];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px', color: '#08090a' }}>
        Waa&#39;ee Barruu
      </h3>
      {metaList.map((info) => (
        <div key={info.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
          <span style={{ color: '#6b7280' }}>{info.label}</span>
          <span style={{ fontWeight: 600, color: '#08090a' }}>{info.value}</span>
        </div>
      ))}
    </div>
  );
}