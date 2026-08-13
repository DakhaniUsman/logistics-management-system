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
import { Container, ContainerStatus, ContainerCondition } from "@/types/container";
import { useContainers } from "@/hooks/use-containers";
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Anchor,
  Activity,
  Plus,
  BarChart3,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Compass,
  Gauge
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

export default function ContainersDashboardAndListPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sizeFilter, setSizeFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [conditionFilter, setConditionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Load Unfiltered Containers for metrics calculation
  const { data: allContainers = [], isLoading: isMetricsLoading } = useContainers({});

  // Load Filtered Containers for table display
  const activeFilters = {
    status: statusFilter === "ALL" ? undefined : (statusFilter as ContainerStatus),
    size: sizeFilter === "ALL" ? undefined : sizeFilter,
    type: typeFilter === "ALL" ? undefined : typeFilter,
    condition: conditionFilter === "ALL" ? undefined : (conditionFilter as ContainerCondition),
    search: searchQuery || undefined
  };
  
  const { data: filteredContainers = [], isLoading: isTableLoading } = useContainers(activeFilters);

  // Calculate Metrics from all containers
  const totalCount = allContainers.length;
  const assignedCount = allContainers.filter((c) => c.bookingId).length;
  const emptyCount = allContainers.filter((c) => ["Empty", "Available", "Returned"].includes(c.status)).length;
  const loadedCount = allContainers.filter((c) => c.status === "Loaded").length;
  const inTransitCount = allContainers.filter((c) => ["Departed", "In Transit"].includes(c.status)).length;
  const atPortCount = allContainers.filter((c) => ["Gate In", "At Destination"].includes(c.status)).length;
  const customsHoldCount = allContainers.filter((c) => c.status === "Customs Hold").length;
  const damagedCount = allContainers.filter((c) => ["Damaged", "Critical Damage", "Inspection Required"].includes(c.condition)).length;

  // Filter container list requiring immediate operational attention
  const attentionRequired = allContainers.filter(
    (c) =>
      c.status === "Customs Hold" ||
      c.sealStatus === "Broken" ||
      ["Damaged", "Critical Damage", "Inspection Required"].includes(c.condition)
  ).slice(0, 5);

  // Upcoming arrivals: currently in transit, arrival date sorted ascending
  const upcomingArrivals = allContainers
    .filter((c) => ["In Transit", "Departed"].includes(c.status) && c.arrivalDate)
    .sort((a, b) => (a.arrivalDate || "").localeCompare(b.arrivalDate || ""))
    .slice(0, 5);

  // Recent activities aggregate across all containers
  const recentActivities = allContainers
    .flatMap((c) =>
      (c.activities || []).map((act) => ({
        ...act,
        containerNumber: c.containerNumber,
        containerId: c.id
      }))
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6);

  // Chart 1: Container Size Distribution
  const sizeDistribution = allContainers.reduce((acc, c) => {
    acc[c.containerSize] = (acc[c.containerSize] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sizeChartData = Object.entries(sizeDistribution).map(([name, count]) => {
    let color = "#3b82f6"; // Blue
    if (name === "20FT") color = "#0ea5e9"; // Sky
    if (name === "40FT HC") color = "#8b5cf6"; // Purple
    if (name === "45FT") color = "#10b981"; // Emerald
    return { name, value: count, color };
  });

  // Chart 2: Container Type Distribution
  const typeDistribution = allContainers.reduce((acc, c) => {
    acc[c.containerType] = (acc[c.containerType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(typeDistribution).map(([name, count]) => ({
    name,
    count
  }));

  const activeFiltersCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    (sizeFilter !== "ALL" ? 1 : 0) +
    (typeFilter !== "ALL" ? 1 : 0) +
    (conditionFilter !== "ALL" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter("ALL");
    setSizeFilter("ALL");
    setTypeFilter("ALL");
    setConditionFilter("ALL");
    setSearchQuery("");
    toast.info("Cleared all container search filters");
  };

  const columns: TableColumn<Container>[] = [
    {
      key: "containerNumber",
      header: "Container # / ISO",
      accessor: (c) => (
        <div>
          <div className="font-bold text-sky-400 font-mono text-xs flex items-center gap-1.5">
            <span>{c.containerNumber}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {c.containerSize} • {c.containerType} ({c.isoCode})
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: "shipmentId",
      header: "Shipment / Booking",
      accessor: (c) => (
        <div className="font-mono text-xs">
          {c.bookingId ? (
            <>
              <div className="text-slate-200 font-bold">{c.shipmentId}</div>
              <div className="text-[10px] text-slate-400">BKG: {c.bookingId}</div>
            </>
          ) : (
            <span className="text-slate-500 italic">Unassigned Pool</span>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: "customerName",
      header: "Customer",
      accessor: (c) => (
        <div className="text-xs">
          {c.customerName ? (
            <>
              <div className="font-semibold text-slate-200 truncate max-w-[120px]">{c.customerName}</div>
              <div className="text-[10px] text-slate-400 font-mono">Job: {c.jobId}</div>
            </>
          ) : (
            <span className="text-slate-500 italic">No Client Alloc.</span>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: "route",
      header: "Leg Route",
      accessor: (c) => (
        <div className="text-xs">
          {c.origin ? (
            <>
              <div className="font-semibold text-slate-200 flex items-center gap-1">
                <span>{c.origin.split(" ")[0]}</span>
                <span className="text-sky-500 font-bold">→</span>
                <span>{c.destination.split(" ")[0]}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{c.currentLocation}</div>
            </>
          ) : (
            <span className="text-slate-500 italic">Standing in Yard</span>
          )}
        </div>
      )
    },
    {
      key: "sealNumber",
      header: "Seal Reference",
      accessor: (c) => (
        <div className="font-mono text-xs">
          {c.sealNumber ? (
            <>
              <span className="text-teal-400 font-bold">{c.sealNumber}</span>
              <span className="block text-[9px] text-slate-500">{c.sealStatus}</span>
            </>
          ) : (
            <span className="text-slate-500 italic">No Seal Lock</span>
          )}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      accessor: (c) => <StatusBadge status={c.status} />,
      sortable: true
    },
    {
      key: "condition",
      header: "Condition",
      accessor: (c) => {
        let textStyle = "text-emerald-400";
        if (c.condition === "Minor Damage") textStyle = "text-amber-400";
        if (["Damaged", "Critical Damage"].includes(c.condition)) textStyle = "text-rose-400";
        if (c.condition === "Inspection Required") textStyle = "text-sky-400";
        return <span className={`text-xs font-bold ${textStyle}`}>{c.condition}</span>;
      },
      sortable: true
    },
    {
      key: "weights",
      header: "Gross Weight (Utilization)",
      accessor: (c) => {
        const gross = c.tareWeight + c.cargoWeight;
        const util = c.maxGrossWeight ? ((gross / c.maxGrossWeight) * 100).toFixed(0) : "0";
        return (
          <div className="text-xs">
            <span className="font-bold text-slate-200 font-mono">{gross.toLocaleString()} kg</span>
            {c.maxGrossWeight > 0 && (
              <span className="block text-[9px] text-slate-400">Cap: {util}% / {c.maxGrossWeight.toLocaleString()} kg</span>
            )}
          </div>
        );
      }
    },
    {
      key: "action",
      header: "Action",
      accessor: (c) => (
        <Link href={`/operations/containers/${c.id}`}>
          <Button variant="ghost" size="xs" icon={ExternalLink}>
            Open Details
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Physical Containers & Equipment Desk"
        subtitle="Manage yard depots, track loaded and transit-leg cargo container metrics, verify seal numbers, and audit damage logs."
        breadcrumbs={[{ label: "Operations", href: "/operations/jobs" }, { label: "Containers" }]}
        actions={
          <Link href="/operations/containers/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Register New Container Unit
            </Button>
          </Link>
        }
      />

      {/* Main Tabs */}
      <Tabs
        tabs={[
          { id: "dashboard", label: "Equipment Dashboard" },
          { id: "directory", label: "Containers Inventory", count: filteredContainers.length }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "dashboard" ? (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
            <StatsCard
              title="Total Containers"
              value={totalCount}
              change={0}
              changePeriod="equipment units"
              icon={Layers}
              iconBgColor="bg-sky-500/10 text-sky-500"
              subtitle="Total inventory"
            />
            <StatsCard
              title="Assigned Capacity"
              value={assignedCount}
              change={0}
              changePeriod="linked to bookings"
              icon={CheckCircle2}
              iconBgColor="bg-blue-500/10 text-blue-400"
              subtitle="Cargo space active"
            />
            <StatsCard
              title="Loaded Containers"
              value={loadedCount}
              change={0}
              changePeriod="stowed cargo"
              icon={Gauge}
              iconBgColor="bg-teal-500/10 text-teal-500"
              subtitle="Vessel stowed"
            />
            <StatsCard
              title="In Transit"
              value={inTransitCount}
              change={0}
              changePeriod="voyages/legs"
              icon={Compass}
              iconBgColor="bg-sky-500/10 text-sky-400"
              subtitle="Active sea/road legs"
            />
            <StatsCard
              title="Empty / Yard Stock"
              value={emptyCount}
              change={0}
              changePeriod="available units"
              icon={Clock}
              iconBgColor="bg-slate-500/10 text-slate-400"
              subtitle="Unassigned / Returned"
            />
            <StatsCard
              title="Port Gate-In"
              value={atPortCount}
              change={0}
              changePeriod="origin depot"
              icon={Anchor}
              iconBgColor="bg-emerald-500/10 text-emerald-500"
              subtitle="Gated at POL"
            />
            <StatsCard
              title="Customs Hold"
              value={customsHoldCount}
              change={0}
              changePeriod="clearance hold"
              icon={ShieldAlert}
              iconBgColor="bg-rose-500/10 text-rose-500"
              subtitle="Inspect needed"
            />
            <StatsCard
              title="Damaged Equipment"
              value={damagedCount}
              change={0}
              changePeriod="requires repair"
              icon={AlertTriangle}
              iconBgColor="bg-rose-500/10 text-rose-500"
              subtitle="Yard repairs"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Container Size split */}
            <Card className="p-5 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-500" />
                  Equipment Size Split
                </CardTitle>
                <CardDescription>
                  Share of active container lengths
                </CardDescription>
              </CardHeader>
              <CardContent className="h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sizeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sizeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Units`, "Quantity"]}
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legends */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2 text-[10px] font-bold">
                  {sizeChartData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-400">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Type split */}
            <Card className="p-5 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Equipment Type Allocation
                </CardTitle>
                <CardDescription>
                  Quantity breakdown across active container types
                </CardDescription>
              </CardHeader>
              <CardContent className="h-60 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Units`, "Quantity"]}
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                      {typeChartData.map((entry, index) => {
                        const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#0ea5e9"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Attention, Arrivals, & Activity panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attention Required Panel */}
            <Card className="p-5 col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Containers Requiring Action ({attentionRequired.length})
                </CardTitle>
                <CardDescription>
                  Units flagged with holds, damage reports, or broken seals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {attentionRequired.length > 0 ? (
                  attentionRequired.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/10 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/operations/containers/${c.id}`} className="font-bold text-sky-400 font-mono hover:underline">
                            {c.containerNumber}
                          </Link>
                          <span className="text-[10px] text-slate-400">{c.containerSize}</span>
                        </div>
                        <p className="text-slate-300">
                          {c.currentLocation} ({c.currentCountry})
                        </p>
                        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wide">
                          {c.status === "Customs Hold" ? "CUSTOMS HOLD" 
                            : c.sealStatus === "Broken" ? "BROKEN SEAL WARNING"
                            : `${c.condition} Equipment`}
                        </p>
                      </div>
                      <Link href={`/operations/containers/${c.id}`}>
                        <Button variant="outline" size="xs">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-center py-12 text-xs">
                    All containers clear. No active equipment issues.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Approaching Destination Panel */}
            <Card className="p-5 col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-500" />
                  Approaching Destination
                </CardTitle>
                <CardDescription>
                  In-transit legs approaching port discharge / delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {upcomingArrivals.length > 0 ? (
                  upcomingArrivals.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900/20 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/operations/containers/${c.id}`} className="font-bold text-sky-400 font-mono hover:underline">
                            {c.containerNumber}
                          </Link>
                          <span className="text-[10px] text-slate-400">{c.containerSize}</span>
                        </div>
                        <p className="text-slate-300">
                          To: {c.destination.split(" ")[0]}
                        </p>
                        <p className="text-[10px] text-sky-400 font-semibold">
                          ETA: {c.arrivalDate || "Pending Schedule"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-center py-12 text-xs">
                    No active in-transit containers approaching destination.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Equipment Activities */}
            <Card className="p-5 col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Recent Yard Logs
                </CardTitle>
                <CardDescription>
                  Real-time events across container fleet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act, index) => (
                    <div key={`${act.id}-${index}`} className="text-xs space-y-1 border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <Link href={`/operations/containers/${act.containerId}`} className="font-bold font-mono text-sky-400 hover:underline">
                          {act.containerNumber}
                        </Link>
                        <span className="text-[9px] text-slate-500 font-mono">{act.timestamp}</span>
                      </div>
                      <p className="text-slate-200 font-medium">{act.title}</p>
                      <p className="text-[10px] text-slate-400 italic">{act.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-center py-12 text-xs">
                    No recent equipment activities logged.
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
                  placeholder="Search by container #, seal #, customer, current location..."
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
                    { label: "Available", value: "Available" },
                    { label: "Assigned", value: "Assigned" },
                    { label: "Empty", value: "Empty" },
                    { label: "Picked Up", value: "Picked Up" },
                    { label: "At Origin", value: "At Origin" },
                    { label: "Gate In", value: "Gate In" },
                    { label: "Loaded", value: "Loaded" },
                    { label: "Departed", value: "Departed" },
                    { label: "In Transit", value: "In Transit" },
                    { label: "At Destination", value: "At Destination" },
                    { label: "Customs Hold", value: "Customs Hold" },
                    { label: "Released", value: "Released" },
                    { label: "Out for Delivery", value: "Out for Delivery" },
                    { label: "Delivered", value: "Delivered" },
                    { label: "Empty Return Pending", value: "Empty Return Pending" },
                    { label: "Returned", value: "Returned" },
                    { label: "Damaged", value: "Damaged" },
                    { label: "Lost", value: "Lost" }
                  ]}
                />

                <Select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  options={[
                    { label: "All Sizes", value: "ALL" },
                    { label: "20FT Container", value: "20FT" },
                    { label: "40FT Container", value: "40FT" },
                    { label: "40FT High Cube", value: "40FT HC" },
                    { label: "45FT Container", value: "45FT" }
                  ]}
                />

                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  options={[
                    { label: "All Types", value: "ALL" },
                    { label: "Dry Van (General)", value: "Dry Van" },
                    { label: "Reefer (Cold Chain)", value: "Reefer" },
                    { label: "Open Top", value: "Open Top" },
                    { label: "Flat Rack", value: "Flat Rack" },
                    { label: "Tank Container", value: "Tank" },
                    { label: "High Cube Dry", value: "High Cube" }
                  ]}
                />

                <Select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  options={[
                    { label: "All Conditions", value: "ALL" },
                    { label: "Good Condition", value: "Good" },
                    { label: "Minor Damage", value: "Minor Damage" },
                    { label: "Damaged", value: "Damaged" },
                    { label: "Critical Damage", value: "Critical Damage" },
                    { label: "Inspection Required", value: "Inspection Required" }
                  ]}
                />

                {activeFiltersCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="text-rose-400 hover:text-rose-300">
                    Reset ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Table Container */}
          <Card className="border border-slate-200 dark:border-slate-800">
            {isTableLoading ? (
              <div className="p-16 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
                Querying active equipment database...
              </div>
            ) : (
              <DataTable
                data={filteredContainers}
                columns={columns}
                searchPlaceholder="Refine equipment lookup..."
                searchKey={(c) => `${c.containerNumber} ${c.sealNumber || ""} ${c.customerName || ""} ${c.shipmentId || ""} ${c.currentLocation}`}
                emptyMessage="No container records matching the active filters found."
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
