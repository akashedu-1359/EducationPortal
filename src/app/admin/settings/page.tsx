"use client";

import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Platform configuration and preferences.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-20 text-center">
        <Settings className="h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">Settings coming soon</p>
        <p className="mt-1 text-xs text-slate-400">This section is under development.</p>
      </div>
    </div>
  );
}
