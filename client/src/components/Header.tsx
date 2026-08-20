'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getAvatarUrl } from '@/types';
import SearchInput from '@/components/Search';

export default function Header() {
  const { user, logout, initialize, isInitialized } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
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
    <header className="sticky top-0 z-50 h-14 bg-white border-b border-gray-200 px-20 flex items-center justify-between gap-3 font-sans text-gray-900">
      {/* Brand Logo & Search Input Container */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-md font-extrabold text-sm tracking-tight shrink-0 hover:bg-gray-800 transition-colors"
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
            className="hidden sm:block px-3.5 py-1.5 bg-[#3b49df] hover:bg-blue-700 text-white rounded-md text-sm font-semibold whitespace-nowrap transition-colors"
          >
            Barreessi
          </Link>

          <button className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Bell size={18} className="text-gray-600" strokeWidth={1.5} />
          </button>

          {/* User Avatar Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors"
            >
              <img
                src={getAvatarUrl(user)}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-bold text-sm text-gray-900">{user.name}</div>
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
            className="px-3.5 py-1.5 bg-[#3b49df] hover:bg-blue-700 text-white rounded-md text-xs font-bold whitespace-nowrap transition-colors"
          >
            Signup
          </Link>
        </div>
      )}
    </header>
  );
}