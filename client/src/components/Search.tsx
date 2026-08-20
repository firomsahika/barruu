'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import api from '@/lib/api';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  author: { name: string; username: string };
}

interface SearchInputProps {
  placeholder?: string;
}

export default function SearchInput({ placeholder = 'Search...' }: SearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`/articles?search=${encodeURIComponent(searchQuery)}&limit=5`);
          setSearchResults(res.data.articles || []);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 ">
      <form onSubmit={handleSearch}>
        <div
          className={`flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 transition-all ${
            showSearch ? 'bg-white border-blue-600 ring-1 ring-blue-600' : 'bg-white hover:border-gray-300'
          }`}
        >
          <Search size={18} className="text-gray-400 shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="w-full bg-transparent text-sm font-normal text-gray-900 placeholder:text-gray-400 placeholder:text-xs placeholder:font-light outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="p-0.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {showSearch && searchQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
          {isSearching ? (
            <div className="px-4 py-3 text-xs text-gray-500">Barbaadaa...</div>
          ) : searchResults.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500">Barruu hin argamne</div>
          ) : (
            searchResults.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="block px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 leading-snug">
                  {article.title}
                </div>
                <div className="text-xs text-gray-500 font-light mt-0.5">
                  by {article.author.name}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}