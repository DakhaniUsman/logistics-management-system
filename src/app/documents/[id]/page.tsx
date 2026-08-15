"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/timeline";
import { useDocumentStore } from "@/store/use-document-store";
import { Document } from "@/types/document";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";
import { DocumentVerificationModal } from "@/components/documents/document-verification-modal";
import { DocumentReplaceModal } from "@/components/documents/document-replace-modal";
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  XCircle,
  History,
  Lock,
  Building2,
  Briefcase,
  Ship,
  Boxes,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Archive,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = (params.id as string) || "DOC-2026-00125";

  const {
    documents,
    getDocumentById,
    archiveDocument,
    openPreviewModal,
    openVerificationModal,
    openReplaceModal,
    isPreviewModalOpen,
    closePreviewModal,
    isVerificationModalOpen,
    closeVerificationModal,
    isReplaceModalOpen,
    closeReplaceModal,
  } = useDocumentStore();

  const [document, setDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadDoc() {
      const found = await getDocumentById(docId);
      if (found) setDocument(found);
      else if (documents.length > 0) setDocument(documents[0]);
    }
    loadDoc();
  }, [docId, documents, getDocumentById]);

  if (!document) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <p>Loading document details...</p>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleDownload = () => {
    toast.success(`Downloading ${document.fileName}...`);
  };

  const handleArchive = async () => {
    if (confirm("Are you sure you want to archive this operational document?")) {
      await archiveDocument(document.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Back Button & Page Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          icon={ArrowLeft}
          onClick={() => router.push("/documents/center")}
        >
          Back to Document Center
        </Button>
      </div>

      <PageHeader
        title={`${document.documentNumber}: ${document.title}`}
        subtitle={`Type: ${document.documentType} (${document.category}) • File: ${document.fileName} (v${document.version})`}
        breadcrumbs={[
          { label: "Documents", href: "/documents/center" },
          { label: "Document Center", href: "/documents/center" },
          { label: document.documentNumber },
        ]}
        statusBadge={
          <div className="flex items-center gap-2">
            <StatusBadge status={document.status} />
            <StatusBadge
              status={
                document.verificationStatus === "Verified"
                  ? "Verified"
                  : document.verificationStatus === "Rejected"
                  ? "Rejected"
                  : "Pending"
              }
            />
            {document.isConfidential && (
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Confidential
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon={FileText} onClick={() => openPreviewModal(document)}>
              Preview File
            </Button>

            <Button variant="outline" size="sm" icon={Download} onClick={handleDownload}>
              Download
            </Button>

            {document.verificationStatus !== "Verified" && (
              <Button
                variant="primary"
                size="sm"
                icon={ShieldCheck}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => openVerificationModal(document)}
              >
                Verify Document
              </Button>
            )}

            <Button variant="outline" size="sm" icon={History} onClick={() => openReplaceModal(document)}>
              Replace Document
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Archive}
              className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              onClick={handleArchive}
            >
              Archive
            </Button>
          </div>
        }
      />

      {/* Top Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Account</span>
            <span className="font-bold text-slate-100 text-xs block">{document.customerName || "N/A"}</span>
            <span className="text-[11px] text-slate-400">{document.customerId || "General Account"}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Related Job</span>
            {document.jobNumber ? (
              <Link
                href={`/operations/jobs/${document.jobId || document.jobNumber}`}
                className="font-bold text-sky-400 hover:underline text-xs block"
              >
                {document.jobNumber}
              </Link>
            ) : (
              <span className="text-slate-400 text-xs">Unlinked</span>
            )}
            <span className="text-[11px] text-slate-400">Operational Job</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Shipment & Booking</span>
            <span className="font-mono text-xs font-bold text-slate-100 block">
              {document.shipmentNumber || "SHP-N/A"}
            </span>
            <span className="text-[11px] text-slate-400">BKG: {document.bookingNumber || "N/A"}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Container Reference</span>
            {document.containerNumber ? (
              <Link
                href={`/operations/containers/${document.containerId || document.containerNumber}`}
                className="font-mono font-bold text-cyan-400 hover:underline text-xs block"
              >
                {document.containerNumber}
              </Link>
            ) : (
              <span className="text-slate-400 text-xs">N/A</span>
            )}
            <span className="text-[11px] text-slate-400">Physical Equipment</span>
          </div>
        </Card>
      </div>

      {/* Main Tabs Card */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-900/40 border-b border-slate-800">
          <Tabs
            tabs={[
              { id: "overview", label: "Document Specifications" },
              { id: "versions", label: "Version History", count: document.versions.length },
              { id: "audit", label: "Activity & Audit Trail", count: document.activities.length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    File & Metadata
                  </h4>
                  <p className="text-slate-300"><strong>Document ID:</strong> {document.documentNumber}</p>
                  <p className="text-slate-300"><strong>File Name:</strong> {document.fileName}</p>
                  <p className="text-slate-300"><strong>File Type:</strong> {document.fileType}</p>
                  <p className="text-slate-300"><strong>File Size:</strong> {formatBytes(document.fileSize)}</p>
                  <p className="text-slate-300"><strong>Uploaded By:</strong> {document.uploadedBy}</p>
                  <p className="text-slate-300"><strong>Uploaded At:</strong> {document.uploadedAt}</p>
                </div>

                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Compliance & Verification Status
                  </h4>
                  <p className="text-slate-300"><strong>Verification:</strong> {document.verificationStatus}</p>
                  {document.verifiedBy && (
                    <p className="text-slate-300">
                      <strong>Verified By:</strong> {document.verifiedBy} ({document.verifiedAt})
                    </p>
                  )}
                  {document.rejectedBy && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                      <p className="font-bold">Rejected by {document.rejectedBy}:</p>
                      <p className="italic">{document.rejectionReason}</p>
                    </div>
                  )}
                  <p className="text-slate-300"><strong>Mandatory:</strong> {document.isRequired ? "Yes" : "No"}</p>
                </div>

                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Dates & Operational Notes
                  </h4>
                  <p className="text-slate-300"><strong>Issue Date:</strong> {document.issueDate || "N/A"}</p>
                  <p className="text-slate-300"><strong>Expiry Date:</strong> {document.expiryDate || "N/A"}</p>
                  <p className="text-slate-300"><strong>Notes:</strong> {document.description || "None provided."}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "versions" && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
                Document Version Control Log
              </h4>

              <div className="space-y-2">
                {document.versions.map((ver) => (
                  <div
                    key={ver.version}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block text-xs">
                        Version v{ver.version} — {ver.fileName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Uploaded by {ver.uploadedBy} on {ver.uploadedAt} • {formatBytes(ver.fileSize)}
                      </span>
                      {ver.changeNote && <p className="text-slate-300 text-[11px] mt-1 italic">{ver.changeNote}</p>}
                    </div>

                    <Button variant="outline" size="xs" icon={Download} onClick={handleDownload}>
                      Download v{ver.version}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
                Audit Trail & History
              </h4>

              <Timeline
                events={document.activities.map((act) => ({
                  id: act.id,
                  title: act.title,
                  description: `${act.description} (By: ${act.performedBy})`,
                  timestamp: act.timestamp,
                  completed: true,
                }))}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={closePreviewModal}
        document={document}
      />

      <DocumentVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={closeVerificationModal}
        document={document}
      />

      <DocumentReplaceModal
        isOpen={isReplaceModalOpen}
        onClose={closeReplaceModal}
        document={document}
      />
    </div>
  );
}
