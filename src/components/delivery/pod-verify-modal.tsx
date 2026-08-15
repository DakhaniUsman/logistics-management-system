"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProofOfDelivery } from "@/types/delivery";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { ShieldCheck, CheckCircle2, FileText, AlertTriangle } from "lucide-react";

interface PodVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pod: ProofOfDelivery | null;
}

export function PodVerifyModal({ isOpen, onClose, pod }: PodVerifyModalProps) {
  const { verifyPOD } = useDeliveryStore();

  const [verifierName, setVerifierName] = useState("Aamir Khan (Operations Lead)");

  if (!pod) return null;

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyPOD(pod.id);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Verify Proof of Delivery (POD): ${pod.podNumber}`} maxWidth="md">
      <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-2 text-emerald-200">
          <div className="flex items-center gap-2 font-bold text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>POD Audit Verification & Sign-Off</span>
          </div>
          <p className="text-[11px] opacity-90">
            Recipient: <strong>{pod.recipientName}</strong> ({pod.recipientDesignation}) • Date: {pod.receivedDate} ({pod.receivedTime})
          </p>
        </div>

        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1.5 text-slate-300">
          <p><strong>Cargo Condition:</strong> <span className="text-emerald-400 font-bold">{pod.condition}</span></p>
          <p><strong>Delivered Quantity:</strong> {pod.deliveredQuantity.toLocaleString()} / {pod.expectedQuantity.toLocaleString()} Units</p>
          <p><strong>Digital Signature:</strong> <span className="text-sky-400 font-bold">Captured & Validated</span></p>
          <p><strong>Document Ref:</strong> <span className="font-mono text-amber-300">{pod.documentNumber || `${pod.podNumber}.pdf`}</span></p>
        </div>

        <p className="text-[10px] text-slate-400 italic">
          * Verifying POD will finalize the delivery lifecycle and mark Delivery Status as COMPLETED.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={CheckCircle2} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Approve & Complete Delivery
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
