"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Delivery } from "@/types/delivery";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { AlertTriangle } from "lucide-react";

interface DeliveryDelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: Delivery | null;
}

export function DeliveryDelayModal({ isOpen, onClose, delivery: del }: DeliveryDelayModalProps) {
  const { markDelayed } = useDeliveryStore();

  const [reasonCategory, setReasonCategory] = useState("Highway Traffic Congestion");
  const [remarks, setRemarks] = useState("");

  if (!del) return null;

  const handleDelaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullReason = remarks ? `${reasonCategory} — ${remarks}` : reasonCategory;
    await markDelayed(del.id, fullReason);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Flag Delivery Delay: ${del.deliveryNumber}`} maxWidth="md">
      <form onSubmit={handleDelaySubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1 text-amber-200">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Delivery Schedule Delay Reporting</span>
          </div>
          <p className="text-[11px] opacity-90">
            Customer: <strong>{del.customerName}</strong> • Driver: <strong>{del.driverName}</strong> ({del.vehicleNumber})
          </p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Delay Reason Category *
          </label>
          <Select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            options={[
              { label: "Highway Traffic Congestion / Toll Queue", value: "Highway Traffic Congestion" },
              { label: "Vehicle Mechanical Breakdown", value: "Vehicle Breakdown" },
              { label: "Customer Unloading Bay Congestion", value: "Customer Unloading Delay" },
              { label: "Adverse Heavy Weather Conditions", value: "Weather Delay" },
              { label: "Customer Gate Security Check Delay", value: "Security Gate Delay" },
            ]}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Detailed Delay Remarks & Updated ETA
          </label>
          <Input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Delayed by 1.5 hours at MIDC toll plaza. Revised ETA 19:30."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={AlertTriangle} className="bg-amber-600 hover:bg-amber-700 text-white">
            Confirm Delay Flag
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
