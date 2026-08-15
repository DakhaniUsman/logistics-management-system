"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Trip, TransportRequestStatus } from "@/types/transport";
import { useTransportStore } from "@/store/use-transport-store";
import { CheckCircle2, Clock, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";

interface TransportStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export function TransportStatusModal({ isOpen, onClose, trip }: TransportStatusModalProps) {
  const { updateTripStatus } = useTransportStore();

  const [targetStatus, setTargetStatus] = useState<TransportRequestStatus>("In Transit");
  const [notes, setNotes] = useState("");

  if (!trip) return null;

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTripStatus(trip.id, targetStatus, notes);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Update Trip Status: ${trip.tripNumber}`} maxWidth="md">
      <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs pt-1">
        {/* Trip Specs Header */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-slate-300">
          <p className="font-bold text-sky-400">Vehicle: {trip.vehicleNumber} • Driver: {trip.driverName}</p>
          <p className="text-[11px] text-slate-400">
            Route: {trip.originLocation} → {trip.destinationLocation}
          </p>
        </div>

        {/* Milestone Status Selector */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            New Trip Milestone Status *
          </label>
          <Select
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as any)}
            options={[
              { label: "Picked Up — Cargo received at origin", value: "Picked Up" },
              { label: "Loaded — Container sealed & secured", value: "Loaded" },
              { label: "Departed — Departed origin gate", value: "Departed" },
              { label: "In Transit — En route on highway", value: "In Transit" },
              { label: "Arrived — Arrived at destination warehouse", value: "Arrived" },
              { label: "Completed — Trip finished & vehicle released", value: "Completed" },
            ]}
          />
        </div>

        {/* Operational Notes */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Operational Execution Notes
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter gate exit time, odometer reading, or road condition notes..."
          />
        </div>

        {/* Info */}
        <p className="text-[10px] text-slate-400 italic">
          * Updating status will log actual timestamp milestone and refresh vehicle/driver availability.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" icon={CheckCircle2} className="bg-sky-600 hover:bg-sky-700 text-white">
            Confirm Status Update
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
