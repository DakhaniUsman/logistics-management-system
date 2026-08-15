"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { FileCheck, CheckCircle2, Clock, AlertTriangle, Upload, Plus, Briefcase, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useDocumentStore } from "@/store/use-document-store";
import { DocumentRequirement } from "@/types/document";
import { DocumentUploadModal } from "@/components/documents/document-upload-modal";

export default function DocumentRequirementsPage() {
  const { requirements, fetchDocuments, openUploadModal, isUploadModalOpen, closeUploadModal } = useDocumentStore();
  const [selectedReq, setSelectedReq] = useState<DocumentRequirement | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const columns = [
    {
      key: "jobNumber",
      header: "Operational Job",
      accessor: (req: DocumentRequirement) => (
        <div>
          <Link
            href={`/operations/jobs/${req.jobId || req.jobNumber}`}
            className="font-extrabold text-sky-400 hover:underline text-xs flex items-center gap-1"
          >
            <span>{req.jobNumber || "JOB-2026-00001"}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <span className="text-[11px] text-slate-400 block">{req.customerName || "ABC Electronics Ltd"}</span>
        </div>
      ),
    },
    {
      key: "documentType",
      header: "Required Document Type",
      accessor: (req: DocumentRequirement) => (
        <div>
          <span className="font-bold text-slate-100 text-xs block">{req.documentType}</span>
          <span className="text-[10px] text-slate-400 block">{req.category} Mandatory Doc</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Requirement Status",
      accessor: (req: DocumentRequirement) => (
        <StatusBadge
          status={
            req.status === "Verified"
              ? "Verified"
              : req.status === "Pending Verification"
              ? "Pending"
              : req.status === "Rejected"
              ? "Rejected"
              : "Missing"
          }
        />
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      accessor: (req: DocumentRequirement) => (
        <span className="text-xs font-mono text-slate-300">{req.dueDate || "Before Departure"}</span>
      ),
    },
    {
      key: "notes",
      header: "Notes & Action",
      accessor: (req: DocumentRequirement) => (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 italic truncate max-w-[200px]">
            {req.notes || "Standard export compliance document."}
          </span>

          {req.status === "Missing" || req.status === "Rejected" ? (
            <Button
              variant="outline"
              size="xs"
              icon={Upload}
              className="text-sky-400 border-sky-500/30 hover:bg-sky-500/10 shrink-0"
              onClick={() => {
                setSelectedReq(req);
                openUploadModal();
              }}
            >
              Upload Missing
            </Button>
          ) : (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="DOCUMENT REQUIREMENTS MATRIX"
        subtitle="Mandatory document readiness matrix tracking required export/import documentation across all active jobs."
        breadcrumbs={[
          { label: "Documents", href: "/documents/center" },
          { label: "Document Center", href: "/documents/center" },
          { label: "Requirements Matrix" },
        ]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={openUploadModal}>
            Upload Document
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden">
        <DataTable data={requirements} columns={columns} />
      </Card>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        defaultJobId={selectedReq?.jobId}
      />
    </div>
  );
}
