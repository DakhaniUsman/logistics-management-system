"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Document } from "@/types/document";
import { useDocumentStore } from "@/store/use-document-store";
import { ShieldCheck, XCircle, AlertTriangle, FileText, CheckCircle2, Building2, Briefcase, Ship, Boxes } from "lucide-react";
import { toast } from "sonner";

interface DocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function DocumentVerificationModal({ isOpen, onClose, document: doc }: DocumentVerificationModalProps) {
  const { verifyDocument, rejectDocument } = useDocumentStore();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!doc) return null;

  const handleApprove = async () => {
    await verifyDocument(doc.id, "Dakhani Usman (Compliance Lead)");
    onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required before rejecting a document.");
      return;
    }
    await rejectDocument(doc.id, rejectionReason, "Dakhani Usman (Compliance Officer)");
    setRejectionReason("");
    setShowRejectForm(false);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Document Compliance Review: ${doc.documentNumber}`} maxWidth="lg">
      <div className="space-y-4 text-xs pt-1">
        {/* Document Header Card */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-extrabold text-slate-100 text-sm block">{doc.title}</span>
            <span className="text-[11px] text-slate-400">
              Type: <strong>{doc.documentType}</strong> ({doc.category}) • {doc.fileName}
            </span>
          </div>

          <StatusBadge status={doc.verificationStatus === "Verified" ? "Verified" : doc.verificationStatus === "Rejected" ? "Rejected" : "Under Review"} />
        </div>

        {/* Audit & Relationship Context Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1.5">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Upload & File Specs
            </h5>

            <p className="text-slate-300"><strong>Uploaded By:</strong> {doc.uploadedBy}</p>
            <p className="text-slate-300"><strong>Upload Date:</strong> {doc.uploadedAt}</p>
            <p className="text-slate-300"><strong>Version:</strong> v{doc.version}</p>
            <p className="text-slate-300"><strong>Mandatory:</strong> {doc.isRequired ? "Yes" : "No"}</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1.5">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Linked Logistics Hierarchy
            </h5>

            <p className="text-slate-300 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" /> Customer: {doc.customerName || "N/A"}
            </p>
            <p className="text-slate-300 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-slate-400" /> Job: {doc.jobNumber || "N/A"}
            </p>
            <p className="text-slate-300 flex items-center gap-1">
              <Ship className="w-3 h-3 text-slate-400" /> Shipment: {doc.shipmentNumber || "N/A"}
            </p>
            <p className="text-slate-300 flex items-center gap-1">
              <Boxes className="w-3 h-3 text-slate-400" /> Container: {doc.containerNumber || "N/A"}
            </p>
          </div>
        </div>

        {/* Dates & Notes */}
        {(doc.issueDate || doc.expiryDate || doc.description) && (
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-1">
            {doc.issueDate && <p className="text-slate-300"><strong>Issue Date:</strong> {doc.issueDate}</p>}
            {doc.expiryDate && <p className="text-slate-300"><strong>Expiry Date:</strong> {doc.expiryDate}</p>}
            {doc.description && <p className="text-slate-300"><strong>Notes:</strong> {doc.description}</p>}
          </div>
        )}

        {/* Rejection Form Input */}
        {showRejectForm ? (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Provide Mandatory Rejection Reason</span>
            </div>

            <Input
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Container number mismatch or missing official stamp..."
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="xs" onClick={() => setShowRejectForm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="xs"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        ) : (
          /* Decision Action Bar */
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
            <div>
              <span className="font-extrabold text-slate-200 block text-xs">Verification Action Required</span>
              <span className="text-[11px] text-slate-400 block">
                Verify document authenticity or mark rejected with compliance notes.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={XCircle}
                className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                onClick={() => setShowRejectForm(true)}
              >
                Reject Document
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleApprove}
              >
                Approve & Verify
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
