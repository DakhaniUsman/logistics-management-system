"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { ShieldCheck, CheckCircle2, XCircle, Eye, Search, FileText, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useDocumentStore } from "@/store/use-document-store";
import { Document } from "@/types/document";
import { DocumentVerificationModal } from "@/components/documents/document-verification-modal";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";

export default function DocumentVerificationPage() {
  const {
    documents,
    isLoading,
    fetchDocuments,
    openVerificationModal,
    openPreviewModal,
    selectedDocument,
    isVerificationModalOpen,
    closeVerificationModal,
    isPreviewModalOpen,
    closePreviewModal,
  } = useDocumentStore();

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter only pending documents
  const pendingDocs = documents.filter((d) => {
    const isPending = d.verificationStatus === "Not Reviewed" || d.verificationStatus === "Under Review" || d.status === "Pending Verification";
    if (!isPending) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.documentNumber.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.fileName.toLowerCase().includes(q) ||
      (d.customerName && d.customerName.toLowerCase().includes(q)) ||
      (d.jobNumber && d.jobNumber.toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      key: "documentNumber",
      header: "Document",
      accessor: (doc: Document) => (
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <Link
              href={`/documents/${doc.id}`}
              className="font-bold text-slate-100 hover:text-sky-400 block truncate transition-colors text-xs"
            >
              {doc.documentNumber}
            </Link>
            <span className="text-[11px] text-slate-400 block truncate">{doc.title}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{doc.documentType} • v{doc.version}</span>
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
      header: "Logistics Link",
      accessor: (doc: Document) => (
        <div className="text-[11px] space-y-0.5">
          <span className="font-semibold text-slate-200 block">{doc.customerName || "N/A"}</span>
          {doc.jobNumber && (
            <Link href={`/operations/jobs/${doc.jobId || doc.jobNumber}`} className="font-mono text-sky-400 hover:underline block text-[10px]">
              Job: {doc.jobNumber}
            </Link>
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
      key: "verificationStatus",
      header: "Status",
      accessor: (doc: Document) => (
        <StatusBadge status="Under Review" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (doc: Document) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            icon={Eye}
            onClick={() => openPreviewModal(doc)}
          >
            Preview
          </Button>

          <Button
            variant="primary"
            size="xs"
            icon={ShieldCheck}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => openVerificationModal(doc)}
          >
            Review & Decision
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="DOCUMENT VERIFICATION QUEUE"
        subtitle="Dedicated operational compliance hub for verifying logistics documents, customs approvals, and insurance policies."
        breadcrumbs={[
          { label: "Documents", href: "/documents/center" },
          { label: "Document Center", href: "/documents/center" },
          { label: "Verification Queue" },
        ]}
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchDocuments()}>
            Refresh Queue
          </Button>
        }
      />

      {/* Queue Banner */}
      <Card className="p-4 bg-amber-500/10 border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <h4 className="font-extrabold text-amber-300 text-sm">
              {pendingDocs.length} DOCUMENTS WAITING FOR COMPLIANCE VERIFICATION
            </h4>
            <p className="text-[11px] text-amber-200/80">
              Review attached files against HS codes, carrier bills of lading, and shipper customer details.
            </p>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queue by doc # or job #..."
            className="pl-9 text-xs"
          />
        </div>
      </Card>

      {/* Main Table */}
      <Card className="p-0 overflow-hidden">
        <DataTable data={pendingDocs} columns={columns} isLoading={isLoading} />
      </Card>

      {/* Modals */}
      <DocumentVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={closeVerificationModal}
        document={selectedDocument}
      />

      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={closePreviewModal}
        document={selectedDocument}
      />
    </div>
  );
}
