"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <CalendarIcon className="w-4 h-4" />
          </div>

          <input
            id={inputId}
            type="date"
            ref={ref}
            className={cn(
              "w-full rounded-lg border bg-white dark:bg-slate-900/90 text-xs sm:text-sm text-slate-900 dark:text-slate-100 transition-colors outline-none pl-9 pr-3 py-2",
              "border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              props.disabled && "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800",
              className
            )}
            {...props}
          />
        </div>

        {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
