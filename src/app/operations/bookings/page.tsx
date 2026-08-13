"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { TableColumn } from "@/types/common";
import { Booking, BookingStatus } from "@/types/booking";
import { useBookingStore } from "@/store/use-booking-store";
import {
  Ship,
  Plane,
  Truck,
  Train,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  ExternalLink,
  Plus,
  BarChart3,
  Search,
  Filter,
  RefreshCw
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
  PieChart,
  Pie
} from "recharts";
import { toast } from "sonner";

export default function BookingsDashboardAndListPage() {
  const { bookings } = useBookingStore();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modeFilter, setModeFilter] = useState<string>("ALL");
  const [carrierFilter, setCarrierFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Calculate Metrics
  const totalBookings = bookings.length;
  const pendingConfirmations = bookings.filter(
    (b) => b.status === "Pending Confirmation" || b.status === "Requested"
  ).length;
  const confirmedCount = bookings.filter((b) => b.status === "Confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "Completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "Cancelled").length;
  const rejectedCount = bookings.filter((b) => b.status === "Rejected").length;
  const amendedCount = bookings.filter(
    (b) => b.status === "Amended" || b.status === "Amendment Requested"
  ).length;

  // Upcoming departures: status is Confirmed or Pending Confirmation, and ETD is today or in the future
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingDepartures = bookings.filter(
    (b) => (b.status === "Confirmed" || b.status === "Pending Confirmation") && b.etd >= todayStr
  );
  
  // Sort upcoming departures by ETD ascending, pick top 6
  const upcomingSorted = [...upcomingDepartures]
    .sort((a, b) => a.etd.localeCompare(b.etd))
    .slice(0, 6);

  // Bookings requiring attention: Rejected, Amendment Requested, or Pending Confirmation with ETD in less than 3 days
  const activeWarningThreshold = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
  const attentionRequired = bookings.filter(
    (b) =>
      b.status === "Rejected" ||
      b.status === "Amendment Requested" ||
      ((b.status === "Pending Confirmation" || b.status === "Requested") && b.etd <= activeWarningThreshold)
  );

  // Chart Data: Transport Mode Distribution
  const modeCounts = bookings.reduce((acc, b) => {
    acc[b.transportMode] = (acc[b.transportMode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const modeData = Object.entries(modeCounts).map(([name, count]) => {
    let color = "#3b82f6"; // blue for sea
    if (name === "Air") color = "#0ea5e9"; // sky for air
    if (name === "Road") color = "#10b981"; // emerald for road
    if (name === "Rail") color = "#f59e0b"; // amber for rail
    if (name === "Multimodal") color = "#8b5cf6"; // purple for multimodal
    return { name, count, color };
  });

  // Chart Data: Carrier Distribution (Top 5)
  const carrierCounts = bookings.reduce((acc, b) => {
    acc[b.carrierName] = (acc[b.carrierName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const carrierData = Object.entries(carrierCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // List of unique carriers & modes for filter selects
  const uniqueCarriers = Array.from(new Set(bookings.map((b) => b.carrierName))).sort();

  // Filter Bookings for List Table
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (modeFilter !== "ALL" && b.transportMode !== modeFilter) return false;
    if (carrierFilter !== "ALL" && b.carrierName !== carrierFilter) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        b.bookingNumber.toLowerCase().includes(q) ||
        b.shipmentId.toLowerCase().includes(q) ||
        b.jobId.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.carrierName.toLowerCase().includes(q) ||
        (b.bookingReference || "").toLowerCase().includes(q) ||
        b.origin.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const activeFiltersCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    (modeFilter !== "ALL" ? 1 : 0) +
    (carrierFilter !== "ALL" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter("ALL");
    setModeFilter("ALL");
    setCarrierFilter("ALL");
    setSearchQuery("");
    toast.info("Cleared all booking filters");
  };

  const columns: TableColumn<Booking>[] = [
    {
      key: "bookingNumber",
      header: "Booking # / Ref",
      accessor: (b) => (
        <div>
          <div className="font-bold text-sky-600 dark:text-sky-400 font-mono text-xs flex items-center gap-1.5">
            <span>{b.bookingNumber}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {b.bookingReference ? `Ref: ${b.bookingReference}` : "Pending Ref"}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "shipmentId",
      header: "Shipment / Job",
      accessor: (b) => (
        <div>
          <div className="text-slate-900 dark:text-slate-100 font-bold font-mono text-xs flex items-center gap-1">
            <span>{b.shipmentId}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Job: {b.jobId}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "customerName",
      header: "Customer",
      accessor: (b) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800 dark:text-slate-200">{b.customerName}</div>
          <div className="text-[10px] text-slate-400 font-medium">Qty: {b.quantity} {b.quantityUnit}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "carrierName",
      header: "Carrier / Mode",
      accessor: (b) => {
        let ModeIcon = Ship;
        if (b.transportMode === "Air") ModeIcon = Plane;
        if (b.transportMode === "Road") ModeIcon = Truck;
        if (b.transportMode === "Rail") ModeIcon = Train;
        if (b.transportMode === "Multimodal") ModeIcon = Layers;

        return (
          <div className="text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <ModeIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{b.carrierName}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">{b.transportMode} Freight</div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "route",
      header: "Route Details",
      accessor: (b) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <span>{b.origin.split(" ")[0]}</span>
            <span className="text-sky-500 font-black">→</span>
            <span>{b.destination.split(" ")[0]}</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
            {b.originPort || b.originAirport || b.pickupLocation || b.origin}
          </div>
        </div>
      ),
    },
    {
      key: "etd",
      header: "ETD / ETA",
      accessor: (b) => (
        <div className="font-mono text-xs">
          <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">D:</span>
            <span>{b.etd}</span>
          </div>
          <div className="text-slate-400 flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">A:</span>
            <span>{b.eta}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (b) => <StatusBadge status={b.status} />,
      sortable: true,
    },
    {
      key: "action",
      header: "Action",
      accessor: (b) => (
        <Link href={`/operations/bookings/${b.id}`}>
          <Button variant="ghost" size="xs" icon={ExternalLink}>
            Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Carrier Bookings Space Command"
        subtitle="Secure and confirm transportation space allocation. Match cargo demands with shipping lines, air carriers, and rail operators."
        breadcrumbs={[{ label: "Operations", href: "/operations/jobs" }, { label: "Bookings" }]}
        actions={
          <Link href="/operations/jobs">
            <Button variant="primary" size="sm" icon={Plus}>
              Create Booking from Shipment
            </Button>
          </Link>
        }
      />

      {/* Main Tabs */}
      <Tabs
        tabs={[
          { id: "dashboard", label: "Operations Dashboard" },
          { id: "directory", label: "Bookings Directory", count: filteredBookings.length }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "dashboard" ? (
        <div className="space-y-6">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            <StatsCard
              title="Total Bookings"
              value={totalBookings}
              change={12.0}
              changePeriod="allocated space"
              icon={Layers}
              iconBgColor="bg-sky-500/10 text-sky-500"
              subtitle="All bookings"
            />
            <StatsCard
              title="Pending Confirmation"
              value={pendingConfirmations}
              change={attentionRequired.length > 0 ? 5.0 : -2.0}
              changePeriod="awaiting carrier ref"
              icon={Clock}
              iconBgColor="bg-amber-500/10 text-amber-500"
              subtitle="Requested & Pending"
            />
            <StatsCard
              title="Confirmed Space"
              value={confirmedCount}
              change={18.0}
              changePeriod="active shipments"
              icon={CheckCircle2}
              iconBgColor="bg-teal-500/10 text-teal-500"
              subtitle="Active carriers space"
            />
            <StatsCard
              title="Amended Bookings"
              value={amendedCount}
              change={0}
              changePeriod="schedule adjustments"
              icon={AlertTriangle}
              iconBgColor="bg-blue-500/10 text-blue-500"
              subtitle="Amended/Requested"
            />
            <StatsCard
              title="Rejected Space"
              value={rejectedCount}
              change={-15.0}
              changePeriod="carrier re-allocation"
              icon={XCircle}
              iconBgColor="bg-rose-500/10 text-rose-500"
              subtitle="Requires action"
            />
            <StatsCard
              title="Completed Flights/Legs"
              value={completedCount}
              change={22.0}
              changePeriod="fulfilled departures"
              icon={CheckCircle2}
              iconBgColor="bg-emerald-500/10 text-emerald-500"
              subtitle="Legs completed"
            />
            <StatsCard
              title="Cancelled Space"
              value={cancelledCount}
              change={0}
              changePeriod="released allocations"
              icon={XCircle}
              iconBgColor="bg-slate-500/10 text-slate-400"
              subtitle="Cancelled bookings"
            />
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mode Distribution Chart */}
            <Card className="p-5 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-500" />
                  Space Leg Distribution
                </CardTitle>
                <CardDescription>
                  Active allocations split by transport mode
                </CardDescription>
              </CardHeader>
              <CardContent className="h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {modeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Bookings`, "Volume"]}
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend list */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2 text-[10px] font-bold">
                  {modeData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-400 uppercase">{d.name} ({d.count})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Carrier Distribution Chart */}
            <Card className="p-5 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Top Carriers & Allocations
                </CardTitle>
                <CardDescription>
                  Volume of bookings handled by top 5 carrier lines
                </CardDescription>
              </CardHeader>
              <CardContent className="h-60 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carrierData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Bookings`, "Space Reserved"]}
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Attention and Upcoming Departures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attention Required */}
            <Card className="p-5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Bookings Requiring Attention ({attentionRequired.length})
                  </CardTitle>
                  <span className="text-[10px] text-slate-400 font-medium">Re-allocation / Amendments</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {attentionRequired.length > 0 ? (
                  attentionRequired.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/10 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/operations/bookings/${b.id}`} className="font-bold text-sky-400 font-mono hover:underline">
                            {b.bookingNumber}
                          </Link>
                          <span className="text-slate-400 font-mono">({b.shipmentId})</span>
                        </div>
                        <p className="text-slate-400">
                          {b.carrierName} • {b.origin.split(" ")[0]} → {b.destination.split(" ")[0]}
                        </p>
                        <p className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
                          <span>ETD: {b.etd}</span>
                          {b.status === "Rejected" && <span>• Carrier Space Rejected</span>}
                          {b.status === "Amendment Requested" && <span>• Amendment Requested</span>}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={b.status} />
                        <Link href={`/operations/bookings/${b.id}`}>
                          <Button variant="outline" size="xs">
                            Resolve
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-center py-12 text-xs">
                    All booking space clear. No active warnings.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Departures */}
            <Card className="p-5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    Upcoming Departures ({upcomingDepartures.length})
                  </CardTitle>
                  <span className="text-[10px] text-slate-400 font-medium">Next 7+ days scheduling</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {upcomingSorted.length > 0 ? (
                  upcomingSorted.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/operations/bookings/${b.id}`} className="font-bold text-sky-500 hover:underline font-mono">
                            {b.bookingNumber}
                          </Link>
                          <span className="text-slate-400 font-mono">({b.shipmentId})</span>
                        </div>
                        <p className="text-slate-900 dark:text-slate-100 font-bold">
                          {b.carrierName} • {b.transportMode} Freight
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          Route: {b.origin} → {b.destination}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="font-mono font-bold text-emerald-400 block">ETD: {b.etd}</span>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-center py-12 text-xs">
                    No upcoming departures scheduled.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Advanced Search & Filtering Area */}
          <Card className="p-4 bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search bookings by ID, shipment, customer, carrier..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950/60 dark:text-white border border-slate-800 rounded-lg focus:outline-none focus:border-sky-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filtering Controls */}
              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap md:flex-nowrap justify-end">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { label: "All Statuses", value: "ALL" },
                    { label: "Draft", value: "Draft" },
                    { label: "Requested", value: "Requested" },
                    { label: "Pending Confirmation", value: "Pending Confirmation" },
                    { label: "Confirmed", value: "Confirmed" },
                    { label: "Amendment Requested", value: "Amendment Requested" },
                    { label: "Amended", value: "Amended" },
                    { label: "Rejected", value: "Rejected" },
                    { label: "Cancelled", value: "Cancelled" },
                    { label: "Completed", value: "Completed" }
                  ]}
                />

                <Select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  options={[
                    { label: "All Modes", value: "ALL" },
                    { label: "Ocean / Sea", value: "Sea" },
                    { label: "Air Freight", value: "Air" },
                    { label: "Road Freight", value: "Road" },
                    { label: "Rail Freight", value: "Rail" },
                    { label: "Multimodal", value: "Multimodal" }
                  ]}
                />

                <Select
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                  options={[
                    { label: "All Carriers", value: "ALL" },
                    ...uniqueCarriers.map((c) => ({ label: c, value: c }))
                  ]}
                />

                {activeFiltersCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="text-rose-400 hover:text-rose-300">
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Bookings Directory Table */}
          <DataTable
            data={filteredBookings}
            columns={columns}
            searchPlaceholder="Refine lookup..."
            searchKey={(b) => `${b.bookingNumber} ${b.shipmentId} ${b.customerName} ${b.carrierName} ${b.bookingReference || ""} ${b.origin} ${b.destination}`}
            emptyMessage="No bookings matching the active filters found."
          />
        </div>
      )}
    </div>
  );
}
