"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Plus,
  FileCheck,
  Building2,
  Briefcase,
  Ship,
  Boxes,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Calendar,
  PenTool,
} from "lucide-react";
import Link from "next/link";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { Delivery, DeliveryStatus, PODStatus } from "@/types/delivery";
import { CreateDeliveryModal } from "@/components/delivery/create-delivery-modal";
import { DeliveryStatusModal } from "@/components/delivery/delivery-status-modal";
import { PodCaptureModal } from "@/components/delivery/pod-capture-modal";
import { PodVerifyModal } from "@/components/delivery/pod-verify-modal";
import { DeliveryDelayModal } from "@/components/delivery/delivery-delay-modal";
import { DeliveryFailureModal } from "@/components/delivery/delivery-failure-modal";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export default function DeliveryDashboardPage() {
  const {
    deliveries,
    pods,
    filters,
    isLoading,
    fetchDeliveries,
    setFilters,
    clearFilters,
    getDashboardKPIs,
    openCreateModal,
    isCreateModalOpen,
    closeCreateModal,
    openStatusModal,
    isStatusModalOpen,
    closeStatusModal,
    openPodCaptureModal,
    isPodCaptureModalOpen,
    closePodCaptureModal,
    openPodVerifyModal,
    isPodVerifyModalOpen,
    closePodVerifyModal,
    openDelayModal,
    isDelayModalOpen,
    closeDelayModal,
    openFailureModal,
    isFailureModalOpen,
    closeFailureModal,
    selectedDelivery,
    selectedPOD,
  } = useDeliveryStore();

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const kpis = getDashboardKPIs();

  let activeFilterCount = 0;
  if (filters.search) activeFilterCount++;
  if (filters.status && filters.status !== "ALL") activeFilterCount++;
  if (filters.podStatus && filters.podStatus !== "ALL") activeFilterCount++;
  if (filters.priority && filters.priority !== "ALL") activeFilterCount++;

  const podPendingDeliveries = deliveries.filter((d) => d.status === "POD Pending" || d.podStatus === "Under Verification");
  const delayedDeliveries = deliveries.filter((d) => d.status === "Delayed");
  const failedDeliveries = deliveries.filter((d) => d.status === "Failed");

  // Recharts Data
  const statusCounts: Record<string, number> = {};
  deliveries.forEach((d) => {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
  });
  const statusChartData = Object.keys(statusCounts).map((st) => ({
    name: st,
    count: statusCounts[st],
  }));

  const COLORS = ["#34d399", "#38bdf8", "#f59e0b", "#f43f5e", "#a78bfa", "#38bdf8", "#fb7185"];

  // Table Columns
  const columns = [
    {
      key: "deliveryNumber",
      header: "Delivery Order #",
      accessor: (del: Delivery) => (
        <div className="flex items-center gap-2.5 min-w-[180px]">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <Link
              href={`/operations/delivery/${del.id}`}
              className="font-extrabold text-slate-100 hover:text-sky-400 block truncate transition-colors text-xs"
            >
              {del.deliveryNumber}
            </Link>
            {del.dispatchNumber && (
              <span className="text-[10px] text-slate-400 font-mono block">
                Dispatch: {del.dispatchNumber}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold">{del.customerName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "jobId",
      header: "Logistics Hierarchy",
      accessor: (del: Delivery) => (
        <div className="text-[11px] space-y-0.5 min-w-[130px]">
          <Link
            href={`/operations/jobs/${del.jobId || del.jobNumber}`}
            className="font-mono font-bold text-sky-400 hover:underline block"
          >
            {del.jobNumber}
          </Link>
          <span className="text-slate-300 block font-mono text-[10px]">SHP: {del.shipmentNumber}</span>
        </div>
      ),
    },
    {
      key: "deliveryAddress",
      header: "Destination & Contact",
      accessor: (del: Delivery) => (
        <div className="text-[11px] min-w-[180px]">
          <span className="font-bold text-slate-200 block truncate">{del.deliveryCity}, {del.deliveryState}</span>
          <span className="text-slate-400 text-[10px] block truncate">
            Contact: {del.deliveryContactPerson} ({del.deliveryContactPhone})
          </span>
        </div>
      ),
    },
    {
      key: "scheduledDate",
      header: "Schedule & Window",
      accessor: (del: Delivery) => (
        <div className="text-[11px] min-w-[140px]">
          <span className="font-mono font-bold text-slate-200 block">{del.scheduledDate}</span>
          <span className="text-[10px] text-slate-400 block truncate">{del.scheduledTimeWindow}</span>
        </div>
      ),
    },
    {
      key: "vehicleNumber",
      header: "Vehicle & Driver",
      accessor: (del: Delivery) => (
        <div className="text-[11px] min-w-[140px]">
          <span className="font-mono font-bold text-slate-100 block">{del.vehicleNumber || "MH 04 AB 1234"}</span>
          <span className="text-slate-400 text-[10px] block">{del.driverName || "Rahul Shaikh"}</span>
        </div>
      ),
    },
    {
      key: "attemptNumber",
      header: "Attempt #",
      accessor: (del: Delivery) => (
        <span
          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
            del.attemptNumber > 1 ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-slate-800 text-slate-300"
          }`}
        >
          Attempt {del.attemptNumber}
        </span>
      ),
    },
    {
      key: "status",
      header: "Delivery Status",
      accessor: (del: Delivery) => <StatusBadge status={del.status} />,
    },
    {
      key: "podStatus",
      header: "POD Status",
      accessor: (del: Delivery) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            del.podStatus === "Verified"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : del.podStatus === "Under Verification"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          }`}
        >
          {del.podStatus || "Pending"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (del: Delivery) => (
        <div className="flex items-center gap-1.5 min-w-[160px]">
          <Link href={`/operations/delivery/${del.id}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              View
            </Button>
          </Link>

          {del.status === "Delivered" || del.status === "POD Pending" ? (
            <Button
              variant="primary"
              size="xs"
              icon={FileCheck}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => openPodCaptureModal(del)}
            >
              Capture POD
            </Button>
          ) : del.status === "Scheduled" || del.status === "Out for Delivery" || del.status === "Arrived" ? (
            <Button
              variant="outline"
              size="xs"
              icon={Truck}
              className="text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
              onClick={() => openStatusModal(del)}
            >
              Update Status
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <PageHeader
        title="DELIVERY EXECUTION & PROOF OF DELIVERY (POD)"
        subtitle="Customer destination delivery orders, vehicle dispatch schedule, arrival & unloading execution, and digital Proof of Delivery verification."
        breadcrumbs={[{ label: "Operations", href: "/operations/jobs" }, { label: "Delivery Execution" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchDeliveries()}>
              Refresh
            </Button>

            <Link href="/operations/delivery/pod">
              <Button variant="outline" size="sm" icon={ShieldCheck} className="text-emerald-400 border-emerald-500/30">
                POD Verification Queue ({kpis.podPending})
              </Button>
            </Link>

            <Button variant="primary" size="sm" icon={Plus} onClick={() => openCreateModal(null)}>
              Schedule Delivery Order
            </Button>
          </div>
        }
      />

      {/* Top Operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div onClick={() => setFilters({ status: "ALL" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="TOTAL DELIVERIES" value={kpis.total.toString()} icon={Truck} />
        </div>

        <div onClick={() => setFilters({ status: "Scheduled" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="SCHEDULED TODAY" value={kpis.scheduledToday.toString()} icon={Calendar} />
        </div>

        <div onClick={() => setFilters({ status: "Out for Delivery" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="OUT FOR DELIVERY" value={kpis.outForDelivery.toString()} icon={Truck} />
        </div>

        <div onClick={() => setFilters({ status: "Arrived" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="ARRIVING" value={kpis.arriving.toString()} icon={Clock} />
        </div>

        <div onClick={() => setFilters({ status: "Completed" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="DELIVERED TODAY" value={kpis.deliveredToday.toString()} icon={CheckCircle2} />
        </div>

        <div onClick={() => setFilters({ status: "POD Pending" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="POD PENDING" value={kpis.podPending.toString()} icon={FileCheck} />
        </div>

        <div onClick={() => setFilters({ status: "Delayed" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="DELAYED" value={kpis.delayed.toString()} icon={AlertTriangle} />
        </div>

        <div onClick={() => setFilters({ status: "Failed" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="FAILED ATTEMPTS" value={kpis.failed.toString()} icon={AlertOctagon} />
        </div>
      </div>

      {/* Operational Attention Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">{podPendingDeliveries.length} Deliveries Awaiting POD</span>
              <span className="text-[11px] text-amber-200/80 block">Recipient signature & document verification</span>
            </div>
          </div>

          <Link href="/operations/delivery/pod">
            <Button variant="outline" size="xs" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20">
              Verify PODs
            </Button>
          </Link>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-rose-300 block">{failedDeliveries.length} Failed Delivery Attempts</span>
              <span className="text-[11px] text-rose-200/80 block">Recipient unavailable or customer closed</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="xs"
            className="border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
            onClick={() => setFilters({ status: "Failed" })}
          >
            Review Failures
          </Button>
        </div>

        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <span className="font-bold text-sky-300 block">Warehouse Outbound Handoff</span>
              <span className="text-[11px] text-sky-200/80 block">Dispatched warehouse cargo ready for scheduling</span>
            </div>
          </div>

          <Link href="/warehouse/dispatch">
            <Button variant="outline" size="xs" className="border-sky-500/40 text-sky-300 hover:bg-sky-500/20">
              View Dispatches
            </Button>
          </Link>
        </div>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4">
          <CardTitle className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
            Delivery Lifecycle & Status Distribution
          </CardTitle>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData.slice(0, 6)}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusChartData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div>
            <CardTitle className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
              On-Time & POD Verification Metric
            </CardTitle>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">On-Time Delivery Rate</span>
                  <span className="text-slate-400 text-[10px]">Within scheduled window</span>
                </div>
                <span className="font-extrabold font-mono text-emerald-400 text-sm">94.2%</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">POD Verification Compliance</span>
                  <span className="text-slate-400 text-[10px]">Digital POD captured & verified</span>
                </div>
                <span className="font-extrabold font-mono text-sky-400 text-sm">98.5%</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 italic block pt-2 border-t border-slate-800">
            * Operational Rule: Delivery becomes &quot;Completed&quot; only after verified POD sign-off.
          </span>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Search by Delivery #, Job #, Shipment #, Dispatch #, Customer, Vehicle #, Driver, Recipient..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-40">
              <Select
                value={filters.status || "ALL"}
                onChange={(e) => setFilters({ status: e.target.value as any })}
                options={[
                  { label: "All Statuses", value: "ALL" },
                  { label: "Scheduled", value: "Scheduled" },
                  { label: "Out for Delivery", value: "Out for Delivery" },
                  { label: "Arrived", value: "Arrived" },
                  { label: "Delivered", value: "Delivered" },
                  { label: "POD Pending", value: "POD Pending" },
                  { label: "Completed", value: "Completed" },
                  { label: "Delayed", value: "Delayed" },
                  { label: "Failed", value: "Failed" },
                ]}
              />
            </div>

            <div className="w-40">
              <Select
                value={filters.podStatus || "ALL"}
                onChange={(e) => setFilters({ podStatus: e.target.value as any })}
                options={[
                  { label: "All POD Statuses", value: "ALL" },
                  { label: "Verified", value: "Verified" },
                  { label: "Under Verification", value: "Under Verification" },
                  { label: "Pending", value: "Pending" },
                ]}
              />
            </div>

            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="xs"
                onClick={clearFilters}
                className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                Clear Filters ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="p-0 overflow-hidden">
        <DataTable data={deliveries} columns={columns} isLoading={isLoading} />
      </Card>

      {/* Modals */}
      <CreateDeliveryModal isOpen={isCreateModalOpen} onClose={closeCreateModal} delivery={selectedDelivery} />

      <DeliveryStatusModal isOpen={isStatusModalOpen} onClose={closeStatusModal} delivery={selectedDelivery} />

      <PodCaptureModal isOpen={isPodCaptureModalOpen} onClose={closePodCaptureModal} delivery={selectedDelivery} />

      <PodVerifyModal isOpen={isPodVerifyModalOpen} onClose={closePodVerifyModal} pod={selectedPOD} />

      <DeliveryDelayModal isOpen={isDelayModalOpen} onClose={closeDelayModal} delivery={selectedDelivery} />

      <DeliveryFailureModal isOpen={isFailureModalOpen} onClose={closeFailureModal} delivery={selectedDelivery} />
    </div>
  );
}
