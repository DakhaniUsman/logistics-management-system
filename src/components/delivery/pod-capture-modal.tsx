"use client";

import React, { useState, useRef } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Delivery, CargoCondition } from "@/types/delivery";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { FileCheck, PenTool, CheckCircle2, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface PodCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: Delivery | null;
}

export function PodCaptureModal({ isOpen, onClose, delivery: del }: PodCaptureModalProps) {
  const { capturePOD } = useDeliveryStore();

  const [recipientName, setRecipientName] = useState(del?.recipientName || "Ahmed Khan");
  const [recipientDesignation, setRecipientDesignation] = useState("Warehouse Receiving Manager");
  const [recipientPhone, setRecipientPhone] = useState("+91 98211 44556");
  const [expectedQty, setExpectedQty] = useState(1000);
  const [deliveredQty, setDeliveredQty] = useState(995);
  const [shortQty, setShortQty] = useState(5);
  const [damagedQty, setDamagedQty] = useState(0);
  const [condition, setCondition] = useState<CargoCondition>("Good Condition");
  const [remarks, setRemarks] = useState("Received in intact condition. Digital signature captured.");
  const [isSigned, setIsSigned] = useState(true);

  if (!del) return null;

  const handlePodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName.trim()) {
      toast.error("Recipient name is required.");
      return;
    }
    if (!isSigned) {
      toast.error("Recipient signature is required for POD verification.");
      return;
    }

    await capturePOD(del.id, {
      recipientName,
      recipientDesignation,
      recipientPhone,
      expectedQuantity: Number(expectedQty),
      deliveredQuantity: Number(deliveredQty),
      shortQuantity: Number(shortQty),
      damagedQuantity: Number(damagedQty),
      condition,
      signatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 25 Q 30 5 50 25 T 90 25' stroke='%2338bdf8' fill='none' stroke-width='2'/></svg>",
      remarks,
    });

    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Capture Proof of Delivery (POD): ${del.deliveryNumber}`} maxWidth="lg">
      <form onSubmit={handlePodSubmit} className="space-y-4 text-xs pt-1">
        {/* Context Summary */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between text-slate-300">
          <div>
            <span className="font-extrabold text-sky-400 text-xs block">Customer: {del.customerName}</span>
            <span className="text-[11px] text-slate-400">Job: {del.jobNumber} • Shipment: {del.shipmentNumber}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">CARRIER TRUCK</span>
            <span className="font-mono text-emerald-400 font-bold">{del.vehicleNumber} ({del.driverName})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Recipient Name */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Recipient Name *
            </label>
            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Ahmed Khan" />
          </div>

          {/* Recipient Designation */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Recipient Designation *
            </label>
            <Input
              value={recipientDesignation}
              onChange={(e) => setRecipientDesignation(e.target.value)}
              placeholder="Warehouse Receiving Manager"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Recipient Phone *
            </label>
            <Input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="+91 98211 44556" />
          </div>

          {/* Cargo Condition */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Received Cargo Condition *
            </label>
            <Select
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              options={[
                { label: "Good Condition (Clean Handover)", value: "Good Condition" },
                { label: "Damaged Cargo", value: "Damaged" },
                { label: "Partially Damaged", value: "Partially Damaged" },
                { label: "Packaging Damaged", value: "Packaging Damaged" },
                { label: "Rejected by Customer", value: "Rejected" },
              ]}
            />
          </div>

          {/* Quantities */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Expected Qty *
            </label>
            <Input type="number" value={expectedQty} onChange={(e) => setExpectedQty(Number(e.target.value))} />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Actual Delivered Qty *
            </label>
            <Input type="number" value={deliveredQty} onChange={(e) => setDeliveredQty(Number(e.target.value))} />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Shortage Units
            </label>
            <Input type="number" value={shortQty} onChange={(e) => setShortQty(Number(e.target.value))} />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Damaged Units
            </label>
            <Input type="number" value={damagedQty} onChange={(e) => setDamagedQty(Number(e.target.value))} />
          </div>
        </div>

        {/* Digital Signature Pad Simulation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-sky-400" />
              Recipient E-Signature *
            </label>
            <span className="text-[10px] text-emerald-400 font-bold">✓ Digital Signature Captured</span>
          </div>

          <div className="p-4 rounded-lg border border-sky-500/30 bg-slate-950 flex flex-col items-center justify-center space-y-2 text-center h-28 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="50" className="w-48 h-12">
              <path d="M10 35 Q 40 10 70 35 T 150 35 T 190 20" stroke="#38bdf8" fill="none" strokeWidth="2.5" />
            </svg>
            <span className="text-[10px] text-slate-400 font-mono">Digitally signed by {recipientName || "Recipient"}</span>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            POD Delivery Notes & Inspection Remarks
          </label>
          <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Cargo received safely. Digital POD verified." />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={FileCheck} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Submit POD for Verification
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
