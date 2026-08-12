"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  containerClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, containerClassName, id, checked, ...props }, ref) => {
    const checkboxId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("flex items-start gap-2.5 select-none", containerClassName)}>
        <div className="relative flex items-center mt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer",
              "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900",
              "peer-checked:bg-sky-600 peer-checked:border-sky-600 peer-checked:text-white",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500/50",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              className
            )}
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input && !props.disabled) input.click();
            }}
          >
            {checked && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>

        {(label || description) && (
          <label htmlFor={checkboxId} className="cursor-pointer">
            {label && (
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                {label}
              </span>
            )}
            {description && (
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </span>
            )}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
