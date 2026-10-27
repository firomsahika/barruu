'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, FileText, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import api from '@/lib/api';
import { Article, getAvatarUrl, formatDate } from '@/types';
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
  const { data: following = [] } = useFollowing(!!currentUser);
  const followUser = useFollowUser();
  const isFollowing = profile ? following.some((followed) => followed.id === profile.id) : false;

  useEffect(() => {
    api
      .get(`/users/${username}`)
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-52 animate-pulse rounded-2xl bg-white border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="mb-2 text-2xl font-bold text-slate-800">Fayyadamaan hin argamne</h1>
          <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Fuula Duraatti Deebi&apos;i
          </Link>
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
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Hordofuu hin dandeenye.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Profile banner */}
      <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600" />

      <div className="mx-auto max-w-4xl px-4">
        {/* Avatar & info card */}
        <div className="relative -mt-12 mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start gap-5">
            <img
              src={getAvatarUrl(profile)}
              alt={profile.name}
              className="h-24 w-24 shrink-0 rounded-full border-4 border-white object-cover shadow-sm"
            />
            <div className="min-w-[200px] flex-1">
              <h1 className="mb-1 text-2xl font-black text-slate-900">{profile.name}</h1>
              {profile.bio && (
                <p className="mb-3 text-sm leading-relaxed text-slate-600">{profile.bio}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Seenaa: {formatDate(profile.createdAt)}</span>
                </div>
                {profile.role === 'ADMIN' && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    ADMIN
                  </span>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Profile Gulaali
              </Link>
            )}
            {currentUser && !isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={followUser.isPending}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                  isFollowing ? 'bg-slate-500 hover:bg-slate-600' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {followUser.isPending ? '...' : isFollowing ? 'Hordofuu dhaabi' : 'Hordofi'}
              </button>
            )}
          </div>

          {/* Stats bar */}
          <div className="mt-6 flex flex-wrap gap-8 border-t border-slate-100 pt-5">
            {[
              { label: 'Maxxansaalee', value: profile._count.articles, icon: '📝' },
              { label: 'Yaadawwan', value: profile._count.comments, icon: '💬' },
              { label: 'Simsireewwan', value: profile.totalReactions, icon: '❤️' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-slate-900">
                  {stat.icon} {stat.value}
                </div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content tabs */}
        <div className="mb-6 flex border-b border-slate-200">
          {(['articles', 'comments'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                activeSection === section
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {section === 'articles' ? <FileText size={16} /> : <MessageCircle size={16} />}
              {section === 'articles'
                ? `Maxxansaalee (${profile._count.articles})`
                : `Yaadawwan (${profile._count.comments})`}
            </button>
          ))}
        </div>

        {/* Articles tab */}
        {activeSection === 'articles' && (
          <div className="space-y-4">
            {profile.articles.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-base text-slate-600">
                  {isOwnProfile ? 'Barruu hin jirtu. Amma barreessi!' : 'Barruu hin jiru.'}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/write"
                    className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Barreessi Amma
                  </Link>
                )}
              </div>
            ) : (
              profile.articles.map((article) => <ArticleCard key={article.id} article={article} />)
            )}
          </div>
        )}

        {/* Comments tab */}
        {activeSection === 'comments' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-400">
            <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm text-slate-500">Yaadawwan kun ammaaf hin agarsiisamu.</p>
          </div>
        )}

        <div className="pb-16" />
      </div>
    </div>
  );
}
