"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TableColumn } from "@/types/common";
import { Job, JobStatus, JobPriority } from "@/types/job";
import { useJobStore } from "@/store/use-job-store";
import { formatCurrency } from "@/lib/utils";
import {
  Briefcase,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Ship,
  Plane,
  Truck,
  DollarSign,
  ExternalLink,
  BarChart2,
  Users,
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
} from "recharts";
import Link from "next/link";

export default function JobsDashboardAndListPage() {
  const { jobs } = useJobStore();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [modeFilter, setModeFilter] = useState<string>("ALL");

  // Calculate KPIs
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "Active" || j.status === "In Progress").length;
  const inProgressCount = jobs.filter((j) => j.status === "In Progress").length;
  const delayedCount = jobs.filter((j) => j.status === "Delayed").length;
  const onHoldCount = jobs.filter((j) => j.status === "On Hold").length;
  const completedCount = jobs.filter((j) => j.status === "Completed").length;

  const totalEstimatedRevenue = jobs.reduce((sum, j) => sum + (j.estimatedRevenue || 0), 0);

  // Filtered Jobs
  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== "ALL" && j.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && j.priority !== priorityFilter) return false;
    if (modeFilter !== "ALL" && j.transportMode !== modeFilter) return false;
    return true;
  });

  // Chart Data: Status Distribution
  const statusData = [
    { name: "Active", count: jobs.filter((j) => j.status === "Active").length, color: "#3b82f6" },
    { name: "In Progress", count: inProgressCount, color: "#0284c7" },
    { name: "On Hold", count: onHoldCount, color: "#f59e0b" },
    { name: "Delayed", count: delayedCount, color: "#f43f5e" },
    { name: "Completed", count: completedCount, color: "#10b981" },
  ];

  const columns: TableColumn<Job>[] = [
    {
      key: "jobNumber",
      header: "Job # / Type",
      accessor: (j) => (
        <div>
          <div className="font-bold text-sky-600 dark:text-sky-400 font-mono text-xs flex items-center gap-1.5">
            <span>{j.jobNumber}</span>
            {j.priority === "Urgent" && (
              <span className="text-[9px] bg-rose-500/20 text-rose-400 font-bold px-1.5 py-0.2 rounded">Urgent</span>
            )}
          </div>
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{j.customerName}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "route",
      header: "Route & Mode",
      accessor: (j) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <span>{(j.origin || "Mumbai").split(" ")[0]}</span>
            <ArrowRight className="w-3 h-3 text-sky-500 shrink-0" />
            <span>{(j.destination || "Dubai").split(" ")[0]}</span>
          </div>
          <div className="text-[10px] text-slate-400">{j.transportMode} • {j.serviceType}</div>
        </div>
      ),
    },
    {
      key: "quotationNumber",
      header: "Commercial Source",
      accessor: (j) => (
        <div>
          {j.quotationId ? (
            <Link href={`/sales/quotations/${j.quotationId}`} className="font-mono text-xs text-sky-500 hover:underline block">
              {j.quotationNumber}
            </Link>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Direct Job</span>
          )}
          {j.enquiryId && (
            <Link href={`/sales/enquiries/${j.enquiryId}`} className="text-[10px] text-slate-400 hover:underline block">
              {j.enquiryNumber}
            </Link>
          )}
        </div>
      ),
    },
    {
      key: "estimatedRevenue",
      header: "Est. Revenue",
      accessor: (j) => (
        <div>
          <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
            {formatCurrency(j.estimatedRevenue || 0)}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">Margin: ~{(j.expectedMarginPercentage || 20).toFixed(1)}%</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "assignedTo",
      header: "Assigned Lead",
      accessor: (j) => <span className="text-xs text-slate-300 font-medium">{j.assignedTo}</span>,
    },
    {
      key: "requiredDeliveryDate",
      header: "Required Delivery",
      accessor: (j) => (
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
          {j.requiredDeliveryDate}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (j) => <StatusBadge status={j.status} />,
      sortable: true,
    },
    {
      key: "action",
      header: "Action",
      accessor: (j) => (
        <Link href={`/operations/jobs/${j.id}`}>
          <Button variant="ghost" size="xs" icon={ExternalLink}>
            Inspect
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Logistics Operations Command Center"
        subtitle="Central operational record managing confirmed logistics jobs, route execution, task assignments, and delivery fulfillment."
        breadcrumbs={[{ label: "Operations", href: "/operations/jobs" }, { label: "Jobs" }]}
        actions={
          <Link href="/operations/jobs/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Create Operational Job
            </Button>
          </Link>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatsCard
          title="Total Jobs"
          value={totalJobs}
          change={14.0}
          changePeriod="central records"
          icon={Briefcase}
          iconBgColor="bg-sky-500/10 text-sky-500"
          subtitle="All operations"
        />
        <StatsCard
          title="Active Operations"
          value={activeJobs}
          change={18.0}
          changePeriod="in fulfillment"
          icon={Clock}
          iconBgColor="bg-blue-500/10 text-blue-500"
          subtitle="Active & In Progress"
        />
        <StatsCard
          title="In Transit / Progress"
          value={inProgressCount}
          change={8.0}
          changePeriod="moving freight"
          icon={Ship}
          iconBgColor="bg-cyan-500/10 text-cyan-500"
          subtitle="Executing jobs"
        />
        <StatsCard
          title="Delayed Jobs"
          value={delayedCount}
          change={-2.0}
          changePeriod="schedule risk"
          icon={AlertTriangle}
          iconBgColor="bg-rose-500/10 text-rose-500"
          subtitle="Requires ops attention"
        />
        <StatsCard
          title="Completed Jobs"
          value={completedCount}
          change={25.0}
          changePeriod="fulfilled"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10 text-emerald-500"
          subtitle="Successfully delivered"
        />
        <StatsCard
          title="Est. Operations Revenue"
          value={formatCurrency(totalEstimatedRevenue)}
          change={20.0}
          changePeriod="active contracts"
          icon={DollarSign}
          iconBgColor="bg-emerald-500/10 text-emerald-500"
          subtitle="Contracted revenue"
        />
        <StatsCard
          title="On Hold"
          value={onHoldCount}
          change={0}
          changePeriod="paused"
          icon={Clock}
          iconBgColor="bg-amber-500/10 text-amber-500"
          subtitle="Awaiting clearance"
        />
      </div>

      {/* Recharts Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-500" />
              Operational Job Lifecycle Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of active operational jobs across lifecycle stages.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Jobs`, "Volume"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assigned Operations Leads */}
        <Card className="p-5 lg:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Operations Leads & Teams
            </CardTitle>
            <CardDescription>
              Active operations team assignments.
            </CardDescription>
          </CardHeader>
          <div className="space-y-2.5 text-xs">
            {["Vikram Mehta (Air Freight)", "Siddharth Rao (Ocean Export)", "Neha Kapoor (Customs Lead)", "Amit Patel (Transport)"].map((lead, idx) => (
              <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{lead}</span>
                  <span className="text-[10px] text-slate-400">Assigned Jobs: {(idx + 2) * 3}</span>
                </div>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 font-bold px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Enterprise Job DataTable */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            All Operational Jobs ({filteredJobs.length})
          </h3>
        </div>

        <DataTable
          data={filteredJobs}
          columns={columns}
          searchPlaceholder="Search jobs by ID, customer, quotation, route, or cargo..."
          searchKey={(j) => `${j.jobNumber} ${j.customerName} ${j.quotationNumber || ""} ${j.origin} ${j.destination} ${j.cargoDescription}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "All Statuses", value: "ALL" },
                  { label: "Active", value: "Active" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "On Hold", value: "On Hold" },
                  { label: "Delayed", value: "Delayed" },
                  { label: "Completed", value: "Completed" },
                ]}
              />

              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={[
                  { label: "All Priorities", value: "ALL" },
                  { label: "Urgent", value: "Urgent" },
                  { label: "High", value: "High" },
                  { label: "Medium", value: "Medium" },
                  { label: "Low", value: "Low" },
                ]}
              />

              <Select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                options={[
                  { label: "All Modes", value: "ALL" },
                  { label: "Ocean Freight", value: "Ocean Freight" },
                  { label: "Air Freight", value: "Air Freight" },
                  { label: "Road Transport", value: "Road Transport" },
                ]}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
