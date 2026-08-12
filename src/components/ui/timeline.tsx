import React from "react";
import { OperationalTimelineEvent } from "@/types/job";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineProps {
  events: OperationalTimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800", className)}>
      {events.map((event) => {
        return (
          <div key={event.id} className="relative flex items-start gap-4">
            <div
              className={cn(
                "relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                event.completed
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                  : event.isCurrent
                  ? "bg-sky-600 text-white border-sky-500 ring-4 ring-sky-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-400 border-slate-300 dark:border-slate-700"
              )}
            >
              {event.completed ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : event.isCurrent ? (
                <Clock className="w-4 h-4 animate-pulse" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
            </div>

            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={cn(
                    "text-xs font-bold",
                    event.completed || event.isCurrent
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {event.title}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {event.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
