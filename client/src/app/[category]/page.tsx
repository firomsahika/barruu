'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Volume2 } from 'lucide-react';
import Header from '@/components/Header';
import ReactionSidebar from '@/components/article/ReactionSidebar';
import CommentsSection from '@/components/article/CommentSection';
import AuthorCard from '@/components/article/AuthorCard';
import ArticleMeta from '@/components/article/ArticleMeta';
import api from '@/lib/api';
import { Article, Comment, getAvatarUrl, formatDate, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
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
        <ReactionSidebar
          liked={liked}
          unicorned={unicorned}
          bookmarked={bookmarked}
          likeCount={likeCount}
          reactionsCount={article._count.reactions}
          onReact={handleReact}
          onBookmark={handleBookmark}
          onShare={handleShare}
        />

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

              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{ maxWidth: 'none' }}
              />
            </div>
          </div>

          <CommentsSection
            comments={comments}
            user={user}
            commentText={commentText}
            isSubmittingComment={isSubmittingComment}
            onCommentChange={setCommentText}
            onSubmitComment={handleComment}
          />
        </main>

        <div style={{ position: 'sticky', top: '80px' }}>
          <AuthorCard author={article.author} />
          <ArticleMeta article={article} />
        </div>
      </div>
    </div>
  );
}