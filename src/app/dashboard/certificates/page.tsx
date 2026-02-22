"use client";

import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { certificatesApi } from "@/lib/certificates";
import { CertificateCard } from "@/components/content/CertificateCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardCertificatesPage() {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: certificatesApi.getMyCertificates,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">My Certificates</h1>
        <p className="page-subtitle">Verifiable certificates you&apos;ve earned.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : !certificates?.length ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Award className="mb-3 h-14 w-14 text-slate-200" />
          <p className="font-medium text-slate-700">No certificates yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Pass an exam to earn your first certificate.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
