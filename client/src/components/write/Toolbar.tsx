'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  Minus,
} from 'lucide-react';

export function ToolbarButton({
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
        active ? 'bg-[#eef2ff] text-[#3b49df]' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const handleSetLink = () => {
    const url = window.prompt('URL galchaa:');
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border-b border-slate-100 bg-white">
      <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Link"
          active={editor.isActive('link')}
          onClick={handleSetLink}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px shrink-0 bg-slate-200" />

        <ToolbarButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Ordered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Heading"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Code block"
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

export default Toolbar;
