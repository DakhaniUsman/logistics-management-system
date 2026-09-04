import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number; // e.g. 12.5 for +12.5%
  changePeriod?: string;
  icon?: LucideIcon;
  iconBgColor?: string;
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  changePeriod = "vs last month",
  icon: Icon,
  iconBgColor = "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  className,
  onClick,
}: StatsCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "logistics-card p-4 sm:p-5 transition-all duration-200 hover:shadow-md dark:hover:border-slate-700",
        onClick && "cursor-pointer hover:border-sky-500/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate" title={title}>
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200", iconBgColor)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change !== undefined || subtitle) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold rounded px-1.5 py-0.5 shrink-0",
                isPositive && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
                isNegative && "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
                !isPositive && !isNegative && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
          )}
          <span className="text-slate-500 dark:text-slate-400 truncate text-[11px] sm:text-xs">
            {subtitle || changePeriod}
          </span>
        </div>
      )}
    </div>
  );
}
