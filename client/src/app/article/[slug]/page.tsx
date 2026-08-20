'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Zap, Bookmark, MessageCircle, Share2, ArrowLeft, Volume2 } from 'lucide-react';
import Header from '@/components/Header';
import api from '@/lib/api';
import { Article, Comment, getAvatarUrl, formatDate, formatRelativeDate, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [unicorned, setUnicorned] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await api.get(`/articles/${slug}`);
        const data: Article = res.data;
        setArticle(data);
        setLiked(data.userReactions?.liked || false);
        setUnicorned(data.userReactions?.unicorned || false);
        setBookmarked(data.userReactions ? (data as Article & { userBookmarked: boolean }).userBookmarked : false);
        setLikeCount(data.reactionCounts?.likes || data._count.reactions || 0);
        setComments(data.comments || []);
      } catch {
        toast.error('Barruu hin argamne');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchArticle();
  }, [slug, router]);

  const handleReact = async (type: 'LIKE' | 'UNICORN') => {
    if (!user) { toast.error('Simsiruuf seeni'); return; }
    try {
      await api.post(`/articles/${article!.id}/react`, { type });
      if (type === 'LIKE') {
        setLiked((p) => { setLikeCount((c) => p ? c - 1 : c + 1); return !p; });
      } else {
        setUnicorned((p) => !p);
      }
    } catch { toast.error('Dogoggori uumame'); }
  };

  const handleBookmark = async () => {
    if (!user) { toast.error('Kuusuuf seeni'); return; }
    try {
      await api.post(`/articles/${article!.id}/bookmark`);
      setBookmarked((p) => !p);
      toast.success(bookmarked ? 'Kitaaboo keessaa haqame' : 'Kitaaboo keessatti kuufame');
    } catch { toast.error('Dogoggori uumame'); }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link harka kee keessa jira!');
    } catch { toast.error('Share hin danda\'amne'); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Yaada dabaaluuf seeni'); return; }
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/articles/${article!.id}/comments`, { content: commentText });
      setComments((prev) => [res.data, ...prev]);
      setCommentText('');
      toast.success('Yaadni kee dabalame!');
    } catch { toast.error('Yaadi hin dabalamine'); }
    finally { setIsSubmittingComment(false); }
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Header />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '32px' }}>
            <div style={{ height: '300px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '24px' }} />
            <div style={{ height: '32px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '16px', width: '80%' }} />
            <div style={{ height: '16px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ height: '16px', backgroundColor: '#f3f4f6', borderRadius: '4px', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const tags = article.tags?.map((at) => at.tag) || [];

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Header />

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '24px 16px',
          display: 'grid',
          gridTemplateColumns: '64px 1fr 260px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left reaction bar */}
        <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {/* Back button */}
          <button
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
              onClick={() => handleReact('LIKE')}
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
              onClick={() => handleReact('UNICORN')}
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
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{article._count.reactions}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleBookmark}
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
            onClick={handleShare}
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

        {/* Main content */}
        <main>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            {/* Cover */}
            {article.coverImageUrl ? (
              <div style={{ height: '420px', overflow: 'hidden' }}>
                <img src={article.coverImageUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div
                style={{
                  height: '140px',
                  background: `linear-gradient(135deg, ${CATEGORY_COLORS[article.category]} 0%, #1a1a2e 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 32px',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', opacity: 0.9 }}>
                  {CATEGORY_LABELS[article.category]}
                </span>
              </div>
            )}

            <div style={{ padding: '32px' }}>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href={`/user/${article.author.username}`}>
                  <img
                    src={getAvatarUrl(article.author)}
                    alt={article.author.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </Link>
                <div>
                  <Link
                    href={`/user/${article.author.username}`}
                    style={{ fontSize: '16px', fontWeight: 700, color: '#08090a', textDecoration: 'none' }}
                    className="hover:text-blue-600"
                  >
                    {article.author.name}
                  </Link>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {formatDate(article.createdAt)} · dubbiisa daqiiqaa {article.readingTime}
                  </div>
                </div>
                {user?.id === article.author.id && (
                  <Link
                    href={`/write?id=${article.id}`}
                    style={{
                      marginLeft: 'auto',
                      padding: '6px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      color: '#4b5563',
                      fontWeight: 500,
                    }}
                  >
                    Gulaali
                  </Link>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#08090a',
                  lineHeight: 1.25,
                  margin: '0 0 16px',
                }}
              >
                {article.title}
              </h1>

              {/* Tags */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        fontSize: '14px',
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

              {/* Audio player if available */}
              {article.audioUrl && (
                <div
                  style={{
                    backgroundColor: '#f0f4ff',
                    border: '1px solid #c7d2fe',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Volume2 size={20} color="#3b49df" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#3b49df', marginBottom: '4px' }}>
                      Sagalee - Audio Narration
                    </div>
                    <audio controls style={{ width: '100%', height: '32px' }} src={article.audioUrl} />
                  </div>
                </div>
              )}

              {/* Content */}
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{ maxWidth: 'none' }}
              />
            </div>
          </div>

          {/* Comments section */}
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

            {/* Comment form */}
            {user ? (
              <form onSubmit={handleComment} style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                <img
                  src={getAvatarUrl(user)}
                  alt={user.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
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

            {/* Comments list */}
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: '15px' }}>
                <MessageCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p>Yaadni hin jiru. Jalqabaa ta'i!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <div style={{ position: 'sticky', top: '80px' }}>
          {/* Author card */}
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
              <Link href={`/user/${article.author.username}`}>
                <img
                  src={getAvatarUrl(article.author)}
                  alt={article.author.name}
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
                href={`/user/${article.author.username}`}
                style={{ display: 'block', fontSize: '16px', fontWeight: 700, color: '#08090a', textDecoration: 'none', marginTop: '8px' }}
              >
                {article.author.name}
              </Link>
              {article.author.bio && (
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 12px', lineHeight: 1.5 }}>
                  {article.author.bio}
                </p>
              )}
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                Seenaa: {formatDate(article.author.createdAt || '')}
              </div>
              <Link
                href={`/user/${article.author.username}`}
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

          {/* Article info */}
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
            {[
              { label: 'Maxxansame', value: formatDate(article.createdAt) },
              { label: 'Akaaka', value: CATEGORY_LABELS[article.category] },
              { label: 'Dubbiisa', value: `daqiiqaa ${article.readingTime}` },
              { label: 'Simsiree', value: `${article._count.reactions} fayyadamaa` },
              { label: 'Ilaalame', value: `${article.viewCount} yeroo` },
            ].map((info) => (
              <div key={info.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#6b7280' }}>{info.label}</span>
                <span style={{ fontWeight: 600, color: '#08090a' }}>{info.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
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

        {/* Replies */}
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
