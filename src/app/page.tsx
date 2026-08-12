"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Tabs } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Timeline } from "@/components/ui/timeline";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { TableColumn, LogisticsStatus } from "@/types/common";
import { OperationalTimelineEvent } from "@/types/job";
import { useAppStore } from "@/store/use-app-store";
import {
  Boxes,
  Ship,
  TrendingUp,
  DollarSign,
  Sparkles,
  Layers,
  Search,
  Plus,
  SlidersHorizontal,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Send,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Shield,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface FoundationItem {
  id: string;
  code: string;
  name: string;
  category: string;
  status: LogisticsStatus;
  updatedAt: string;
}

const DEMO_TABLE_DATA: FoundationItem[] = [
  {
    id: "f-1",
    code: "SHELL-PRM-001",
    name: "Application Shell Container Layout",
    category: "Layout Primitive",
    status: "Active",
    updatedAt: "2026-08-13 02:00",
  },
  {
    id: "f-2",
    code: "SHELL-PRM-002",
    name: "Responsive Sidebar Navigation",
    category: "Navigation System",
    status: "Verified",
    updatedAt: "2026-08-13 02:00",
  },
  {
    id: "f-3",
    code: "SHELL-PRM-003",
    name: "Global Search Engine (⌘K Modal)",
    category: "Global Shared UI",
    status: "Confirmed",
    updatedAt: "2026-08-13 02:00",
  },
  {
    id: "f-4",
    code: "SHELL-PRM-004",
    name: "Zustand UI State Management",
    category: "State Architecture",
    status: "Completed",
    updatedAt: "2026-08-13 02:00",
  },
  {
    id: "f-5",
    code: "SHELL-PRM-005",
    name: "Data Table Foundation & Filters",
    category: "Table Foundation",
    status: "In Transit",
    updatedAt: "2026-08-13 02:00",
  },
  {
    id: "f-6",
    code: "SHELL-PRM-006",
    name: "Operational Status Badges Engine",
    category: "Design System",
    status: "Customs Cleared",
    updatedAt: "2026-08-13 02:00",
  },
  {
    id: "f-7",
    code: "SHELL-PRM-007",
    name: "Mock Base Repository Services",
    category: "Data Service Layer",
    status: "Approved",
    updatedAt: "2026-08-13 02:00",
  },
];

const DEMO_TIMELINE: OperationalTimelineEvent[] = [
  {
    id: "t-1",
    title: "Foundation & Design System Configured",
    description: "Established colors, dark theme CSS variables, typography, and spacing tokens.",
    timestamp: "01:30 AM",
    completed: true,
  },
  {
    id: "t-2",
    title: "Application Shell & Navigation Mounted",
    description: "Rendered collapsible responsive sidebar, topbar, user profile, and notifications popover.",
    timestamp: "01:45 AM",
    completed: true,
  },
  {
    id: "t-3",
    title: "UI Component Primitives Built",
    description: "Input fields, buttons, status badges, modals, drawers, data table toolbar, and tabs.",
    timestamp: "02:00 AM",
    completed: false,
    isCurrent: true,
  },
  {
    id: "t-4",
    title: "Ready for Business Module Development",
    description: "Architecture clean and scalable for upcoming module-by-module implementation.",
    timestamp: "Upcoming",
    completed: false,
  },
];

export default function FoundationShowcasePage() {
  const { setGlobalSearchOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState("overview");

  // Modal / Drawer state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form interactive state
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const columns: TableColumn<FoundationItem>[] = [
    {
      key: "code",
      header: "Primitive Code",
      accessor: (item) => (
        <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
          {item.code}
        </span>
      ),
      sortable: true,
    },
    {
      key: "name",
      header: "Component Name",
      accessor: (item) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
          <div className="text-[11px] text-slate-400">{item.category}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Operational Status",
      accessor: (item) => <StatusBadge status={item.status} />,
      sortable: true,
    },
    {
      key: "updatedAt",
      header: "Last Update",
      accessor: (item) => <span className="text-slate-400 text-xs font-mono">{item.updatedAt}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (item) => (
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="xs" icon={MoreVertical}>
              Options
            </Button>
          }
          items={[
            {
              label: "Inspect Component",
              icon: ExternalLink,
              onClick: () => toast.info(`Inspecting ${item.name}`),
            },
            {
              label: "Edit Configuration",
              icon: Edit,
              onClick: () => setIsDrawerOpen(true),
            },
            "separator",
            {
              label: "Delete Component",
              icon: Trash2,
              destructive: true,
              onClick: () => setIsConfirmOpen(true),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Page Header */}
      <PageHeader
        title="Logistics OS — Foundation & Application Shell"
        subtitle="Enterprise design system, responsive shell navigation, UI primitives, and state architecture powering Eclipse Logistics Operating System."
        breadcrumbs={[
          { label: "System Foundation", href: "/" },
          { label: "App Shell Showcase" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Search}
              onClick={() => setGlobalSearchOpen(true)}
            >
              Search (⌘K)
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => toast.success("Foundation system online & verified clean!")}
            >
              System Ready
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Core Design System Tokens"
          value="48 Tokens"
          change={100}
          changePeriod="dark & light themes"
          icon={Boxes}
          iconBgColor="bg-sky-500/10 text-sky-500"
          subtitle="Variables, surface & typography"
        />
        <StatsCard
          title="Reusable UI Primitives"
          value="24 Components"
          change={100}
          changePeriod="shadcn/ui foundation"
          icon={Layers}
          iconBgColor="bg-emerald-500/10 text-emerald-500"
          subtitle="Buttons, Cards, Tables, Modals"
        />
        <StatsCard
          title="Shell Navigation Submenus"
          value="9 Modules"
          change={0}
          changePeriod="ready for phase rollout"
          icon={Ship}
          iconBgColor="bg-blue-500/10 text-blue-500"
          subtitle="CRM, Ops, Warehouse, Finance"
        />
        <StatsCard
          title="State Store & Repositories"
          value="100% Async"
          change={100}
          changePeriod="mock repository layer"
          icon={TrendingUp}
          iconBgColor="bg-teal-500/10 text-teal-500"
          subtitle="Zustand + TanStack Query"
        />
      </div>

      {/* Interactive Tabs Showcase */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: "overview", label: "UI Component Primitives", count: 24 },
              { id: "forms", label: "Form & Input Foundations", count: 6 },
              { id: "overlays", label: "Modals, Drawers & Dialogs", count: 3 },
              { id: "states", label: "Feedback & Loading States", count: 4 },
              { id: "timeline", label: "Activity & Milestones", count: 4 },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {/* TAB 1: UI COMPONENTS */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Buttons */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Buttons & Triggers
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button variant="primary" icon={Plus}>Primary Action</Button>
                  <Button variant="secondary" icon={SlidersHorizontal}>Secondary Action</Button>
                  <Button variant="outline" icon={FileText}>Outline Action</Button>
                  <Button variant="ghost" icon={Bell}>Ghost Action</Button>
                  <Button variant="destructive" icon={Trash2}>Destructive</Button>
                  <Button variant="primary" isLoading>Loading State</Button>
                  <Button variant="outline" size="xs">Extra Small</Button>
                  <Button variant="outline" size="sm">Small</Button>
                  <Button variant="outline" size="lg">Large Button</Button>
                </div>
              </div>

              {/* Status Badges */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Logistics Operational Status Badges
                </h3>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <StatusBadge status="Draft" />
                  <StatusBadge status="Pending" />
                  <StatusBadge status="Active" />
                  <StatusBadge status="In Transit" />
                  <StatusBadge status="Customs Cleared" />
                  <StatusBadge status="Delivered" />
                  <StatusBadge status="Completed" />
                  <StatusBadge status="Delayed" />
                  <StatusBadge status="Overdue" />
                  <StatusBadge status="Cancelled" />
                  <StatusBadge status="Paid" />
                </div>
              </div>

              {/* Tooltip & Dropdown Menu */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Tooltips & Context Menus
                </h3>
                <div className="flex items-center gap-4">
                  <Tooltip content="Custom operational ETA tooltip explanation">
                    <Button variant="outline" size="sm">Hover for Tooltip</Button>
                  </Tooltip>

                  <DropdownMenu
                    trigger={
                      <Button variant="secondary" size="sm" icon={ChevronDown}>
                        Actions Dropdown Menu
                      </Button>
                    }
                    items={[
                      { label: "View Specifications", icon: ExternalLink, onClick: () => toast.info("Opening spec...") },
                      { label: "Duplicate Component", icon: Sparkles, onClick: () => toast.success("Duplicated!") },
                      "separator",
                      { label: "Deactivate Component", icon: Trash2, destructive: true, onClick: () => toast.error("Deactivated") },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMS */}
          {activeTab === "forms" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Logistics Entity Reference"
                placeholder="e.g. JOB-2026-00125"
                helperText="Standard uppercase alphanumeric reference ID."
              />

              <Select
                label="Transport Mode Selection"
                options={[
                  { label: "Ocean Freight (FCL / LCL)", value: "ocean" },
                  { label: "Air Freight Express", value: "air" },
                  { label: "Road Transport Trucking", value: "road" },
                  { label: "Rail Freight Network", value: "rail" },
                ]}
              />

              <DatePicker
                label="Expected Date of Arrival (ETA)"
                helperText="Select target port arrival timestamp."
              />

              <div className="space-y-4 pt-2">
                <Switch
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                  label="Automated Customs Clearing Alert"
                  description="Receive push notifications when customs status changes."
                />

                <Checkbox
                  checked={checkboxChecked}
                  onChange={(e: any) => setCheckboxChecked(e.target.checked)}
                  label="Require Digital Document Verification"
                  description="Enforce PDF parsing validation before job closure."
                />
              </div>
            </div>
          )}

          {/* TAB 3: OVERLAYS & MODALS */}
          {activeTab === "overlays" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Test interactive modal dialogs, slide-over drawers, and confirmation alerts:
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
                  Open Standard Dialog Modal
                </Button>

                <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>
                  Open Right Side-Drawer
                </Button>

                <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
                  Trigger Confirmation Dialog
                </Button>
              </div>

              {/* Dialog Modal instance */}
              <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="System Configuration Modal"
                description="Reusable foundation modal component for inspection and configuration."
              >
                <div className="space-y-4 py-2">
                  <p className="text-xs text-slate-300">
                    This accessible dialog supports Escape key closure, focus traps, and backdrop blurs.
                  </p>
                  <Input label="Configuration Key" defaultValue="LOGISTICS_OS_THEME" />
                  <Select
                    label="Default Environment"
                    options={[
                      { label: "Production (HQ Mumbai)", value: "prod" },
                      { label: "Staging Sandbox", value: "staging" },
                    ]}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        toast.success("Saved dialog configuration!");
                        setIsDialogOpen(false);
                      }}
                    >
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </Dialog>

              {/* Side Drawer instance */}
              <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Operational Inspection Drawer"
                subtitle="Slide-over detail view for quick side editing."
              >
                <div className="space-y-6">
                  <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-500/30 text-xs text-sky-300">
                    Drawers are ideal for inspecting dense job details, container trackings, and invoice line items.
                  </div>

                  <Input label="Drawer Item Name" defaultValue="Master Container Tracking" />
                  <Input label="Carrier Vessel" defaultValue="MSC VIRTUOSA" />
                  <Select
                    label="Operational Priority"
                    options={[
                      { label: "High Priority (VIP Customer)", value: "high" },
                      { label: "Standard Operational Priority", value: "normal" },
                    ]}
                  />

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      toast.success("Drawer updates submitted successfully!");
                      setIsDrawerOpen(false);
                    }}
                  >
                    Save Drawer Changes
                  </Button>
                </div>
              </Drawer>

              {/* Confirmation Dialog instance */}
              <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                  toast.error("Component deletion confirmed!");
                  setIsConfirmOpen(false);
                }}
                title="Confirm Action"
                description="Are you sure you want to perform this operation? This action cannot be undone."
                variant="danger"
                confirmText="Yes, Proceed"
              />
            </div>
          )}

          {/* TAB 4: STATES */}
          {activeTab === "states" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skeleton loading */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs uppercase text-slate-400">Skeleton Loading State</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardSkeleton />
                </CardContent>
              </Card>

              {/* Loading spinner */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs uppercase text-slate-400">Full Loading Spinner State</CardTitle>
                </CardHeader>
                <CardContent>
                  <LoadingState message="Fetching real-time freight telemetry..." />
                </CardContent>
              </Card>

              {/* Empty state */}
              <EmptyState
                title="No Invoices Found"
                description="No invoices match the specified criteria or query."
                actionLabel="Create Invoice"
                onAction={() => toast.info("Invoice module pending phase implementation.")}
              />

              {/* Error state */}
              <ErrorState
                title="Telemetry Connection Issue"
                message="Failed to establish websocket link with Port JNPT EDI service."
                onRetry={() => toast.success("Reconnected to JNPT EDI successfully.")}
              />
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="max-w-xl mx-auto py-2">
              <h3 className="text-sm font-bold text-slate-200 mb-4">
                Operational Stepper & Activity Audit Feed
              </h3>
              <Timeline events={DEMO_TIMELINE} />
            </div>
          )}
        </div>
      </Card>

      {/* Data Table Foundation Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Data Table Foundation & Toolbar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standardized data table with sortable columns, search filter, page size pagination, and contextual action menus.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsTableLoading(true);
              setTimeout(() => {
                setIsTableLoading(false);
                toast.success("Table reloaded");
              }, 800);
            }}
          >
            Toggle Table Loading
          </Button>
        </div>

        <DataTable
          data={DEMO_TABLE_DATA}
          columns={columns}
          searchPlaceholder="Filter primitives by name or code..."
          searchKey={(item) => `${item.name} ${item.code} ${item.category}`}
          isLoading={isTableLoading}
          onRowClick={(item) => toast.info(`Clicked ${item.name}`)}
          onExport={() => toast.success("Exported foundation dataset to CSV.")}
          onRefresh={() => toast.info("Refreshed table records.")}
        />
      </div>
    </div>
  );
}
