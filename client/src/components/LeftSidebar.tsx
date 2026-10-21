'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Trophy,
  Newspaper,
  MessageCircle,
  Landmark,
  BookOpen,
  ScrollText,
  Library,
  Wheat,
  Mic2,
  Search,
  LogIn,
  UserPlus,
  Hash,
} from 'lucide-react';

import { useTags } from '@/hooks/useTags';
import { useAuthStore } from '@/store/authStore';
import { Tag } from '@/types';

const mainNavItems = [
  {
    icon: Home,
    label: 'Home',
    href: '/',
  },
  {
    icon: Trophy,
    label: 'Filatamoo',
    href: '/?sort=top',
  },
];

const cultureNavItems = [
  {
    icon: Newspaper,
    label: 'Oduu',
    href: '/oduu',
  },
  {
    icon: MessageCircle,
    label: 'Mammaaksa',
    href: '/mammaaksa',
  },
  {
    icon: Landmark,
    label: 'Seenaa',
    href: '/seenaa',
  },
  {
    icon: BookOpen,
    label: 'Walaloo',
    href: '/walaloo',
  },
  {
    icon: ScrollText,
    label: 'Durdurii',
    href: '/durdurii',
  },
  {
    icon: Library,
    label: 'Asoosama',
    href: '/asoosama',
  },
  {
    icon: Wheat,
    label: 'Olmaa',
    href: '/olmaa',
  },
  {
    icon: Mic2,
    label: 'Sagalee',
    href: '/sagalee',
  },
];

function NavigationItem({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        'group relative flex items-center gap-3 rounded-lg px-3 py-2',
        'text-[13px] transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
        active
          ? 'bg-slate-100 font-semibold text-slate-950'
          : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900',
      ].join(' ')}
    >
      {/* Active indicator */}

      {active && (
        <span className="absolute -left-[1px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-slate-900" />
      )}

      <Icon
        className={[
          'h-[17px] w-[17px] shrink-0 transition-colors',
          active
            ? 'text-slate-900'
            : 'text-slate-400 group-hover:text-slate-700',
        ].join(' ')}
        strokeWidth={active ? 2.2 : 1.8}
      />

      <span>{label}</span>
    </Link>
  );
}

export default function LeftSidebar() {
  const pathname = usePathname();

  const { data: tags = [] } = useTags();
  const { user } = useAuthStore();

  const [tagFilter, setTagFilter] = useState('');

  const filteredTags = tags
    .filter((tag: Tag) =>
      tag.name
        .toLowerCase()
        .includes(tagFilter.toLowerCase())
    )
    .slice(0, 7);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href;
  };

  return (
    <aside className="h-full w-full">
      <div className="sticky top-20 h-[calc(100vh-96px)] overflow-y-auto pr-1 pb-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm shadow-slate-200/30">
          {/* ============================================================ */}
          {/* Main navigation                                               */}
          {/* ============================================================ */}

          <nav className="space-y-0.5">
            {mainNavItems.map((item) => (
              <NavigationItem
                key={item.href}
                {...item}
                active={isActive(item.href)}
              />
            ))}
          </nav>

          {/* ============================================================ */}
          {/* Section divider                                               */}
          {/* ============================================================ */}

          <div className="my-3 px-3">
            <div className="h-px bg-slate-100" />
          </div>

          {/* ============================================================ */}
          {/* Culture navigation                                            */}
          {/* ============================================================ */}

          <div>
            <div className="mb-1 px-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Aadaa fi Barruu
              </span>
            </div>

            <nav className="space-y-0.5">
              {cultureNavItems.map((item) => (
                <NavigationItem
                  key={item.href}
                  {...item}
                  active={isActive(item.href)}
                />
              ))}
            </nav>
          </div>

          {/* ============================================================ */}
          {/* Community CTA                                                 */}
          {/* ============================================================ */}

          {!user && (
            <>
              <div className="my-3 px-3">
                <div className="h-px bg-slate-100" />
              </div>

              <div className="mx-1 rounded-xl bg-slate-950 p-3.5">
                <div className="mb-3">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>

                  <h3 className="text-[13px] font-bold leading-5 text-white">
                    Hawaasa keenya waliin
                  </h3>

                  <p className="mt-1.5 text-[11px] leading-[1.55] text-slate-400">
                    Barruu kee qoodi, yaada kee ibsi,
                    hawaasa keenya waliin wal qunnami.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Link
                    href="/register"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-slate-950 transition-all hover:bg-slate-100"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Galmaa&apos;i
                  </Link>

                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[11px] font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Seeni
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* Popular tags                                                   */}
          {/* ============================================================ */}

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between px-3">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-slate-400" />

                <h3 className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Tegoolee
                </h3>
              </div>

              <span className="text-[9px] text-slate-300">
                Baay&apos;ee fayyadaman
              </span>
            </div>

            {/* Search */}

            <div className="relative px-2">
              <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Teg barbaadi..."
                value={tagFilter}
                onChange={(e) =>
                  setTagFilter(e.target.value)
                }
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2.5 text-[11px] text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Tags */}

            <div className="mt-1.5 space-y-0.5">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag: Tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tag/${tag.slug}`}
                    className="group flex items-center justify-between rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50"
                  >
                    <span className="max-w-[125px] truncate text-[11px] font-medium text-slate-500 transition-colors group-hover:text-slate-900">
                      #{tag.name}
                    </span>

                    <span className="text-[9px] text-slate-300 transition-colors group-hover:text-slate-400">
                      {tag._count?.articles || 0}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="px-3 py-3 text-center text-[10px] text-slate-400">
                  Teg hin argamne
                </p>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* Footer                                                        */}
          {/* ============================================================ */}

          <div className="mt-4 border-t border-slate-100 px-3 pb-1 pt-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-slate-400">
              <Link
                href="/waa-nu-bira"
                className="transition-colors hover:text-slate-700"
              >
                Waa Nu Bira
              </Link>

              <span className="text-slate-200">•</span>

              <Link
                href="/seera-fayyadama"
                className="transition-colors hover:text-slate-700"
              >
                Seera
              </Link>

              <span className="text-slate-200">•</span>

              <Link
                href="/dhuunfaa"
                className="transition-colors hover:text-slate-700"
              >
                Dhuunfaa
              </Link>

              <span className="text-slate-200">•</span>

              <Link
                href="/quunnamtii"
                className="transition-colors hover:text-slate-700"
              >
                Quunnamtii
              </Link>
            </div>

            <p className="mt-2 text-[9px] text-slate-300">
              Siidaa Barruu · 2026
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
