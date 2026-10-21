'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { useArticles } from '@/hooks/useArticles';

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useArticles({ tag: slug, limit: 20 });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">Tegii</p>
            <h1 className="text-xs font-bold text-gray-900">#{slug}</h1>
          </div>
          <Link href="/write" className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
            Barreessi
          </Link>
        </div>

        {isLoading && <p className="py-12 text-center text-gray-500">Fe&apos;aa jira...</p>}
        {isError && <p className="py-12 text-center text-red-600">Barruulee fe&apos;uu hin dandeenye.</p>}
        {!isLoading && !isError && data?.articles.length === 0 && (
          <p className="py-12 text-center text-gray-500">Teg kanaan barruun hin jiru.</p>
        )}
        <div className="space-y-4">
          {data?.articles.map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
      </main>
    </>
  );
}
