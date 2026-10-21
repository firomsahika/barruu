'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Comment, getAvatarUrl, User } from '@/types';
import CommentItem from './CommentItem';

interface CommentsSectionProps {
    comments: Comment[];
    user: User | null;
    commentText: string;
    isSubmittingComment: boolean;
    onCommentChange: (text: string) => void;
    onSubmitComment: (e: React.FormEvent) => void;
}

export default function CommentsSection({
    comments,
    user,
    commentText,
    isSubmittingComment,
    onCommentChange,
    onSubmitComment,
}: CommentsSectionProps) {
    return (
        <div
            id="yaadawwan"
            style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '24px',
            }}
        >
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#08090a', margin: '0 0 20px' }}>
                Yaadawwan ({comments.length})
            </h2>

            {user ? (
                <form onSubmit={onSubmitComment} style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                    <img
                        src={getAvatarUrl(user)}
                        alt={user.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                        <textarea
                            value={commentText}
                            onChange={(e) => onCommentChange(e.target.value)}
                            placeholder="Maal yaadda?"
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '15px',
                                color: '#08090a',
                                outline: 'none',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#3b49df')}
                            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                        />
                        <button
                            type="submit"
                            disabled={isSubmittingComment || !commentText.trim()}
                            style={{
                                marginTop: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#3b49df',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: isSubmittingComment || !commentText.trim() ? 'not-allowed' : 'pointer',
                                opacity: isSubmittingComment || !commentText.trim() ? 0.7 : 1,
                                fontFamily: 'inherit',
                            }}
                        >
                            {isSubmittingComment ? 'Dabalaa...' : 'Yaada Dabaali'}
                        </button>
                    </div>
                </form>
            ) : (
                <div
                    style={{
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        textAlign: 'center',
                        marginBottom: '24px',
                        fontSize: '14px',
                        color: '#6b7280',
                    }}
                >
                    Yaada dabaluuf{' '}
                    <Link href="/login" style={{ color: '#3b49df', fontWeight: 600, textDecoration: 'none' }}>
                        seeni
                    </Link>{' '}
                    ykn{' '}
                    <Link href="/register" style={{ color: '#3b49df', fontWeight: 600, textDecoration: 'none' }}>
                        galmaa&apos;i
                    </Link>
                    .
                </div>
            )}

            {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: '15px' }}>
                    <MessageCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p>Yaadni hin jiru. Jalqabaa ta&apos;i!</p>
                </div>
            ) : (
                comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))
            )}
        </div>
    );
}