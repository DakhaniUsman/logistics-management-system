"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PackingOperation } from "@/types/warehouse";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { CheckCircle2, Package } from "lucide-react";

interface PackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  packing: PackingOperation | null;
}

export function PackingModal({ isOpen, onClose, packing: pack }: PackingModalProps) {
  const { completePacking } = useWarehouseStore();

  const [packageType, setPackageType] = useState("Pallet");
  const [packageCount, setPackageCount] = useState(1);
  const [totalWeightKg, setTotalWeightKg] = useState(480);
  const [packedBy, setPackedBy] = useState("Suresh Pujari");

  if (!pack) return null;

  const handlePackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completePacking(pack.id);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Packing Operation: ${pack.packingNumber}`} maxWidth="md">
      <form onSubmit={handlePackingSubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-slate-300">
          <p className="font-bold text-sky-400">Pick Ref: {pack.pickNumber} • Job: {pack.jobNumber}</p>
          <p className="text-[11px] text-slate-400">Shipment: {pack.shipmentNumber}</p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Package Structure Type *
          </label>
          <Select
            value={packageType}
            onChange={(e) => setPackageType(e.target.value)}
            options={[
              { label: "Palletizing (Heavy Pallet)", value: "Pallet" },
              { label: "Standard Corrugated Carton", value: "Carton" },
              { label: "Wooden Crate Packing", value: "Crate" },
            ]}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Package Units Count *
          </label>
          <Input
            type="number"
            value={packageCount}
            onChange={(e) => setPackageCount(Number(e.target.value))}
            placeholder="1"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Total Gross Weight (KG) *
          </label>
          <Input
            type="number"
            value={totalWeightKg}
            onChange={(e) => setTotalWeightKg(Number(e.target.value))}
            placeholder="480"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Packer Specialist Name *
          </label>
          <Input value={packedBy} onChange={(e) => setPackedBy(e.target.value)} placeholder="Suresh Pujari" />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={CheckCircle2} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Mark Ready for Dispatch
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
