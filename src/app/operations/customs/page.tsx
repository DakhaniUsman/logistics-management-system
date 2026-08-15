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
import { Tabs } from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  History,
  Download,
  Building2,
  Briefcase,
  Ship,
  Boxes,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
  Send,
  CreditCard,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useCustomsStore } from "@/store/use-customs-store";
import { CustomsDeclaration, CUSTOMS_TYPES, MOCK_CUSTOMS_OFFICES, CustomsType } from "@/types/customs";
import { CustomsFormModal } from "@/components/customs/customs-form-modal";
import { CustomsFilingModal } from "@/components/customs/customs-filing-modal";
import { DutyPaymentModal } from "@/components/customs/duty-payment-modal";
import { ExaminationModal } from "@/components/customs/examination-modal";
import { CustomsQueryModal } from "@/components/customs/customs-query-modal";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";

export default function CustomsDashboardPage() {
  const {
    declarations,
    filters,
    isLoading,
    fetchDeclarations,
    setFilters,
    clearFilters,
    getDashboardKPIs,
    openFormModal,
    isFormModalOpen,
    closeFormModal,
    selectedDeclaration,
    isFilingModalOpen,
    closeFilingModal,
    openFilingModal,
    isDutyModalOpen,
    closeDutyModal,
    openDutyModal,
    isExaminationModalOpen,
    closeExaminationModal,
    openExaminationModal,
    isQueryModalOpen,
    closeQueryModal,
    openQueryModal,
  } = useCustomsStore();

  useEffect(() => {
    fetchDeclarations();
  }, [fetchDeclarations]);

  const kpis = getDashboardKPIs();

  // Active filters count
  let activeFilterCount = 0;
  if (filters.search) activeFilterCount++;
  if (filters.customsType && filters.customsType !== "ALL") activeFilterCount++;
  if (filters.status && filters.status !== "ALL") activeFilterCount++;
  if (filters.dutyStatus && filters.dutyStatus !== "ALL") activeFilterCount++;
  if (filters.customsOffice) activeFilterCount++;

  // Operational attention subsets
  const openQueryDeclarations = declarations.filter((d) => d.status === "Query Raised");
  const dutyPendingDeclarations = declarations.filter((d) => d.dutyPaymentStatus === "Pending" && d.totalPayable > 0);
  const examDeclarations = declarations.filter((d) => d.status === "Examination Required");
  const delayedDeclarations = declarations.filter((d) => d.isDelayed || d.status === "On Hold");

  // Recharts status data
  const statusCounts: Record<string, number> = {};
  declarations.forEach((d) => {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
  });
  const statusChartData = Object.keys(statusCounts).map((st) => ({
    name: st,
    count: statusCounts[st],
  }));

  const COLORS = ["#38bdf8", "#34d399", "#f59e0b", "#f43f5e", "#a78bfa", "#38bdf8", "#fb7185"];

  // Table Column Definitions
  const columns = [
    {
      key: "declarationNumber",
      header: "Declaration & Type",
      accessor: (dec: CustomsDeclaration) => (
        <div className="flex items-center gap-2.5 min-w-[190px]">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <Link
              href={`/operations/customs/${dec.id}`}
              className="font-extrabold text-slate-100 hover:text-sky-400 block truncate transition-colors text-xs"
            >
              {dec.declarationNumber}
            </Link>
            <span className="text-[11px] text-slate-400 block font-semibold">
              {dec.customsType} • {dec.direction}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "jobId",
      header: "Logistics Hierarchy",
      accessor: (dec: CustomsDeclaration) => (
        <div className="text-[11px] space-y-0.5 min-w-[130px]">
          {dec.jobNumber && (
            <Link
              href={`/operations/jobs/${dec.jobId || dec.jobNumber}`}
              className="font-mono font-bold text-sky-400 hover:underline block"
            >
              {dec.jobNumber}
            </Link>
          )}
          {dec.shipmentNumber && (
            <span className="text-slate-300 block font-mono text-[10px]">SHP: {dec.shipmentNumber}</span>
          )}
          {dec.containerNumbers.length > 0 && (
            <span className="text-emerald-400 block font-mono text-[10px]">
              CON: {dec.containerNumbers[0]}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "customerId",
      header: "Customer & Broker",
      accessor: (dec: CustomsDeclaration) => (
        <div className="text-[11px] min-w-[150px]">
          <span className="font-bold text-slate-200 block truncate">{dec.customerName}</span>
          <span className="text-slate-400 text-[10px] block truncate">{dec.brokerName}</span>
        </div>
      ),
    },
    {
      key: "customsOffice",
      header: "Customs Office & Port",
      accessor: (dec: CustomsDeclaration) => (
        <div className="text-[11px] min-w-[160px]">
          <span className="font-semibold text-slate-200 block truncate">{dec.customsOffice}</span>
          <span className="text-slate-400 text-[10px] block">{dec.portOfEntry}</span>
        </div>
      ),
    },
    {
      key: "customsValue",
      header: "Customs Value",
      accessor: (dec: CustomsDeclaration) => (
        <div className="text-xs font-mono">
          <span className="font-bold text-slate-100 block">
            {dec.currency} {dec.customsValue.toLocaleString()}
          </span>
          <span className="text-slate-400 text-[10px]">Inv: {dec.invoiceValue.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "dutyAmount",
      header: "Duty & Tax Payable",
      accessor: (dec: CustomsDeclaration) => (
        <div className="text-xs font-mono">
          <span className="font-bold text-emerald-400 block">
            {dec.currency} {dec.totalPayable.toLocaleString()}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              dec.dutyPaymentStatus === "Paid"
                ? "bg-emerald-500/20 text-emerald-300"
                : dec.dutyPaymentStatus === "Pending"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {dec.dutyPaymentStatus}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Customs Status",
      accessor: (dec: CustomsDeclaration) => (
        <StatusBadge status={dec.status} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (dec: CustomsDeclaration) => (
        <div className="flex items-center gap-1.5 min-w-[140px]">
          <Link href={`/operations/customs/${dec.id}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              View
            </Button>
          </Link>

          {dec.status === "Draft" || dec.status === "Documents Pending" || dec.status === "Ready to File" ? (
            <Button
              variant="outline"
              size="xs"
              icon={Send}
              className="text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
              onClick={() => openFilingModal(dec)}
            >
              File
            </Button>
          ) : dec.status === "Duty Pending" || (dec.dutyPaymentStatus === "Pending" && dec.totalPayable > 0) ? (
            <Button
              variant="outline"
              size="xs"
              icon={CreditCard}
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => openDutyModal(dec)}
            >
              Pay Duty
            </Button>
          ) : dec.status === "Query Raised" ? (
            <Button
              variant="outline"
              size="xs"
              icon={AlertTriangle}
              className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              onClick={() => openQueryModal(dec)}
            >
              Respond
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
        title="CUSTOMS MANAGEMENT & CLEARANCE HUB"
        subtitle="End-to-end import/export customs clearance lifecycle, duty assessment, container examination, and regulatory filing."
        breadcrumbs={[{ label: "Operations", href: "/operations/jobs" }, { label: "Customs Clearance" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchDeclarations()}>
              Refresh
            </Button>

            <Link href="/documents/center">
              <Button variant="outline" size="sm" icon={FileText}>
                Document Center
              </Button>
            </Link>

            <Button variant="primary" size="sm" icon={Plus} onClick={() => openFormModal(null)}>
              Create Declaration
            </Button>
          </div>
        }
      />

      {/* Top operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div
          onClick={() => setFilters({ status: "ALL", dutyStatus: "ALL" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard title="TOTAL DECLARATIONS" value={kpis.total.toString()} icon={FileText} />
        </div>

        <div
          onClick={() => setFilters({ status: "Documents Pending" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard title="DOCS PENDING" value={kpis.documentsPending.toString()} icon={Clock} />
        </div>

        <div
          onClick={() => setFilters({ status: "Under Assessment" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard title="UNDER ASSESSMENT" value={kpis.underAssessment.toString()} icon={ShieldCheck} />
        </div>

        <div
          onClick={() => setFilters({ status: "Examination Required" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard title="EXAMINATION" value={kpis.examination.toString()} icon={Search} />
        </div>

        <div
          onClick={() => setFilters({ status: "Query Raised" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard title="QUERY RAISED" value={kpis.queryRaised.toString()} icon={AlertTriangle} />
        </div>

        <div
          onClick={() => setFilters({ dutyStatus: "Pending" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard title="DUTY PENDING" value={kpis.dutyPending.toString()} icon={CreditCard} />
        </div>

        <div
          onClick={() => setFilters({ status: "Cleared" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard title="CLEARED / RELEASED" value={kpis.cleared.toString()} icon={CheckCircle2} />
        </div>

        <div
          onClick={() => setFilters({ status: "On Hold" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard title="ON HOLD" value={kpis.onHold.toString()} icon={Lock} />
        </div>
      </div>

      {/* Operational Attention Alerts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">{openQueryDeclarations.length} Customs Queries Open</span>
              <span className="text-[11px] text-amber-200/80 block">Requires official response to resume clearance</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="xs"
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
            onClick={() => setFilters({ status: "Query Raised" })}
          >
            Review Queries
          </Button>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 block">
                ₹{(kpis.totalDutyPendingAmount / 100000).toFixed(1)}L Duty Pending
              </span>
              <span className="text-[11px] text-emerald-200/80 block">Challans generated for ICEGATE payment</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="xs"
            className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
            onClick={() => setFilters({ dutyStatus: "Pending" })}
          >
            Pay Duty
          </Button>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-rose-300 block">{delayedDeclarations.length} Clearances Delayed / On Hold</span>
              <span className="text-[11px] text-rose-200/80 block">Port demurrage risks flagged</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="xs"
            className="border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
            onClick={() => setFilters({ status: "On Hold" })}
          >
            View Holds
          </Button>
        </div>
      </div>

      {/* Recharts Analytics Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4">
          <CardTitle className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
            Customs Clearance Status Distribution
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
              Import vs Export Volume
            </CardTitle>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Import Declarations</span>
                  <span className="text-slate-400 text-[10px]">Inbound port clearances</span>
                </div>
                <span className="font-extrabold font-mono text-sky-400 text-sm">
                  {declarations.filter((d) => d.customsType === "Import").length}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Export Declarations</span>
                  <span className="text-slate-400 text-[10px]">Outbound shipping bills</span>
                </div>
                <span className="font-extrabold font-mono text-emerald-400 text-sm">
                  {declarations.filter((d) => d.customsType === "Export").length}
                </span>
              </div>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 italic block pt-2 border-t border-slate-800">
            * Fully integrated with Phase 10 Document Center verification.
          </span>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Search by Declaration #, Job #, Shipment #, Container #, Customer, Broker, Office..."
              className="pl-9 text-xs"
            />
          </div>

          {/* Filter Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-36">
              <Select
                value={filters.customsType || "ALL"}
                onChange={(e) => setFilters({ customsType: e.target.value as any })}
                options={[
                  { label: "All Types", value: "ALL" },
                  ...CUSTOMS_TYPES.map((t) => ({ label: `${t}s`, value: t })),
                ]}
              />
            </div>

            <div className="w-40">
              <Select
                value={filters.customsOffice || ""}
                onChange={(e) => setFilters({ customsOffice: e.target.value })}
                options={[
                  { label: "All Customs Offices", value: "" },
                  ...MOCK_CUSTOMS_OFFICES.map((o) => ({ label: o, value: o })),
                ]}
              />
            </div>

            <div className="w-36">
              <Select
                value={filters.dutyStatus || "ALL"}
                onChange={(e) => setFilters({ dutyStatus: e.target.value as any })}
                options={[
                  { label: "All Duty Statuses", value: "ALL" },
                  { label: "Duty Paid", value: "Paid" },
                  { label: "Duty Pending", value: "Pending" },
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
        <DataTable data={declarations} columns={columns} isLoading={isLoading} />
      </Card>

      {/* Dialog Modals */}
      <CustomsFormModal isOpen={isFormModalOpen} onClose={closeFormModal} declaration={selectedDeclaration} />

      <CustomsFilingModal isOpen={isFilingModalOpen} onClose={closeFilingModal} declaration={selectedDeclaration} />

      <DutyPaymentModal isOpen={isDutyModalOpen} onClose={closeDutyModal} declaration={selectedDeclaration} />

      <ExaminationModal
        isOpen={isExaminationModalOpen}
        onClose={closeExaminationModal}
        declaration={selectedDeclaration}
      />

      <CustomsQueryModal isOpen={isQueryModalOpen} onClose={closeQueryModal} declaration={selectedDeclaration} />
    </div>
  );
}
