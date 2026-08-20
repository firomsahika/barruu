'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Comment, getAvatarUrl, formatRelativeDate } from '@/types';

export default function CommentItem({ comment }: { comment: Comment }) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
      <Link href={`/user/${comment.author.username}`} style={{ flexShrink: 0 }}>
        <img
          src={getAvatarUrl(comment.author)}
          alt={comment.author.name}
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
        />
      </Link>
      <div style={{ flex: 1 }}>
        <div
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Link
              href={`/user/${comment.author.username}`}
              style={{ fontSize: '14px', fontWeight: 700, color: '#08090a', textDecoration: 'none' }}
            >
              {comment.author.name}
            </Link>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
              {formatRelativeDate(comment.createdAt)}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#3d3d3d', lineHeight: 1.6, margin: 0 }}>
            {comment.content}
          </p>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: '8px', marginLeft: '16px' }}>
            <button
              onClick={() => setShowReplies((p) => !p)}
              style={{
                fontSize: '12px',
                color: '#3b49df',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '0',
                fontFamily: 'inherit',
                marginBottom: '8px',
              }}
            >
              {showReplies ? '▼' : '▶'} {comment.replies.length} deebii
            </button>
            {showReplies && comment.replies.map((reply) => (
              <div key={reply.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <img
                  src={getAvatarUrl(reply.author)}
                  alt={reply.author.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    flex: 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#08090a' }}>{reply.author.name}</span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatRelativeDate(reply.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#3d3d3d', lineHeight: 1.6, margin: 0 }}>{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}