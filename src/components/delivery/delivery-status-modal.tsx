"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Delivery, DeliveryStatus } from "@/types/delivery";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { CheckCircle2, Truck, MapPin, Box } from "lucide-react";

interface DeliveryStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: Delivery | null;
}

export function DeliveryStatusModal({ isOpen, onClose, delivery: del }: DeliveryStatusModalProps) {
  const { markOutForDelivery, markArrived, startUnloading, markDelivered } = useDeliveryStore();

  const [targetStatus, setTargetStatus] = useState<DeliveryStatus>("Out for Delivery");
  const [notes, setNotes] = useState("");

  if (!del) return null;

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetStatus === "Out for Delivery") {
      await markOutForDelivery(del.id, notes);
    } else if (targetStatus === "Arrived") {
      await markArrived(del.id, notes);
    } else if (targetStatus === "Unloading") {
      await startUnloading(del.id);
    } else if (targetStatus === "Delivered") {
      await markDelivered(del.id);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Update Delivery Status: ${del.deliveryNumber}`} maxWidth="md">
      <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-slate-300">
          <p className="font-bold text-sky-400">Customer: {del.customerName} • Job: {del.jobNumber}</p>
          <p className="text-[11px] text-slate-400">
            Destination: {del.deliveryCity}, {del.deliveryState} • Truck: {del.vehicleNumber} ({del.driverName})
          </p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            New Milestone Execution Status *
          </label>
          <Select
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as any)}
            options={[
              { label: "Out for Delivery — Departed warehouse for customer destination", value: "Out for Delivery" },
              { label: "Arrived — Arrived at customer dock gate", value: "Arrived" },
              { label: "Unloading — Cargo unloading commenced at bay", value: "Unloading" },
              { label: "Delivered — Cargo physically handed over to recipient", value: "Delivered" },
            ]}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Operational Execution Remarks
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter gate arrival time, unloading bay #, or driver remarks..."
          />
        </div>

        <p className="text-[10px] text-slate-400 italic">
          * Note: Marking &quot;Delivered&quot; indicates physical handover. Status will move to &quot;Completed&quot; only after POD verification.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={CheckCircle2} className="bg-sky-600 hover:bg-sky-700 text-white">
            Confirm Milestone Transition
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
