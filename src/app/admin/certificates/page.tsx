"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { certificatesApi } from "@/lib/certificates";
import { getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";

export default function AdminCertificatesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "certificates", page, search],
    queryFn: () =>
      certificatesApi.adminList({
        pageNumber: page,
        pageSize: 20,
        search: search || undefined,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      const { url } = await certificatesApi.adminDownloadUrl(id);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Certificates</h1>
        <p className="page-subtitle">
          All certificates issued to students after passing exams.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex max-w-md gap-2">
        <Input
          placeholder="Search by student or exam…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
            ) : !data?.items.length ? (
              <TableEmpty
                colSpan={4}
                icon={<Award className="h-10 w-10 text-slate-200" />}
                message="No certificates yet. They appear here when students pass exams."
              />
            ) : (
              data.items.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{cert.userName}</p>
                    <p className="text-xs text-slate-400">{cert.userEmail}</p>
                  </TableCell>
                  <TableCell>{cert.examTitle}</TableCell>
                  <TableCell className="text-slate-500">{formatDate(cert.issuedAt)}</TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(cert.id)}
                      disabled={downloadingId === cert.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {downloadingId === cert.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      PDF
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
