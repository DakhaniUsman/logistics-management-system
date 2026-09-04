"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Document } from "@/types/document";
import { useDocumentStore } from "@/store/use-document-store";
import {
  Download,
  Printer,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  ShieldCheck,
  XCircle,
  History,
  CheckCircle2,
  Lock,
  ExternalLink,
  Building2,
  Briefcase,
  Ship,
  Boxes,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function DocumentPreviewModal({ isOpen, onClose, document: doc }: DocumentPreviewModalProps) {
  const { openVerificationModal, openReplaceModal } = useDocumentStore();
  const [activeViewTab, setActiveViewTab] = useState<"preview" | "versions" | "audit">("preview");

  if (!doc) return null;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleDownload = () => {
    toast.success(`Downloading file: ${doc.fileName}`);
  };

  const handlePrint = () => {
    toast.info(`Preparing print payload for ${doc.documentNumber}...`);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Document Preview: ${doc.documentNumber}`} maxWidth="2xl">
      <div className="space-y-4 text-xs">
        {/* Top Header Information Strip */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-sky-500/10 text-sky-400">
              {doc.fileType === "XLSX" || doc.fileType === "XLS" ? (
                <FileSpreadsheet className="w-5 h-5" />
              ) : doc.fileType === "PNG" || doc.fileType === "JPG" ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                <span>{doc.title}</span>
                {doc.isConfidential && (
                  <span className="bg-rose-500/20 text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Confidential
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-400">
                {doc.fileName} • {formatBytes(doc.fileSize)} • Version v{doc.version}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={doc.verificationStatus === "Verified" ? "Verified" : doc.verificationStatus === "Rejected" ? "Rejected" : "Pending"} />

            <Button variant="outline" size="xs" icon={Download} onClick={handleDownload}>
              Download
            </Button>

            <Button variant="outline" size="xs" icon={Printer} onClick={handlePrint}>
              Print
            </Button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 gap-4 text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveViewTab("preview")}
            className={`pb-2 border-b-2 transition-colors ${activeViewTab === "preview" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-slate-200"
              }`}
          >
            File Preview
          </button>
          <button
            onClick={() => setActiveViewTab("versions")}
            className={`pb-2 border-b-2 transition-colors ${activeViewTab === "versions" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-slate-200"
              }`}
          >
            Version History ({doc.versions.length})
          </button>
          <button
            onClick={() => setActiveViewTab("audit")}
            className={`pb-2 border-b-2 transition-colors ${activeViewTab === "audit" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-slate-200"
              }`}
          >
            Audit History ({doc.activities.length})
          </button>
        </div>

        {/* TAB CONTENT 1: FILE PREVIEW */}
        {activeViewTab === "preview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Realistic Canvas Preview Frame */}
            <div className="lg:col-span-2 min-h-[380px] bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              {/* Mock PDF Rendering Visual */}
              {doc.fileType === "PDF" && (
                <div className="w-full max-w-md bg-white text-slate-900 rounded-lg p-6 shadow-2xl space-y-4 font-mono text-[10px]">
                  <div className="flex justify-between border-b pb-2 border-slate-200">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">{doc.documentType.toUpperCase()}</h3>
                      <p className="text-[9px] text-slate-500">{doc.documentNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sky-600">FLOQ VERIFIED</p>
                      <p className="text-[9px] text-slate-400">Date: {doc.issueDate || "2026-08-14"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 p-2 rounded border border-slate-200">
                    <div>
                      <span className="text-slate-400 block uppercase">Shipper / Customer</span>
                      <strong className="text-slate-800">{doc.customerName || "ABC Electronics Ltd"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase">Operational Job</span>
                      <strong className="text-slate-800">{doc.jobNumber || "JOB-2026-00001"}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-700">
                    <p><strong>Cargo Description:</strong> Microcontrollers & Electronic Components</p>
                    <p><strong>Shipment Ref:</strong> {doc.shipmentNumber || "SHP-2026-00125"}</p>
                    <p><strong>Container / Seal:</strong> {doc.containerNumber || "MSCU1234567"} / SEAL-98402</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
                    <span>Page 1 of 1</span>
                    <span>Document Signature: SHA256-8F92A1...</span>
                  </div>
                </div>
              )}

              {/* Mock Image Rendering Visual */}
              {(doc.fileType === "PNG" || doc.fileType === "JPG") && (
                <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-lg p-3 text-center space-y-2">
                  <div className="h-48 bg-slate-800/80 rounded flex items-center justify-center border border-slate-700">
                    <ImageIcon className="w-12 h-12 text-slate-500" />
                  </div>
                  <p className="text-slate-300 font-bold text-xs">{doc.fileName}</p>
                  <p className="text-[10px] text-slate-500">Image Scan • High Resolution Document Proof</p>
                </div>
              )}

              {/* Mock Spreadsheet Rendering Visual */}
              {(doc.fileType === "XLSX" || doc.fileType === "XLS") && (
                <div className="w-full bg-slate-900 rounded-lg border border-slate-800 p-4 font-mono text-[10px] space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>EXCEL SPREADSHEET PREVIEW — {doc.fileName}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 bg-slate-850 p-2 rounded text-slate-300 border border-slate-800 font-semibold text-[9px]">
                    <div className="bg-slate-800 p-1">Item #</div>
                    <div className="bg-slate-800 p-1">Carton Code</div>
                    <div className="bg-slate-800 p-1">Weight (KG)</div>
                    <div className="bg-slate-800 p-1">Volume (CBM)</div>
                    <div>001</div>
                    <div>CTN-8490</div>
                    <div>45.0</div>
                    <div>0.25</div>
                    <div>002</div>
                    <div>CTN-8491</div>
                    <div>48.5</div>
                    <div>0.28</div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Metadata & Linked Entities */}
            <div className="space-y-3">
              {/* Linked Entities */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Logistics Relationships
                </h5>

                <div className="space-y-1.5">
                  {doc.customerName && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" /> Customer:
                      </span>
                      <span className="font-bold text-slate-200 truncate">{doc.customerName}</span>
                    </div>
                  )}

                  {doc.jobNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" /> Job:
                      </span>
                      <Link
                        href={`/operations/jobs/${doc.jobId || doc.jobNumber}`}
                        className="font-bold text-sky-400 hover:underline flex items-center gap-0.5"
                      >
                        {doc.jobNumber} <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  )}

                  {doc.shipmentNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Ship className="w-3 h-3 text-slate-400" /> Shipment:
                      </span>
                      <span className="font-bold text-slate-200">{doc.shipmentNumber}</span>
                    </div>
                  )}

                  {doc.containerNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Boxes className="w-3 h-3 text-slate-400" /> Container:
                      </span>
                      <Link
                        href={`/operations/containers/${doc.containerId || doc.containerNumber}`}
                        className="font-bold text-sky-400 hover:underline flex items-center gap-0.5"
                      >
                        {doc.containerNumber} <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Review Info */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Verification & Compliance
                </h5>

                <div className="space-y-1 text-slate-300">
                  <p><strong>Verification:</strong> {doc.verificationStatus}</p>
                  {doc.verifiedBy && <p><strong>Verified By:</strong> {doc.verifiedBy} ({doc.verifiedAt})</p>}
                  {doc.rejectedBy && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                      <p className="font-bold">Rejected by {doc.rejectedBy}:</p>
                      <p className="italic">{doc.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {doc.verificationStatus !== "Verified" && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    icon={ShieldCheck}
                    onClick={() => {
                      onClose();
                      openVerificationModal(doc);
                    }}
                  >
                    Review & Verify Document
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  icon={History}
                  onClick={() => {
                    onClose();
                    openReplaceModal(doc);
                  }}
                >
                  Upload New Version (Replace)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: VERSIONS */}
        {activeViewTab === "versions" && (
          <div className="space-y-2">
            {doc.versions.map((ver) => (
              <div
                key={ver.version}
                className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-extrabold text-slate-200 block">
                    Version v{ver.version} — {ver.fileName}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    Uploaded by {ver.uploadedBy} on {ver.uploadedAt} • {formatBytes(ver.fileSize)}
                  </span>
                  {ver.changeNote && <p className="text-slate-300 italic text-[11px] mt-1">{ver.changeNote}</p>}
                </div>

                <Button variant="outline" size="xs" icon={Download} onClick={handleDownload}>
                  Download v{ver.version}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* TAB CONTENT 3: AUDIT */}
        {activeViewTab === "audit" && (
          <div className="space-y-2">
            {doc.activities.map((act) => (
              <div key={act.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-400">{act.title}</span>
                  <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{act.description}</p>
                <span className="text-[10px] text-slate-500 block">By: {act.performedBy}</span>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
