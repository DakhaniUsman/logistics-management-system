import React from "react";
import { LogisticsStatus } from "@/types/common";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ship,
  FileCheck,
  XCircle,
  AlertCircle,
  FileText,
  DollarSign,
} from "lucide-react";

interface StatusBadgeProps {
  status: LogisticsStatus | string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  let badgeStyle = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  let IconComponent = Clock;

  switch (status) {
    case "In Transit":
    case "Active":
    case "Picked Up":
    case "Departed":
    case "Out for Delivery":
      badgeStyle = "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      IconComponent = Ship;
      break;
    case "Delivered":
    case "Completed":
    case "Paid":
    case "Verified":
    case "Loaded":
    case "Released":
      badgeStyle = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      IconComponent = CheckCircle2;
      break;
    case "Customs Cleared":
    case "Approved":
    case "Confirmed":
    case "At Origin":
    case "Gate In":
    case "At Destination":
      badgeStyle = "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-800";
      IconComponent = FileCheck;
      break;
    case "Delayed":
    case "Overdue":
    case "Missing":
    case "Customs Hold":
    case "Damaged":
    case "Lost":
      badgeStyle = "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      IconComponent = AlertTriangle;
      break;
    case "Pending":
    case "Under Review":
    case "Needs Review":
    case "Partially Paid":
    case "Empty":
    case "Empty Return Pending":
      badgeStyle = "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      IconComponent = AlertCircle;
      break;
    case "Draft":
    case "Available":
    case "Assigned":
    case "Returned":
      badgeStyle = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      IconComponent = FileText;
      break;
    case "Cancelled":
    case "Rejected":
      badgeStyle = "bg-slate-100 text-slate-500 line-through dark:bg-slate-900 dark:text-slate-500 border-slate-200 dark:border-slate-800";
      IconComponent = XCircle;
      break;
    default:
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-colors",
        badgeStyle,
        className
      )}
    >
      {showIcon && <IconComponent className="w-3 h-3 shrink-0" />}
      <span>{status}</span>
    </span>
  );
}
