"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { cmsAdminApi } from "@/lib/cms";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import type { FaqCategory, FaqItem } from "@/types";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});
type FaqFormData = z.infer<typeof faqSchema>;

const catSchema = z.object({ name: z.string().min(1, "Name is required") });
type CatFormData = z.infer<typeof catSchema>;

export default function AdminFaqsPage() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [faqModal, setFaqModal] = useState<{ open: boolean; categoryId: string; editing: FaqItem | null }>({
    open: false, categoryId: "", editing: null,
  });
  const [catModal, setCatModal] = useState<{ open: boolean; editing: FaqCategory | null }>({
    open: false, editing: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<{ type: "faq" | "cat"; id: string; name: string } | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin", "cms", "faqs"],
    queryFn: cmsAdminApi.getFaqCategories,
  });

  const faqForm = useForm<FaqFormData>({ resolver: zodResolver(faqSchema) });
  const catForm = useForm<CatFormData>({ resolver: zodResolver(catSchema) });

  const saveFaqMutation = useMutation({
    mutationFn: (data: FaqFormData) =>
      faqModal.editing
        ? cmsAdminApi.updateFaq(faqModal.editing.id, data)
        : cmsAdminApi.createFaq(faqModal.categoryId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "faqs"] });
      toast.success(faqModal.editing ? "FAQ updated" : "FAQ created");
      setFaqModal({ open: false, categoryId: "", editing: null });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const saveCatMutation = useMutation({
    mutationFn: (data: CatFormData) =>
      catModal.editing
        ? cmsAdminApi.updateFaqCategory(catModal.editing.id, data)
        : cmsAdminApi.createFaqCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "faqs"] });
      toast.success(catModal.editing ? "Category updated" : "Category created");
      setCatModal({ open: false, editing: null });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: "faq" | "cat"; id: string }) =>
      type === "faq" ? cmsAdminApi.deleteFaq(id) : cmsAdminApi.deleteFaqCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cms", "faqs"] });
      toast.success("Deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const openAddFaq = (categoryId: string) => {
    faqForm.reset({ question: "", answer: "" });
    setFaqModal({ open: true, categoryId, editing: null });
  };

  const openEditFaq = (faq: FaqItem, categoryId: string) => {
    faqForm.reset({ question: faq.question, answer: faq.answer });
    setFaqModal({ open: true, categoryId, editing: faq });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="page-title">FAQs</h1>
          <p className="page-subtitle">Manage frequently asked questions by category.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { catForm.reset({ name: "" }); setCatModal({ open: true, editing: null }); }}>
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <HelpCircle className="mb-3 h-12 w-12 text-slate-200" />
          <p className="font-medium text-slate-700">No FAQ categories yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-slate-200 bg-white shadow-card">
              {/* Category header */}
              <div
                className="flex cursor-pointer items-center justify-between px-5 py-4"
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              >
                <div className="flex items-center gap-3">
                  {expanded === cat.id ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                  <span className="font-semibold text-slate-900">{cat.name}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {cat.faqs?.length || 0} FAQs
                  </span>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => openAddFaq(cat.id)}>
                    Add FAQ
                  </Button>
                  <button
                    onClick={() => { catForm.reset({ name: cat.name }); setCatModal({ open: true, editing: cat }); }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: "cat", id: cat.id, name: cat.name })}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* FAQs */}
              {expanded === cat.id && (
                <div className="border-t border-slate-100">
                  {!cat.faqs?.length ? (
                    <p className="px-5 py-4 text-sm text-slate-400">No FAQs in this category.</p>
                  ) : (
                    cat.faqs.map((faq, i) => (
                      <div
                        key={faq.id}
                        className={`flex items-start gap-4 px-5 py-4 ${i < cat.faqs.length - 1 ? "border-b border-slate-50" : ""}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800">{faq.question}</p>
                          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{faq.answer}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            onClick={() => openEditFaq(faq, cat.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: "faq", id: faq.id, name: faq.question })}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={catModal.open}
        onClose={() => setCatModal({ open: false, editing: null })}
        title={catModal.editing ? "Edit Category" : "New Category"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCatModal({ open: false, editing: null })}>Cancel</Button>
            <Button onClick={catForm.handleSubmit((d) => saveCatMutation.mutate(d))} isLoading={saveCatMutation.isPending}>
              {catModal.editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <Input label="Category Name" error={catForm.formState.errors.name?.message} required {...catForm.register("name")} />
      </Modal>

      {/* FAQ Modal */}
      <Modal
        isOpen={faqModal.open}
        onClose={() => setFaqModal({ open: false, categoryId: "", editing: null })}
        title={faqModal.editing ? "Edit FAQ" : "New FAQ"}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFaqModal({ open: false, categoryId: "", editing: null })}>Cancel</Button>
            <Button onClick={faqForm.handleSubmit((d) => saveFaqMutation.mutate(d))} isLoading={saveFaqMutation.isPending}>
              {faqModal.editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Question" error={faqForm.formState.errors.question?.message} required {...faqForm.register("question")} />
          <Textarea label="Answer" error={faqForm.formState.errors.answer?.message} required rows={4} {...faqForm.register("answer")} />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate({ type: deleteTarget.type, id: deleteTarget.id })}
        title="Confirm Delete"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
