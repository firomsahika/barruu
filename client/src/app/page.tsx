'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import ArticleCard from '@/components/ArticleCard';
import { useArticles } from '@/hooks/useArticles';
import SearchInput from '@/components/Search';
import { Compass, Zap, Users, LucideIcon } from 'lucide-react';

type SortTab = 'relevant' | 'latest' | 'top';

const TABS: { id: SortTab; label: string; icon: LucideIcon }[] = [
  { id: 'relevant', label: 'Discover', icon: Compass },
  { id: 'latest', label: 'Latest', icon: Zap },
  { id: 'top', label: 'Following', icon: Users },
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
    <div className="" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Header />

      {/* Added responsive horizontal padding with px-4 md:px-10 lg:px-20 */}
      <div
        className="responsive-grid px-4 py-5 sm:px-6 lg:px-8"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '20px',
          paddingBottom: '32px',
          display: 'grid',
          gridTemplateColumns: '240px 1fr 300px',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left Sidebar */}
        <div style={{ position: 'sticky', top: '72px' }}>
          <LeftSidebar />
        </div>

        {/* Main Feed */}
        <main className="space-y-4">
          {/* Top "What's on your mind?" Search Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <SearchInput placeholder="What's on your mind?" />
          </div>

          {/* Navigation Filter Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '0',
            }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 bg-transparent cursor-pointer text-xs font-sans -mb-px transition-all duration-100 ${activeTab === tab.id
                    ? 'font-bold text-[#08090a] border-b-2 border-[#3b49df]'
                    : 'font-normal text-gray-500 border-b-2 border-transparent'
                    }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
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
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#08090a', marginBottom: '8px' }}>
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
                    Barruu Dabalataa Agarsiisi
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <div style={{ position: 'sticky', top: '72px' }}>
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
          }
          .responsive-grid > div:first-child {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}