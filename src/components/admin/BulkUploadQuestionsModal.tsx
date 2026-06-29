"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { examsApi } from "@/lib/exams";
import { getApiErrorMessage } from "@/lib/api";
import {
  downloadQuestionCsvTemplate,
  parseQuestionsCsv,
  type ParsedQuestionRow,
} from "@/lib/questionBulkUpload";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { BulkQuestionInput } from "@/types";

interface BulkUploadQuestionsModalProps {
  examId: string;
  onClose: () => void;
}

export function BulkUploadQuestionsModal({ examId, onClose }: BulkUploadQuestionsModalProps) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedQuestionRow[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const validQuestions = rows
    .filter((r): r is ParsedQuestionRow & { question: BulkQuestionInput } => r.question != null)
    .map((r) => r.question);

  const invalidRows = rows.filter((r) => r.error);

  const mutation = useMutation({
    mutationFn: () => examsApi.bulkAddQuestions(examId, validQuestions),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["admin", "exam-questions", examId] });
      qc.invalidateQueries({ queryKey: ["admin", "questions", examId] });
      qc.invalidateQueries({ queryKey: ["admin", "exam", examId] });
      toast.success(`${result.addedCount} question(s) uploaded`);
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const { rows: parsed, fileError: err } = parseQuestionsCsv(text);
    setRows(parsed);
    setFileError(err ?? null);
  };

  return (
    <Modal isOpen onClose={onClose} title="Bulk Upload Questions" size="xl">
      <div className="space-y-5">
        <p className="text-sm text-slate-600">
          Upload a CSV file with columns:{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
            questionText, option1, option2, option3, option4, correctOption, sortOrder
          </code>
          . Use <strong>correctOption</strong> as 1–4 (Option 1 = 1). sortOrder is optional.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={downloadQuestionCsvTemplate}
          >
            Download template
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose CSV file
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {fileName && (
            <span className="flex items-center text-sm text-slate-500">{fileName}</span>
          )}
        </div>

        {fileError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fileError}
          </div>
        )}

        {rows.length > 0 && !fileError && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p>
              <strong>{validQuestions.length}</strong> valid question(s)
              {invalidRows.length > 0 && (
                <>, <strong className="text-red-600">{invalidRows.length}</strong> with errors</>
              )}
            </p>
          </div>
        )}

        {invalidRows.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
            <p className="mb-2 font-medium text-amber-800">Rows with errors (skipped):</p>
            <ul className="space-y-1 text-amber-700">
              {invalidRows.slice(0, 10).map((row) => (
                <li key={row.rowNumber}>
                  Row {row.rowNumber}: {row.error}
                </li>
              ))}
              {invalidRows.length > 10 && (
                <li>…and {invalidRows.length - 10} more</li>
              )}
            </ul>
          </div>
        )}

        {validQuestions.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Question</th>
                  <th className="px-3 py-2">Correct</th>
                </tr>
              </thead>
              <tbody>
                {validQuestions.slice(0, 20).map((q, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="max-w-xs truncate px-3 py-2">{q.questionText}</td>
                    <td className="px-3 py-2">Option {(q.correctOptionIndex ?? 0) + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {validQuestions.length > 20 && (
              <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
                …and {validQuestions.length - 20} more
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={validQuestions.length === 0 || !!fileError}
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Upload {validQuestions.length > 0 ? `${validQuestions.length} question(s)` : ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
