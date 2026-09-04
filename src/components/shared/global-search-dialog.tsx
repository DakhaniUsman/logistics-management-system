"use client";

import React, { useState, useEffect } from "react";
import { Search, Ship, Building2, ArrowRight, X } from "lucide-react";
import { MOCK_JOBS, GOLDEN_CUSTOMERS } from "@/data/mock/golden-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAppStore } from "@/store/use-app-store";

export function GlobalSearchDialog() {
  const { isGlobalSearchOpen, setGlobalSearchOpen } = useAppStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setGlobalSearchOpen(!isGlobalSearchOpen);
      }
      if (e.key === "Escape" && isGlobalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGlobalSearchOpen, setGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const filteredJobs = MOCK_JOBS.filter(
    (j) =>
      (j.jobNumber || j.jobNo || "").toLowerCase().includes(query.toLowerCase()) ||
      (j.customerName || (j as any).customer?.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (j.origin || "").toLowerCase().includes(query.toLowerCase()) ||
      (j.destination || "").toLowerCase().includes(query.toLowerCase())
  );

  const filteredCustomers = GOLDEN_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Input header */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a Job # (e.g. JOB-2026-00125), Customer, Container, or Route..."
            className="w-full px-3 py-4 text-sm sm:text-base bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Jobs Section */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Jobs & Operations ({filteredJobs.length})
            </div>
            {filteredJobs.length > 0 ? (
              <div className="space-y-1">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setGlobalSearchOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                        <Ship className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {job.jobNumber || job.jobNo}
                          </span>
                          <span className="text-xs text-slate-500">• {job.customerName || (job as any).customer?.name}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {(job.origin || "Mumbai").split(" ")[0]} → {(job.destination || "Dubai").split(" ")[0]} ({job.transportMode})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={job.status} showIcon={false} />
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic px-2 py-1">No matching jobs found.</div>
            )}
          </div>

          {/* Customers Section */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Customers ({filteredCustomers.length})
            </div>
            <div className="space-y-1">
              {filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => setGlobalSearchOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {cust.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">({cust.code})</span>
                      <div className="text-xs text-slate-400">{cust.contactPerson} • {cust.country}</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {cust.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Search powered by <span className="font-semibold text-slate-600 dark:text-slate-300">FLOQ Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
