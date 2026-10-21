'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

import {
  ArrowLeft,
  Bold,
  Check,
  ChevronDown,
  Code,
  Eye,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Music,
  Quote,
  Save,
  Upload,
  X,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import api, { getApiErrorMessage, uploadImage } from '@/lib/api';
import toast from 'react-hot-toast';

import {
  Category,
  CATEGORY_LABELS,
} from '@/types';

/* ========================================================================= */
/* Categories                                                                */
/* ========================================================================= */

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

/* ========================================================================= */
/* Toolbar Button                                                            */
/* ========================================================================= */

function ToolbarButton({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-button-unstyled
      title={title}
      aria-label={title}
      onClick={onClick}
      className={[
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
        'border border-transparent',
        'text-slate-500',
        'transition-colors duration-150',
        'hover:bg-slate-100 hover:text-slate-900',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b49df]/20',
        active
          ? 'bg-[#eef2ff] text-[#3b49df]'
          : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

/* ========================================================================= */
/* Setting Section                                                           */
/* ========================================================================= */

function SettingSection({
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

/* ========================================================================= */
/* Page                                                                      */
/* ========================================================================= */

function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isInitialized } =
    useAuthStore();

  const queryClient =
    useQueryClient();

  const editSlug =
    searchParams.get('slug');

  const editId =
    searchParams.get('id');

  const isEditing =
    Boolean(editSlug || editId);

  /* ----------------------------------------------------------------------- */
  /* State                                                                   */
  /* ----------------------------------------------------------------------- */

  const [articleId, setArticleId] =
    useState<string | null>(editId);

  const [title, setTitle] =
    useState('');

  const [tags, setTags] =
    useState<string[]>([]);

  const [tagInput, setTagInput] =
    useState('');

  const [category, setCategory] =
    useState<Category>('ASOOSAMA');

  const [coverImageUrl, setCoverImageUrl] =
    useState('');

  const [isUploadingCover, setIsUploadingCover] =
    useState(false);

  const [audioUrl, setAudioUrl] =
    useState('');

  const [showCoverInput, setShowCoverInput] =
    useState(false);

  const [showAudioInput, setShowAudioInput] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<'edit' | 'preview'>('edit');

  const [showMobileMenu, setShowMobileMenu] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isPublishing, setIsPublishing] =
    useState(false);

  /* ----------------------------------------------------------------------- */
  /* Editor                                                                  */
  /* ----------------------------------------------------------------------- */

  const editor = useEditor({
    extensions: [
      StarterKit,

      Image.configure({
        inline: false,
        allowBase64: true,
      }),

      LinkExtension.configure({
        openOnClick: false,
      }),

      Placeholder.configure({
        placeholder:
          'Barruukee asitti barreessi...',
      }),
    ],

    content: '',

    editorProps: {
      attributes: {
        class:
          'min-h-[420px] px-5 py-5 pb-24 outline-none sm:min-h-[520px] sm:px-8 sm:py-7 lg:px-10 lg:py-8',
      },
    },
  });

  /* ========================================================================= */
  /* Authentication                                                            */
  /* ========================================================================= */

  useEffect(() => {
    if (
      isInitialized &&
      !user
    ) {
      toast.error(
        'Barreessuuf seeni'
      );

      router.push('/login');
    }
  }, [
    user,
    isInitialized,
    router,
  ]);

  /* ========================================================================= */
  /* Load Article                                                             */
  /* ========================================================================= */

  useEffect(() => {
    if (
      !editor ||
      !isInitialized ||
      !user ||
      (!editSlug && !editId)
    ) {
      return;
    }

    const request = editSlug ? api.get(`/articles/${editSlug}`) : api.get(`/articles/id/${editId}`);

    request                                                                                                                                                       
      .then((res) => {
        const article = res.data;

        setArticleId(article.id);
        setTitle(article.title || '');
        setCategory(article.category);
        setCoverImageUrl(
          article.coverImageUrl || ''
        );
        setAudioUrl(
          article.audioUrl || ''
        );

        setTags(
          article.tags?.map(
            (item: {
              tag: {
                name: string;
              };
            }) => item.tag.name
          ) || []
        );

        editor.commands.setContent(
          article.content || ''
        );
      })
      .catch((error: unknown) => {
        toast.error(
          getApiErrorMessage(
            error,
            'Barruu hin argamne'
          )
        );

        router.replace('/dashboard');
      });
  }, [
    editor,
    editSlug,
    editId,
    isInitialized,
    user,
    router,
  ]);

  /* ========================================================================= */
  /* Tags                                                                      */
  /* ========================================================================= */

  const addTag = () => {
    const tag = tagInput
      .trim()
      .toLowerCase()
      .replace(/^#/, '');

    if (
      !tag ||
      tags.includes(tag) ||
      tags.length >= 4
    ) {
      return;
    }

    setTags((previous) => [
      ...previous,
      tag,
    ]);

    setTagInput('');
  };

  const removeTag = (
    tagToRemove: string
  ) => {
    setTags((previous) =>
      previous.filter(
        (tag) =>
          tag !== tagToRemove
      )
    );
  };

  const handleCoverUpload = async (file: File) => {
    setIsUploadingCover(true);
    try {
      const url = await uploadImage(file, 'article-covers');
      setCoverImageUrl(url);
      toast.success('Fakkiin olkaa\'ame');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Fakkii olkaa\'uu hin dandeenye');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleTagKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === 'Enter' ||
      event.key === ','
    ) {
      event.preventDefault();
      addTag();
    }

    if (
      event.key === 'Backspace' &&
      !tagInput &&
      tags.length > 0
    ) {
      setTags((previous) =>
        previous.slice(0, -1)
      );
    }
  };

  /* ========================================================================= */
  /* Content                                                                   */
  /* ========================================================================= */

  const getContent = useCallback(
    () =>
      editor?.getHTML() || '',
    [editor]
  );

  /* ========================================================================= */
  /* Save / Publish                                                            */
  /* ========================================================================= */

  const handleSave = async (
    publish: boolean
  ) => {
    const cleanTitle =
      title.trim();

    const content =
      getContent();

    if (!cleanTitle) {
      toast.error(
        'Mata-duree galchaa'
      );
      return;
    }

    if (
      !content ||
      content === '<p></p>'
    ) {
      toast.error(
        'Qabiyyee barreessaa'
      );
      return;
    }

    if (publish) {
      setIsPublishing(true);
    } else {
      setIsSaving(true);
    }

    try {
      const payload = {
        title: cleanTitle,
        content,
        category,
        tags,

        ...(coverImageUrl.trim()
          ? {
              coverImageUrl:
                coverImageUrl.trim(),
            }
          : {}),

        ...(audioUrl.trim()
          ? {
              audioUrl:
                audioUrl.trim(),
            }
          : {}),

        published: publish,
      };

      if (articleId) {
        await api.patch(
          `/articles/${articleId}`,
          payload
        );
      } else {
        const response =
          await api.post(
            '/articles',
            payload
          );

        setArticleId(
          response.data.id
        );

        if (publish) {
          router.push(
            `/article/${response.data.slug}`
          );
        }
      }

      toast.success(
        publish
          ? 'Barruu maxxanfame!'
          : 'Draft kuufame!'
      );

      await queryClient.invalidateQueries({
        queryKey: ['articles'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['drafts'],
      });
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          'Dogoggori uumame'
        )
      );
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  /* ========================================================================= */
  /* Loading                                                                   */
  /* ========================================================================= */

  if (!isInitialized) {
    return null;
  }

  if (!user) {
    return null;
  }

  /* ========================================================================= */
  /* Render                                                                    */
  /* ========================================================================= */

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-24 lg:pb-8">

      {/* =================================================================== */}
      {/* HEADER                                                               */}
      {/* =================================================================== */}

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
            href={
              isEditing
                ? '/dashboard'
                : '/'
            }
            data-button-unstyled
            className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" />

            Duubatti
          </Link>

          <div className="hidden h-5 w-px bg-slate-200 sm:block" />

          {/* Page title */}

          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {isEditing
                ? 'Gulaalaa'
                : 'Barreessuu'}
            </p>

            <h1 className="truncate text-sm font-bold text-slate-950 sm:text-[15px]">
              {isEditing
                ? 'Barruu Gulaali'
                : 'Barruukee Barreessi'}
            </h1>
          </div>

          {/* Desktop actions */}

          <div className="ml-auto hidden items-center gap-2 sm:flex">

            <button
              type="button"
              data-button-unstyled
              onClick={() =>
                setActiveTab(
                  activeTab === 'edit'
                    ? 'preview'
                    : 'edit'
                )
              }
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            >
              <Eye className="h-3.5 w-3.5" />

              {activeTab === 'edit'
                ? 'Preview'
                : 'Gulaali'}
            </button>

            <button
              type="button"
              data-button-unstyled
              onClick={() =>
                handleSave(false)
              }
              disabled={isSaving}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />

              {isSaving
                ? 'Kuufaa...'
                : 'Draft Kuufi'}
            </button>

            <button
              type="button"
              onClick={() =>
                handleSave(true)
              }
              disabled={isPublishing}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#1e293b] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#334155] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />

              {isPublishing
                ? 'Maxxansaa...'
                : 'Maxxansi'}
            </button>

          </div>

          {/* Mobile menu */}

          <div className="relative ml-auto sm:hidden">

            <button
              type="button"
              data-button-unstyled
              aria-label="More actions"
              onClick={() =>
                setShowMobileMenu(
                  (value) => !value
                )
              }
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
                    setActiveTab(
                      activeTab === 'edit'
                        ? 'preview'
                        : 'edit'
                    );

                    setShowMobileMenu(
                      false
                    );
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />

                  {activeTab === 'edit'
                    ? 'Preview'
                    : 'Gulaali'}
                </button>

                <button
                  type="button"
                  data-button-unstyled
                  onClick={() => {
                    handleSave(false);

                    setShowMobileMenu(
                      false
                    );
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

      {/* =================================================================== */}
      {/* WORKSPACE                                                            */}
      {/* =================================================================== */}

      <div className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-5 sm:py-6 lg:px-6 lg:py-8">

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">

          {/* ================================================================= */}
          {/* MAIN EDITOR                                                       */}
          {/* ================================================================= */}

          <main className="min-w-0">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* ------------------------------------------------------------- */}
              {/* MEDIA ACTIONS                                                  */}
              {/* ------------------------------------------------------------- */}

              <div className="border-b border-slate-100">

                <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden">

                  <button
                    type="button"
                    data-button-unstyled
                    onClick={() => {
                      setShowCoverInput(
                        (value) => !value
                      );

                      setShowAudioInput(
                        false
                      );
                    }}
                    className={[
                      'inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-semibold',
                      showCoverInput
                        ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#3b49df]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />

                    Fakkii
                  </button>

                  <button
                    type="button"
                    data-button-unstyled
                    onClick={() => {
                      setShowAudioInput(
                        (value) => !value
                      );

                      setShowCoverInput(
                        false
                      );
                    }}
                    className={[
                      'inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-semibold',
                      showAudioInput
                        ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#3b49df]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <Music className="h-3.5 w-3.5" />

                    Sagalee
                  </button>

                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* COVER IMAGE                                                     */}
              {/* ------------------------------------------------------------- */}

              {showCoverInput && (
                <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">

                  <div className="mb-3 flex items-start justify-between gap-4">

                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Fakkii Uumaa
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        Fakkii kompiitaraa kee filadhu ykn URL isaa galchi.
                      </p>
                    </div>

                    <button
                      type="button"
                      data-button-unstyled
                      onClick={() =>
                        setShowCoverInput(
                          false
                        )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-900"
                    >
                      <X className="h-4 w-4" />
                    </button>

                  </div>

                  {coverImageUrl && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">

                      <div className="aspect-[16/8] w-full">

                        <img
                          src={coverImageUrl}
                          alt="Cover preview"
                          className="h-full w-full object-cover"
                        />

                      </div>

                    </div>
                  )}

                  <label className="mb-3 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500">
                    {isUploadingCover ? 'Fakkii olkaa\'aa jira...' : 'Fakkii filadhu'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      disabled={isUploadingCover}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleCoverUpload(file);
                        event.target.value = '';
                      }}
                    />
                  </label>

                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(event) =>
                      setCoverImageUrl(
                        event.target.value
                      )
                    }
                    placeholder="https://example.com/image.jpg"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#3b49df] focus:ring-4 focus:ring-[#eef2ff] placeholder:text-slate-400"
                  />

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* AUDIO                                                           */}
              {/* ------------------------------------------------------------- */}

              {showAudioInput && (
                <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">

                  <div className="mb-3 flex items-start justify-between gap-4">

                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Sagalee barruu
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        URL audio MP3 kee galchi.
                      </p>
                    </div>

                    <button
                      type="button"
                      data-button-unstyled
                      onClick={() =>
                        setShowAudioInput(
                          false
                        )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-900"
                    >
                      <X className="h-4 w-4" />
                    </button>

                  </div>

                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(event) =>
                      setAudioUrl(
                        event.target.value
                      )
                    }
                    placeholder="https://example.com/audio.mp3"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#3b49df] focus:ring-4 focus:ring-[#eef2ff] placeholder:text-slate-400"
                  />

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* ARTICLE HEADER                                                  */}
              {/* ------------------------------------------------------------- */}

              <div className="px-5 pb-4 pt-7 sm:px-8 sm:pt-9 lg:px-10 lg:pt-10">

                <textarea
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  rows={2}
                  maxLength={200}
                  placeholder="Mata-duree Haaraa..."
                  className="block w-full resize-none border-0 bg-transparent p-0 text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.045em] text-slate-950 outline-none placeholder:text-slate-200 focus:ring-0"
                />

                <div className="mt-3 flex items-center justify-between gap-4">

                  <div className="text-[10px] font-medium text-slate-400">
                    {category
                      ? CATEGORY_LABELS[
                          category
                        ]
                      : ''}
                  </div>

                  <span className="text-[10px] tabular-nums text-slate-300">
                    {title.length}/200
                  </span>

                </div>

              </div>

              {/* ------------------------------------------------------------- */}
              {/* TAGS                                                            */}
              {/* ------------------------------------------------------------- */}

              <div className="px-5 pb-5 sm:px-8 lg:px-10">

                <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-xl">

                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600"
                    >
                      #{tag}

                      <button
                        type="button"
                        data-button-unstyled
                        onClick={() =>
                          removeTag(tag)
                        }
                        className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {tags.length < 4 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(event) =>
                        setTagInput(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleTagKeyDown
                      }
                      onBlur={addTag}
                      placeholder={
                        tags.length
                          ? 'Teg dabaladhu...'
                          : 'Tegoolee dabaladhu...'
                      }
                      className="h-9 min-w-[150px] flex-1 border-0 bg-transparent px-1 text-xs text-slate-700 outline-none placeholder:text-slate-300 focus:ring-0 sm:flex-none"
                    />
                  )}

                </div>

                <p className="mt-2 text-[10px] text-slate-300">
                  Tegoolee hanga 4 fayyadami.
                </p>

              </div>

              {/* ------------------------------------------------------------- */}
              {/* EDIT / PREVIEW TABS                                             */}
              {/* ------------------------------------------------------------- */}

              <div className="border-y border-slate-100 bg-slate-50/40 px-3 py-2 sm:px-5">

                <div className="flex items-center justify-between gap-3">

                  <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">

                    <button
                      type="button"
                      data-button-unstyled
                      onClick={() =>
                        setActiveTab(
                          'edit'
                        )
                      }
                      className={[
                        'h-8 rounded-md px-3 text-[11px] font-bold',
                        activeTab === 'edit'
                          ? 'bg-slate-950 text-white'
                          : 'text-slate-500 hover:text-slate-900',
                      ].join(' ')}
                    >
                      Barreessi
                    </button>

                    <button
                      type="button"
                      data-button-unstyled
                      onClick={() =>
                        setActiveTab(
                          'preview'
                        )
                      }
                      className={[
                        'h-8 rounded-md px-3 text-[11px] font-bold',
                        activeTab === 'preview'
                          ? 'bg-slate-950 text-white'
                          : 'text-slate-500 hover:text-slate-900',
                      ].join(' ')}
                    >
                      Preview
                    </button>

                  </div>

                  {activeTab === 'edit' && (
                    <span className="hidden text-[10px] font-medium text-slate-400 sm:block">
                      Barreessuu kee asitti jalqabi
                    </span>
                  )}

                </div>

              </div>

              {/* ================================================================= */}
              {/* EDITOR                                                           */}
              {/* ================================================================= */}

              {activeTab === 'edit' && (
                <>

                  {/* Toolbar */}

                  <div className="border-b border-slate-100 bg-white">

                    <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">

                      <ToolbarButton
                        title="Bold"
                        active={Boolean(
                          editor?.isActive(
                            'bold'
                          )
                        )}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleBold()
                            .run()
                        }
                      >
                        <Bold className="h-4 w-4" />
                      </ToolbarButton>

                      <ToolbarButton
                        title="Italic"
                        active={Boolean(
                          editor?.isActive(
                            'italic'
                          )
                        )}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleItalic()
                            .run()
                        }
                      >
                        <Italic className="h-4 w-4" />
                      </ToolbarButton>

                      <ToolbarButton
                        title="Link"
                        active={Boolean(
                          editor?.isActive(
                            'link'
                          )
                        )}
                        onClick={() => {
                          const url =
                            window.prompt(
                              'URL galchaa:'
                            );

                          if (!url) return;

                          editor
                            ?.chain()
                            .focus()
                            .setLink({
                              href: url,
                            })
                            .run();
                        }}
                      >
                        <Link2 className="h-4 w-4" />
                      </ToolbarButton>

                      <div className="mx-1 h-5 w-px shrink-0 bg-slate-200" />

                      <ToolbarButton
                        title="Bullet list"
                        active={Boolean(
                          editor?.isActive(
                            'bulletList'
                          )
                        )}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleBulletList()
                            .run()
                        }
                      >
                        <List className="h-4 w-4" />
                      </ToolbarButton>

                      <ToolbarButton
                        title="Numbered list"
                        active={Boolean(
                          editor?.isActive(
                            'orderedList'
                          )
                        )}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleOrderedList()
                            .run()
                        }
                      >
                        <ListOrdered className="h-4 w-4" />
                      </ToolbarButton>

                      <ToolbarButton
                        title="Heading"
                        active={Boolean(
                          editor?.isActive(
                            'heading',
                            {
                              level: 2,
                            }
                          )
                        )}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleHeading({
                              level: 2,
                            })
                            .run()
                        }
                      >
                        <Heading2 className="h-4 w-4" />
                      </ToolbarButton>

                      <div className="mx-1 h-5 w-px shrink-0 bg-slate-200" />

                      <ToolbarButton
                        title="Quote"
                        active={Boolean(
                          editor?.isActive(
                            'blockquote'
                          )
                        )}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleBlockquote()
                            .run()
                        }
                      >
                        <Quote className="h-4 w-4" />
                      </ToolbarButton>

                      <ToolbarButton
                        title="Inline code"
                        active={Boolean(
                          editor?.isActive(
                            'code'
                          )
                        )}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleCode()
                            .run()
                        }
                      >
                        <Code className="h-4 w-4" />
                      </ToolbarButton>

                      <ToolbarButton
                        title="Code block"
                        active={Boolean(
                          editor?.isActive(
                            'codeBlock'
                          )
                        )}
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .toggleCodeBlock()
                            .run()
                        }
                      >
                        <Code className="h-4 w-4 opacity-60" />
                      </ToolbarButton>

                      <ToolbarButton
                        title="Add image"
                        onClick={() => {
                          const url =
                            window.prompt(
                              'Fakkii URL:'
                            );

                          if (!url) return;

                          editor
                            ?.chain()
                            .focus()
                            .setImage({
                              src: url,
                            })
                            .run();
                        }}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </ToolbarButton>

                      <ToolbarButton
                        title="Divider"
                        onClick={() =>
                          editor
                            ?.chain()
                            .focus()
                            .setHorizontalRule()
                            .run()
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </ToolbarButton>

                    </div>

                  </div>

                  {/* Editor */}

                  <div className="min-w-0">

                    <EditorContent
                      editor={editor}
                    />

                  </div>

                </>
              )}

              {/* ================================================================= */}
              {/* PREVIEW                                                          */}
              {/* ================================================================= */}

              {activeTab ===
                'preview' && (
                <article className="min-w-0 px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">

                  {coverImageUrl && (
                    <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                      <div className="aspect-[16/8] w-full">
                        <img
                          src={coverImageUrl}
                          alt={title || 'Cover'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-6">

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-bold text-[#3b49df]">
                        {
                          CATEGORY_LABELS[
                            category
                          ]
                        }
                      </span>

                      {tags.map(
                        (tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500"
                          >
                            #{tag}
                          </span>
                        )
                      )}
                    </div>

                    <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.08] tracking-[-0.045em] text-slate-950">
                      {title ||
                        'Mata-duree hin jiru'}
                    </h1>

                  </div>

                  <div
                    className="
                      prose
                      max-w-none
                      text-[15px]
                      leading-8
                      text-slate-700

                      [&_h2]:mt-8
                      [&_h2]:mb-3
                      [&_h2]:text-2xl
                      [&_h2]:font-extrabold
                      [&_h2]:tracking-tight
                      [&_h2]:text-slate-950

                      [&_h3]:mt-7
                      [&_h3]:mb-3
                      [&_h3]:text-xl
                      [&_h3]:font-bold
                      [&_h3]:text-slate-950

                      [&_img]:max-w-full
                      [&_img]:rounded-xl

                      [&_pre]:overflow-x-auto
                    "
                    dangerouslySetInnerHTML={{
                      __html:
                        editor?.getHTML() ||
                        '',
                    }}
                  />

                </article>
              )}

            </div>
          </main>

          {/* ================================================================= */}
          {/* DESKTOP SETTINGS                                                   */}
          {/* ================================================================= */}

          <aside className="min-w-0">

            <div className="space-y-4 lg:sticky lg:top-24">

              {/* ------------------------------------------------------------- */}
              {/* Publish card                                                    */}
              {/* ------------------------------------------------------------- */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                <div className="mb-4 flex items-start justify-between gap-3">

                  <div>
                    <h2 className="text-sm font-bold text-slate-950">
                      Maxxansuu
                    </h2>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      Barruu kee yeroo kamiyyuu
                      maxxansi.
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
                    onClick={() =>
                      handleSave(false)
                    }
                    disabled={isSaving}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />

                    {isSaving
                      ? 'Kuufaa...'
                      : 'Draft Kuufi'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSave(true)
                    }
                    disabled={isPublishing}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1e293b] text-xs font-bold text-white shadow-sm hover:bg-[#334155] disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />

                    {isPublishing
                      ? 'Maxxansaa...'
                      : 'Maxxansi'}
                  </button>

                </div>

              </section>

              {/* ------------------------------------------------------------- */}
              {/* Category                                                        */}
              {/* ------------------------------------------------------------- */}

              <SettingSection
                title="Akaaka Barruutii"
                description="Kutaa barruun kee keessatti mul'atu filadhu."
              >

                <div className="grid grid-cols-2 gap-2">

                  {CATEGORIES.map(
                    (item) => {
                      const active =
                        category ===
                        item;

                      return (
                        <button
                          key={item}
                          type="button"
                          data-button-unstyled
                          onClick={() =>
                            setCategory(
                              item
                            )
                          }
                          className={[
                            'flex min-h-10 items-center justify-between gap-2 rounded-xl border px-3 text-left text-[11px] font-bold',
                            active
                              ? 'border-[#c7d2fe] bg-[#eef2ff] text-[#3b49df]'
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
                          ].join(' ')}
                        >
                          <span className="truncate">
                            {
                              CATEGORY_LABELS[
                                item
                              ]
                            }
                          </span>

                          {active && (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                          )}
                        </button>
                      );
                    }
                  )}

                </div>

              </SettingSection>

              {/* ------------------------------------------------------------- */}
              {/* Cover / Audio                                                  */}
              {/* ------------------------------------------------------------- */}

              <SettingSection
                title="Miidiyaa"
                description="Fakkii ykn sagalee barruu kee waliin walqabsiisi."
              >

                <div className="space-y-2">

                  <button
                    type="button"
                    data-button-unstyled
                    onClick={() =>
                      setShowCoverInput(
                        (value) => !value
                      )
                    }
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
                        showCoverInput
                          ? 'rotate-180'
                          : '',
                      ].join(' ')}
                    />
                  </button>

                  <button
                    type="button"
                    data-button-unstyled
                    onClick={() =>
                      setShowAudioInput(
                        (value) => !value
                      )
                    }
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
                        showAudioInput
                          ? 'rotate-180'
                          : '',
                      ].join(' ')}
                    />
                  </button>

                </div>

              </SettingSection>

              {/* ------------------------------------------------------------- */}
              {/* Writing tips                                                   */}
              {/* ------------------------------------------------------------- */}

              <section className="rounded-2xl border border-[#dbe4ff] bg-[#f7f8ff] p-4 sm:p-5">

                <div className="mb-3 flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3b49df]">
                    <span className="text-xs">
                      ✦
                    </span>
                  </div>

                  <h2 className="text-xs font-bold text-slate-900">
                    Gorsa Barreessuu
                  </h2>

                </div>

                <ul className="space-y-2.5">

                  {[
                    'Mata-duree gabaabaa fi ifa taʼe fayyadami.',
                    'Tegoolee barbaachisoo dabaladhu.',
                    'Qabiyyee kee keeyyata gabaabaatti qoodi.',
                    'Fakkii qulqullina qabu fayyadami.',
                  ].map(
                    (tip, index) => (
                      <li
                        key={tip}
                        className="flex gap-2.5 text-[11px] leading-5 text-slate-500"
                      >
                        <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#3b49df] shadow-sm">
                          {index + 1}
                        </span>

                        <span>
                          {tip}
                        </span>
                      </li>
                    )
                  )}

                </ul>

              </section>

            </div>

          </aside>

        </div>
      </div>

      {/* =================================================================== */}
      {/* MOBILE BOTTOM ACTION BAR                                             */}
      {/* =================================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-2.5 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:hidden">

        <div className="mx-auto flex max-w-lg items-center gap-2">

          <button
            type="button"
            data-button-unstyled
            onClick={() =>
              setActiveTab(
                activeTab === 'edit'
                  ? 'preview'
                  : 'edit'
              )
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
            aria-label="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            type="button"
            data-button-unstyled
            onClick={() =>
              handleSave(false)
            }
            disabled={isSaving}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {isSaving
              ? 'Kuusaa...'
              : 'Draft'}
          </button>

          <button
            type="button"
            onClick={() =>
              handleSave(true)
            }
            disabled={isPublishing}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1e293b] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#334155] disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />

            {isPublishing
              ? 'Maxxansaa jira...'
              : 'Maxxansi'}
          </button>

        </div>

      </div>

    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-xs text-slate-500">Fe&apos;aa jira...</div>}>
      <WritePageContent />
    </Suspense>
  );
}

