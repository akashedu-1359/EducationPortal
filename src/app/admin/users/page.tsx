"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserCheck, UserX, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/users";
import { getApiErrorMessage } from "@/lib/api";
import { formatDate, formatRelativeTime, getInitials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmModal } from "@/components/ui/modal";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, TableEmpty,
} from "@/components/ui/table";
import type { User, UserRole } from "@/types";

const ROLE_BADGE: Record<UserRole, "primary" | "success" | "info" | "warning" | "default"> = {
  SuperAdmin: "danger" as never,
  Admin: "primary",
  ContentManager: "info",
  ExamManager: "warning",
  Analyst: "default",
  User: "default",
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [activeConfirm, setActiveConfirm] = useState<{ user: User; active: boolean } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page, search, roleFilter],
    queryFn: () =>
      usersApi.list({
        pageNumber: page,
        pageSize: 20,
        search: search || undefined,
        role: (roleFilter as UserRole) || undefined,
      }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Role updated");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.setActive(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(activeConfirm?.active ? "User activated" : "User deactivated");
      setActiveConfirm(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">View, manage roles, and activate/deactivate users.</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-64">
          <Input
            placeholder="Search by name or email…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          options={[
            { value: "SuperAdmin", label: "Super Admin" },
            { value: "Admin", label: "Admin" },
            { value: "ContentManager", label: "Content Manager" },
            { value: "ExamManager", label: "Exam Manager" },
            { value: "Analyst", label: "Analyst" },
            { value: "User", label: "User" },
          ]}
          placeholder="All roles"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as UserRole | ""); setPage(1); }}
          className="w-44"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Role Actions</TableHead>
            <TableHead className="text-right">Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={7} />
            ))
          ) : !data?.items?.length ? (
            <TableEmpty colSpan={7} message="No users found." />
          ) : (
            data.items.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {getInitials(user.fullName)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.fullName}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_BADGE[user.role]}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "success" : "default"} dot>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "—"}
                </TableCell>
                <TableCell>
                  <select
                    value={user.role}
                    onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value as UserRole })}
                    disabled={roleMutation.isPending}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {(["SuperAdmin", "Admin", "ContentManager", "ExamManager", "Analyst", "User"] as UserRole[]).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => setActiveConfirm({ user, active: !user.isActive })}
                    className={`rounded-lg p-1.5 transition-colors ${
                      user.isActive
                        ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
                        : "text-slate-400 hover:bg-green-50 hover:text-green-600"
                    }`}
                    title={user.isActive ? "Deactivate" : "Activate"}
                  >
                    {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmModal
        isOpen={!!activeConfirm}
        onClose={() => setActiveConfirm(null)}
        onConfirm={() =>
          activeConfirm &&
          activeMutation.mutate({ id: activeConfirm.user.id, isActive: activeConfirm.active })
        }
        title={activeConfirm?.active ? "Activate User" : "Deactivate User"}
        description={`${activeConfirm?.active ? "Activate" : "Deactivate"} account for ${activeConfirm?.user.fullName}?${
          activeConfirm?.active ? "" : " They will not be able to sign in."
        }`}
        confirmLabel={activeConfirm?.active ? "Activate" : "Deactivate"}
        isDangerous={!activeConfirm?.active}
        isLoading={activeMutation.isPending}
      />
    </div>
  );
}
