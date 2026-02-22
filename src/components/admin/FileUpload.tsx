"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle, AlertCircle, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { storageApi } from "@/lib/storage";
import { getApiErrorMessage } from "@/lib/api";

type UploadPurpose = "resource-video" | "resource-pdf" | "thumbnail" | "cms-image";

interface FileUploadProps {
  purpose: UploadPurpose;
  accept?: string;
  maxSizeMb?: number;
  label?: string;
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  onError?: (message: string) => void;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success"; url: string }
  | { status: "error"; message: string };

const ACCEPT_DEFAULTS: Record<UploadPurpose, string> = {
  "resource-video": "video/mp4,video/webm,video/ogg",
  "resource-pdf": "application/pdf",
  "thumbnail": "image/jpeg,image/png,image/webp",
  "cms-image": "image/jpeg,image/png,image/webp,image/gif",
};

export function FileUpload({
  purpose,
  accept,
  maxSizeMb = 500,
  label = "Upload file",
  currentUrl,
  onUploadComplete,
  onError,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [dragOver, setDragOver] = useState(false);

  const resolvedAccept = accept || ACCEPT_DEFAULTS[purpose];

  const handleFile = async (file: File) => {
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      const msg = `File must be under ${maxSizeMb} MB`;
      setState({ status: "error", message: msg });
      onError?.(msg);
      return;
    }

    setState({ status: "uploading", progress: 0 });
    try {
      const url = await storageApi.upload(file, purpose, (pct) => {
        setState({ status: "uploading", progress: pct });
      });
      setState({ status: "success", url });
      onUploadComplete(url);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setState({ status: "error", message: msg });
      onError?.(msg);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setState({ status: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  const isUploading = state.status === "uploading";
  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-slate-700">{label}</p>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-primary-400 bg-primary-50"
            : isSuccess
            ? "border-green-300 bg-green-50"
            : isError
            ? "border-red-300 bg-red-50"
            : "border-slate-300 bg-slate-50 hover:border-slate-400",
          isUploading && "pointer-events-none"
        )}
      >
        {isUploading ? (
          <div className="w-full max-w-xs">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">Uploading…</span>
              <span className="font-medium text-slate-800">
                {state.progress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary-600 transition-all duration-150"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        ) : isSuccess ? (
          <>
            <CheckCircle className="mb-2 h-8 w-8 text-green-500" />
            <p className="text-sm font-medium text-green-700">Upload complete!</p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 text-xs text-slate-500 underline hover:text-slate-700"
            >
              Replace file
            </button>
          </>
        ) : isError ? (
          <>
            <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
            <p className="text-sm font-medium text-red-700">{state.message}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 text-xs text-slate-500 underline hover:text-slate-700"
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <Upload className="mb-3 h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">
              Drag & drop or{" "}
              <button
                type="button"
                className="text-primary-600 hover:underline"
                onClick={() => inputRef.current?.click()}
              >
                browse
              </button>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Max {maxSizeMb} MB
            </p>
            {currentUrl && (
              <p className="mt-2 max-w-[200px] truncate text-xs text-slate-400">
                Current: {currentUrl.split("/").pop()}
              </p>
            )}
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={resolvedAccept}
        className="hidden"
        onChange={handleInputChange}
        aria-label={label}
      />
    </div>
  );
}
