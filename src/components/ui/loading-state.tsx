"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading data...", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "p-12 text-center flex flex-col items-center justify-center space-y-3 my-4",
        className
      )}
    >
      <div className="p-3 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{message}</p>
    </div>
  );
}
