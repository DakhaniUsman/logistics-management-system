"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbItem } from "./breadcrumb";

export type { BreadcrumbItem };

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  statusBadge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  statusBadge,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 space-y-2", className)}>
      {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="mb-2" />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {title}
            </h1>
            {statusBadge}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
