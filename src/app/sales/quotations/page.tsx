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
import { Quotation, QuotationStatus } from "@/types/quotation";
import { useQuotationStore } from "@/store/use-quotation-store";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Plus,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart2,
  DollarSign,
  ExternalLink,
  Percent,
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

export default function QuotationsDashboardAndListPage() {
  const { quotations } = useQuotationStore();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL");

  // Calculate KPIs
  const totalQuotations = quotations.length;
  const draftCount = quotations.filter((q) => q.status === "Draft").length;
  const sentCount = quotations.filter((q) => q.status === "Sent").length;
  const viewedCount = quotations.filter((q) => q.status === "Viewed").length;
  const negotiationCount = quotations.filter((q) => q.status === "Negotiation").length;
  const acceptedCount = quotations.filter((q) => q.status === "Accepted").length;

  const totalQuotedValue = quotations.reduce((sum, q) => sum + q.grandTotal, 0);
  const acceptedRevenueValue = quotations
    .filter((q) => q.status === "Accepted")
    .reduce((sum, q) => sum + q.grandTotal, 0);

  const winRatePercentage = totalQuotations > 0 ? ((acceptedCount / totalQuotations) * 100).toFixed(1) : "0";

  // Filtered List
  const filteredQuotations = quotations.filter((q) => {
    if (statusFilter !== "ALL" && q.status !== statusFilter) return false;
    if (ownerFilter !== "ALL" && q.createdBy !== ownerFilter) return false;
    return true;
  });

  // Chart Data: Pipeline Breakdown
  const pipelineData = [
    { name: "Draft", count: draftCount, color: "#94a3b8" },
    { name: "Sent", count: sentCount, color: "#3b82f6" },
    { name: "Viewed", count: viewedCount, color: "#0284c7" },
    { name: "Negotiation", count: negotiationCount, color: "#f59e0b" },
    { name: "Accepted", count: acceptedCount, color: "#10b981" },
  ];

  const columns: TableColumn<Quotation>[] = [
    {
      key: "quotationNumber",
      header: "Quotation # / Rev",
      accessor: (q) => (
        <div>
          <div className="font-bold text-sky-600 dark:text-sky-400 font-mono text-xs">
            {q.quotationNumber} <span className="text-[10px] text-slate-400">(Rev {q.revisionNumber})</span>
          </div>
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{q.customerName}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "enquiryNumber",
      header: "Source Enquiry",
      accessor: (q) => (
        <Link href={`/sales/enquiries/${q.enquiryId}`} className="font-mono text-xs text-sky-500 hover:underline">
          {q.enquiryNumber}
        </Link>
      ),
    },
    {
      key: "route",
      header: "Route & Mode",
      accessor: (q) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <span>{q.origin.split(" ")[0]}</span>
            <ArrowRight className="w-3 h-3 text-sky-500 shrink-0" />
            <span>{q.destination.split(" ")[0]}</span>
          </div>
          <div className="text-[10px] text-slate-400">{q.transportMode}</div>
        </div>
      ),
    },
    {
      key: "grandTotal",
      header: "Quoted Price (Grand Total)",
      accessor: (q) => (
        <div>
          <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
            {formatCurrency(q.grandTotal)}
          </div>
          <div className="text-[10px] text-slate-400">Subtotal: {formatCurrency(q.subtotal)}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "validUntil",
      header: "Valid Until",
      accessor: (q) => (
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
          {q.validUntil}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (q) => <StatusBadge status={q.status} />,
      sortable: true,
    },
    {
      key: "createdBy",
      header: "Sales Rep",
      accessor: (q) => <span className="text-xs text-slate-400 font-medium">{q.createdBy}</span>,
    },
    {
      key: "action",
      header: "Action",
      accessor: (q) => (
        <Link href={`/sales/quotations/${q.id}`}>
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
        title="Commercial Quotation Command Center"
        subtitle="Manage customer pricing, apply profit margins over operational costs, issue formal commercial quotations, and track contract acceptance."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "Quotations" }]}
        actions={
          <Link href="/sales/quotations/builder">
            <Button variant="primary" size="sm" icon={Plus}>
              Create New Quotation
            </Button>
          </Link>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatsCard
          title="Total Quotations"
          value={totalQuotations}
          change={16.0}
          changePeriod="issued quotes"
          icon={FileText}
          iconBgColor="bg-sky-500/10 text-sky-500"
          subtitle="All contract quotes"
        />
        <StatsCard
          title="Quoted Revenue"
          value={formatCurrency(totalQuotedValue)}
          change={22.0}
          changePeriod="total pipeline"
          icon={DollarSign}
          iconBgColor="bg-blue-500/10 text-blue-500"
          subtitle="Gross quoted value"
        />
        <StatsCard
          title="Accepted Business"
          value={formatCurrency(acceptedRevenueValue)}
          change={14.5}
          changePeriod="won contracts"
          icon={TrendingUp}
          iconBgColor="bg-emerald-500/10 text-emerald-500"
          subtitle="Confirmed revenue"
        />
        <StatsCard
          title="Sent to Shipper"
          value={sentCount}
          change={10.0}
          changePeriod="awaiting review"
          icon={Send}
          iconBgColor="bg-cyan-500/10 text-cyan-500"
          subtitle="Customer pending"
        />
        <StatsCard
          title="In Negotiation"
          value={negotiationCount}
          change={5.0}
          changePeriod="active negotiation"
          icon={Clock}
          iconBgColor="bg-amber-500/10 text-amber-500"
          subtitle="Revision in progress"
        />
        <StatsCard
          title="Commercial Win Rate"
          value={`${winRatePercentage}%`}
          change={3.2}
          changePeriod="conversion rate"
          icon={Percent}
          iconBgColor="bg-green-500/10 text-green-500"
          subtitle="Acceptance ratio"
        />
        <StatsCard
          title="Draft Quotes"
          value={draftCount}
          change={0}
          changePeriod="unissued drafts"
          icon={AlertCircle}
          iconBgColor="bg-slate-500/10 text-slate-500"
          subtitle="Internal drafts"
        />
      </div>

      {/* Recharts Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-500" />
              Quotation Pipeline Stage Breakdown
            </CardTitle>
            <CardDescription>
              Commercial distribution of quotations across Draft, Sent, Viewed, Negotiation, and Accepted.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Quotations`, "Volume"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Commercial Highlights */}
        <Card className="p-5 lg:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Commercial Summary
            </CardTitle>
            <CardDescription>
              Key financial milestones for issued customer quotes.
            </CardDescription>
          </CardHeader>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Pipeline Value</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-lg block">
                {formatCurrency(totalQuotedValue)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-emerald-400">
              <span className="text-[10px] font-bold uppercase block">Confirmed Accepted Revenue</span>
              <span className="font-mono font-bold text-lg block">{formatCurrency(acceptedRevenueValue)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Enterprise Quotations DataTable */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            All Issued Commercial Quotations ({filteredQuotations.length})
          </h3>
        </div>

        <DataTable
          data={filteredQuotations}
          columns={columns}
          searchPlaceholder="Search quotations by ID, customer, enquiry, or route..."
          searchKey={(q) => `${q.quotationNumber} ${q.customerName} ${q.enquiryNumber} ${q.origin} ${q.destination}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "All Statuses", value: "ALL" },
                  { label: "Draft", value: "Draft" },
                  { label: "Sent", value: "Sent" },
                  { label: "Viewed", value: "Viewed" },
                  { label: "Negotiation", value: "Negotiation" },
                  { label: "Accepted", value: "Accepted" },
                  { label: "Rejected", value: "Rejected" },
                ]}
              />

              <Select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                options={[
                  { label: "All Representatives", value: "ALL" },
                  { label: "Dakhani Usman", value: "Dakhani Usman" },
                  { label: "Priya Nair", value: "Priya Nair" },
                  { label: "Rohan Varma", value: "Rohan Varma" },
                ]}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
