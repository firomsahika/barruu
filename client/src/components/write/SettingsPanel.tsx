'use client';

import React from 'react';
import {
  Upload,
  Save,
  Check,
  Image as ImageIcon,
  Music,
  ChevronDown,
} from 'lucide-react';
import { Category, CATEGORY_LABELS } from '@/types';

const CATEGORIES: Category[] = [
  'ODUU',
  'MAMMAAKSA',
  'SEENAA',
  'WALALOO',
  'DURDURII',
  'ASOOSAMA',
  'OOLMAA',
  'SAGALEE',
];

export function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold tracking-tight text-slate-950">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export interface SettingsPanelProps {
  category: Category;
  setCategory: (cat: Category) => void;
  showCoverInput: boolean;
  setShowCoverInput: (val: boolean | ((prev: boolean) => boolean)) => void;
  showAudioInput: boolean;
  setShowAudioInput: (val: boolean | ((prev: boolean) => boolean)) => void;
  isSaving: boolean;
  isPublishing: boolean;
  onSave: (published: boolean) => void;
}

export function SettingsPanel({
  category,
  setCategory,
  showCoverInput,
  setShowCoverInput,
  showAudioInput,
  setShowAudioInput,
  isSaving,
  isPublishing,
  onSave,
}: SettingsPanelProps) {
  return (
    <aside className="min-w-0">
      <div className="space-y-4 lg:sticky lg:top-24">
        {/* Publish Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Maxxansuu</h2>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                Barruu kee yeroo kamiyyuu maxxansi.
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3b49df]">
              <Upload className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              data-button-unstyled
              onClick={() => onSave(false)}
              disabled={isSaving}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Kuufaa...' : 'Draft Kuufi'}
            </button>

            <button
              type="button"
              onClick={() => onSave(true)}
              disabled={isPublishing}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1e293b] text-xs font-bold text-white shadow-sm hover:bg-[#334155] disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {isPublishing ? 'Maxxansaa...' : 'Maxxansi'}
            </button>
          </div>
        </section>

        {/* Category Selection */}
        <SettingSection
          title="Akaaka Barruutii"
          description="Kutaa barruun kee keessatti mul'atu filadhu."
        >
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  data-button-unstyled
                  onClick={() => setCategory(item)}
                  className={[
                    'flex min-h-10 items-center justify-between gap-2 rounded-xl border px-3 text-left text-[11px] font-bold',
                    active
                      ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#3b49df]'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')}
                >
                  <span className="truncate">{CATEGORY_LABELS[item]}</span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </SettingSection>

        {/* Media Attachments */}
        <SettingSection
          title="Miidiyaa"
          description="Fakkii ykn sagalee barruu kee waliin walqabsiisi."
        >
          <div className="space-y-2">
            <button
              type="button"
              data-button-unstyled
              onClick={() => setShowCoverInput((v) => !v)}
              className={[
                'flex h-10 w-full items-center justify-between rounded-xl border px-3 text-xs font-semibold',
                showCoverInput
                  ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#3b49df]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Fakkii Uumaa
              </span>
              <ChevronDown
                className={[
                  'h-4 w-4 transition-transform',
                  showCoverInput ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            <button
              type="button"
              data-button-unstyled
              onClick={() => setShowAudioInput((v) => !v)}
              className={[
                'flex h-10 w-full items-center justify-between rounded-xl border px-3 text-xs font-semibold',
                showAudioInput
                  ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#3b49df]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Sagalee
              </span>
              <ChevronDown
                className={[
                  'h-4 w-4 transition-transform',
                  showAudioInput ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>
          </div>
        </SettingSection>

        {/* Writing Tips */}
        <section className="rounded-2xl border border-[#dbe4ff] bg-[#f7f8ff] p-4 sm:p-5">
          <h3 className="text-xs font-bold text-[#2a38c2]">Gorsa Barreessitootaa</h3>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-slate-600">
            <li>• Mata-duree ifaafi harkisaa filadhu.</li>
            <li>• Barruu kee keessatti tegoolee sirrii fayyadami.</li>
            <li>• Fakkii qulqullina qabu itti dabaladhu.</li>
          </ul>
        </section>
      </div>
    </aside>
  );
}

export default SettingsPanel;
