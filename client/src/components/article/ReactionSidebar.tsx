'use client';

import { ArrowLeft, Heart, Zap, Bookmark, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReactionSidebarProps {
  liked: boolean;
  unicorned: boolean;
  bookmarked: boolean;
  likeCount: number;
  reactionsCount: number;
  onReact: (type: 'LIKE' | 'UNICORN') => void;
  onBookmark: () => void;
  onShare: () => void;
}

export default function ReactionSidebar({
  liked,
  unicorned,
  bookmarked,
  likeCount,
  reactionsCount,
  onReact,
  onBookmark,
  onShare,
}: ReactionSidebarProps) {
  const router = useRouter();

  return (
    <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <button
        data-button-unstyled
        onClick={() => router.back()}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}
      >
        <ArrowLeft size={18} color="#6b7280" />
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <button
          data-button-unstyled
          onClick={() => onReact('LIKE')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid #e5e7eb',
            backgroundColor: liked ? '#fee2e2' : '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <Heart size={20} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#6b7280'} />
        </button>
        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{likeCount}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <button
          data-button-unstyled
          onClick={() => onReact('UNICORN')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid #e5e7eb',
            backgroundColor: unicorned ? '#f0fdf4' : '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <Zap size={20} fill={unicorned ? '#16a34a' : 'none'} color={unicorned ? '#16a34a' : '#6b7280'} />
        </button>
        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{reactionsCount}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <button
          data-button-unstyled
          onClick={onBookmark}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid #e5e7eb',
            backgroundColor: bookmarked ? '#eff6ff' : '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <Bookmark size={20} fill={bookmarked ? '#3b49df' : 'none'} color={bookmarked ? '#3b49df' : '#6b7280'} />
        </button>
      </div>

      <button
        data-button-unstyled
        onClick={onShare}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Share2 size={18} color="#6b7280" />
      </button>
    </div>
  );
}