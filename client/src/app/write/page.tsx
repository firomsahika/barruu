'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Link2, List, ListOrdered, Heading2,
  Quote, Code, Image as ImageIcon, Minus, MoreHorizontal,
  Eye, Save, Upload, Music
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Category, CATEGORY_LABELS } from '@/types';

const CATEGORIES: Category[] = ['WALALOO', 'DURDURII', 'ASOOSAMA', 'OOLMAA', 'SAGALEE'];

export default function WritePage() {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState<Category>('ASOOSAMA');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [showCoverInput, setShowCoverInput] = useState(false);
  const [showAudioInput, setShowAudioInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Barruukee asitti barreessi...' }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !user) {
      toast.error('Barreessuuf seeni');
      router.push('/login');
    }
  }, [user, isInitialized, router]);

  // Load article for editing
  useEffect(() => {
    if (editId && editor) {
      api.get(`/articles/${editId}`)
        .then((res) => {
          const a = res.data;
          setTitle(a.title);
          setCategory(a.category);
          setCoverImageUrl(a.coverImageUrl || '');
          setAudioUrl(a.audioUrl || '');
          setTags(a.tags?.map((at: { tag: { name: string } }) => at.tag.name) || []);
          editor.commands.setContent(a.content);
        })
        .catch(() => toast.error('Barruu hin argamne'));
    }
  }, [editId, editor]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (t && !tags.includes(t) && tags.length < 4) {
      setTags((prev) => [...prev, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const getContent = useCallback(() => editor?.getHTML() || '', [editor]);

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) { toast.error('Mata-duree galchaa'); return; }
    const content = getContent();
    if (!content || content === '<p></p>') { toast.error('Qabiyyee barreessaa'); return; }

    if (publish) setIsPublishing(true); else setIsSaving(true);

    try {
      const payload = { title, content, category, tags, coverImageUrl: coverImageUrl || null, audioUrl: audioUrl || null, published: publish };

      if (editId) {
        await api.patch(`/articles/${editId}`, payload);
        toast.success(publish ? 'Barruu maxxanfame!' : 'Draft kuufame!');
      } else {
        const res = await api.post('/articles', payload);
        toast.success(publish ? 'Barruu maxxanfame!' : 'Draft kuufame!');
        if (publish) router.push(`/article/${res.data.slug}`);
      }

      if (!publish) toast.success('Draft kuufame');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Dogoggori uumame';
      toast.error(msg);
    } finally {
      setIsPublishing(false);
      setIsSaving(false);
    }
  };

  if (!isInitialized || !user) return null;

  const ToolbarButton = ({
    onClick, active = false, title: tooltip, children
  }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: active ? '#e8eaff' : 'transparent',
        cursor: 'pointer',
        color: active ? '#3b49df' : '#4b5563',
        transition: 'all 0.1s',
      }}
      className="hover:bg-gray-100"
    >
      {children}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '56px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '16px',
        }}
      >
        <Link
          href="/"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#08090a',
            borderRadius: '6px',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '14px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          S|B
        </Link>

        <span style={{ fontSize: '15px', color: '#4b5563', fontWeight: 500 }}>
          {editId ? 'Gulaali' : 'Barruukee Barreessi'}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#4b5563',
              fontFamily: 'inherit',
            }}
          >
            <Eye size={15} />
            {activeTab === 'edit' ? 'Preview' : 'Gulaali'}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              color: '#4b5563',
              fontFamily: 'inherit',
            }}
          >
            <Save size={15} />
            {isSaving ? 'Kuufaa...' : 'Draft Kuufi'}
          </button>
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px',
          }}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '24px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Editor area */}
        <div>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Cover image toolbar */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setShowCoverInput(!showCoverInput); setShowAudioInput(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: showCoverInput ? '#f0f4ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#4b5563',
                  fontFamily: 'inherit',
                }}
              >
                <Upload size={14} />
                Fakkii Uumaa fe&#39;i
              </button>
              <button
                onClick={() => { setShowAudioInput(!showAudioInput); setShowCoverInput(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: showAudioInput ? '#f0f4ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#4b5563',
                  fontFamily: 'inherit',
                }}
              >
                <Music size={14} />
                Sagalee URL
              </button>
            </div>

            {/* Cover image input */}
            {showCoverInput && (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                {coverImageUrl && (
                  <div style={{ marginBottom: '8px', borderRadius: '6px', overflow: 'hidden', height: '120px' }}>
                    <img src={coverImageUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <input
                  type="url"
                  placeholder="https://fakkii-url.com/fakkii.jpg"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Audio URL input */}
            {showAudioInput && (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                <input
                  type="url"
                  placeholder="https://sagalee-url.com/sagalee.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Title */}
            <div style={{ padding: '16px 32px 0' }}>
              <textarea
                placeholder="Mata-duree Haaraa..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={2}
                maxLength={200}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#08090a',
                  fontFamily: 'inherit',
                  resize: 'none',
                  lineHeight: 1.2,
                  padding: 0,
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Tags input */}
            <div style={{ padding: '8px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '3px 8px',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    borderRadius: '4px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0 0 0 2px', color: '#9ca3af', fontSize: '16px', lineHeight: 1 }}
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
                  placeholder={tags.length === 0 ? 'Tegoo hanga 4 dabaladhu...' : 'Teg dabaladhu...'}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    color: '#6b7280',
                    fontFamily: 'inherit',
                    minWidth: '200px',
                    background: 'transparent',
                  }}
                />
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '4px 0' }} />

            {activeTab === 'edit' ? (
              <>
                {/* Toolbar */}
                <div
                  style={{
                    padding: '6px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    flexWrap: 'wrap',
                  }}
                >
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold (Ctrl+B)">
                    <Bold size={16} strokeWidth={2.5} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic (Ctrl+I)">
                    <Italic size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => {
                      const url = window.prompt('URL galchaa:');
                      if (url) editor?.chain().focus().setLink({ href: url }).run();
                    }}
                    active={editor?.isActive('link')}
                    title="Link"
                  >
                    <Link2 size={16} />
                  </ToolbarButton>
                  <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="List">
                    <List size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered List">
                    <ListOrdered size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Heading">
                    <Heading2 size={16} />
                  </ToolbarButton>
                  <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">
                    <Quote size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Code">
                    <Code size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Code Block">
                    <Code size={16} strokeWidth={1.5} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => {
                      const url = window.prompt('Fakkii URL:');
                      if (url) editor?.chain().focus().setImage({ src: url }).run();
                    }}
                    title="Image"
                  >
                    <ImageIcon size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider">
                    <Minus size={16} />
                  </ToolbarButton>
                </div>

                {/* Editor */}
                <div style={{ minHeight: '500px' }}>
                  <EditorContent editor={editor} />
                </div>
              </>
            ) : (
              /* Preview */
              <div style={{ padding: '32px' }}>
                {coverImageUrl && (
                  <div style={{ height: '300px', overflow: 'hidden', borderRadius: '8px', marginBottom: '24px' }}>
                    <img src={coverImageUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#08090a', marginBottom: '16px' }}>{title || 'Mata-duree hin jiru'}</h1>
                {tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {tags.map((t) => (
                      <span key={t} style={{ padding: '2px 8px', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '4px', fontSize: '13px' }}>#{t}</span>
                    ))}
                  </div>
                )}
                <div className="prose" dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
              </div>
            )}
          </div>

          {/* Bottom publish bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          >
            <button
              onClick={() => handleSave(true)}
              disabled={isPublishing}
              style={{
                padding: '10px 20px',
                backgroundColor: isPublishing ? '#6b7280' : '#3b49df',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: isPublishing ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
            >
              {isPublishing ? 'Maxxansaa...' : 'Maxxansi'}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                fontSize: '15px',
                fontWeight: 500,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                color: '#4b5563',
                fontFamily: 'inherit',
              }}
            >
              {isSaving ? 'Kuufaa...' : 'Draft Kuufi'}
            </button>
            <button
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                fontSize: '15px',
                cursor: 'pointer',
                color: '#ef4444',
                fontFamily: 'inherit',
              }}
            >
              Jijjiirramoota Deebisi
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ position: 'sticky', top: '72px' }}>
          {/* Category */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#08090a', marginBottom: '8px', display: 'block' }}>
              Akaaka Barruutii
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px 12px',
                    border: `2px solid ${category === cat ? '#3b49df' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    backgroundColor: category === cat ? '#eff2ff' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: category === cat ? '#3b49df' : '#4b5563',
                    fontFamily: 'inherit',
                    fontWeight: category === cat ? 700 : 400,
                    textAlign: 'left',
                    transition: 'all 0.1s',
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Writing tips */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#08090a', margin: '0 0 12px' }}>
              Mata-duree Gaarii Barreessuu
            </h3>
            <ul style={{ padding: '0 0 0 16px', margin: 0 }}>
              {[
                'Mata-duree gabaabaa fi bilisaan barreessi',
                'Tegoolee barbaachisoo dabaladhu',
                'Fakkii uumaa galchi dubbistootaaf',
                'Qabiyyee dheeraafi ifa ta\'e barreessi',
              ].map((tip) => (
                <li key={tip} style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', lineHeight: 1.5 }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
