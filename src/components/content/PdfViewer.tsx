"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfViewerProps {
  /** Pre-signed S3 URL — only available when user has access */
  src?: string;
  title: string;
  isLocked?: boolean;
  onUnlockClick?: () => void;
}

export function PdfViewer({ src, title, isLocked = false, onUnlockClick }: PdfViewerProps) {
  const [useEmbed, setUseEmbed] = useState(true);

  if (isLocked || !src) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-20 text-center">
        <Lock className="mb-3 h-12 w-12 text-slate-300" />
        <p className="font-semibold text-slate-700">PDF is locked</p>
        <p className="mt-1 text-sm text-slate-500">
          Purchase or enroll to access this PDF.
        </p>
        {onUnlockClick && (
          <Button className="mt-4" onClick={onUnlockClick}>
            Unlock PDF
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Action bar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
          <a
            href={src}
            download={`${title}.pdf`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
      </div>

      {/* PDF embed */}
      {useEmbed ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <iframe
            src={`${src}#toolbar=0&navpanes=0`}
            className="h-[70vh] w-full"
            title={title}
            onError={() => setUseEmbed(false)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-12 text-center">
          <FileText className="mb-3 h-12 w-12 text-slate-300" />
          <p className="font-medium text-slate-700">Preview unavailable in this browser</p>
          <p className="mt-1 text-sm text-slate-500">
            Use the Open or Download buttons above to view the PDF.
          </p>
        </div>
      )}
    </div>
  );
}
