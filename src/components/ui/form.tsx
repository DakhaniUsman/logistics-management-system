"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Select } from "./select";

export { Input, Select };

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FormItem({ className, ...props }: FormItemProps) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ className, required, children, ...props }: FormLabelProps) {
  return (
    <label
      className={cn("block text-xs font-semibold text-slate-700 dark:text-slate-300", className)}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

export function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative", className)} {...props} />;
}

export function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[11px] text-slate-500 dark:text-slate-400", className)} {...props} />;
}

export function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className={cn("text-[11px] font-medium text-rose-500", className)} {...props}>
      {children}
    </p>
  );
}
