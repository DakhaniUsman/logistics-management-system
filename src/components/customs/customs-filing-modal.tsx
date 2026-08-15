"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomsDeclaration } from "@/types/customs";
import { useCustomsStore } from "@/store/use-customs-store";
import { useDocumentStore } from "@/store/use-document-store";
import { FileCheck, CheckCircle2, AlertTriangle, Send, XCircle, Building2, Briefcase } from "lucide-react";

interface CustomsFilingModalProps {
  isOpen: boolean;
  onClose: () => void;
  declaration: CustomsDeclaration | null;
}

export function CustomsFilingModal({ isOpen, onClose, declaration: dec }: CustomsFilingModalProps) {
  const { fileDeclaration } = useCustomsStore();
  const { getJobDocuments } = useDocumentStore();

  if (!dec) return null;

  const jobDocs = getJobDocuments(dec.jobId);
  const unverifiedDocs = jobDocs.filter((d) => d.verificationStatus !== "Verified");

  const checklistItems = [
    { label: "Shipment Linked", isOk: !!dec.shipmentNumber, detail: dec.shipmentNumber || "Missing" },
    { label: "Customer Linked", isOk: !!dec.customerName, detail: dec.customerName || "Missing" },
    { label: "Customs Office Selected", isOk: !!dec.customsOffice, detail: dec.customsOffice || "Missing" },
    { label: "Origin & Destination Set", isOk: !!(dec.countryOfOrigin && dec.countryOfDestination), detail: `${dec.countryOfOrigin} → ${dec.countryOfDestination}` },
    { label: "Customs Valuation Entered", isOk: dec.customsValue > 0, detail: `${dec.currency} ${dec.customsValue.toLocaleString()}` },
    { label: "Documents Verified", isOk: unverifiedDocs.length === 0, detail: unverifiedDocs.length === 0 ? "All verified" : `${unverifiedDocs.length} pending review` },
  ];

  const allReady = checklistItems.every((item) => item.isOk);

  const handleFilingSubmit = async () => {
    await fileDeclaration(dec.id, "Dakhani Usman (Customs Officer)");
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`File Declaration: ${dec.declarationNumber}`} maxWidth="lg">
      <div className="space-y-4 text-xs pt-1">
        {/* Readiness Checklist Banner */}
        <div
          className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${allReady
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
        >
          <div className="flex items-center gap-2.5">
            {allReady ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="font-extrabold text-xs block">
                {allReady ? "READY FOR CUSTOMS FILING" : "PRE-FILING CHECKLIST INCOMPLETE"}
              </span>
              <span className="text-[11px] opacity-90 block">
                {allReady
                  ? "All compliance prerequisites met. Confirm filing with customs portal."
                  : "Resolve incomplete prerequisites before filing."}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Readiness Checklist Grid */}
        <div className="space-y-2">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Customs Filing Requirements Checklist
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${item.isOk
                    ? "bg-slate-900/40 border-slate-800"
                    : "bg-rose-500/10 border-rose-500/30"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {item.isOk ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-200">{item.label}</span>
                </div>

                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px] text-right">
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Declaration Context */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-slate-300">
          <p><strong>Customs Type:</strong> {dec.customsType} ({dec.direction})</p>
          <p><strong>Customs Office:</strong> {dec.customsOffice}</p>
          <p><strong>Assigned Broker:</strong> {dec.brokerName}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Send}
            disabled={!allReady}
            onClick={handleFilingSubmit}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            Submit Declaration to Customs
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
