"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface DropdownMenuItemProps {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  badge?: string;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: (DropdownMenuItemProps | "separator")[];
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({ trigger, items, align = "right", className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1 animate-in fade-in duration-150",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, idx) => {
            if (item === "separator") {
              return <div key={idx} className="my-1 border-t border-slate-100 dark:border-slate-800" />;
            }

            const Icon = item.icon;

            return (
              <button
                key={idx}
                disabled={item.disabled}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left",
                  item.destructive
                    ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
