'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Zap } from 'lucide-react';
import { Article, getAvatarUrl, formatRelativeDate, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  onUpdate?: (article: Article) => void;
}

export default function ArticleCard({ article, featured = false, onUpdate }: ArticleCardProps) {
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(article.userReactions?.liked || false);
  const [unicorned, setUnicorned] = useState(article.userReactions?.unicorned || false);
  const [bookmarked, setBookmarked] = useState(article.userBookmarked || false);
  const [likeCount, setLikeCount] = useState(article._count.reactions || 0);
  const [isReacting, setIsReacting] = useState(false);

  const handleReact = async (type: 'LIKE' | 'UNICORN') => {
    if (!user) {
      toast.error('Simsiruuf seeni');
      return;
    }
    if (isReacting) return;
    setIsReacting(true);
    try {
      await api.post(`/articles/${article.id}/react`, { type });
      if (type === 'LIKE') {
        setLiked((prev) => {
          setLikeCount((c) => prev ? c - 1 : c + 1);
          return !prev;
        });
      } else {
        setUnicorned((prev) => !prev);
      }
    } catch {
      toast.error('Dogoggori uumame');
    } finally {
      setIsReacting(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Kuusuuf seeni');
      return;
    }
    try {
      await api.post(`/articles/${article.id}/bookmark`);
      setBookmarked((prev) => !prev);
      toast.success(bookmarked ? 'Kitaaboo keessaa haqame' : 'Kitaaboo keessatti kuufame');
    } catch {
      toast.error('Dogoggori uumame');
    }
  };

  const tags = article.tags?.map((at) => at.tag) || [];

  if (featured) {
    return (
      <article
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        {/* Cover image or gradient */}
        {article.coverImageUrl ? (
          <div style={{ height: '220px', overflow: 'hidden' }}>
            <img
              src={article.coverImageUrl}
              alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            style={{
              height: '220px',
              background: `linear-gradient(135deg, ${CATEGORY_COLORS[article.category] || '#3b49df'} 0%, #1a1a2e 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '64px' }}>
              {article.category === 'WALALOO' ? '📜' :
               article.category === 'DURDURII' ? '🌿' :
               article.category === 'ASOOSAMA' ? '📖' :
               article.category === 'SAGALEE' ? '🎙️' : '🎓'}
            </span>
          </div>
        )}

        <div style={{ padding: '16px' }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <img
              src={getAvatarUrl(article.author)}
              alt={article.author.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <div>
              <Link
                href={`/user/${article.author.username}`}
                style={{ fontSize: '14px', fontWeight: 600, color: '#08090a', textDecoration: 'none' }}
                className="hover:text-blue-600"
              >
                {article.author.name}
              </Link>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {formatRelativeDate(article.createdAt)}
              </div>
            </div>
          </div>

          {/* Title */}
          <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#08090a',
                lineHeight: 1.3,
                margin: '0 0 8px',
              }}
              className="hover:text-blue-700"
            >
              {article.title}
            </h2>
          </Link>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    fontSize: '13px',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                  className="hover:bg-gray-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => handleReact('LIKE')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: liked ? '#fee2e2' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: liked ? '#ef4444' : '#6b7280',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                className="hover:bg-red-50"
              >
                <Heart size={16} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#6b7280'} />
                <span style={{ fontWeight: 500 }}>{likeCount}</span>
              </button>
              <button
                onClick={() => handleReact('UNICORN')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: unicorned ? '#f0fdf4' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: unicorned ? '#16a34a' : '#6b7280',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                className="hover:bg-green-50"
              >
                <Zap size={16} fill={unicorned ? '#16a34a' : 'none'} color={unicorned ? '#16a34a' : '#6b7280'} />
                <span style={{ fontWeight: 500 }}>{article._count.reactions}</span>
              </button>
              <Link
                href={`/article/${article.slug}#yaadawwan`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  color: '#6b7280',
                  transition: 'background 0.1s',
                }}
                className="hover:bg-gray-100"
              >
                <MessageCircle size={16} />
                <span style={{ fontWeight: 500 }}>{article._count.comments} yaada</span>
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                dubbiisa daqiiqaa {article.readingTime}
              </span>
              <button
                onClick={handleBookmark}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: bookmarked ? '#eff6ff' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                }}
                className="hover:bg-gray-100"
              >
                <Bookmark
                  size={18}
                  fill={bookmarked ? '#3b49df' : 'none'}
                  color={bookmarked ? '#3b49df' : '#6b7280'}
                />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard card
  return (
    <article
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        transition: 'box-shadow 0.1s',
      }}
      className="hover:shadow-sm"
    >
      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Link href={`/user/${article.author.username}`}>
          <img
            src={getAvatarUrl(article.author)}
            alt={article.author.name}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </Link>
        <div>
          <Link
            href={`/user/${article.author.username}`}
            style={{ fontSize: '13px', fontWeight: 600, color: '#08090a', textDecoration: 'none' }}
            className="hover:text-blue-600"
          >
            {article.author.name}
          </Link>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {formatRelativeDate(article.createdAt)}
          </div>
        </div>

        {/* Category badge */}
        <div style={{ marginLeft: 'auto' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: CATEGORY_COLORS[article.category] || '#3b49df',
            }}
          >
            {CATEGORY_LABELS[article.category]}
          </span>
        </div>
      </div>

      {/* Title */}
      <div style={{ paddingLeft: '38px' }}>
        <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#08090a',
              lineHeight: 1.35,
              margin: '0 0 6px',
            }}
            className="hover:text-blue-700"
          >
            {article.title}
          </h2>
        </Link>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
            {tags.slice(0, 4).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  color: '#4b5563',
                  fontSize: '12px',
                  textDecoration: 'none',
                  fontWeight: 400,
                }}
                className="hover:bg-gray-100"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={() => handleReact('LIKE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                color: liked ? '#ef4444' : '#6b7280',
                fontFamily: 'inherit',
                transition: 'all 0.1s',
              }}
              className="hover:bg-red-50"
            >
              <Heart size={15} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#6b7280'} />
              {likeCount} simsiree
            </button>
            <Link
              href={`/article/${article.slug}#yaadawwan`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '13px',
                color: '#6b7280',
                transition: 'background 0.1s',
              }}
              className="hover:bg-gray-100"
            >
              <MessageCircle size={15} />
              {article._count.comments} yaada
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
              daqiiqaa {article.readingTime}
            </span>
            <button
              onClick={handleBookmark}
              style={{
                padding: '5px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.1s',
              }}
              className="hover:bg-gray-100"
            >
              <Bookmark
                size={16}
                fill={bookmarked ? '#3b49df' : 'none'}
                color={bookmarked ? '#3b49df' : '#9ca3af'}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
