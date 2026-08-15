"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PickList } from "@/types/warehouse";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { CheckCircle2, Box } from "lucide-react";

interface PickingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickList: PickList | null;
}

export function PickingModal({ isOpen, onClose, pickList: pick }: PickingModalProps) {
  const { completePicking } = useWarehouseStore();

  if (!pick) return null;

  const handlePickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completePicking(pick.id);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Execute Pick Operation: ${pick.pickNumber}`} maxWidth="lg">
      <form onSubmit={handlePickSubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-slate-300">
          <p className="font-bold text-sky-400">Customer: {pick.customerName} • Job: {pick.jobNumber}</p>
          <p className="text-[11px] text-slate-400">Shipment: {pick.shipmentNumber}</p>
        </div>

        <div className="space-y-2">
          <h5 className="font-bold text-slate-400 uppercase text-[10px]">Pick List SKUs & Locations</h5>
          {pick.items.map((item) => (
            <div key={item.id} className="p-3 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-slate-100 block">{item.itemCode}: {item.description}</span>
                <span className="text-emerald-400 font-mono text-[11px]">Location: {item.locationCode}</span>
              </div>

              <div className="text-right font-mono">
                <span className="text-slate-300 block">Requested: {item.requestedQuantity}</span>
                <span className="text-emerald-400 font-bold">Picked: {item.requestedQuantity}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={CheckCircle2} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Complete Picking Operation
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
