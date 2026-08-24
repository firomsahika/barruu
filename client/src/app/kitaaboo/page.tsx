'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { useAuthStore } from '@/store/authStore';
import { useBookmarks } from '@/hooks/useUserActions';

export default function BookmarksPage() {
  const { user, isInitialized } = useAuthStore();
  const { data: bookmarks = [], isLoading, isError } = useBookmarks();

  if (!isInitialized || !user) {
    return <><Header /><p className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-600">Kitaaboo kee ilaaluuf seeni.</p></>;
  }

  return (
    <><Header /><main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-xs font-bold text-gray-900">Kitaaboo Koo</h1>
      {isLoading && <p className="py-12 text-center text-gray-500">Fe'aa jira...</p>}
      {isError && <p className="py-12 text-center text-red-600">Kitaaboo fe'uu hin dandeenye.</p>}
      {!isLoading && !isError && bookmarks.length === 0 && <p className="py-12 text-center text-gray-500">Barruun kuufame hin jiru.</p>}
      <div className="space-y-4">{bookmarks.map(({ article }) => <ArticleCard key={article.id} article={article} />)}</div>
      <Link href="/" className="mt-8 inline-block text-xs font-semibold text-blue-600">Barruulee barbaadi</Link>
    </main></>
  );
}
