"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Briefcase,
  Ship,
  Boxes,
  ShieldCheck,
  Truck,
  Building2,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  Eye,
  ArrowRight,
  FileText,
  Users,
  DollarSign,
  PackageCheck,
  Layers,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useJobStore } from "@/store/use-job-store";
import { useBookingStore } from "@/store/use-booking-store";
import { useContainerStore } from "@/store/use-container-store";
import { useCustomsStore } from "@/store/use-customs-store";
import { useTransportStore } from "@/store/use-transport-store";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export default function GlobalDashboardPage() {
  const { jobs } = useJobStore();
  const { bookings } = useBookingStore();
  const { containers } = useContainerStore();
  const { declarations } = useCustomsStore();
  const { requests: transportReqs, trips: transportTrips } = useTransportStore();
  const { warehouses, grns, dispatches } = useWarehouseStore();
  const { deliveries, pods } = useDeliveryStore();

  // Operational Metrics
  const activeJobs = jobs.filter((j) => j.status === "Active" || j.status === "In Progress").length;
  const customsPending = declarations.filter((d) => d.status === "Under Assessment" || d.status === "Examination Required").length;
  const inTransitTrips = transportTrips.filter((t) => t.status === "In Transit" || t.status === "Departed").length;
  const pendingGRNs = grns.filter((g) => g.status === "Pending Verification" || g.status === "Discrepancy").length;
  const podPendingDeliveries = deliveries.filter((d) => d.status === "POD Pending" || d.podStatus === "Under Verification").length;
  const completedDeliveries = deliveries.filter((d) => d.status === "Completed" || d.status === "Delivered").length;

  // Visual Chart Data
  const moduleOverviewData = [
    { name: "Jobs", count: jobs.length },
    { name: "Bookings", count: bookings.length },
    { name: "Containers", count: containers.length },
    { name: "Customs", count: declarations.length },
    { name: "Transport", count: transportReqs.length },
    { name: "GRNs", count: grns.length },
    { name: "Deliveries", count: deliveries.length },
  ];

  const COLORS = ["#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#059669"];

  // Master Active Operations Columns
  const activeOpsColumns = [
    {
      key: "jobNumber",
      header: "Operational Job #",
      accessor: (job: any) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="truncate">
            <Link
              href={`/operations/jobs/${job.id}`}
              className="font-extrabold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 block truncate transition-colors text-xs"
            >
              {job.jobNumber || job.id}
            </Link>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{job.customerName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "serviceType",
      header: "Service & Route",
      accessor: (job: any) => (
        <div className="text-[11px] min-w-[150px]">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">{job.serviceType || "Sea Freight Import"}</span>
          <span className="text-slate-500 dark:text-slate-400 text-[10px] block truncate">
            {job.originPort || "Shanghai"} → {job.destinationPort || "Nhava Sheva"}
          </span>
        </div>
      ),
    },
    {
      key: "customsStatus",
      header: "Customs Handoff",
      accessor: (job: any) => {
        const customs = declarations.find((d) => d.jobId === job.id || d.jobNumber === job.jobNumber);
        return customs ? (
          <Link href={`/operations/customs/${customs.id}`}>
            <StatusBadge status={customs.status} />
          </Link>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-[10px] italic">Not Filed</span>
        );
      },
    },
    {
      key: "transportStatus",
      header: "Transport Execution",
      accessor: (job: any) => {
        const tr = transportReqs.find((t) => t.jobId === job.id || t.jobNumber === job.jobNumber);
        return tr ? (
          <Link href={`/operations/transport/${tr.id}`}>
            <StatusBadge status={tr.status} />
          </Link>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-[10px] italic">Pending Transport</span>
        );
      },
    },
    {
      key: "warehouseStatus",
      header: "Warehouse GRN",
      accessor: (job: any) => {
        const grn = grns.find((g) => g.jobId === job.id || g.jobNumber === job.jobNumber);
        return grn ? (
          <Link href="/warehouse/grn">
            <StatusBadge status={grn.status} />
          </Link>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-[10px] italic">No GRN</span>
        );
      },
    },
    {
      key: "deliveryStatus",
      header: "Delivery & POD",
      accessor: (job: any) => {
        const del = deliveries.find((d) => d.jobId === job.id || d.jobNumber === job.jobNumber);
        return del ? (
          <Link href={`/operations/delivery/${del.id}`}>
            <StatusBadge status={del.status} />
          </Link>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-[10px] italic">Pending Delivery</span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (job: any) => (
        <Link href={`/operations/jobs/${job.id}`}>
          <Button variant="outline" size="xs" icon={Eye}>
            View Job
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <PageHeader
        title="LOGISTICS OS — EXECUTIVE OPERATIONAL COMMAND CENTER"
        subtitle="End-to-end multi-modal logistics operating system: CRM, Quotations, Jobs, Shipments, Bookings, Containers, Customs, Transport, Warehouse & POD."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => window.location.reload()}
            >
              Refresh OS
            </Button>

            <Link href="/operations/jobs/create">
              <Button variant="primary" size="sm" icon={Plus}>
                Create Job
              </Button>
            </Link>

            <Link href="/operations/delivery/pod">
              <Button variant="outline" size="sm" icon={ShieldCheck} className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30">
                POD Queue ({podPendingDeliveries})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary OS KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Link href="/operations/jobs">
          <StatsCard title="ACTIVE JOBS" value={activeJobs.toString()} icon={Briefcase} />
        </Link>

        <Link href="/operations/bookings">
          <StatsCard title="VESSEL BOOKINGS" value={bookings.length.toString()} icon={Ship} />
        </Link>

        <Link href="/operations/containers">
          <StatsCard title="CONTAINERS" value={containers.length.toString()} icon={Boxes} />
        </Link>

        <Link href="/operations/customs">
          <StatsCard title="CUSTOMS DECLARATIONS" value={declarations.length.toString()} icon={ShieldCheck} />
        </Link>

        <Link href="/operations/transport">
          <StatsCard title="IN-TRANSIT TRIPS" value={inTransitTrips.toString()} icon={Truck} />
        </Link>

        <Link href="/warehouse/inventory">
          <StatsCard title="WAREHOUSE FACILITIES" value={warehouses.length.toString()} icon={Building2} />
        </Link>

        <Link href="/operations/delivery">
          <StatsCard title="DELIVERIES TODAY" value={deliveries.length.toString()} icon={PackageCheck} />
        </Link>

        <Link href="/operations/delivery/pod">
          <StatsCard title="PODs VERIFIED" value={pods.filter((p) => p.status === "Verified").length.toString()} icon={FileCheck} />
        </Link>
      </div>

      {/* End-to-End Operational Lifecycle Visual Pipeline */}
      <Card className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Logistics OS End-to-End Operational Execution Lifecycle
            </h4>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
            Phases 1 — 14 Live & Connected
          </span>
        </div>

        {/* 10-Step Interactive Pipeline Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 text-xs pt-1">
          <Link href="/sales/crm" className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-colors text-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">1. CRM</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px] block truncate">Leads & RFQs</span>
          </Link>

          <Link href="/sales/quotations" className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-colors text-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">2. QUOTATION</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px] block truncate">Rates & Quotes</span>
          </Link>

          <Link href="/operations/jobs" className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-colors text-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">3. JOB EXECUTION</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px] block truncate">Ops Job Creation</span>
          </Link>

          <Link href="/operations/bookings" className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-colors text-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">4. BOOKING</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px] block truncate">Vessel Booking</span>
          </Link>

          <Link href="/operations/containers" className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-colors text-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">5. CONTAINER</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px] block truncate">Equipment Track</span>
          </Link>

          <Link href="/documents/center" className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-colors text-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">6. DOCUMENTS</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px] block truncate">Document Center</span>
          </Link>

          <Link href="/operations/customs" className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-colors text-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">7. CUSTOMS</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px] block truncate">Port Clearance</span>
          </Link>

          <Link href="/operations/transport" className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-colors text-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">8. TRANSPORT</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px] block truncate">Road Dispatch</span>
          </Link>

          <Link href="/warehouse/inventory" className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-colors text-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block">9. WAREHOUSE</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-[11px] block truncate">GRN & Storage</span>
          </Link>

          <Link href="/operations/delivery" className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/50 hover:border-emerald-400 transition-colors text-center">
            <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block">10. DELIVERY</span>
            <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] block truncate">Customer POD</span>
          </Link>
        </div>
      </Card>

      {/* Operational Attention Alerts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-300 block">{podPendingDeliveries} Deliveries Awaiting POD</span>
              <span className="text-[11px] text-amber-700 dark:text-amber-200/80 block">Recipient E-signature verification</span>
            </div>
          </div>
          <Link href="/operations/delivery/pod">
            <Button variant="outline" size="xs" className="border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20">
              Verify
            </Button>
          </Link>
        </div>

        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <div>
              <span className="font-bold text-sky-900 dark:text-sky-300 block">{pendingGRNs} GRNs Pending Verification</span>
              <span className="text-[11px] text-sky-700 dark:text-sky-200/80 block">Warehouse cargo inspection</span>
            </div>
          </div>
          <Link href="/warehouse/grn">
            <Button variant="outline" size="xs" className="border-sky-300 dark:border-sky-500/40 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20">
              Review
            </Button>
          </Link>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-purple-900 dark:text-purple-300 block">{customsPending} Customs Exam Requests</span>
              <span className="text-[11px] text-purple-700 dark:text-purple-200/80 block">Port customs assessment</span>
            </div>
          </div>
          <Link href="/operations/customs">
            <Button variant="outline" size="xs" className="border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/20">
              Inspect
            </Button>
          </Link>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block">{inTransitTrips} Road Trips In Transit</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-200/80 block">Highway haulage dispatch</span>
            </div>
          </div>
          <Link href="/operations/transport">
            <Button variant="outline" size="xs" className="border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20">
              Track
            </Button>
          </Link>
        </div>
      </div>

      {/* Recharts Operations Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <CardTitle className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">
            Module Record Volumes Across Operating System
          </CardTitle>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleOverviewData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px", color: "#f8fafc" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {moduleOverviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <CardTitle className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">
              System Execution Compliance
            </CardTitle>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-200 block">Customs Clearance Rate</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Duty paid & released</span>
                </div>
                <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400 text-sm">96.8%</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-200 block">POD Verification Rate</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Digital recipient POD signed</span>
                </div>
                <span className="font-extrabold font-mono text-sky-600 dark:text-sky-400 text-sm">98.5%</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] text-slate-500 dark:text-slate-400 italic block pt-2 border-t border-slate-200 dark:border-slate-800">
            * All 14 operational modules interconnected with real mock datasets.
          </span>
        </Card>
      </div>

      {/* Master Active Operations Table */}
      <Card className="p-0 overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Active Multi-Modal Jobs Command Console
          </h4>
          <Link href="/operations/jobs" className="text-sky-600 dark:text-sky-400 text-xs font-bold hover:underline flex items-center gap-1">
            View All Jobs ({jobs.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable data={jobs.slice(0, 10)} columns={activeOpsColumns} isLoading={false} />
      </Card>
    </div>
  );
}
