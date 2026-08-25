'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Comment, getAvatarUrl, formatRelativeDate } from '@/types';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CommentItem({ comment, onDelete, onUpdate }: { comment: Comment; onDelete?: (id: string) => void; onUpdate?: (comment: Comment) => void }) {
  const [showReplies, setShowReplies] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const { user } = useAuthStore();
  const canManage = user?.id === comment.author.id || user?.role === 'ADMIN';

  const saveEdit = async () => {
    if (!content.trim()) return;
    try {
      const updated = (await api.patch(`/comments/${comment.id}`, { content: content.trim() })).data;
      onUpdate?.(updated);
      setIsEditing(false);
    } catch { toast.error('Yaada fooyyessuu hin dandeenye.'); }
  };

  const deleteComment = async () => {
    if (!window.confirm('Yaada kana haquu barbaaddaa?')) return;
    try {
      await api.delete(`/comments/${comment.id}`);
      onDelete?.(comment.id);
    } catch { toast.error('Yaada haquu hin dandeenye.'); }
  };

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
      <Link href={`/user/${comment.author.username}`} style={{ flexShrink: 0 }}>
        <img
          src={getAvatarUrl(comment.author)}
          alt={comment.author.name}
          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      </Link>
      <div style={{ flex: 1 }}>
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #eef0f3',
            borderRadius: '10px',
            padding: '10px 12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Link
              href={`/user/${comment.author.username}`}
              style={{ fontSize: '14px', fontWeight: 700, color: '#08090a', textDecoration: 'none' }}
            >
              {comment.author.name}
            </Link>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
              {formatRelativeDate(comment.createdAt)}
            </span>
          </div>
          {isEditing ? (
            <div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}><button onClick={saveEdit} style={{ color: '#3b49df', border: 'none', background: 'none', cursor: 'pointer' }}>Kuufi</button><button onClick={() => { setContent(comment.content); setIsEditing(false); }} style={{ color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer' }}>Dhiisi</button></div>
            </div>
          ) : <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>{comment.content}</p>}
        </div>
        {canManage && !isEditing && <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}><button onClick={() => setIsEditing(true)} style={{ color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}>Gulaali</button><button onClick={deleteComment} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}>Haqi</button></div>}

        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: '8px', marginLeft: '14px', paddingLeft: '12px', borderLeft: '2px solid #eef0f3' }}>
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