"use client";

import React from "react";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { AlertTriangle, Info } from "lucide-react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  description?: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmLabel,
  confirmText,
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationDialogProps) {
  const displayMessage = message || description || "";
  const displayConfirmLabel = confirmText || confirmLabel || "Confirm";

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full shrink-0 ${
            variant === "danger"
              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600"
              : variant === "warning"
              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600"
              : "bg-sky-100 dark:bg-sky-950/60 text-sky-600"
          }`}
        >
          {variant === "danger" || variant === "warning" ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <Info className="w-6 h-6" />
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {displayMessage}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "danger" ? "destructive" : "primary"}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {displayConfirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
