'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Image as ImageIcon, Music, Upload, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import api, { getApiErrorMessage, uploadImage } from '@/lib/api';
import toast from 'react-hot-toast';
import { Category, CATEGORY_LABELS } from '@/types';

import Toolbar from '@/components/write/Toolbar';
import SettingsPanel from '@/components/write/SettingsPanel';
import PublishBar from '@/components/write/PublishBar';

function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isInitialized } = useAuthStore();
  const queryClient = useQueryClient();

  const editSlug = searchParams.get('slug');
  const editId = searchParams.get('id');
  const isEditing = Boolean(editSlug || editId);

  const [articleId, setArticleId] = useState<string | null>(editId);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState<Category>('ASOOSAMA');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [showCoverInput, setShowCoverInput] = useState(false);
  const [showAudioInput, setShowAudioInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Barruukee asitti barreessi...' }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any,
    content: '',
    editorProps: {
      attributes: {
        class:
          'min-h-[420px] px-5 py-5 pb-24 outline-none sm:min-h-[520px] sm:px-8 sm:py-7 lg:px-10 lg:py-8',
      },
    },
  });

  useEffect(() => {
    if (isInitialized && !user) {
      toast.error('Barreessuuf seeni');
      router.push('/login');
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (!editor || !isEditing) return;

    const fetchArticleForEditing = async () => {
      try {
        const endpoint = editId ? `/articles/id/${editId}` : `/articles/${editSlug}`;
        const { data } = await api.get(endpoint);

        if (user && data.authorId !== user.id) {
          toast.error('Barruu nama biraa gulaaluu hin dandeessu');
          router.push('/');
          return;
        }

        setArticleId(data.id);
        setTitle(data.title || '');
        setCategory(data.category || 'ASOOSAMA');
        setCoverImageUrl(data.coverImageUrl || '');
        setAudioUrl(data.audioUrl || '');
        setTags(data.tags?.map((t: { tag: { name: string } }) => t.tag.name) || []);
        editor.commands.setContent(data.content || '');
      } catch (error: unknown) {
        toast.error(getApiErrorMessage(error, 'Barruu fiduu hin dandeenye'));
        router.push('/write');
      }
    };

    fetchArticleForEditing();
  }, [editor, editSlug, editId, isEditing, user, router]);

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (!trimmed) return;
    if (tags.length >= 4) {
      toast.error('Tegoolee 4 qofa dabalachuu dandeessa');
      return;
    }
    if (tags.includes(trimmed)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  }, [tagInput, tags]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const url = await uploadImage(file, 'article-covers');
      setCoverImageUrl(url);
      toast.success('Fakkiin ol-fe&apos;ameera');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Fakkii fe&apos;uu hin dandeenye'));
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSave = async (published: boolean) => {
    if (!title.trim()) {
      toast.error('Mata-duree barreessi');
      return;
    }
    const html = editor?.getHTML() || '';
    if (!html.trim() || html === '<p></p>') {
      toast.error('Qabiyyee barruu barreessi');
      return;
    }

    if (published) setIsPublishing(true);
    else setIsSaving(true);

    const payload = {
      title: title.trim(),
      content: html,
      category,
      coverImageUrl: coverImageUrl || undefined,
      audioUrl: audioUrl.trim() || undefined,
      tags,
      published,
    };

    try {
      if (articleId) {
        await api.patch(`/articles/${articleId}`, payload);
        toast.success(published ? 'Barruun maxxansameera!' : 'Draft kuufameera!');
      } else {
        const { data } = await api.post('/articles', payload);
        setArticleId(data.id);
        toast.success(published ? 'Barruun maxxansameera!' : 'Draft kuufameera!');
      }

      await queryClient.invalidateQueries({ queryKey: ['articles'] });
      router.push(published ? '/' : '/dashboard');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Kuusuun hin danda&apos;amne'));
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  if (!isInitialized || !user) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-24 lg:pb-8">
      {/* Top Publish Bar */}
      <PublishBar
        isEditing={isEditing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSave={handleSave}
      />

      {/* Main Workspace */}
      <div className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-5 sm:py-6 lg:px-6 lg:py-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
          {/* Main Editor Canvas */}
          <main className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Media Controls Bar */}
              <div className="border-b border-slate-100">
                <div className="flex gap-2 overflow-x-auto px-3 py-3 sm:px-4">
                  <button
                    type="button"
                    data-button-unstyled
                    onClick={() => {
                      setShowCoverInput((v) => !v);
                      setShowAudioInput(false);
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
                      setShowAudioInput((v) => !v);
                      setShowCoverInput(false);
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

              {/* Cover Upload Dropdown */}
              {showCoverInput && (
                <div className="border-b border-slate-100 bg-slate-50/70 p-4">
                  {coverImageUrl ? (
                    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-slate-200">
                      <img src={coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl('')}
                        className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white hover:bg-black"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-[#3b49df]">
                      <Upload className="h-6 w-6 text-slate-400" />
                      <span className="mt-2 text-xs font-semibold text-slate-600">
                        {isUploadingCover ? 'Fe&apos;aa jira...' : 'Fakkii filadhu'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                        disabled={isUploadingCover}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Audio URL Dropdown */}
              {showAudioInput && (
                <div className="border-b border-slate-100 bg-slate-50/70 p-4">
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 outline-none focus:border-[#3b49df]"
                  />
                </div>
              )}

              {/* Title Input */}
              <div className="px-5 pb-4 pt-6 sm:px-8 sm:pt-8 lg:px-10">
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                  maxLength={200}
                  placeholder="Mata-duree Haaraa..."
                  className="block w-full resize-none border-0 bg-transparent p-0 text-3xl font-extrabold tracking-tight text-slate-950 outline-none placeholder:text-slate-200 sm:text-4xl lg:text-5xl"
                />
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{CATEGORY_LABELS[category]}</span>
                  <span>{title.length}/200</span>
                </div>
              </div>

              {/* Tags Input */}
              <div className="px-5 pb-4 sm:px-8 lg:px-10">
                <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-xl">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-slate-400 hover:text-slate-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {tags.length < 4 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={addTag}
                      placeholder={tags.length ? 'Teg dabaladhu...' : 'Tegoolee dabaladhu...'}
                      className="h-8 min-w-[140px] flex-1 border-0 bg-transparent px-1 text-xs text-slate-700 outline-none placeholder:text-slate-300"
                    />
                  )}
                </div>
              </div>

              {/* Tabs & Toolbar */}
              {activeTab === 'edit' ? (
                <>
                  <Toolbar editor={editor} />
                  <EditorContent editor={editor} />
                </>
              ) : (
                <article className="prose max-w-none p-5 sm:p-8 lg:p-10">
                  <h1 className="text-3xl font-extrabold">{title || 'Mata-duree hin jiru'}</h1>
                  <div
                    className="mt-6 leading-7 text-slate-700"
                    dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
                  />
                </article>
              )}
            </div>
          </main>

          {/* Desktop Settings Sidebar */}
          <SettingsPanel
            category={category}
            setCategory={setCategory}
            showCoverInput={showCoverInput}
            setShowCoverInput={setShowCoverInput}
            showAudioInput={showAudioInput}
            setShowAudioInput={setShowAudioInput}
            isSaving={isSaving}
            isPublishing={isPublishing}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f4f6]" />}>
      <WritePageContent />
    </Suspense>
  );
}
