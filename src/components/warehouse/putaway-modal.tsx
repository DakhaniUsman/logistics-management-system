"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { Boxes, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface PutAwayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PutAwayModal({ isOpen, onClose }: PutAwayModalProps) {
  const { putAways, locations, operators, completePutAway } = useWarehouseStore();

  const pendingPutAway = putAways.find((p) => p.status === "Pending" || p.status === "In Progress") || putAways[0];

  const [selectedLocationCode, setSelectedLocationCode] = useState(
    pendingPutAway?.locationCode || "A-01-03-02"
  );
  const [operatorName, setOperatorName] = useState("Ramesh Kumar");

  if (!pendingPutAway) return null;

  const handlePutAwaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completePutAway(pendingPutAway.id, selectedLocationCode);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Put-Away Storage Allocation: ${pendingPutAway.putAwayNumber}`} maxWidth="md">
      <form onSubmit={handlePutAwaySubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-slate-300">
          <p className="font-bold text-sky-400">GRN Reference: {pendingPutAway.grnNumber}</p>
          <p className="text-[11px] text-slate-400">
            Accepted Cargo Qty to Store: <strong>{pendingPutAway.quantity} Units</strong>
          </p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Target Storage Location Code *
          </label>
          <Select
            value={selectedLocationCode}
            onChange={(e) => setSelectedLocationCode(e.target.value)}
            options={locations.map((loc) => ({
              label: `${loc.locationCode} - ${loc.zoneName} (${loc.capacityUnits - loc.occupiedUnits} units available)`,
              value: loc.locationCode,
            }))}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Assign Warehouse Operator *
          </label>
          <Select
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            options={operators.map((op) => ({
              label: `${op.name} (${op.role})`,
              value: op.name,
            }))}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={CheckCircle2} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Confirm Put-Away Completed
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
