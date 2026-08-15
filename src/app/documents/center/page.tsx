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
} from "lucide-react";
import Link from "next/link";
import { useDocumentStore } from "@/store/use-document-store";
import { Document, DOCUMENT_TYPES, DOCUMENT_CATEGORIES, DocumentType, DocumentCategory } from "@/types/document";
import { DocumentUploadModal } from "@/components/documents/document-upload-modal";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";
import { DocumentVerificationModal } from "@/components/documents/document-verification-modal";
import { DocumentReplaceModal } from "@/components/documents/document-replace-modal";
import { DocumentCompletenessWidget } from "@/components/documents/document-completeness-widget";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";

export default function DocumentCenterPage() {
  const {
    documents,
    filters,
    isLoading,
    fetchDocuments,
    setFilters,
    clearFilters,
    getDashboardKPIs,
    openUploadModal,
    isUploadModalOpen,
    closeUploadModal,
    selectedDocument,
    isPreviewModalOpen,
    closePreviewModal,
    openPreviewModal,
    isVerificationModalOpen,
    closeVerificationModal,
    openVerificationModal,
    isReplaceModalOpen,
    closeReplaceModal,
    openReplaceModal,
  } = useDocumentStore();

  const [activeInsightTab, setActiveInsightTab] = useState<"pending" | "missing" | "expiring" | "recent">("pending");

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const kpis = getDashboardKPIs();

  // Active filters count calculation
  let activeFilterCount = 0;
  if (filters.search) activeFilterCount++;
  if (filters.documentType && filters.documentType !== "ALL") activeFilterCount++;
  if (filters.category && filters.category !== "ALL") activeFilterCount++;
  if (filters.status && filters.status !== "ALL") activeFilterCount++;
  if (filters.verificationStatus && filters.verificationStatus !== "ALL") activeFilterCount++;
  if (filters.expiryStatus && filters.expiryStatus !== "ALL") activeFilterCount++;

  // Operational Insight Subset Lists
  const pendingDocs = documents.filter(
    (d) => d.verificationStatus === "Not Reviewed" || d.verificationStatus === "Under Review"
  );
  const expiringDocs = documents.filter((d) => {
    if (!d.expiryDate) return false;
    const days = Math.ceil((new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return days <= 14;
  });
  const recentUploads = [...documents].slice(0, 5);

  // Category Chart Data
  const categoryCounts: Record<string, number> = {};
  documents.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });
  const categoryChartData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    count: categoryCounts[cat],
  }));

  const COLORS = ["#38bdf8", "#34d399", "#f59e0b", "#f43f5e", "#a78bfa", "#38bdf8", "#fb7185"];

  // Table Column Definitions
  const columns = [
    {
      key: "documentNumber",
      header: "Document & Type",
      accessor: (doc: Document) => (
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <Link
              href={`/documents/${doc.id}`}
              className="font-extrabold text-slate-100 hover:text-sky-400 block truncate transition-colors text-xs"
            >
              {doc.documentNumber}
            </Link>
            <span className="text-[11px] text-slate-400 block truncate">{doc.title}</span>
            <span className="text-[10px] text-slate-400 block font-semibold">{doc.documentType} • v{doc.version}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      accessor: (doc: Document) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {doc.category}
        </span>
      ),
    },
    {
      key: "jobId",
      header: "Logistics Entity",
      accessor: (doc: Document) => (
        <div className="text-[11px] space-y-0.5 min-w-[130px]">
          {doc.jobNumber && (
            <Link
              href={`/operations/jobs/${doc.jobId || doc.jobNumber}`}
              className="font-mono font-bold text-sky-400 hover:underline block"
            >
              {doc.jobNumber}
            </Link>
          )}
          {doc.shipmentNumber && (
            <span className="text-slate-300 block font-mono text-[10px]">SHP: {doc.shipmentNumber}</span>
          )}
          {doc.containerNumber && (
            <Link
              href={`/operations/containers/${doc.containerId || doc.containerNumber}`}
              className="text-emerald-400 block font-mono hover:underline text-[10px]"
            >
              CON: {doc.containerNumber}
            </Link>
          )}
          {!doc.jobNumber && !doc.shipmentNumber && !doc.containerNumber && (
            <span className="text-slate-400 text-[10px] italic">General Customer Doc</span>
          )}
        </div>
      ),
    },
    {
      key: "uploadedAt",
      header: "Uploaded By & Date",
      accessor: (doc: Document) => (
        <div className="text-[11px] text-slate-300">
          <span className="font-semibold block">{doc.uploadedBy}</span>
          <span className="text-slate-400 text-[10px]">{doc.uploadedAt}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (doc: Document) => (
        <StatusBadge status={doc.status} />
      ),
    },
    {
      key: "verificationStatus",
      header: "Verification",
      accessor: (doc: Document) => (
        <StatusBadge
          status={
            doc.verificationStatus === "Verified"
              ? "Verified"
              : doc.verificationStatus === "Rejected"
              ? "Rejected"
              : "Pending"
          }
        />
      ),
    },
    {
      key: "expiryDate",
      header: "Expiry",
      accessor: (doc: Document) => {
        if (!doc.expiryDate) return <span className="text-[11px] text-slate-400">—</span>;
        const days = Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const isExp = days < 0;
        const isSoon = days >= 0 && days <= 14;

        return (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isExp
                ? "bg-rose-500/20 text-rose-300"
                : isSoon
                ? "bg-amber-500/20 text-amber-300"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {doc.expiryDate} {isSoon ? `(${days}d left)` : isExp ? "(Expired)" : ""}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (doc: Document) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            icon={Eye}
            onClick={() => openPreviewModal(doc)}
            title="Preview Document"
          >
            Preview
          </Button>

          {doc.verificationStatus !== "Verified" && (
            <Button
              variant="outline"
              size="xs"
              icon={ShieldCheck}
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => openVerificationModal(doc)}
              title="Verify Compliance"
            >
              Verify
            </Button>
          )}

          <Button
            variant="outline"
            size="xs"
            icon={History}
            onClick={() => openReplaceModal(doc)}
            title="Replace Version"
          >
            Replace
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <PageHeader
        title="DOCUMENT MANAGEMENT CENTER"
        subtitle="Centralized document repository, operational compliance checklist, and multi-tier verification engine."
        breadcrumbs={[{ label: "Documents", href: "/documents/center" }, { label: "Document Center" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchDocuments()}
            >
              Refresh
            </Button>

            <Link href="/documents/verification">
              <Button variant="outline" size="sm" icon={ShieldCheck}>
                Verification Queue ({kpis.pendingVerification})
              </Button>
            </Link>

            <Link href="/documents/requirements">
              <Button variant="outline" size="sm" icon={FileCheck}>
                Requirements Matrix
              </Button>
            </Link>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openUploadModal}
            >
              Upload Document
            </Button>
          </div>
        }
      />

      {/* Top operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div
          onClick={() => setFilters({ status: "ALL", verificationStatus: "ALL", expiryStatus: "ALL" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard
            title="TOTAL DOCS"
            value={kpis.total.toString()}
            icon={FileText}
          />
        </div>

        <div
          onClick={() => setFilters({ verificationStatus: "Under Review" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard
            title="PENDING VERIFICATION"
            value={kpis.pendingVerification.toString()}
            icon={Clock}
          />
        </div>

        <div
          onClick={() => setFilters({ verificationStatus: "Verified" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard
            title="VERIFIED"
            value={kpis.verified.toString()}
            icon={CheckCircle2}
          />
        </div>

        <div
          onClick={() => setFilters({ verificationStatus: "Rejected" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard
            title="REJECTED"
            value={kpis.rejected.toString()}
            icon={XCircle}
          />
        </div>

        <div
          onClick={() => setFilters({ status: "ALL" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard
            title="MISSING"
            value={kpis.missing.toString()}
            icon={AlertTriangle}
          />
        </div>

        <div
          onClick={() => setFilters({ expiryStatus: "Expired" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard
            title="EXPIRED"
            value={kpis.expired.toString()}
            icon={AlertTriangle}
          />
        </div>

        <div
          onClick={() => setFilters({ expiryStatus: "Expiring Soon" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard
            title="EXPIRING SOON"
            value={kpis.expiringSoon.toString()}
            icon={Calendar}
          />
        </div>

        <div
          onClick={() => setFilters({ status: "ALL" })}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <StatsCard
            title="UPLOADED TODAY"
            value={kpis.uploadedToday.toString()}
            icon={Upload}
          />
        </div>
      </div>

      {/* Main Operational Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operational Tabs */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between">
            <Tabs
              tabs={[
                { id: "pending", label: "Pending Verification", count: pendingDocs.length },
                { id: "expiring", label: "Expiring Soon", count: expiringDocs.length },
                { id: "recent", label: "Recently Uploaded", count: recentUploads.length },
              ]}
              activeTab={activeInsightTab}
              onChange={(tab) => setActiveInsightTab(tab as any)}
            />

            <Link href="/documents/verification">
              <Button variant="outline" size="xs" icon={ExternalLink}>
                View All Queue
              </Button>
            </Link>
          </div>

          <div className="p-4">
            {activeInsightTab === "pending" && (
              <div className="space-y-2">
                {pendingDocs.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-slate-100 block">{doc.documentNumber}: {doc.title}</span>
                      <span className="text-slate-400 text-[11px]">
                        Uploaded by {doc.uploadedBy} • {doc.uploadedAt} • Job: {doc.jobNumber || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status="Pending" />
                      <Button variant="outline" size="xs" icon={ShieldCheck} onClick={() => openVerificationModal(doc)}>
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeInsightTab === "expiring" && (
              <div className="space-y-2">
                {expiringDocs.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-amber-300 block">{doc.title}</span>
                      <span className="text-slate-400 text-[11px]">
                        Expires on: <strong className="text-amber-400">{doc.expiryDate}</strong> • Entity: {doc.customerName}
                      </span>
                    </div>

                    <Button variant="outline" size="xs" icon={History} onClick={() => openReplaceModal(doc)}>
                      Renew / Replace
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeInsightTab === "recent" && (
              <div className="space-y-2">
                {recentUploads.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">{doc.fileName}</span>
                      <span className="text-slate-400 text-[11px]">
                        {doc.documentType} • Uploaded {doc.uploadedAt} by {doc.uploadedBy}
                      </span>
                    </div>

                    <StatusBadge status={doc.verificationStatus === "Verified" ? "Verified" : "Pending"} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right 1 Col: Category Distribution Chart */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <CardTitle className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
              Category Distribution
            </CardTitle>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData.slice(0, 5)}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryChartData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Commercial: {categoryCounts["Commercial"] || 0}</span>
            <span>Shipping: {categoryCounts["Shipping"] || 0}</span>
            <span>Compliance: {categoryCounts["Compliance"] || 0}</span>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar & Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Search by Doc #, Title, File Name, Customer, Job #, Shipment #, Container #..."
              className="pl-9 text-xs"
            />
          </div>

          {/* Filter Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type */}
            <div className="w-40">
              <Select
                value={filters.documentType || "ALL"}
                onChange={(e) => setFilters({ documentType: e.target.value as any })}
                options={[
                  { label: "All Types", value: "ALL" },
                  ...DOCUMENT_TYPES.map((dt) => ({ label: dt.type, value: dt.type })),
                ]}
              />
            </div>

            {/* Category */}
            <div className="w-36">
              <Select
                value={filters.category || "ALL"}
                onChange={(e) => setFilters({ category: e.target.value as any })}
                options={[
                  { label: "All Categories", value: "ALL" },
                  ...DOCUMENT_CATEGORIES.map((c) => ({ label: c, value: c })),
                ]}
              />
            </div>

            {/* Verification Status */}
            <div className="w-36">
              <Select
                value={filters.verificationStatus || "ALL"}
                onChange={(e) => setFilters({ verificationStatus: e.target.value as any })}
                options={[
                  { label: "All Verifications", value: "ALL" },
                  { label: "Verified", value: "Verified" },
                  { label: "Under Review", value: "Under Review" },
                  { label: "Rejected", value: "Rejected" },
                ]}
              />
            </div>

            {/* Expiry Status */}
            <div className="w-36">
              <Select
                value={filters.expiryStatus || "ALL"}
                onChange={(e) => setFilters({ expiryStatus: e.target.value as any })}
                options={[
                  { label: "All Expiry", value: "ALL" },
                  { label: "Valid", value: "Valid" },
                  { label: "Expiring Soon", value: "Expiring Soon" },
                  { label: "Expired", value: "Expired" },
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

      {/* Main Document Table */}
      <Card className="p-0 overflow-hidden">
        <DataTable
          data={documents}
          columns={columns}
          isLoading={isLoading}
        />
      </Card>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
      />

      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={closePreviewModal}
        document={selectedDocument}
      />

      <DocumentVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={closeVerificationModal}
        document={selectedDocument}
      />

      <DocumentReplaceModal
        isOpen={isReplaceModalOpen}
        onClose={closeReplaceModal}
        document={selectedDocument}
      />
    </div>
  );
}
