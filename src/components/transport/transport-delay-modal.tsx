"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Trip } from "@/types/transport";
import { useTransportStore } from "@/store/use-transport-store";
import { AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

interface TransportDelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export function TransportDelayModal({ isOpen, onClose, trip }: TransportDelayModalProps) {
  const { markDelayed } = useTransportStore();

  const [reasonCategory, setReasonCategory] = useState("Highway Traffic Congestion");
  const [remarks, setRemarks] = useState("");

  if (!trip) return null;

  const handleDelaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullReason = remarks ? `${reasonCategory} — ${remarks}` : reasonCategory;
    await markDelayed(trip.id, fullReason);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Mark Trip Delayed: ${trip.tripNumber}`} maxWidth="md">
      <form onSubmit={handleDelaySubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1 text-amber-200">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Operational Exception Reporting</span>
          </div>
          <p className="text-[11px] opacity-90">
            Vehicle: <strong>{trip.vehicleNumber}</strong> • Driver: <strong>{trip.driverName}</strong>
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
              { label: "Highway Traffic Congestion / Accident", value: "Highway Traffic Congestion" },
              { label: "Vehicle Mechanical Breakdown", value: "Vehicle Mechanical Breakdown" },
              { label: "Adverse Weather / Heavy Rainfall", value: "Adverse Weather" },
              { label: "Customs Hold / Port Gate Delay", value: "Customs Hold" },
              { label: "Warehouse Loading Bay Delay", value: "Warehouse Loading Bay Delay" },
              { label: "Driver Health / Duty Hours Issue", value: "Driver Duty Hours Limit" },
            ]}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Detailed Delay Remarks & Expected Recovery Time
          </label>
          <Input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. 2-hour delay at Mumbai-Pune expressway toll plaza..."
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
