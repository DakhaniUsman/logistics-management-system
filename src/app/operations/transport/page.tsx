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
  UserCheck,
  Building2,
  Briefcase,
  Ship,
  Boxes,
  Lock,
  ArrowRight,
  FileText,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useTransportStore } from "@/store/use-transport-store";
import { TransportRequest, VEHICLE_TYPES, TransportRequestStatus } from "@/types/transport";
import { TransportRequestModal } from "@/components/transport/transport-request-modal";
import { AssignTransportModal } from "@/components/transport/assign-transport-modal";
import { TransportStatusModal } from "@/components/transport/transport-status-modal";
import { TransportDelayModal } from "@/components/transport/transport-delay-modal";
import { TransportExpenseModal } from "@/components/transport/transport-expense-modal";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export default function TransportDashboardPage() {
  const {
    requests,
    trips,
    filters,
    isLoading,
    fetchRequests,
    setFilters,
    clearFilters,
    getDashboardKPIs,
    openRequestModal,
    isRequestModalOpen,
    closeRequestModal,
    selectedRequest,
    isAssignModalOpen,
    closeAssignModal,
    openAssignModal,
    selectedTrip,
    isStatusModalOpen,
    closeStatusModal,
    openStatusModal,
    isDelayModalOpen,
    closeDelayModal,
    openDelayModal,
    isExpenseModalOpen,
    closeExpenseModal,
    openExpenseModal,
  } = useTransportStore();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const kpis = getDashboardKPIs();

  let activeFilterCount = 0;
  if (filters.search) activeFilterCount++;
  if (filters.status && filters.status !== "ALL") activeFilterCount++;
  if (filters.priority && filters.priority !== "ALL") activeFilterCount++;
  if (filters.vehicleType && filters.vehicleType !== "ALL") activeFilterCount++;

  const pendingAssignmentReqs = requests.filter((r) => r.status === "Pending Assignment");
  const delayedTrips = trips.filter((t) => t.status === "Delayed");

  // Recharts Data
  const statusCounts: Record<string, number> = {};
  requests.forEach((r) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });
  const statusChartData = Object.keys(statusCounts).map((st) => ({
    name: st,
    count: statusCounts[st],
  }));

  const COLORS = ["#38bdf8", "#34d399", "#f59e0b", "#f43f5e", "#a78bfa", "#38bdf8", "#fb7185"];

  // Table Columns
  const columns = [
    {
      key: "requestNumber",
      header: "Request & Trip #",
      accessor: (req: TransportRequest) => (
        <div className="flex items-center gap-2.5 min-w-[190px]">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <Link
              href={`/operations/transport/${req.id}`}
              className="font-extrabold text-slate-100 hover:text-sky-400 block truncate transition-colors text-xs"
            >
              {req.requestNumber}
            </Link>
            {req.tripId && (
              <span className="text-[11px] text-emerald-400 font-mono block font-bold">
                Trip: {req.tripId}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold">{req.requiredVehicleType}</span>
          </div>
        </div>
      ),
    },
    {
      key: "jobId",
      header: "Logistics Hierarchy",
      accessor: (req: TransportRequest) => (
        <div className="text-[11px] space-y-0.5 min-w-[130px]">
          <Link
            href={`/operations/jobs/${req.jobId || req.jobNumber}`}
            className="font-mono font-bold text-sky-400 hover:underline block"
          >
            {req.jobNumber}
          </Link>
          <span className="text-slate-300 block font-mono text-[10px]">SHP: {req.shipmentNumber}</span>
          {req.containerNumbers.length > 0 && (
            <span className="text-cyan-400 block font-mono text-[10px]">
              CON: {req.containerNumbers[0]}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "pickupLocation",
      header: "Transport Route",
      accessor: (req: TransportRequest) => (
        <div className="text-[11px] min-w-[180px]">
          <span className="font-bold text-slate-200 block truncate">{req.pickupLocation}</span>
          <span className="text-sky-400 text-[10px] flex items-center gap-1 font-semibold">
            ↓ {req.destinationLocation}
          </span>
        </div>
      ),
    },
    {
      key: "pickupDate",
      header: "Schedule & Priority",
      accessor: (req: TransportRequest) => (
        <div className="text-[11px]">
          <span className="font-mono font-bold text-slate-200 block">{req.pickupDate} ({req.pickupTime})</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              req.priority === "Critical" || req.priority === "Urgent"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {req.priority} Priority
          </span>
        </div>
      ),
    },
    {
      key: "assignedVehicleNumber",
      header: "Vehicle & Driver",
      accessor: (req: TransportRequest) => (
        <div className="text-[11px] min-w-[140px]">
          {req.assignedVehicleNumber ? (
            <>
              <span className="font-mono font-bold text-slate-100 block">{req.assignedVehicleNumber}</span>
              <span className="text-slate-400 text-[10px] block">{req.assignedDriverName || "Driver Assigned"}</span>
            </>
          ) : (
            <span className="text-amber-400 text-[11px] font-semibold italic block">
              Pending Vehicle Assignment
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Execution Status",
      accessor: (req: TransportRequest) => <StatusBadge status={req.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (req: TransportRequest) => {
        const matchingTrip = trips.find((t) => t.id === req.tripId || t.transportRequestId === req.id);
        return (
          <div className="flex items-center gap-1.5 min-w-[150px]">
            <Link href={`/operations/transport/${req.id}`}>
              <Button variant="outline" size="xs" icon={Eye}>
                View
              </Button>
            </Link>

            {req.status === "Pending Assignment" ? (
              <Button
                variant="primary"
                size="xs"
                icon={UserCheck}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => openAssignModal(req)}
              >
                Assign
              </Button>
            ) : matchingTrip ? (
              <Button
                variant="outline"
                size="xs"
                icon={Truck}
                className="text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
                onClick={() => openStatusModal(matchingTrip)}
              >
                Update
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <PageHeader
        title="TRANSPORT MANAGEMENT & ROAD DISPATCH"
        subtitle="End-to-end container haulage, vehicle dispatch, driver assignment, road trip execution milestones, and transport cost tracking."
        breadcrumbs={[{ label: "Operations", href: "/operations/jobs" }, { label: "Transport Execution" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchRequests()}>
              Refresh
            </Button>

            <Link href="/documents/center">
              <Button variant="outline" size="sm" icon={FileText}>
                Document Center
              </Button>
            </Link>

            <Button variant="primary" size="sm" icon={Plus} onClick={() => openRequestModal(null)}>
              Create Transport Request
            </Button>
          </div>
        }
      />

      {/* Top Operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div onClick={() => setFilters({ status: "ALL" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="TOTAL REQUESTS" value={kpis.total.toString()} icon={Truck} />
        </div>

        <div onClick={() => setFilters({ status: "Pending Assignment" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="PENDING ASSIGNMENT" value={kpis.pendingAssignment.toString()} icon={Clock} />
        </div>

        <div onClick={() => setFilters({ status: "Scheduled" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="SCHEDULED TRIPS" value={kpis.scheduled.toString()} icon={UserCheck} />
        </div>

        <div onClick={() => setFilters({ status: "In Transit" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="IN TRANSIT" value={kpis.inTransit.toString()} icon={Truck} />
        </div>

        <div onClick={() => setFilters({ status: "Arrived" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="ARRIVING TODAY" value={kpis.arrivingToday.toString()} icon={CheckCircle2} />
        </div>

        <div onClick={() => setFilters({ status: "Delayed" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="DELAYED TRIPS" value={kpis.delayed.toString()} icon={AlertTriangle} />
        </div>

        <div onClick={() => setFilters({ status: "Completed" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="COMPLETED TRIPS" value={kpis.completed.toString()} icon={CheckCircle2} />
        </div>

        <div onClick={() => setFilters({ status: "On Hold" })} className="cursor-pointer transition-transform hover:scale-105">
          <StatsCard title="ON HOLD" value={kpis.onHold.toString()} icon={Lock} />
        </div>
      </div>

      {/* Operational Attention Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">{pendingAssignmentReqs.length} Requests Need Vehicle Assignment</span>
              <span className="text-[11px] text-amber-200/80 block">Unassigned port drayage & haulage orders</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="xs"
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
            onClick={() => setFilters({ status: "Pending Assignment" })}
          >
            Assign Vehicles
          </Button>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-rose-300 block">{delayedTrips.length} Active Trips Delayed</span>
              <span className="text-[11px] text-rose-200/80 block">Highway congestion & breakdown exceptions</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="xs"
            className="border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
            onClick={() => setFilters({ status: "Delayed" })}
          >
            Review Delays
          </Button>
        </div>

        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <span className="font-bold text-sky-300 block">Operational Custom Hand-off</span>
              <span className="text-[11px] text-sky-200/80 block">Customs released containers ready for dispatch</span>
            </div>
          </div>

          <Link href="/operations/customs">
            <Button variant="outline" size="xs" className="border-sky-500/40 text-sky-300 hover:bg-sky-500/20">
              View Customs
            </Button>
          </Link>
        </div>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4">
          <CardTitle className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
            Transport Trip Execution Distribution
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
              Fleet Capacity Utilization
            </CardTitle>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">40 FT Container Trucks</span>
                  <span className="text-slate-400 text-[10px]">Heavy port haulage</span>
                </div>
                <span className="font-extrabold font-mono text-sky-400 text-sm">
                  {requests.filter((r) => r.requiredVehicleType === "40 FT Container Truck").length}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Trailer & Flatbed Trucks</span>
                  <span className="text-slate-400 text-[10px]">Specialized chemical/hazmat</span>
                </div>
                <span className="font-extrabold font-mono text-emerald-400 text-sm">
                  {requests.filter((r) => r.requiredVehicleType === "Trailer / Flatbed").length}
                </span>
              </div>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 italic block pt-2 border-t border-slate-800">
            * Operational execution handoff from Phase 11 Customs Releases.
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
              placeholder="Search by Request #, Trip #, Job #, Shipment #, Container #, Customer, Vehicle #, Driver, Vendor..."
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
                  { label: "Pending Assignment", value: "Pending Assignment" },
                  { label: "Scheduled", value: "Scheduled" },
                  { label: "In Transit", value: "In Transit" },
                  { label: "Arrived", value: "Arrived" },
                  { label: "Completed", value: "Completed" },
                  { label: "Delayed", value: "Delayed" },
                ]}
              />
            </div>

            <div className="w-40">
              <Select
                value={filters.vehicleType || "ALL"}
                onChange={(e) => setFilters({ vehicleType: e.target.value as any })}
                options={[
                  { label: "All Vehicle Types", value: "ALL" },
                  ...VEHICLE_TYPES.map((v) => ({ label: v, value: v })),
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
        <DataTable data={requests} columns={columns} isLoading={isLoading} />
      </Card>

      {/* Modals */}
      <TransportRequestModal
        isOpen={isRequestModalOpen}
        onClose={closeRequestModal}
        request={selectedRequest}
      />

      <AssignTransportModal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        request={selectedRequest}
      />

      <TransportStatusModal
        isOpen={isStatusModalOpen}
        onClose={closeStatusModal}
        trip={selectedTrip}
      />

      <TransportDelayModal
        isOpen={isDelayModalOpen}
        onClose={closeDelayModal}
        trip={selectedTrip}
      />

      <TransportExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={closeExpenseModal}
        trip={selectedTrip}
      />
    </div>
  );
}
