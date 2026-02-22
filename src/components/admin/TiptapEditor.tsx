// @ts-nocheck
"use client";

/**
 * Tiptap rich text editor implementation.
 * Loaded dynamically from RichTextEditor.tsx.
 *
 * Required packages (install separately):
 *   npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
 *              @tiptap/extension-link @tiptap/extension-placeholder
 *              @tiptap/extension-text-align @tiptap/extension-underline
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
  minHeight: number;
}

export function TiptapEditor({
  value,
  onChange,
  placeholder,
  minHeight,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none px-4 py-3 text-slate-900`,
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  // Sync external value changes (e.g., form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 px-2 py-1.5">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={`rounded px-2 py-1 text-sm font-bold transition-colors ${editor.isActive("bold") ? "bg-primary-100 text-primary-700" : "text-slate-600 hover:bg-slate-100"}`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={`rounded px-2 py-1 text-sm italic transition-colors ${editor.isActive("italic") ? "bg-primary-100 text-primary-700" : "text-slate-600 hover:bg-slate-100"}`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          className={`rounded px-2 py-1 text-sm underline transition-colors ${editor.isActive("underline") ? "bg-primary-100 text-primary-700" : "text-slate-600 hover:bg-slate-100"}`}
          title="Underline"
        >
          U
        </button>

        <div className="mx-1 h-4 w-px bg-slate-200" />

        {([1, 2, 3] as const).map((level) => (
          <button
            key={level}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level }).run(); }}
            className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${editor.isActive("heading", { level }) ? "bg-primary-100 text-primary-700" : "text-slate-600 hover:bg-slate-100"}`}
            title={`Heading ${level}`}
          >
            H{level}
          </button>
        ))}

        <div className="mx-1 h-4 w-px bg-slate-200" />

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          className={`rounded px-2 py-1 text-sm transition-colors ${editor.isActive("bulletList") ? "bg-primary-100 text-primary-700" : "text-slate-600 hover:bg-slate-100"}`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          className={`rounded px-2 py-1 text-sm transition-colors ${editor.isActive("orderedList") ? "bg-primary-100 text-primary-700" : "text-slate-600 hover:bg-slate-100"}`}
          title="Ordered List"
        >
          1. List
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          className={`rounded px-2 py-1 text-sm transition-colors ${editor.isActive("blockquote") ? "bg-primary-100 text-primary-700" : "text-slate-600 hover:bg-slate-100"}`}
          title="Quote"
        >
          ❝
        </button>

        <div className="mx-1 h-4 w-px bg-slate-200" />

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          disabled={!editor.can().undo()}
          className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30"
          title="Undo"
        >
          ↩
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          disabled={!editor.can().redo()}
          className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30"
          title="Redo"
        >
          ↪
        </button>
      </div>

      <EditorContent editor={editor} />
    </>
  );
}
