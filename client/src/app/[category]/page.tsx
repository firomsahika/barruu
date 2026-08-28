'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  PenLine,
  BookOpen,
} from 'lucide-react';

import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { useArticles } from '@/hooks/useArticles';
import {
  Category,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/types';

const categoryValues = new Set<Category>([
  'ODUU',
  'MAMMAAKSA',
  'SEENAA',
  'WALALOO',
  'DURDURII',
  'ASOOSAMA',
  'OOLMAA',
  'SAGALEE',
]);

function getCategoryIcon(category: Category) {
  switch (category) {
    case 'ODUU':
      return '📰';
    case 'MAMMAAKSA':
      return '💬';
    case 'SEENAA':
      return '🏛️';
    case 'WALALOO':
      return '📜';
    case 'DURDURII':
      return '🌿';
    case 'ASOOSAMA':
      return '📖';
    case 'OOLMAA':
      return '🌍';
    case 'SAGALEE':
      return '🎙️';
    default:
      return '📚';
  }
}

export default function CategoryPage() {
  const { category: rawCategory } =
    useParams<{ category: string }>();

  const category =
    rawCategory?.toUpperCase() as Category;

  const isValidCategory =
    categoryValues.has(category);

  const {
    data,
    isLoading,
    isError,
  } = useArticles({
    category: isValidCategory
      ? category
      : undefined,
    limit: 20,
  });

  /* ---------------------------------------------------------------------- */
  /* Invalid category                                                       */
  /* ---------------------------------------------------------------------- */

  if (!isValidCategory) {
    return (
      <>
        <Header />

        <main className="min-h-[calc(100vh-64px)] bg-[#f8fafc]">
          <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-2xl shadow-sm">
                📚
              </div>

              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Akaakuun barruu hin argamne
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Kutaan barruu ati barbaadde hin argamne.
                Mee gara fuula barruulee deebi'i.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Gara fuula jalqabaa
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const categoryColor =
    CATEGORY_COLORS[category] || '#3b49df';

  const articlesCount =
    data?.articles?.length ?? 0;

  return (
    <>
      <Header />

      <main className="min-h-[calc(100vh-64px)] bg-[#f8fafc]">
        {/* ================================================================== */}
        {/* Page Header                                                        */}
        {/* ================================================================== */}

        <section className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Back button */}

            <Link
              href="/"
              className="group mb-8 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Deebi'i
            </Link>

            {/* Category hero */}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                {/* Category icon */}

                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm ring-1 ring-black/5 sm:h-16 sm:w-16 sm:text-3xl"
                  style={{
                    backgroundColor: `${categoryColor}12`,
                  }}
                >
                  {getCategoryIcon(category)}
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          categoryColor,
                      }}
                    />

                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.14em]"
                      style={{
                        color: categoryColor,
                      }}
                    >
                      Kutaa barruu
                    </span>
                  </div>

                  <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">
                    {CATEGORY_LABELS[category]}
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                    Barruulee fi yaada haaraa kutaa kana
                    keessatti qoodaman ilaali.
                  </p>
                </div>
              </div>

              {/* Write button */}

              <Link
                href="/write"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
              >
                <PenLine className="h-4 w-4" />

                Barreessi

                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* Content                                                            */}
        {/* ================================================================== */}

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Results header */}

          {!isLoading && !isError && (
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-slate-400" />

                <span className="font-semibold text-slate-700">
                  Barruulee
                </span>

                <span className="text-slate-400">
                  {articlesCount}
                </span>
              </div>

              <span className="hidden text-xs text-slate-400 sm:block">
                Haaraa irraa jalqabi
              </span>
            </div>
          )}

          {/* ================================================================ */}
          {/* Loading                                                          */}
          {/* ================================================================ */}

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5"
                >
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200" />

                      <div className="space-y-1.5">
                        <div className="h-3 w-28 rounded bg-slate-200" />
                        <div className="h-2.5 w-16 rounded bg-slate-100" />
                      </div>
                    </div>

                    <div className="mt-5 h-5 w-3/4 rounded bg-slate-200" />

                    <div className="mt-3 space-y-2">
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-5/6 rounded bg-slate-100" />
                      <div className="h-3 w-2/3 rounded bg-slate-100" />
                    </div>

                    <div className="mt-5 flex gap-2">
                      <div className="h-6 w-16 rounded-full bg-slate-100" />
                      <div className="h-6 w-20 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================================================================ */}
          {/* Error                                                            */}
          {/* ================================================================ */}

          {isError && (
            <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl">
                ⚠️
              </div>

              <h2 className="text-base font-bold text-slate-900">
                Barruulee fe'uu hin dandeenye
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Rakkoon tokko uumameera. Mee yeroo
                muraasa booda irra deebi'ii yaali.
              </p>
            </div>
          )}

          {/* ================================================================ */}
          {/* Empty state                                                      */}
          {/* ================================================================ */}

          {!isLoading &&
            !isError &&
            articlesCount === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
                  style={{
                    backgroundColor: `${categoryColor}12`,
                  }}
                >
                  {getCategoryIcon(category)}
                </div>

                <h2 className="text-lg font-bold tracking-tight text-slate-950">
                  Kutaa kana keessatti barruun hin jiru
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Barruun jalqabaa kutaa kanaa ta'uuf
                  yaada kee qoodi.
                </p>

                <Link
                  href="/write"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                >
                  <PenLine className="h-4 w-4" />
                  Barruu barreessi
                </Link>
              </div>
            )}

          {/* ================================================================ */}
          {/* Articles                                                         */}
          {/* ================================================================ */}

          {!isLoading &&
            !isError &&
            articlesCount > 0 && (
              <div className="space-y-3">
                {data?.articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                  />
                ))}
              </div>
            )}
        </section>
      </main>
    </>
  );
}

