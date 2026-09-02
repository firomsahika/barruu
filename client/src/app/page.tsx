'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import ArticleCard from '@/components/ArticleCard';
import { useArticles } from '@/hooks/useArticles';
import SearchInput from '@/components/Search';
import { ArrowRight, BookOpen, Compass, Feather, Sparkles, Zap, LucideIcon } from 'lucide-react';
import Link from 'next/link';

type SortTab = 'relevant' | 'latest' | 'top';

const TABS: { id: SortTab; label: string; icon: LucideIcon }[] = [
  { id: 'relevant', label: 'Argadhu', icon: Compass },
  { id: 'latest', label: 'Haaraa', icon: Zap },
  { id: 'top', label: 'Filatamoo', icon: Sparkles },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<SortTab>('relevant');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useArticles({ sort: activeTab, page, limit: 10 });
  const articles = data?.articles || [];
  const totalPages = data?.pagination.pages || 1;

  const loadMore = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <Header />

      {/* Added responsive horizontal padding with px-4 md:px-10 lg:px-20 */}
      <div
        className="responsive-grid px-4 py-5 sm:px-6 lg:px-8"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          height: 'calc(100vh - 56px)',
          paddingTop: '20px',
          paddingBottom: '32px',
          display: 'grid',
          gridTemplateColumns: '240px 1fr 300px',
          gap: '20px',
          alignItems: 'stretch',
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar */}
        <div className="min-h-0 h-full">
          <LeftSidebar />
        </div>

        {/* Main Feed */}
        <main className="min-h-0 min-w-0 space-y-4 overflow-y-auto overscroll-contain pr-1 sm:pr-2">
          <section className="relative overflow-hidden rounded-3xl bg-[#173f31] px-6 py-8 text-white shadow-xl shadow-emerald-950/10 sm:px-8 sm:py-10">
            <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border-[28px] border-[#d49a32]/20" />
            <div className="relative max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#f6d68c]">
                <BookOpen size={14} /> Mana kuusaa barruu Oromoo
              </div>
              <h1 className="max-w-lg font-serif text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                Jechoota keenya, dhalootaaf haa kuusnu.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-emerald-50/80">
                Barruu jechuun mana waloo seenaa, aadaa fi kalaqaa Afaan Oromoo ti.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/write" className="inline-flex items-center gap-2 rounded-xl bg-[#d49a32] px-4 py-2.5 text-sm font-bold text-[#173f31] transition hover:bg-[#e8b451]">
                  <Feather size={16} /> Barruu qoodi
                </Link>
                <Link href="/seenaa" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Seenaa keenya ilaali <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
            <SearchInput placeholder="Barruu, barreessaa ykn mata-duree barbaadi" />
          </div>

          {/* Navigation Filter Tabs */}
          <div
            className="max-w-full overflow-x-auto"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #dbe3dd',
              paddingBottom: '0',
            }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  data-button-unstyled
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 bg-transparent cursor-pointer text-xs font-sans -mb-px transition-all duration-100 ${activeTab === tab.id
                    ? 'font-bold text-[#173f31] border-b-2 border-[#176b4d]'
                    : 'font-normal text-gray-500 border-b-2 border-transparent'
                    }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-end justify-between px-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#176b4d]">Kuusaa Barruu</p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-slate-950">Dubbisaaf filadhu</h2>
            </div>
            <span className="text-xs text-slate-400">{data?.pagination.total ?? 0} barruu</span>
          </div>

          {/* Articles Section */}
          {isLoading ? (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#f3f4f6' }} />
                    <div style={{ height: '14px', width: '120px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
                  </div>
                  <div style={{ height: '20px', width: '80%', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '8px', marginLeft: '38px' }} />
                  <div style={{ height: '14px', width: '60%', backgroundColor: '#f3f4f6', borderRadius: '4px', marginLeft: '38px' }} />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#173f31', marginBottom: '8px' }}>
                Barruuwwan hin jiran
              </h3>
              <p style={{ color: '#6b7280', fontSize: '15px' }}>
                API server akka kaahu mirkaneessi ykn barruuwwan haaraa barreessi.
              </p>
            </div>
          ) : (
            <>
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  featured={index === 0}
                />
              ))}

              {page < totalPages && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={loadMore}
                    style={{
                      padding: '10px 32px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#3b49df',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                    className="hover:bg-gray-50"
                  >
                    Fuula itti aanuu →
                  </button>
                </div>
              )}
              {page > 1 && (
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <button
                    type="button"
                    data-button-unstyled
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="text-xs font-semibold text-[#176b4d] hover:underline"
                  >
                    ← Fuula duraanii ilaali
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <div className="min-h-0 h-full">
          <RightSidebar />
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 1024px) {
          .responsive-grid {
            grid-template-columns: 200px 1fr !important;
          }
          .responsive-grid > div:last-child {
            display: none;
          }
        }
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            overflow: visible !important;
          }
          .responsive-grid > div:first-child {
            display: none;
          }
          .responsive-grid main {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
