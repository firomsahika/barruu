'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, FileText, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import api from '@/lib/api';
import { Article, getAvatarUrl, formatDate, CATEGORY_LABELS } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useFollowUser, useFollowing } from '@/hooks/useUserActions';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  totalReactions: number;
  _count: { articles: number; comments: number };
  articles: Article[];
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'articles' | 'comments'>('articles');
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: following = [] } = useFollowing(!!currentUser);
  const followUser = useFollowUser();

  useEffect(() => {
    api.get(`/users/${username}`)
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [username]);

  useEffect(() => {
    if (profile) {
      setIsFollowing(following.some((followed) => followed.id === profile.id));
    }
  }, [following, profile]);

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Header />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', height: '200px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Fayyadamaan hin argamne</h1>
          <Link href="/" style={{ color: '#3b49df' }}>Fuula Duraatti Deebi&apos;i</Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === username;

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Namoota hordofuuf seeni.');
      return;
    }
    try {
      await followUser.mutateAsync({ followeeId: profile.id, following: isFollowing });
      setIsFollowing(!isFollowing);
    } catch (error: unknown) {
      toast.error((error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Hordofuu hin dandeenye.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Header />

      {/* Profile header */}
      <div
        style={{
          height: '120px',
          background: 'linear-gradient(135deg, #3b49df 0%, #7c3aed 100%)',
        }}
      />

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        {/* Avatar & info */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginTop: '-40px',
            marginBottom: '24px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            <img
              src={getAvatarUrl(profile)}
              alt={profile.name}
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #ffffff',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#08090a', margin: '0 0 4px' }}>
                {profile.name}
              </h1>
              {profile.bio && (
                <p style={{ fontSize: '15px', color: '#4b5563', margin: '0 0 12px', lineHeight: 1.6 }}>
                  {profile.bio}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                  <Calendar size={14} />
                  Seenaa: {formatDate(profile.createdAt)}
                </div>
                {profile.role === 'ADMIN' && (
                  <span
                    style={{
                      padding: '2px 8px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <Link
                href="/dashboard"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#08090a',
                  backgroundColor: '#ffffff',
                }}
              >
                Profile Gulaali
              </Link>
            )}
            {currentUser && !isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={followUser.isPending}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', color: '#ffffff', backgroundColor: isFollowing ? '#6b7280' : '#3b49df', fontWeight: 600, cursor: 'pointer' }}
              >
                {followUser.isPending ? '...' : isFollowing ? 'Hordofuu dhaabi' : 'Hordofi'}
              </button>
            )}
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #f3f4f6',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Maxxansaalee', value: profile._count.articles, icon: '📝' },
              { label: 'Yaadawwan', value: profile._count.comments, icon: '💬' },
              { label: 'Simsireewwan', value: profile.totalReactions, icon: '❤️' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#08090a' }}>
                  {stat.icon} {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          {(['articles', 'comments'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: activeSection === section ? 700 : 400,
                color: activeSection === section ? '#08090a' : '#6b7280',
                borderBottom: activeSection === section ? '2px solid #3b49df' : '2px solid transparent',
                marginBottom: '-1px',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {section === 'articles' ? <FileText size={16} /> : <MessageCircle size={16} />}
              {section === 'articles' ? `Maxxansaalee (${profile._count.articles})` : `Yaadawwan (${profile._count.comments})`}
            </button>
          ))}
        </div>

        {/* Articles */}
        {activeSection === 'articles' && (
          <div>
            {profile.articles.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '48px',
                  textAlign: 'center',
                  color: '#9ca3af',
                }}
              >
                <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: '16px' }}>
                  {isOwnProfile ? 'Barruu hin jirtu. Amma barreessi!' : 'Barruu hin jiru.'}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/write"
                    style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      padding: '8px 20px',
                      backgroundColor: '#3b49df',
                      color: '#ffffff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Barreessi Amma
                  </Link>
                )}
              </div>
            ) : (
              profile.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </div>
        )}

        {activeSection === 'comments' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '32px',
              textAlign: 'center',
              color: '#9ca3af',
            }}
          >
            <MessageCircle size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>Yaadawwan kun ammaaf hin agarsiisamu.</p>
          </div>
        )}

        <div style={{ paddingBottom: '48px' }} />
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
