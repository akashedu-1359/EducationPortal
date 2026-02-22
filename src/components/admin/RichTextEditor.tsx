"use client";

/**
 * Rich Text Editor wrapper using Tiptap (free, open-source).
 *
 * Install: npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link
 *          @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-text-align
 *
 * Falls back to a plain textarea if Tiptap is not installed yet.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  minHeight?: number;
}

// Toolbar button helper
function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex h-7 items-center rounded px-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary-100 text-primary-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  label,
  error,
  minHeight = 200,
}: RichTextEditorProps) {
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<{
    value: string;
    onChange: (html: string) => void;
    placeholder: string;
    minHeight: number;
  }> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically load Tiptap to keep bundle lean
    import("./TiptapEditor")
      .then((mod) => {
        setEditorComponent(() => mod.TiptapEditor);
        setLoading(false);
      })
      .catch(() => {
        // Tiptap not installed — use fallback textarea
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div
        className={cn(
          "rounded-xl border bg-white transition-colors",
          error ? "border-red-400" : "border-slate-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20"
        )}
      >
        {loading ? (
          <div
            className="flex items-center justify-center text-sm text-slate-400"
            style={{ minHeight }}
          >
            Loading editor…
          </div>
        ) : EditorComponent ? (
          <EditorComponent
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            minHeight={minHeight}
          />
        ) : (
          /* Fallback plain textarea */
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className="block w-full resize-y rounded-xl bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
