"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TableColumn } from "@/types/common";
import { Rate, RateCategory, RateStatus, RateUnit } from "@/types/rate";
import { TransportMode } from "@/types/common";
import { useRateStore } from "@/store/use-rate-store";
import { MOCK_VENDORS, MOCK_CARRIERS } from "@/data/mock/vendor-data";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Ship,
  Plane,
  Truck,
  Train,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  Sparkles,
  Building2,
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
import { toast } from "sonner";

export default function RatesDashboardAndListPage() {
  const { rates, addRate, duplicateRate } = useRateStore();

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [vendorFilter, setVendorFilter] = useState<string>("ALL");

  // Form State
  const [formData, setFormData] = useState({
    rateType: "Ocean Freight" as RateCategory,
    serviceType: "Port-to-Port",
    vendorId: MOCK_VENDORS[0].id,
    vendorName: MOCK_VENDORS[0].name,
    carrierId: MOCK_CARRIERS[0].id,
    carrierName: MOCK_CARRIERS[0].name,
    origin: "Mumbai Port (JNPT)",
    originCountry: "India",
    destination: "Jebel Ali Port",
    destinationCountry: "UAE",
    transportMode: "Ocean Freight" as TransportMode,
    containerType: "40ft High Cube",
    containerSize: "40FT",
    rate: 80000,
    currency: "INR",
    unit: "Per Container" as RateUnit,
    minimumCharge: 80000,
    validFrom: "2026-08-15",
    validUntil: "2026-09-15",
    status: "Active" as RateStatus,
    terms: "Subject to BAF & THC charges.",
    notes: "",
    createdBy: "Shahbaj Borkar",
    updatedBy: "Shahbaj Borkar",
  });

  // Calculate Rate KPIs
  const totalRates = rates.length;
  const activeRates = rates.filter((r) => r.status === "Active").length;
  const expiringSoon = rates.filter((r) => r.status === "Expiring Soon").length;
  const expiredRates = rates.filter((r) => r.status === "Expired").length;
  const oceanRates = rates.filter((r) => r.rateType === "Ocean Freight").length;
  const airRates = rates.filter((r) => r.rateType === "Air Freight").length;
  const transportRates = rates.filter((r) => r.rateType === "Road Transport").length;

  // Filtered List
  const filteredRates = rates.filter((r) => {
    if (typeFilter !== "ALL" && r.rateType !== typeFilter) return false;
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (vendorFilter !== "ALL" && r.vendorId !== vendorFilter) return false;
    return true;
  });

  // Chart 1: Rate Category Distribution
  const categoryChartData = [
    { name: "Ocean Freight", count: oceanRates, color: "#0284c7" },
    { name: "Air Freight", count: airRates, color: "#38bdf8" },
    { name: "Road Transport", count: transportRates, color: "#f59e0b" },
    { name: "Customs Clearance", count: rates.filter((r) => r.rateType === "Customs Clearance").length, color: "#10b981" },
    { name: "Warehouse", count: rates.filter((r) => r.rateType === "Warehouse Handling").length, color: "#8b5cf6" },
  ];

  const columns: TableColumn<Rate>[] = [
    {
      key: "rateNumber",
      header: "Rate ID / Category",
      accessor: (r) => (
        <div>
          <div className="font-bold text-sky-600 dark:text-sky-400 font-mono text-xs">{r.rateNumber}</div>
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{r.rateType}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "vendorName",
      header: "Vendor / Carrier",
      accessor: (r) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{r.vendorName}</div>
          <div className="text-[11px] text-slate-400">{r.carrierName || r.serviceType}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "route",
      header: "Trade Lane Route",
      accessor: (r) => (
        <div className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          <span>{r.origin.split(" ")[0]}</span>
          <ArrowRight className="w-3 h-3 text-sky-500 shrink-0" />
          <span>{r.destination.split(" ")[0]}</span>
        </div>
      ),
    },
    {
      key: "rateAmount",
      header: "Tariff Rate & Unit",
      accessor: (r) => (
        <div>
          <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
            {formatCurrency(r.rate)}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold">{r.unit}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "validUntil",
      header: "Valid Until",
      accessor: (r) => (
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
          {r.validUntil}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (r) => <StatusBadge status={r.status} />,
      sortable: true,
    },
    {
      key: "action",
      header: "Action",
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <Link href={`/sales/rates/${r.id}`}>
            <Button variant="ghost" size="xs" icon={ExternalLink}>
              Inspect
            </Button>
          </Link>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              const dup = duplicateRate(r.id);
              if (dup) toast.success(`Duplicated rate as ${dup.rateNumber}`);
            }}
          >
            Copy
          </Button>
        </div>
      ),
    },
  ];

  const handleVendorSelect = (vendId: string) => {
    const v = MOCK_VENDORS.find((ven) => ven.id === vendId);
    if (v) {
      setFormData({
        ...formData,
        vendorId: v.id,
        vendorName: v.name,
      });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = addRate(formData);
    toast.success(`Created Rate Tariff ${newRate.rateNumber} for ${newRate.vendorName}`);
    setIsCreateDrawerOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Tariff Rate & Cost Management Command Center"
        subtitle="Maintain carrier shipping lines, air freight, trucking, and customs rates to calculate operational fulfillment costs."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "Rate Management" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/sales/rates/comparison">
              <Button variant="outline" size="sm" icon={SlidersHorizontal}>
                Rate Comparison Engine
              </Button>
            </Link>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateDrawerOpen(true)}>
              Create Tariff Rate
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatsCard
          title="Total Tariff Rates"
          value={totalRates}
          change={12.0}
          changePeriod="active contracts"
          icon={Layers}
          iconBgColor="bg-sky-500/10 text-sky-500"
          subtitle="All service vendors"
        />
        <StatsCard
          title="Active Rates"
          value={activeRates}
          change={18.0}
          changePeriod="valid for pricing"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10 text-emerald-500"
          subtitle="Valid contracts"
        />
        <StatsCard
          title="Expiring Soon"
          value={expiringSoon}
          change={-5.0}
          changePeriod="within 7 days"
          icon={AlertTriangle}
          iconBgColor="bg-amber-500/10 text-amber-500"
          subtitle="Needs renewal"
        />
        <StatsCard
          title="Ocean Rates"
          value={oceanRates}
          change={10.0}
          changePeriod="shipping lines"
          icon={Ship}
          iconBgColor="bg-blue-500/10 text-blue-500"
          subtitle="FCL / LCL tariffs"
        />
        <StatsCard
          title="Air Express Rates"
          value={airRates}
          change={15.0}
          changePeriod="airlines"
          icon={Plane}
          iconBgColor="bg-cyan-500/10 text-cyan-500"
          subtitle="Per KG tariffs"
        />
        <StatsCard
          title="Trucking Feeder"
          value={transportRates}
          change={6.0}
          changePeriod="road vendors"
          icon={Truck}
          iconBgColor="bg-amber-500/10 text-amber-500"
          subtitle="Per Trip rates"
        />
        <StatsCard
          title="Expired Contracts"
          value={expiredRates}
          change={0}
          changePeriod="archived"
          icon={Clock}
          iconBgColor="bg-rose-500/10 text-rose-500"
          subtitle="Requires update"
        />
      </div>

      {/* Alert Banner for Expiring Rates */}
      {expiringSoon > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Notice:</strong> {expiringSoon} tariff rates are expiring within 7 days. Review vendor contracts to prevent cost calculation discrepancies.
            </span>
          </div>
          <Link href="/sales/rates/comparison">
            <Button variant="ghost" size="xs" className="text-amber-400 hover:text-amber-300">
              Compare Alternatives →
            </Button>
          </Link>
        </div>
      )}

      {/* Recharts Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-500" />
              Rates by Service Category Breakdown
            </CardTitle>
            <CardDescription>
              Contract tariffs categorized across Ocean, Air, Road Transport, Customs, and Warehousing.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Rates`, "Tariffs"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendor Contract Breakdown */}
        <Card className="p-5 lg:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Top Active Vendors ({MOCK_VENDORS.length})
            </CardTitle>
            <CardDescription>
              Service providers furnishing cost tariffs.
            </CardDescription>
          </CardHeader>
          <div className="space-y-2 text-xs">
            {MOCK_VENDORS.slice(0, 5).map((v) => (
              <div key={v.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{v.name}</span>
                  <span className="text-[10px] text-slate-400">{v.category}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                  ★ {v.rating}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Enterprise Rate DataTable */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            All Contract Rates & Tariffs ({filteredRates.length})
          </h3>
        </div>

        <DataTable
          data={filteredRates}
          columns={columns}
          searchPlaceholder="Search rates by ID, vendor, origin, or destination..."
          searchKey={(r) => `${r.rateNumber} ${r.vendorName} ${r.origin} ${r.destination} ${r.rateType}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { label: "All Categories", value: "ALL" },
                  { label: "Ocean Freight", value: "Ocean Freight" },
                  { label: "Air Freight", value: "Air Freight" },
                  { label: "Road Transport", value: "Road Transport" },
                  { label: "Customs Clearance", value: "Customs Clearance" },
                  { label: "Warehouse Handling", value: "Warehouse Handling" },
                ]}
              />

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "All Statuses", value: "ALL" },
                  { label: "Active", value: "Active" },
                  { label: "Expiring Soon", value: "Expiring Soon" },
                  { label: "Expired", value: "Expired" },
                  { label: "Draft", value: "Draft" },
                ]}
              />
            </div>
          }
        />
      </div>

      {/* CREATE RATE DRAWER */}
      <Drawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        title="Create New Vendor Tariff Rate"
        subtitle="Add a carrier ocean rate, air tariff, trucking feeder, or customs fee to the rate repository."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Select
            label="Rate Category"
            value={formData.rateType}
            onChange={(e) => setFormData({ ...formData, rateType: e.target.value as RateCategory })}
            options={[
              { label: "Ocean Freight", value: "Ocean Freight" },
              { label: "Air Freight", value: "Air Freight" },
              { label: "Road Transport", value: "Road Transport" },
              { label: "Rail Transport", value: "Rail Transport" },
              { label: "Customs Clearance", value: "Customs Clearance" },
              { label: "Warehouse Handling", value: "Warehouse Handling" },
              { label: "Documentation", value: "Documentation" },
              { label: "Insurance", value: "Insurance" },
            ]}
          />

          <Select
            label="Service Provider / Vendor"
            value={formData.vendorId}
            onChange={(e) => handleVendorSelect(e.target.value)}
            options={MOCK_VENDORS.map((v) => ({ label: `${v.name} (${v.category})`, value: v.id }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Origin Location / Port"
              required
              placeholder="e.g. Mumbai Port (JNPT)"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            />
            <Input
              label="Destination Location / Port"
              required
              placeholder="e.g. Jebel Ali Port"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Rate Amount (₹)"
              type="number"
              required
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
            />

            <Select
              label="Currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              options={[
                { label: "INR (₹)", value: "INR" },
                { label: "USD ($)", value: "USD" },
                { label: "EUR (€)", value: "EUR" },
              ]}
            />

            <Select
              label="Rate Unit Basis"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value as RateUnit })}
              options={[
                { label: "Per Container", value: "Per Container" },
                { label: "Per KG", value: "Per KG" },
                { label: "Per CBM", value: "Per CBM" },
                { label: "Per Shipment", value: "Per Shipment" },
                { label: "Per Trip", value: "Per Trip" },
                { label: "Flat Rate", value: "Flat Rate" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Valid From Date"
              type="date"
              required
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            />
            <Input
              label="Valid Until Date"
              type="date"
              required
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>

          <Input
            label="Tariff Terms & Conditions"
            value={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
            placeholder="Specify BAF, free time demurrage, or port surcharges..."
          />

          <Button variant="primary" type="submit" className="w-full mt-4">
            Save Tariff Rate
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
