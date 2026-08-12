"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import {
  LayoutDashboard,
  Users2,
  Ship,
  Warehouse,
  FileText,
  DollarSign,
  BarChart3,
  Globe2,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  children?: { title: string; href: string; badge?: string }[];
}

const NAVIGATION_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: "MAIN",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    section: "SALES",
    items: [
      {
        title: "CRM & Sales",
        icon: Users2,
        children: [
          { title: "CRM Overview", href: "/sales/crm" },
          { title: "Leads", href: "/sales/leads" },
          { title: "Companies", href: "/sales/companies" },
          { title: "Contacts", href: "/sales/contacts" },
          { title: "Customers", href: "/sales/customers" },
          { title: "Enquiries / RFQs", href: "/sales/enquiries" },
          { title: "Rate Management", href: "/sales/rates" },
          { title: "Rate Comparison Engine", href: "/sales/rates/comparison" },
          { title: "Quotations", href: "/sales/quotations" },
          { title: "Quotation Builder", href: "/sales/quotations/builder" },
          { title: "Activities", href: "/sales/activities" },
          { title: "Tasks & Follow-ups", href: "/sales/tasks" },
        ],
      },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      {
        title: "Logistics Operations",
        icon: Ship,
        children: [
          { title: "Jobs Command Center", href: "/operations/jobs" },
          { title: "Create Operational Job", href: "/operations/jobs/create" },
          { title: "Shipments (Phase 7)", href: "/operations/jobs" },
          { title: "Bookings (Phase 8)", href: "/operations/jobs" },
          { title: "Containers (Phase 9)", href: "/operations/jobs" },
          { title: "Transport (Phase 10)", href: "/operations/jobs" },
          { title: "Customs (Phase 11)", href: "/operations/jobs" },
        ],
      },
    ],
  },
  {
    section: "WAREHOUSE",
    items: [
      {
        title: "Warehouse & Stock",
        icon: Warehouse,
        children: [
          { title: "Warehouses", href: "/warehouse/locations" },
          { title: "GRN", href: "/warehouse/grn" },
          { title: "Inventory", href: "/warehouse/inventory" },
          { title: "Picking", href: "/warehouse/picking" },
          { title: "Packing", href: "/warehouse/packing" },
          { title: "Dispatch", href: "/warehouse/dispatch" },
        ],
      },
    ],
  },
  {
    section: "DOCUMENTS",
    items: [
      {
        title: "Document Hub",
        icon: FileText,
        children: [
          { title: "Document Center", href: "/documents/center" },
          { title: "Templates", href: "/documents/templates" },
          { title: "Verification", href: "/documents/verification" },
        ],
      },
    ],
  },
  {
    section: "FINANCE",
    items: [
      {
        title: "Finance & Accounting",
        icon: DollarSign,
        children: [
          { title: "Invoices", href: "/finance/invoices" },
          { title: "Receivables", href: "/finance/receivables" },
          { title: "Payables", href: "/finance/payables" },
          { title: "Payments", href: "/finance/payments" },
          { title: "Profitability", href: "/finance/profitability" },
        ],
      },
    ],
  },
  {
    section: "ANALYTICS",
    items: [
      {
        title: "Analytics & Reports",
        icon: BarChart3,
        children: [
          { title: "Operations Analytics", href: "/analytics/operations" },
          { title: "Finance Analytics", href: "/analytics/finance" },
          { title: "Customer Analytics", href: "/analytics/customers" },
          { title: "Vendor Analytics", href: "/analytics/vendors" },
          { title: "Performance KPIs", href: "/analytics/performance" },
        ],
      },
    ],
  },
  {
    section: "PORTAL & AI",
    items: [
      {
        title: "Customer Portal",
        href: "/portal",
        icon: Globe2,
      },
      {
        title: "AI Automation",
        icon: Sparkles,
        badge: "AI",
        children: [
          { title: "Email → Enquiry", href: "/ai/email-enquiry" },
          { title: "PDF Extraction", href: "/ai/pdf-extraction" },
          { title: "Doc Verification", href: "/ai/verification" },
          { title: "AI Assistant", href: "/ai/assistant" },
        ],
      },
    ],
  },
  {
    section: "ADMIN",
    items: [
      {
        title: "Administration",
        icon: ShieldCheck,
        children: [
          { title: "Users", href: "/admin/users" },
          { title: "Roles & Permissions", href: "/admin/roles" },
          { title: "Settings", href: "/admin/settings" },
          { title: "Audit Logs", href: "/admin/audit-logs" },
        ],
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    currentOrg,
  } = useAppStore();

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "CRM & Sales": true,
    "Logistics Operations": true,
    "Finance & Accounting": true,
  });

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-all duration-300",
          isSidebarCollapsed ? "w-20" : "w-64",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black shadow-lg shadow-sky-600/30 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-base tracking-tight text-white block truncate">
                  LOGISTICS <span className="text-sky-400">OS</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase truncate">
                  {currentOrg.branch}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAVIGATION_SECTIONS.map((sec) => (
            <div key={sec.section}>
              {!isSidebarCollapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  {sec.section}
                </div>
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = !!item.children;
                  const isOpen = openSubmenus[item.title];
                  const isActive = item.href === pathname;

                  if (!hasChildren && item.href) {
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                          isActive
                            ? "bg-sky-600/20 text-sky-400 border border-sky-500/30 font-semibold"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white",
                          isSidebarCollapsed && "justify-center px-0"
                        )}
                        title={isSidebarCollapsed ? item.title : undefined}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                          {!isSidebarCollapsed && <span className="truncate">{item.title}</span>}
                        </div>
                        {!isSidebarCollapsed && item.badge && (
                          <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  }

                  return (
                    <div key={item.title}>
                      <button
                        onClick={() => {
                          if (isSidebarCollapsed) toggleSidebarCollapse();
                          toggleSubmenu(item.title);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors",
                          isSidebarCollapsed && "justify-center px-0"
                        )}
                        title={isSidebarCollapsed ? item.title : undefined}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                          {!isSidebarCollapsed && <span className="truncate">{item.title}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">
                                {item.badge}
                              </span>
                            )}
                            {isOpen ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </div>
                        )}
                      </button>

                      {!isSidebarCollapsed && isOpen && item.children && (
                        <div className="ml-4 pl-3 mt-1 space-y-0.5 border-l border-slate-800">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.title}
                                href={child.href}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={cn(
                                  "flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium rounded transition-colors",
                                  isChildActive
                                    ? "text-sky-400 font-semibold bg-sky-500/10"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                                )}
                              >
                                <span className="truncate">{child.title}</span>
                                {child.badge && (
                                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-bold shrink-0">
                                    {child.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between bg-slate-950/40">
          {!isSidebarCollapsed ? (
            <>
              <div>
                <span className="font-semibold text-slate-300">Logistics OS</span> v1.0
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold">Online</span>
              </div>
            </>
          ) : (
            <div className="mx-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
