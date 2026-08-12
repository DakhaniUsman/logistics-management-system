import React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  message = "An error occurred while fetching operational records. Please check your connectivity and try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "logistics-card p-8 text-center flex flex-col items-center justify-center my-4 border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-3">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-5">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry Action
        </Button>
      )}
    </div>
  );
}
