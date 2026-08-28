'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { useAuthStore } from '@/store/authStore';

// Compact labels keep the navigation scannable.
const navItems = [
  { icon: '🏠', label: 'Home', href: '/' },
  { icon: '🏆', label: 'Filatamoo', href: '/?sort=top' },
  { icon: '📰', label: 'Oduu', href: '/oduu' },
  { icon: '💬', label: 'Mammaaksa', href: '/mammaaksa' },
  { icon: '🏛️', label: 'Seenaa', href: '/seenaa' },
  { icon: '📖', label: 'Walaloo', href: '/walaloo' },
  { icon: '📜', label: 'Durdurii', href: '/durdurii' },
  { icon: '📚', label: 'Asoosama', href: '/asoosama' },
  { icon: '🎙️', label: 'Sagalee', href: '/sagalee' },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const { data: tags = [] } = useTags();
  const {user} = useAuthStore();
  const [tagFilter, setTagFilter] = useState('');

  const filteredTags = tags
    .filter((t: any) => t.name.toLowerCase().includes(tagFilter.toLowerCase()))
    .slice(0, 8);

  return (
    <aside className="w-full space-y-5 text-[#171717]">
      {/* Navigation Links with Colored Emoji Icons */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all ${isActive
                ? 'bg-white font-semibold text-gray-900 border border-gray-200 shadow-sm'
                : 'font-medium text-gray-600 hover:bg-white hover:text-blue-600'
                }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-[13px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-3" />

      {/* Community Callout Card */}
      {
        user ? (  <div></div>):(
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
        <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
          Siidaa Barruu fi Aadaa Oromoo
        </h3>
        <p className="text-[13px] text-gray-500 font-normal leading-relaxed">
          Siidaa Barruu bakka barruu aadaa fi seenaa Afaan Oromoo maxxansuu fi dubbisuu dandeessuudha.
        </p>
        <div className="space-y-2 pt-1">
          <Link
            href="/register"
            className="block text-center w-full py-2 px-3 text-[13px] font-semibold text-white bg-slate-800 hover:bg-slate-600 rounded-md transition-colors"
          >
            Galmaa'i Amma
          </Link>
          <Link
            href="/login"
            className="block text-center w-full py-2 px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
          >
            Seeni
          </Link>
        </div>
      </div> )
   
      }
    

      {/* Popular Tags Section */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-gray-500 px-3 uppercase tracking-[0.12em]">
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
            className="w-full pl-8 pr-3 py-2 text-[13px] bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 placeholder:text-gray-400"
          />
        </div>

        {/* Tags List */}
        <div className="space-y-0.5 pt-1">
          {filteredTags.map((tag: any) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-white hover:text-blue-600 transition-all"
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