'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTags } from '@/hooks/useTags';

// DEV.to uses colorful emojis/icons with text-sm labels
const navItems = [
  { icon: '🏠', label: 'Home', href: '/' },
  { icon: '🏆', label: 'Filatamoo', href: '/filatamoo' },
  { icon: '📖', label: 'Walaloo', href: '/walaloo' },
  { icon: '📜', label: 'Durdurii', href: '/durdurii' },
  { icon: '📚', label: 'Asoosama', href: '/asoosama' },
  { icon: '🎙️', label: 'Sagalee', href: '/sagalee' },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const { data: tags = [] } = useTags();
  const [tagFilter, setTagFilter] = useState('');

  const filteredTags = tags
    .filter((t: any) => t.name.toLowerCase().includes(tagFilter.toLowerCase()))
    .slice(0, 8);

  return (
    <aside className="w-full space-y-4  text-[#171717]">
      {/* Navigation Links with Colored Emoji Icons */}
      <nav className="space-y-0.3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[5px] transition-all ${isActive
                ? 'bg-white font-bold text-gray-900 border border-gray-200'
                : 'font-light  text-gray-700 hover:bg-gray-200/60 hover:text-blue-600 hover:underline'
                }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-xs font-light">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-[1px] bg-gray-200 my-3" />

      {/* Community Callout Card */}
      <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 leading-snug">
          Siidaa Barruu fi Aadaa Oromoo
        </h3>
        <p className="text-xs text-gray-500 font-normal leading-relaxed">
          Siidaa Barruu bakka barruu aadaa fi seenaa Afaan Oromoo maxxansuu fi dubbisuu dandeessuudha.
        </p>
        <div className="space-y-2 pt-1">
          <Link
            href="/register"
            className="block text-center w-full py-1.5 px-3 text-xs font-semibold text-white bg-[#3b49df] hover:bg-blue-700 rounded-md transition-colors"
          >
            Galmaa'i Amma
          </Link>
          <Link
            href="/login"
            className="block text-center w-full py-1.5 px-3 text-xs font-normal text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
          >
            Seeni
          </Link>
        </div>
      </div>

      {/* Popular Tags Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-800 px-3 uppercase tracking-wider">
          Tegoolee Baay'ee Fayyadamamu
        </h3>

        {/* Search Input Filter */}
        <div className="px-3 relative">
          <Search size={14} className="text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Teg barbaadi..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 placeholder:text-gray-400 font-light"
          />
        </div>

        {/* Tags List */}
        <div className="space-y-0.5 pt-1">
          {filteredTags.map((tag: any) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-normal text-gray-600 hover:bg-gray-200/60 hover:text-blue-600 transition-all"
            >
              <span>#{tag.name}</span>
              <span className="text-xs text-gray-400 font-light">
                {tag._count?.articles || 0} barruu
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Meta Links */}
      <div className="pt-2 px-3 space-y-2">
        <div className="text-xs text-gray-400 font-light flex flex-wrap gap-1.5 leading-relaxed">
          <Link href="/waa-nu-bira" className="hover:text-blue-600 hover:underline">
            Waa Nu Bira
          </Link>
          <span>·</span>
          <Link href="/seera-fayyadama" className="hover:text-blue-600 hover:underline">
            Seera
          </Link>
          <span>·</span>
          <Link href="/dhuunfaa" className="hover:text-blue-600 hover:underline">
            Dhuunfaa
          </Link>
          <span>·</span>
          <Link href="/quunnamtii" className="hover:text-blue-600 hover:underline">
            Quunnamtii
          </Link>
        </div>
        <p className="text-xs text-gray-400 font-light">
          Siidaa Barruu Community 2026
        </p>
      </div>
    </aside>
  );
}