"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TableColumn } from "@/types/common";
import { Shipment, ShipmentStatus, TransportMode } from "@/types/shipment";
import { useShipmentStore } from "@/store/use-shipment-store";
import { useJobStore } from "@/store/use-job-store";
import { formatCurrency } from "@/lib/utils";
import {
  Ship,
  Plane,
  Truck,
  Train,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Plus,
  ExternalLink,
  Calendar,
  MapPin,
  Search,
  Filter,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Download,
  FileText,
  Eye,
  AlertCircle,
  Anchor,
  Box,
  TrendingUp,
  BarChart3,
  CheckSquare,
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
  Pie,
} from "recharts";
import { toast } from "sonner";

export default function ShipmentsDashboardAndListPage() {
  const {
    shipments,
    updateShipmentStatus,
    markShipmentDelayed,
    clearShipmentDelay,
  } = useShipmentStore();

  const { jobs } = useJobStore();

  const [activeTab, setActiveTab] = useState("dashboard");

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modeFilter, setModeFilter] = useState<string>("ALL");
  const [carrierFilter, setCarrierFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dialog Controls
  const [statusModalShipment, setStatusModalShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>("In Transit");
  const [statusNotes, setStatusNotes] = useState("");

  const [delayModalShipment, setDelayModalShipment] = useState<Shipment | null>(null);
  const [delayDays, setDelayDays] = useState(2);
  const [delayReason, setDelayReason] = useState("Feeder vessel connection missed / Port terminal congestion");

  // Calculate Metrics
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter((s) => s.status === "In Transit").length;
  const delayedShipments = shipments.filter((s) => s.status === "Delayed" || s.isDelayed);
  const delayedCount = delayedShipments.length;
  const deliveredCount = shipments.filter(
    (s) => s.status === "Delivered" || s.status === "Completed"
  ).length;
  const bookedCount = shipments.filter(
    (s) => s.status === "Booked" || s.status === "Cargo Ready"
  ).length;
  const pendingBookingCount = shipments.filter(
    (s) => s.status === "Booking Pending" || s.status === "Scheduled" || s.status === "Draft"
  ).length;

  const totalTonnageKg = shipments.reduce((sum, s) => sum + (s.weight || 0), 0);
  const totalTonnageMT = (totalTonnageKg / 1000).toFixed(1);
  const totalVolumeCBM = shipments.reduce((sum, s) => sum + (s.volume || 0), 0).toFixed(0);
  const totalEstRevenue = shipments.reduce((sum, s) => sum + (s.estimatedRevenue || 0), 0);

  // Distinct carriers for filter
  const distinctCarriers = useMemo(() => {
    const set = new Set<string>();
    shipments.forEach((s) => {
      if (s.carrierName) set.add(s.carrierName);
    });
    return Array.from(set).sort();
  }, [shipments]);

  // Filtered Shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (modeFilter !== "ALL" && s.transportMode !== modeFilter) return false;
      if (carrierFilter !== "ALL" && s.carrierName !== carrierFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNumber = s.shipmentNumber?.toLowerCase().includes(query) || s.id.toLowerCase().includes(query);
        const matchesJob = s.jobNumber?.toLowerCase().includes(query) || s.jobId?.toLowerCase().includes(query);
        const matchesCustomer = s.customerName?.toLowerCase().includes(query);
        const matchesRoute =
          s.origin?.toLowerCase().includes(query) ||
          s.destination?.toLowerCase().includes(query) ||
          s.originCountry?.toLowerCase().includes(query) ||
          s.destinationCountry?.toLowerCase().includes(query);
        const matchesCarrier =
          s.carrierName?.toLowerCase().includes(query) ||
          s.vesselName?.toLowerCase().includes(query) ||
          s.flightNumber?.toLowerCase().includes(query) ||
          s.vehicleNumber?.toLowerCase().includes(query);
        const matchesCargo = s.cargoDescription?.toLowerCase().includes(query);

        if (!matchesNumber && !matchesJob && !matchesCustomer && !matchesRoute && !matchesCarrier && !matchesCargo) {
          return false;
        }
      }
      return true;
    });
  }, [shipments, statusFilter, modeFilter, carrierFilter, searchQuery]);

  // Chart Data: Transport Mode Breakdown
  const modeData = useMemo(() => {
    const counts: Record<string, number> = { Sea: 0, Air: 0, Road: 0, Rail: 0, Multimodal: 0 };
    shipments.forEach((s) => {
      if (counts[s.transportMode] !== undefined) counts[s.transportMode]++;
    });
    return [
      { name: "Ocean Freight", count: counts.Sea, color: "#0284c7" },
      { name: "Air Cargo", count: counts.Air, color: "#38bdf8" },
      { name: "Road Transport", count: counts.Road, color: "#10b981" },
      { name: "Rail Intermodal", count: counts.Rail, color: "#f59e0b" },
      { name: "Multimodal", count: counts.Multimodal, color: "#8b5cf6" },
    ].filter((d) => d.count > 0);
  }, [shipments]);

  // Chart Data: Status Funnel
  const statusFunnelData = useMemo(() => {
    return [
      { name: "Scheduled", count: shipments.filter((s) => s.status === "Scheduled" || s.status === "Draft").length, color: "#94a3b8" },
      { name: "Booked", count: shipments.filter((s) => s.status === "Booked" || s.status === "Cargo Ready").length, color: "#0ea5e9" },
      { name: "In Transit", count: inTransitCount, color: "#3b82f6" },
      { name: "Delayed", count: delayedCount, color: "#f43f5e" },
      { name: "Arrived / Deliv", count: deliveredCount, color: "#10b981" },
    ];
  }, [shipments, inTransitCount, delayedCount, deliveredCount]);

  // Helper for mode icons
  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case "Sea":
        return <Ship className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
      case "Air":
        return <Plane className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
      case "Road":
        return <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case "Rail":
        return <Train className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-violet-500 shrink-0" />;
    }
  };

  // Export Manifest CSV
  const handleExportCSV = () => {
    const headers = [
      "Shipment Number",
      "Job Number",
      "Customer",
      "Status",
      "Mode",
      "Carrier",
      "Origin",
      "Destination",
      "ETD",
      "ETA",
      "Weight (KG)",
      "Volume (CBM)",
      "Cargo Description",
    ];
    const rows = filteredShipments.map((s) => [
      s.shipmentNumber,
      s.jobNumber,
      `"${s.customerName}"`,
      s.status,
      s.transportMode,
      `"${s.carrierName || ""}"`,
      `"${s.origin}"`,
      `"${s.destination}"`,
      s.etd,
      s.eta,
      s.weight,
      s.volume,
      `"${s.cargoDescription?.replace(/"/g, '""') || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shipments_manifest_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Shipments manifest exported to CSV");
  };

  // Table Columns
  const columns: TableColumn<Shipment>[] = [
    {
      key: "shipmentNumber",
      header: "Shipment # / Mode",
      accessor: (s) => (
        <div>
          <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
            <span className="p-1 rounded bg-slate-100 dark:bg-slate-800/80">
              {getModeIcon(s.transportMode)}
            </span>
            <Link
              href={`/operations/shipments/${s.id}`}
              className="text-sky-600 dark:text-sky-400 hover:underline tracking-tight"
            >
              {s.shipmentNumber}
            </Link>
            {s.priority === "Urgent" && (
              <span className="text-[9px] bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold px-1.5 py-0.2 rounded border border-rose-500/20">
                Urgent
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {s.transportMode} • {s.serviceType}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "jobAndCustomer",
      header: "Job & Customer",
      accessor: (s) => (
        <div className="max-w-[180px]">
          <Link
            href={`/operations/jobs/${s.jobId}`}
            className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 hover:underline block truncate"
          >
            {s.jobNumber}
          </Link>
          <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate" title={s.customerName}>
            {s.customerName}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "route",
      header: "Route Corridor",
      accessor: (s) => (
        <div className="text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <span className="truncate max-w-[90px]">{s.origin.split(" ")[0]}</span>
            <ArrowRight className="w-3 h-3 text-sky-500 shrink-0" />
            <span className="truncate max-w-[90px]">{s.destination.split(" ")[0]}</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5" />
            <span>{s.originCountry} → {s.destinationCountry}</span>
          </div>
        </div>
      ),
    },
    {
      key: "carrier",
      header: "Carrier & Conveyance",
      accessor: (s) => (
        <div className="text-xs max-w-[170px]">
          <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {s.carrierName || <span className="italic text-slate-400">Carrier Unassigned</span>}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
            {s.vesselName && `${s.vesselName} ${s.voyageNumber ? `(${s.voyageNumber})` : ""}`}
            {s.flightNumber && `Flight: ${s.flightNumber}`}
            {s.vehicleNumber && `Truck: ${s.vehicleNumber}`}
            {!s.vesselName && !s.flightNumber && !s.vehicleNumber && "Dispatch Pending"}
          </div>
        </div>
      ),
    },
    {
      key: "cargoSpecs",
      header: "Cargo & Specs",
      accessor: (s) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {s.weight ? `${s.weight.toLocaleString()} ${s.weightUnit || "KG"}` : "—"}
            {s.volume ? ` • ${s.volume} CBM` : ""}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]" title={s.cargoDescription}>
            {s.cargoType && (
              <span className="inline-block px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-medium mr-1 text-slate-600 dark:text-slate-300">
                {s.cargoType}
              </span>
            )}
            {s.quantity} {s.quantityUnit}
          </div>
        </div>
      ),
    },
    {
      key: "schedule",
      header: "ETD / ETA",
      accessor: (s) => (
        <div className="text-xs font-mono">
          <div className="text-slate-600 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase font-sans mr-1">ETD:</span>
            {s.etd}
          </div>
          <div className="text-slate-900 dark:text-slate-100 font-semibold flex items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-sans mr-1">ETA:</span>
            {s.eta}
            {s.isDelayed && (
              <span className="text-[9px] bg-rose-500/20 text-rose-500 font-bold px-1 rounded font-sans">
                +{s.delayDays || 2}d
              </span>
            )}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (s) => (
        <div>
          <StatusBadge status={s.status} />
          {s.isDelayed && s.status !== "Delayed" && (
            <div className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              <span>Delay Warning</span>
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (s) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/operations/shipments/${s.id}`}>
            <Button variant="outline" size="xs" icon={Eye} className="h-7 text-xs">
              View
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setStatusModalShipment(s);
              setNewStatus(s.status);
              setStatusNotes("");
            }}
            className="h-7 text-xs text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40"
          >
            Status
          </Button>
          {!s.isDelayed && s.status !== "Delivered" && s.status !== "Completed" ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setDelayModalShipment(s);
                setDelayDays(2);
                setDelayReason("Port congestion / feeder vessel reschedule");
              }}
              className="h-7 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Report Delay"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </Button>
          ) : s.isDelayed ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => clearShipmentDelay(s.id)}
              className="h-7 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              title="Resolve Delay"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Page Header */}
      <PageHeader
        title="SHIPMENTS COMMAND CENTER"
        subtitle="End-to-End Multimodal Consignment Operations, Real-time Milestones, Vessel & Flight Tracking, and Exception Management."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
              className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800"
            >
              Export Manifest
            </Button>
            <Link href="/operations/shipments/create">
              <Button variant="primary" size="sm" icon={Plus} className="bg-sky-600 hover:bg-sky-500 text-white shadow-sm">
                Create Operational Shipment
              </Button>
            </Link>
          </div>
        }
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Shipments" },
        ]}
      />

      {/* High-Impact Delay Warning Banner if any delayed */}
      {delayedCount > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-500 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>{delayedCount} Active Consignments Flagged as Delayed</span>
                <span className="text-[10px] font-mono uppercase bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full font-bold">
                  Immediate Attention Required
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Vessel berthing holds, customs audits, and cold-chain checkpoints are impacting SLA delivery targets.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setStatusFilter("Delayed");
                setActiveTab("directory");
              }}
              className="border-rose-400/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            >
              Filter Delayed Shipments
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        <StatsCard
          title="TOTAL SHIPMENTS"
          value={totalShipments.toString()}
          subtitle="All active & past files"
          icon={Layers}
          iconBgColor="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        />
        <StatsCard
          title="IN TRANSIT"
          value={inTransitCount.toString()}
          subtitle="Moving on ocean/air/road"
          icon={Ship}
          iconBgColor="bg-sky-500/15 text-sky-600 dark:text-sky-400"
        />
        <StatsCard
          title="DELAYED / HOLD"
          value={delayedCount.toString()}
          subtitle="Exceptions requiring audit"
          icon={AlertTriangle}
          iconBgColor="bg-rose-500/15 text-rose-600 dark:text-rose-400"
        />
        <StatsCard
          title="BOOKED / READY"
          value={bookedCount.toString()}
          subtitle="Space allocated & staged"
          icon={CheckCircle2}
          iconBgColor="bg-teal-500/15 text-teal-600 dark:text-teal-400"
        />
        <StatsCard
          title="CARGO WEIGHT"
          value={`${totalTonnageMT} MT`}
          subtitle={`${totalVolumeCBM} CBM Volume`}
          icon={Box}
          iconBgColor="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
        />
        <StatsCard
          title="EST. REVENUE"
          value={formatCurrency(totalEstRevenue)}
          subtitle="Operational book value"
          icon={TrendingUp}
          iconBgColor="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Main Tabs Navigation */}
      <Tabs
        tabs={[
          { id: "dashboard", label: "Operations Dashboard" },
          { id: "directory", label: `Shipments Directory (${filteredShipments.length})` },
          { id: "exceptions", label: `Delay Queue (${delayedCount})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: OPERATIONS DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Mode Distribution */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-500" />
                    <span>Freight Mode Distribution</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-400 font-mono">
                    {totalShipments} Consignments
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Active shipments breakdown by Sea, Air, Road, and Rail multimodal corridors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} stroke="rgba(148, 163, 184, 0.6)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="rgba(148, 163, 184, 0.6)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #1e293b",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {modeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Pipeline Funnel */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-500" />
                    <span>Operational Lifecycle Funnel</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-400 font-mono">
                    Stage Velocity
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Status distribution across origin stuffing, carrier transit, and final delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusFunnelData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.15)" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="rgba(148, 163, 184, 0.6)" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="rgba(148, 163, 184, 0.6)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #1e293b",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {statusFunnelData.map((entry, index) => (
                          <Cell key={`cell-status-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Active Shipments Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* High Priority / Urgent Shipments */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Priority Cargo & Active Corridors</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Live high-value and temperature-monitored consignments currently in execution
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setActiveTab("directory")}
                    className="text-xs text-sky-500"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {shipments.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-sky-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-slate-200 dark:bg-slate-800">
                          {getModeIcon(s.transportMode)}
                        </span>
                        <Link
                          href={`/operations/shipments/${s.id}`}
                          className="font-bold font-mono text-xs text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          {s.shipmentNumber}
                        </Link>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {s.customerName}
                        </span>
                        {s.isDelayed && (
                          <span className="text-[10px] bg-rose-500/15 text-rose-500 px-1.5 py-0.5 rounded font-bold">
                            Delayed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {s.origin}
                        </span>
                        <ArrowRight className="w-3 h-3 text-sky-500 shrink-0" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {s.destination}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{s.carrierName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-xs">
                        <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          ETA {s.eta}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {s.weight?.toLocaleString()} {s.weightUnit}
                        </div>
                      </div>
                      <StatusBadge status={s.status} />
                      <Link href={`/operations/shipments/${s.id}`}>
                        <Button variant="outline" size="xs" icon={ExternalLink} className="h-7 text-xs">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Carrier Space & Bookings Summary */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-sky-500" />
                  <span>Carrier Allocation</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Active shipping lines & airlines managing capacity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {distinctCarriers.slice(0, 6).map((carrier) => {
                  const carrierShipments = shipments.filter((s) => s.carrierName === carrier);
                  const carrierCount = carrierShipments.length;
                  const percentage = Math.round((carrierCount / totalShipments) * 100);

                  return (
                    <div key={carrier} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {carrier}
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {carrierCount} files ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <Link
                    href="/operations/bookings"
                    className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Carrier Bookings</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link
                    href="/operations/containers"
                    className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Container Tracking</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTORY / DATA TABLE */}
      {activeTab === "directory" && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-500" />
                  <span>Consignment Operations Master List</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {filteredShipments.length} of {shipments.length} registered operational shipments
                </CardDescription>
              </div>

              {/* Quick actions in directory header */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  icon={RefreshCw}
                  onClick={() => {
                    setStatusFilter("ALL");
                    setModeFilter("ALL");
                    setCarrierFilter("ALL");
                    setSearchQuery("");
                    toast.info("Filters reset");
                  }}
                  className="h-8 text-xs"
                >
                  Reset
                </Button>
                <Link href="/operations/shipments/create">
                  <Button variant="primary" size="xs" icon={Plus} className="h-8 text-xs bg-sky-600 text-white">
                    New Shipment
                  </Button>
                </Link>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search Shipment #, Job, Customer, Vessel, City..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "ALL", label: "All Operational Statuses" },
                  { value: "In Transit", label: "In Transit" },
                  { value: "Booked", label: "Booked" },
                  { value: "Booking Pending", label: "Booking Pending" },
                  { value: "Cargo Ready", label: "Cargo Ready" },
                  { value: "Picked Up", label: "Picked Up" },
                  { value: "Arrived", label: "Arrived" },
                  { value: "Delivered", label: "Delivered" },
                  { value: "Delayed", label: "Delayed (Exceptions)" },
                  { value: "Scheduled", label: "Scheduled" },
                  { value: "Completed", label: "Completed" },
                ]}
                className="h-9 text-xs"
              />

              {/* Mode Filter */}
              <Select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                options={[
                  { value: "ALL", label: "All Transport Modes" },
                  { value: "Sea", label: "Ocean Freight (Sea)" },
                  { value: "Air", label: "Air Cargo (Air)" },
                  { value: "Road", label: "Road Transport (Road)" },
                  { value: "Rail", label: "Rail Intermodal (Rail)" },
                  { value: "Multimodal", label: "Multimodal" },
                ]}
                className="h-9 text-xs"
              />

              {/* Carrier Filter */}
              <Select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                options={[
                  { value: "ALL", label: "All Carriers" },
                  ...distinctCarriers.map((c) => ({ value: c, label: c })),
                ]}
                className="h-9 text-xs"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              data={filteredShipments}
              columns={columns}
              pageSize={10}
              emptyMessage="No shipments found matching current query or filters."
            />
          </CardContent>
        </Card>
      )}

      {/* TAB 3: EXCEPTION & DELAY QUEUE */}
      {activeTab === "exceptions" && (
        <Card className="border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-rose-100 dark:border-rose-900/30">
            <CardTitle className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>Delay & Operational Exception Queue ({delayedCount})</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Consignments currently facing berthing congestion, flight delays, customs holds, or equipment shortages.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {delayedShipments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {delayedShipments.map((s) => (
                  <Card
                    key={s.id}
                    className="p-4 border border-rose-300 dark:border-rose-800/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                            {s.shipmentNumber}
                          </span>
                          <span className="text-[10px] bg-rose-500/20 text-rose-500 font-bold px-2 py-0.5 rounded-full">
                            +{s.delayDays || 2} Days Delay
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                          {s.customerName} • Job: {s.jobNumber}
                        </div>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>

                    <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 text-xs">
                      <div className="font-semibold text-rose-600 dark:text-rose-400 text-[11px] uppercase tracking-wider">
                        Root Cause / Operational Reason:
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                        {s.delayReason || "Port congestion / feeder vessel reschedule"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-slate-400 font-sans block text-[10px]">Route:</span>
                        {s.origin} → {s.destination}
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block text-[10px]">Carrier:</span>
                        {s.carrierName || "N/A"}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => clearShipmentDelay(s.id)}
                        className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-400/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      >
                        Resolve & Clear Delay
                      </Button>
                      <Link href={`/operations/shipments/${s.id}`}>
                        <Button variant="primary" size="xs" icon={ExternalLink} className="text-xs bg-rose-600 hover:bg-rose-500 text-white">
                          Investigate File
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="font-medium text-slate-700 dark:text-slate-300">All shipments operating on schedule!</p>
                <p className="text-xs text-slate-400 mt-1">No active delay flags or transshipment holds reported.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* QUICK STATUS UPDATE MODAL */}
      <Dialog
        isOpen={!!statusModalShipment}
        onClose={() => setStatusModalShipment(null)}
        title={`Update Status: ${statusModalShipment?.shipmentNumber}`}
      >
        <div className="space-y-4 pt-2">
          <div className="text-xs text-slate-500">
            Update operational state for {statusModalShipment?.customerName} ({statusModalShipment?.origin} → {statusModalShipment?.destination})
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              New Lifecycle Status
            </label>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Scheduled", label: "Scheduled" },
                { value: "Booking Pending", label: "Booking Pending" },
                { value: "Booked", label: "Booked" },
                { value: "Cargo Ready", label: "Cargo Ready" },
                { value: "Picked Up", label: "Picked Up" },
                { value: "In Transit", label: "In Transit" },
                { value: "Arrived", label: "Arrived at Destination" },
                { value: "Delivered", label: "Delivered & POD Signed" },
                { value: "Delayed", label: "Delayed (Exception)" },
                { value: "Completed", label: "Completed" },
              ]}
              className="w-full text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Operator Log / Audit Notes
            </label>
            <Input
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="e.g. Vessel berthed at Jebel Ali Terminal 2. Discharge commenced."
              className="text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setStatusModalShipment(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (statusModalShipment) {
                  updateShipmentStatus(statusModalShipment.id, newStatus, statusNotes);
                  setStatusModalShipment(null);
                }
              }}
              className="bg-sky-600 text-white"
            >
              Confirm Update
            </Button>
          </div>
        </div>
      </Dialog>

      {/* QUICK REPORT DELAY MODAL */}
      <Dialog
        isOpen={!!delayModalShipment}
        onClose={() => setDelayModalShipment(null)}
        title={`Report Delay: ${delayModalShipment?.shipmentNumber}`}
      >
        <div className="space-y-4 pt-2">
          <div className="text-xs text-rose-500 font-medium">
            Flag this consignment with an operational exception alert and notify stakeholders.
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Estimated Delay (Days)
            </label>
            <Input
              type="number"
              min={1}
              max={30}
              value={delayDays}
              onChange={(e) => setDelayDays(parseInt(e.target.value) || 1)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Delay Reason / Root Cause
            </label>
            <Input
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              placeholder="e.g. Weather disruption in Bay of Bengal / feeder connection reschedule"
              className="text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDelayModalShipment(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (delayModalShipment) {
                  markShipmentDelayed(delayModalShipment.id, delayDays, delayReason);
                  setDelayModalShipment(null);
                }
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white"
            >
              Record Delay
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
