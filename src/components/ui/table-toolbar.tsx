"use client";

import React from "react";
import { Search, Filter, Download, SlidersHorizontal, RefreshCw } from "lucide-react";
import { Button } from "./button";

export interface TableToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export function TableToolbar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Filter records...",
  onRefresh,
  onExport,
  filters,
  actions,
}: TableToolbarProps) {
  return (
    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
      {/* Left: Search input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Right: Custom filters & actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters}

        {onExport && (
          <Button variant="outline" size="sm" icon={Download} onClick={onExport}>
            Export
          </Button>
        )}

        {onRefresh && (
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRefresh}>
            Refresh
          </Button>
        )}

        {actions}
      </div>
    </div>
  );
}
