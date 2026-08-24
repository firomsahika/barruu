'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { useArticles } from '@/hooks/useArticles';
import { Category, CATEGORY_LABELS } from '@/types';

const categoryValues = new Set<Category>(['WALALOO', 'DURDURII', 'ASOOSAMA', 'OOLMAA', 'SAGALEE']);

export default function CategoryPage() {
  const { category: rawCategory } = useParams<{ category: string }>();
  const category = rawCategory?.toUpperCase() as Category;
  const isValidCategory = categoryValues.has(category);
  const { data, isLoading, isError } = useArticles({ category: isValidCategory ? category : undefined, limit: 20 });

  if (!isValidCategory) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-600">Akaakuun barruu hin argamne.</p>;
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">Siidaa Barruu</p>
            <h1 className="text-xs font-bold text-gray-900">{CATEGORY_LABELS[category]}</h1>
          </div>
          <Link href="/write" className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
            Barreessi
          </Link>
        </div>

        {isLoading && <p className="py-12 text-center text-gray-500">Fe'aa jira...</p>}
        {isError && <p className="py-12 text-center text-red-600">Barruulee fe'uu hin dandeenye.</p>}
        {!isLoading && !isError && data?.articles.length === 0 && (
          <p className="py-12 text-center text-gray-500">Kutaa kana keessatti barruun hin jiru.</p>
        )}
        <div className="space-y-4">
          {data?.articles.map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
      </main>
    </>
  );
}
