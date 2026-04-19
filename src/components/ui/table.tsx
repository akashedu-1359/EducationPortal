import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Primitives ─────────────────────────────────────────────────────────────

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto rounded-xl border border-slate-200">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("border-b border-slate-200 bg-slate-50", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-slate-100 bg-white", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-slate-50/50",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 py-3 text-slate-700", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// ─── Sortable Header ─────────────────────────────────────────────────────────

interface SortableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  column: string;
  currentSort?: string;
  currentDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
}

function SortableHead({
  column,
  currentSort,
  currentDirection,
  onSort,
  children,
  className,
  ...props
}: SortableHeadProps) {
  const isActive = currentSort === column;

  return (
    <TableHead
      className={cn("cursor-pointer select-none", className)}
      onClick={() => onSort?.(column)}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        <span className="text-slate-400">
          {isActive ? (
            currentDirection === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5" />
          )}
        </span>
      </div>
    </TableHead>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

interface TableEmptyProps {
  colSpan: number;
  message?: string;
  icon?: React.ReactNode;
}

function TableEmpty({ colSpan, message = "No results found.", icon }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        {icon && <div className="mx-auto mb-3 text-slate-300">{icon}</div>}
        <p className="text-sm text-slate-500">{message}</p>
      </td>
    </tr>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableHead,
  TableEmpty,
};
