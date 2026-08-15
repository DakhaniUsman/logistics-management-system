"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Trip } from "@/types/transport";
import { useTransportStore } from "@/store/use-transport-store";
import { DollarSign, CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";

interface TransportExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export function TransportExpenseModal({ isOpen, onClose, trip }: TransportExpenseModalProps) {
  const { addTransportExpense } = useTransportStore();

  const [category, setCategory] = useState<any>("Fuel");
  const [amount, setAmount] = useState<number>(4500);
  const [description, setDescription] = useState("Diesel refill at highway fuel station");

  if (!trip) return null;

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("Valid expense amount required.");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required.");
      return;
    }

    await addTransportExpense(trip.id, {
      category,
      amount: Number(amount),
      description,
    });

    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Record Trip Expense: ${trip.tripNumber}`} maxWidth="md">
      <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-slate-300">
          <p className="font-bold text-sky-400">Vehicle: {trip.vehicleNumber} • Carrier: {trip.vendorName}</p>
          <p className="text-[11px] text-slate-400">
            Estimated Cost: {trip.currency} {trip.estimatedCost.toLocaleString()} • Actual to Date: {trip.currency} {trip.actualCost.toLocaleString()}
          </p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Expense Category *
          </label>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { label: "Fuel / Diesel Refill", value: "Fuel" },
              { label: "Expressway Toll Plaza Charges", value: "Toll" },
              { label: "Terminal / Parking Fee", value: "Parking" },
              { label: "Driver Allowance & Meals", value: "Driver Allowance" },
              { label: "Loading Labor Charges", value: "Loading" },
              { label: "Unloading Labor Charges", value: "Unloading" },
              { label: "Other Contingency Expense", value: "Other" },
            ]}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Expense Amount ({trip.currency}) *
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="4500"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Expense Details & Receipt Reference *
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Fuel refill invoice #89201"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={Plus} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Add Expense Record
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
