"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-slate-500 dark:text-slate-400", className)}>
      <ol className="flex items-center space-x-1.5 flex-wrap">
        {showHome && (
          <li className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {showHome && items.length > 0 && (
          <li className="flex items-center">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-0.5" />
          </li>
        )}

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={idx} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className={cn("flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-200", isLast && "text-sky-600 dark:text-sky-400")}>
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-1" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
