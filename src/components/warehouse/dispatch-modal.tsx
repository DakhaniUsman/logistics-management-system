"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dispatch } from "@/types/warehouse";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { useTransportStore } from "@/store/use-transport-store";
import { Truck, CheckCircle2 } from "lucide-react";

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatch: Dispatch | null;
}

export function DispatchModal({ isOpen, onClose, dispatch: dsp }: DispatchModalProps) {
  const { confirmDispatch } = useWarehouseStore();
  const { trips } = useTransportStore();

  const [selectedTripId, setSelectedTripId] = useState(dsp?.transportTripId || "");

  if (!dsp) return null;

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await confirmDispatch(dsp.id);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Outbound Dispatch: ${dsp.dispatchNumber}`} maxWidth="md">
      <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-slate-300">
          <p className="font-bold text-sky-400">Packing Ref: {dsp.packingNumber} • Job: {dsp.jobNumber}</p>
          <p className="text-[11px] text-slate-400">Customer: {dsp.customerName}</p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Linked Transport Trip & Carrier Truck *
          </label>
          <Select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            options={[
              { label: "MH 04 AB 1234 (Rahul Shaikh) - TRIP-2026-00125", value: "TRIP-2026-00125" },
              ...trips.map((t) => ({
                label: `${t.tripNumber} - Vehicle ${t.vehicleNumber} (${t.driverName})`,
                value: t.id,
              })),
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={Truck} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Confirm Outbound Dispatch
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
