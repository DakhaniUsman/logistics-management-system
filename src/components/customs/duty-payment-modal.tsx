"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomsDeclaration } from "@/types/customs";
import { useCustomsStore } from "@/store/use-customs-store";
import { DollarSign, CheckCircle2, FileText, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface DutyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  declaration: CustomsDeclaration | null;
}

export function DutyPaymentModal({ isOpen, onClose, declaration: dec }: DutyPaymentModalProps) {
  const { markDutyPaid } = useCustomsStore();
  const [paymentRef, setPaymentRef] = useState(
    `ICEGATE-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
  );

  if (!dec) return null;

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRef.trim()) {
      toast.error("Payment reference is required.");
      return;
    }
    await markDutyPaid(dec.id, paymentRef, "Dakhani Usman");
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Customs Duty Payment: ${dec.declarationNumber}`} maxWidth="md">
      <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs pt-1">
        {/* Payment Summary Box */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-bold text-[11px] uppercase">Customs Office</span>
            <span className="font-bold text-slate-200">{dec.customsOffice}</span>
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Assessed Customs Value:</span>
              <span className="font-mono font-bold">{dec.currency} {dec.customsValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Basic Customs Duty (BCD):</span>
              <span className="font-mono">{dec.currency} {dec.dutyAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST / Tax Component:</span>
              <span className="font-mono">{dec.currency} {dec.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Port Handling / Surcharge:</span>
              <span className="font-mono">{dec.currency} {dec.otherCharges.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-extrabold text-emerald-400">
            <span>TOTAL DUTY & TAX PAYABLE:</span>
            <span className="font-mono text-base">{dec.currency} {dec.totalPayable.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Ref Field */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Customs Payment Reference / Challan Number *
          </label>
          <Input
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="e.g. ICEGATE-TXN-98402910"
          />
        </div>

        {/* Info Disclaimer */}
        <p className="text-[10px] text-slate-400 italic">
          * Simulated payment gateway confirmation. Marking duty paid will issue Customs Out of Charge release eligibility.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={CreditCard} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Confirm Duty Payment
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
