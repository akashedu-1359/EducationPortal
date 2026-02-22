"use client";

import { useState } from "react";
import { Award, Download, ExternalLink, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { certificatesApi, type Certificate } from "@/lib/certificates";
import { getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { url } = await certificatesApi.getDownloadUrl(certificate.id);
      // Trigger browser download via hidden link
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${certificate.verificationCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
        <Award className="h-6 w-6 text-amber-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-slate-900">{certificate.examTitle}</p>
        <p className="mt-0.5 text-sm text-slate-500">
          Issued {formatDate(certificate.issuedAt)} to {certificate.userName}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="success" dot>Verified</Badge>
          <span className="font-mono text-xs text-slate-400">
            #{certificate.verificationCode}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1.5">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          PDF
        </button>
        <a
          href={certificate.verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Verify
        </a>
      </div>
    </div>
  );
}
