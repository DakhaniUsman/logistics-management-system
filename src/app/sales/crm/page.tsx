"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TableColumn } from "@/types/common";
import { Lead, Task, Activity } from "@/types/crm";
import { useCrmStore } from "@/store/use-crm-store";
import { formatCurrency } from "@/lib/utils";
import {
  Users2,
  UserCheck,
  Building2,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowUpRight,
  BarChart2,
  CheckSquare,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import Link from "next/link";
import { toast } from "sonner";

export default function CrmDashboardPage() {
  const { leads, customers, activities, tasks, toggleTaskStatus } = useCrmStore();

  // Calculate CRM KPIs
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const qualifiedLeads = leads.filter((l) => l.status === "Qualified" || l.status === "Proposal").length;
  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const openActivities = activities.filter((a) => a.status === "Upcoming" || a.status === "In Progress").length;
  const followupsDue = tasks.filter((t) => t.status === "Pending" || t.status === "In Progress").length;

  // Pipeline Chart Data
  const pipelineData = [
    { name: "New", count: leads.filter((l) => l.status === "New").length, color: "#3b82f6" },
    { name: "Contacted", count: leads.filter((l) => l.status === "Contacted").length, color: "#0284c7" },
    { name: "Qualified", count: leads.filter((l) => l.status === "Qualified").length, color: "#0d9488" },
    { name: "Proposal", count: leads.filter((l) => l.status === "Proposal").length, color: "#d97706" },
    { name: "Won", count: leads.filter((l) => l.status === "Won").length, color: "#10b981" },
    { name: "Lost", count: leads.filter((l) => l.status === "Lost").length, color: "#f43f5e" },
  ];

  // Acquisition Monthly Trend Data
  const acquisitionData = [
    { month: "Jan", newCustomers: 4, pipelineValue: 12000000 },
    { month: "Feb", newCustomers: 6, pipelineValue: 15500000 },
    { month: "Mar", newCustomers: 5, pipelineValue: 18000000 },
    { month: "Apr", newCustomers: 8, pipelineValue: 22000000 },
    { month: "May", newCustomers: 7, pipelineValue: 26000000 },
    { month: "Jun", newCustomers: 9, pipelineValue: 31000000 },
    { month: "Jul", newCustomers: 11, pipelineValue: 38000000 },
    { month: "Aug", newCustomers: 14, pipelineValue: 45000000 },
  ];

  const recentLeadsColumns: TableColumn<Lead>[] = [
    {
      key: "leadNumber",
      header: "Lead ID / Company",
      accessor: (lead) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{lead.leadNumber}</div>
          <div className="text-xs text-slate-400">{lead.companyName}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "contactName",
      header: "Primary Contact",
      accessor: (lead) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">{lead.contactName}</div>
          <div className="text-[11px] text-slate-400">{lead.email}</div>
        </div>
      ),
    },
    {
      key: "source",
      header: "Lead Source",
      accessor: (lead) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {lead.source}
        </span>
      ),
    },
    {
      key: "estimatedValue",
      header: "Est. Value",
      accessor: (lead) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(lead.estimatedValue)}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (lead) => <StatusBadge status={lead.status} />,
      sortable: true,
    },
    {
      key: "action",
      header: "Action",
      accessor: (lead) => (
        <Link href={`/sales/leads?id=${lead.id}`}>
          <Button variant="ghost" size="xs" icon={ArrowUpRight}>
            Inspect
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="CRM Operational Command Center"
        subtitle="Commercial relationship management, lead pipelines, customer accounts, and sales team activities."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "CRM Overview" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/sales/leads">
              <Button variant="primary" size="sm" icon={Plus}>
                New Lead Opportunity
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Pipeline Leads"
          value={totalLeads}
          change={12.5}
          changePeriod="active leads"
          icon={Users2}
          iconBgColor="bg-sky-500/10 text-sky-500"
          subtitle="Across all sources"
        />
        <StatsCard
          title="New Leads (This Month)"
          value={newLeads}
          change={18.2}
          changePeriod="vs last month"
          icon={TrendingUp}
          iconBgColor="bg-blue-500/10 text-blue-500"
          subtitle="Inbound inquiries"
        />
        <StatsCard
          title="Qualified Opportunities"
          value={qualifiedLeads}
          change={8.4}
          changePeriod="proposal stage"
          icon={UserCheck}
          iconBgColor="bg-teal-500/10 text-teal-500"
          subtitle="High conversion probability"
        />
        <StatsCard
          title="Active Customers"
          value={activeCustomers}
          change={15.0}
          changePeriod="contracted clients"
          icon={Building2}
          iconBgColor="bg-emerald-500/10 text-emerald-500"
          subtitle="Logistics shippers"
        />
        <StatsCard
          title="Open Activities"
          value={openActivities}
          change={0}
          changePeriod="meetings & calls"
          icon={CalendarCheck}
          iconBgColor="bg-amber-500/10 text-amber-500"
          subtitle="Logged interactions"
        />
        <StatsCard
          title="Follow-ups Due"
          value={followupsDue}
          change={-5.2}
          changePeriod="tasks pending"
          icon={CheckSquare}
          iconBgColor="bg-rose-500/10 text-rose-500"
          subtitle="Action required"
        />
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Distribution Bar Chart */}
        <Card className="p-5 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-500" />
              Lead Pipeline Stage Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of current leads across commercial stages.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical" margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={75} />
                <Tooltip
                  formatter={(val: any) => [`${val} Leads`, "Count"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Acquisition & Pipeline Trend Area Chart */}
        <Card className="p-5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Customer Acquisition & Pipeline Growth Trend
            </CardTitle>
            <CardDescription>
              Monthly new shipper acquisition vs total pipeline contract value (₹).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={acquisitionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Pipeline Value"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="pipelineValue" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorPipeline)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Recent Leads Table & Tasks Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads Table (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Lead Opportunities
            </h3>
            <Link href="/sales/leads">
              <Button variant="ghost" size="xs">View All Leads ({leads.length})</Button>
            </Link>
          </div>

          <DataTable
            data={leads.slice(0, 6)}
            columns={recentLeadsColumns}
            searchPlaceholder="Filter recent leads..."
            pageSize={6}
          />
        </div>

        {/* Upcoming Tasks & Follow-ups Feed (1 Column) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Follow-ups & Tasks
            </h3>
            <Link href="/sales/tasks">
              <Button variant="ghost" size="xs">View All ({tasks.length})</Button>
            </Link>
          </div>

          <Card className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
            {tasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => {
                        toggleTaskStatus(task.id);
                        toast.success(`Task status updated`);
                      }}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        task.status === "Completed"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-400 hover:border-sky-500"
                      }`}
                    >
                      {task.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                    <div>
                      <p className={`text-xs font-semibold ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                        {task.title}
                      </p>
                      <span className="text-[11px] text-slate-400">{task.relatedEntityName}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      task.priority === "Urgent"
                        ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400"
                        : task.priority === "High"
                        ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Assigned: {task.assignee}</span>
                  <span className="font-mono">Due: {task.dueDate}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
