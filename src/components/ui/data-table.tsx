"use client";

import React, { useState } from "react";
import { TableColumn } from "@/types/common";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { TableToolbar } from "./table-toolbar";
import { TableSkeletonRows } from "./skeleton";

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T | ((row: T) => string);
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  onRefresh?: () => void;
  onExport?: () => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchKey,
  onRowClick,
  actions,
  isLoading = false,
  emptyMessage = "No matching records found.",
  pageSize = 8,
  onRefresh,
  onExport,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Search logic
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    if (typeof searchKey === "function") {
      return searchKey(row).toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (searchKey && row[searchKey]) {
      return String(row[searchKey]).toLowerCase().includes(searchTerm.toLowerCase());
    }
    return JSON.stringify(row).toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = (a as any)[sortKey];
    const valB = (b as any)[sortKey];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="logistics-card overflow-hidden">
      {/* Table Toolbar */}
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={(t) => {
          setSearchTerm(t);
          setCurrentPage(1);
        }}
        searchPlaceholder={searchPlaceholder}
        actions={actions}
        onRefresh={onRefresh}
        onExport={onExport}
      />

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300 logistics-table">
          <thead className="bg-slate-100/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 font-semibold select-none", col.className)}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="shrink-0">
                        {sortKey === col.key ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="w-3 h-3 text-sky-500" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-sky-500" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <TableSkeletonRows rows={pageSize} cols={columns.length} />
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer hover:bg-sky-500/5 dark:hover:bg-sky-500/10"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3.5 whitespace-nowrap", col.className)}>
                      {col.accessor ? col.accessor(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          Showing{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{sortedData.length}</span>{" "}
          entries
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1 || isLoading}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
