import type { BulkQuestionInput } from "@/types";

export const QUESTION_CSV_TEMPLATE = `questionText,option1,option2,option3,option4,correctOption,sortOrder
"What is 2+2?","3","4","5","6",2,1
"Capital of India?","Mumbai","Delhi","Kolkata","Chennai",2,2`;

export interface ParsedQuestionRow {
  rowNumber: number;
  question: BulkQuestionInput | null;
  error?: string;
}

const REQUIRED_HEADERS = [
  "questiontext",
  "option1",
  "option2",
  "option3",
  "option4",
  "correctoption",
] as const;

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function headerIndex(headers: string[], ...names: string[]): number {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  for (const name of names) {
    const idx = normalized.indexOf(name.toLowerCase());
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseCorrectOption(raw: string): number | null {
  const value = Number(raw.trim());
  if (!Number.isFinite(value)) return null;
  if (value >= 1 && value <= 4) return value - 1;
  if (value >= 0 && value <= 3) return value;
  return null;
}

function validateRow(cells: string[], indexes: Record<string, number>, rowNumber: number): ParsedQuestionRow {
  const get = (key: string) => (cells[indexes[key]] ?? "").trim();

  const questionText = get("questionText");
  const option1 = get("option1");
  const option2 = get("option2");
  const option3 = get("option3");
  const option4 = get("option4");
  const correctRaw = get("correctOption");
  const sortRaw = get("sortOrder");

  if (!questionText && !option1 && !option2 && !option3 && !option4 && !correctRaw) {
    return { rowNumber, question: null, error: "Empty row" };
  }

  if (questionText.length < 3) {
    return { rowNumber, question: null, error: "Question text must be at least 3 characters" };
  }
  if (!option1 || !option2 || !option3 || !option4) {
    return { rowNumber, question: null, error: "All four options are required" };
  }

  const correctOptionIndex = parseCorrectOption(correctRaw);
  if (correctOptionIndex == null) {
    return { rowNumber, question: null, error: "correctOption must be 1–4 (or 0–3)" };
  }

  const sortOrder = sortRaw ? Number(sortRaw) : 0;
  if (sortRaw && (!Number.isFinite(sortOrder) || sortOrder < 0)) {
    return { rowNumber, question: null, error: "sortOrder must be a non-negative number" };
  }

  return {
    rowNumber,
    question: {
      questionText,
      option1,
      option2,
      option3,
      option4,
      correctOptionIndex,
      sortOrder: sortOrder > 0 ? sortOrder : undefined,
    },
  };
}

export function parseQuestionsCsv(text: string): { rows: ParsedQuestionRow[]; fileError?: string } {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], fileError: "File is empty" };
  }

  const headers = parseCsvLine(lines[0]);
  const indexes: Record<string, number> = {
    questionText: headerIndex(headers, "questiontext", "question"),
    option1: headerIndex(headers, "option1"),
    option2: headerIndex(headers, "option2"),
    option3: headerIndex(headers, "option3"),
    option4: headerIndex(headers, "option4"),
    correctOption: headerIndex(headers, "correctoption", "correctoptionindex", "correct"),
    sortOrder: headerIndex(headers, "sortorder", "order"),
  };

  for (const key of REQUIRED_HEADERS) {
    const mapped =
      key === "questiontext"
        ? indexes.questionText
        : key === "correctoption"
          ? indexes.correctOption
          : indexes[key as "option1"];
    if (mapped < 0) {
      return {
        rows: [],
        fileError: `Missing required column: ${key === "questiontext" ? "questionText" : key === "correctoption" ? "correctOption" : key}`,
      };
    }
  }

  const rows: ParsedQuestionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row = validateRow(cells, indexes, i + 1);
    if (row.error === "Empty row") continue;
    rows.push(row);
  }

  return { rows };
}

export function downloadQuestionCsvTemplate() {
  const blob = new Blob([QUESTION_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exam-questions-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}
