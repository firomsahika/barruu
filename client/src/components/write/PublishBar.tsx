'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Eye,
  Save,
  Upload,
  MoreHorizontal,
} from 'lucide-react';

export interface PublishBarProps {
  isEditing: boolean;
  activeTab: 'edit' | 'preview';
  setActiveTab: (tab: 'edit' | 'preview') => void;
  isSaving: boolean;
  isPublishing: boolean;
  onSave: (published: boolean) => void;
}

export function PublishBar({
  isEditing,
  activeTab,
  setActiveTab,
  isSaving,
  isPublishing,
  onSave,
}: PublishBarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-3 sm:h-16 sm:px-5 lg:px-6">
        {/* Logo */}
        <Link
          href="/"
          data-button-unstyled
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black tracking-tight text-white shadow-sm"
        >
          SB
        </Link>

        {/* Back */}
        <Link
          href={isEditing ? '/dashboard' : '/'}
          data-button-unstyled
          className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Duubatti
        </Link>

        <div className="hidden h-5 w-px bg-slate-200 sm:block" />

        {/* Page Title */}
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {isEditing ? 'Gulaalaa' : 'Barreessuu'}
          </p>
          <h1 className="truncate text-sm font-bold text-slate-950 sm:text-[15px]">
            {isEditing ? 'Barruu Gulaali' : 'Barruukee Barreessi'}
          </h1>
        </div>

        {/* Desktop actions */}
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <button
            type="button"
            data-button-unstyled
            onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
          >
            <Eye className="h-3.5 w-3.5" />
            {activeTab === 'edit' ? 'Preview' : 'Gulaali'}
          </button>

          <button
            type="button"
            data-button-unstyled
            onClick={() => onSave(false)}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Kuufaa...' : 'Draft Kuufi'}
          </button>

          <button
            type="button"
            onClick={() => onSave(true)}
            disabled={isPublishing}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#1e293b] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#334155] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {isPublishing ? 'Maxxansaa...' : 'Maxxansi'}
          </button>
        </div>

        {/* Mobile menu */}
        <div className="relative ml-auto sm:hidden">
          <button
            type="button"
            data-button-unstyled
            aria-label="More actions"
            onClick={() => setShowMobileMenu((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showMobileMenu && (
            <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <button
                type="button"
                data-button-unstyled
                onClick={() => {
                  setActiveTab(activeTab === 'edit' ? 'preview' : 'edit');
                  setShowMobileMenu(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                {activeTab === 'edit' ? 'Preview' : 'Gulaali'}
              </button>

              <button
                type="button"
                data-button-unstyled
                onClick={() => {
                  onSave(false);
                  setShowMobileMenu(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Save className="h-4 w-4" />
                Draft Kuufi
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublishBar;
