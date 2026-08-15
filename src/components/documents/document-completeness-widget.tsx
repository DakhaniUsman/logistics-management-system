"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DocumentCompleteness, Document } from "@/types/document";
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  Eye,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { useDocumentStore } from "@/store/use-document-store";

interface DocumentCompletenessWidgetProps {
  jobId?: string;
  shipmentId?: string;
  bookingId?: string;
  containerId?: string;
  onUploadClick?: () => void;
  onPreviewClick?: (doc: Document) => void;
}

export function DocumentCompletenessWidget({
  jobId,
  shipmentId,
  bookingId,
  containerId,
  onUploadClick,
  onPreviewClick,
}: DocumentCompletenessWidgetProps) {
  const {
    getJobDocuments,
    getShipmentDocuments,
    getBookingDocuments,
    getContainerDocuments,
    openUploadModal,
    openPreviewModal,
    openVerificationModal,
  } = useDocumentStore();

  let docs: Document[] = [];
  if (jobId) docs = getJobDocuments(jobId);
  else if (shipmentId) docs = getShipmentDocuments(shipmentId);
  else if (bookingId) docs = getBookingDocuments(bookingId);
  else if (containerId) docs = getContainerDocuments(containerId);

  const total = docs.length + (jobId ? 1 : 0); // Include 1 expected missing compliance doc for demo
  const verified = docs.filter((d) => d.verificationStatus === "Verified").length;
  const pending = docs.filter(
    (d) => d.verificationStatus === "Not Reviewed" || d.verificationStatus === "Under Review"
  ).length;
  const rejected = docs.filter((d) => d.verificationStatus === "Rejected").length;
  const missing = jobId ? 1 : 0;

  const percentage = total > 0 ? Math.round((verified / total) * 100) : 100;
  const status = percentage === 100 ? "Complete" : percentage > 50 ? "Partially Complete" : "Incomplete";

  const statusColor =
    status === "Complete"
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : status === "Partially Complete"
      ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
      : "text-rose-400 border-rose-500/30 bg-rose-500/10";

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>DOCUMENT COMPLETENESS</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                {status}
              </span>
            </CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified: <strong className="text-slate-200">{verified}</strong> of {total} required documents
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="xs"
          icon={Plus}
          onClick={onUploadClick || openUploadModal}
        >
          Upload Document
        </Button>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Progress Bar & Metric Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">Overall Readiness</span>
            <span className="text-sky-400 font-mono text-sm">{percentage}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                percentage === 100
                  ? "bg-emerald-500"
                  : percentage > 50
                  ? "bg-sky-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Required</span>
              <span className="font-extrabold text-slate-200 font-mono">{total}</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 block text-[10px] uppercase font-bold">Verified</span>
              <span className="font-extrabold text-emerald-400 font-mono">{verified}</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 block text-[10px] uppercase font-bold">Pending</span>
              <span className="font-extrabold text-amber-400 font-mono">{pending}</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-400 block text-[10px] uppercase font-bold">Missing</span>
              <span className="font-extrabold text-rose-400 font-mono">{missing}</span>
            </div>
          </div>
        </div>

        {/* Document Checklist Items */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Required Documents Checklist
          </h5>

          {docs.length === 0 ? (
            <p className="text-slate-400 text-xs py-2 italic">No documents attached yet.</p>
          ) : (
            <div className="space-y-1.5">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/30 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {doc.verificationStatus === "Verified" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : doc.verificationStatus === "Rejected" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    )}

                    <div className="truncate">
                      <span className="font-bold text-slate-200 block truncate">{doc.documentType}</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {doc.fileName} • v{doc.version}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={doc.verificationStatus === "Verified" ? "Verified" : doc.verificationStatus === "Rejected" ? "Rejected" : "Pending"} />

                    <Button
                      variant="outline"
                      size="xs"
                      icon={Eye}
                      onClick={() => (onPreviewClick ? onPreviewClick(doc) : openPreviewModal(doc))}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}

              {/* Demo Missing Item */}
              {jobId && (
                <div className="p-2.5 rounded-lg border border-dashed border-rose-500/40 bg-rose-500/5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-bold text-rose-300 block">Customs Clearance Certificate</span>
                      <span className="text-[10px] text-rose-400/80 block">Missing — Mandatory for destination import</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    icon={Upload}
                    className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                    onClick={onUploadClick || openUploadModal}
                  >
                    Upload Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
