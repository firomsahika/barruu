'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Menu, X, PenLine, Home, Newspaper, MessageCircle, Landmark, BookOpen, ScrollText, Library, Wheat, Mic2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getAvatarUrl } from '@/types';
import SearchInput from '@/components/Search';

export default function Header() {
  const { user, logout, initialize, isInitialized } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [initialize, isInitialized]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-gray-200 bg-white/95 font-sans text-gray-900 backdrop-blur">
      <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-20">
        <button
          type="button"
          data-button-unstyled
          aria-label={showMobileMenu ? 'Cufi menu' : 'Bani menu'}
          aria-expanded={showMobileMenu}
          onClick={() => setShowMobileMenu((open) => !open)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 md:hidden"
        >
          {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>

      {/* Brand Logo & Search Input Container */}
      <div className="flex min-w-0 max-w-2xl flex-1 items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 bg-[#08090a] text-white rounded-md font-extrabold text-xs tracking-tight shrink-0 hover:bg-gray-800 transition-colors"
        >
         B
        </Link>

        {/* Reusable Search Bar Component */}
        <SearchInput />
      </div>

      {/* Right Navigation Actions */}
      {user ? (
        <div className="flex items-center gap-2">
          <Link
            href="/write"
            className="flex items-center gap-1.5 rounded-md bg-slate-800 px-2.5 py-2 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-slate-600 sm:px-3 sm:py-1.5"
          >
            <PenLine size={15} className="sm:hidden" />
            <span className="hidden sm:inline">Barreessi</span>
          </Link>

          <Link href="/notifications" aria-label="Beeksisa" className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Bell size={18} className="text-gray-600" strokeWidth={1.5} />
          </Link>

          {/* User Avatar Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              data-button-unstyled
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full overflow-hidden border bg-slate-800 border-gray-200 hover:border-gray-400 transition-colors"
            >
              <img
                src={getAvatarUrl(user)}
                alt={user.name}
                className="w-full h-full bg-slate-800 object-cover"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-bold text-xs text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 font-light">@{user.username}</div>
                </div>

                <div className="py-1 border-b border-gray-100">
                  {[
                    { label: 'Fuula Koo', href: `/user/${user.username}` },
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Barruu Haaraa', href: '/write' },
                    { label: 'Maxxansaalee Koo', href: `/user/${user.username}` },
                    { label: 'Kitaaboo', href: '/kitaaboo' },
                    ...(user.role === 'ADMIN' ? [{ label: 'Admin Panel', href: '/admin' }] : []),
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    router.push('/');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  Bahi
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-100 text-gray-800 rounded-md text-xs font-light whitespace-nowrap transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-bold whitespace-nowrap transition-colors"
          >
            Signup
          </Link>
        </div>
      )}
      </div>

      {showMobileMenu && (
        <div className="border-t border-gray-100 bg-white px-3 py-3 shadow-lg md:hidden">
          <nav className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Home', href: '/', icon: Home },
              { label: 'Oduu', href: '/oduu', icon: Newspaper },
              { label: 'Mammaaksa', href: '/mammaaksa', icon: MessageCircle },
              { label: 'Seenaa', href: '/seenaa', icon: Landmark },
              { label: 'Walaloo', href: '/walaloo', icon: BookOpen },
              { label: 'Durdurii', href: '/durdurii', icon: ScrollText },
              { label: 'Asoosama', href: '/asoosama', icon: Library },
              { label: 'Olmaa', href: '/olmaa', icon: Wheat },
              { label: 'Sagalee', href: '/sagalee', icon: Mic2 },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setShowMobileMenu(false)}
                className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon size={17} className="text-slate-400" />
                {label}
              </Link>
            ))}
          </nav>
          {user && (
            <Link
              href="/write"
              onClick={() => setShowMobileMenu(false)}
              className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
            >
              <PenLine size={17} />
              Barreessi
            </Link>
          )}
        </div>
      )}
    </header>
  );
}