"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TransportRequest } from "@/types/transport";
import { useTransportStore } from "@/store/use-transport-store";
import { Truck, UserCheck, Building2, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "sonner";

interface AssignTransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TransportRequest | null;
}

export function AssignTransportModal({ isOpen, onClose, request: req }: AssignTransportModalProps) {
  const { vehicles, drivers, vendors, assignVehicleAndDriver } = useTransportStore();

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("VND-TRP-001");
  const [scheduledPickup, setScheduledPickup] = useState(
    `${new Date().toISOString().split("T")[0]} 10:00`
  );

  if (!req) return null;

  const availableVehicles = vehicles.filter((v) => v.status === "Available" || v.status === "Assigned");
  const availableDrivers = drivers.filter((d) => d.status === "Available" || d.status === "Assigned");

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  // Validation warnings
  let capacityWarning = "";
  if (selectedVehicle && selectedVehicle.capacityTonnes < req.requiredCapacityTonnes) {
    capacityWarning = `Vehicle capacity (${selectedVehicle.capacityTonnes}T) is below required ${req.requiredCapacityTonnes}T capacity!`;
  }

  let driverWarning = "";
  if (selectedDriver && new Date(selectedDriver.licenseExpiry) < new Date()) {
    driverWarning = `Selected driver license EXPIRED on ${selectedDriver.licenseExpiry}!`;
  }

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicleId) {
      toast.error("Please select a vehicle.");
      return;
    }
    if (!selectedDriverId) {
      toast.error("Please select a driver.");
      return;
    }
    if (driverWarning) {
      toast.error("Cannot assign driver with an expired license.");
      return;
    }

    const success = await assignVehicleAndDriver(req.id, {
      vehicleId: selectedVehicleId,
      driverId: selectedDriverId,
      vendorId: selectedVendorId,
      scheduledPickup,
    });

    if (success) onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Assign Vehicle & Driver: ${req.requestNumber}`} maxWidth="lg">
      <form onSubmit={handleAssignmentSubmit} className="space-y-4 text-xs pt-1">
        {/* Request Context Summary */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1 text-slate-300">
          <div className="flex items-center justify-between text-xs font-bold text-sky-400">
            <span>Route: {req.pickupLocation} → {req.destinationLocation}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
              {req.requiredVehicleType} ({req.requiredCapacityTonnes}T)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Customer: {req.customerName} • Cargo Weight: {req.cargoWeightKg.toLocaleString()} KG
          </p>
        </div>

        {/* Validation Warnings */}
        {(capacityWarning || driverWarning) && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Assignment Compatibility Alert</span>
            </div>
            {capacityWarning && <p className="text-[11px]">{capacityWarning}</p>}
            {driverWarning && <p className="text-[11px]">{driverWarning}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Transport Vendor */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Transport Vendor / Carrier *
            </label>
            <Select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              options={vendors.map((v) => ({ label: `${v.name} (${v.contactPerson})`, value: v.id }))}
            />
          </div>

          {/* Vehicle Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Select Fleet Vehicle *
            </label>
            <Select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              options={[
                { label: "Select Available Vehicle", value: "" },
                ...availableVehicles.map((v) => ({
                  label: `${v.vehicleNumber} - ${v.vehicleType} (${v.capacityTonnes}T) [${v.status}]`,
                  value: v.id,
                })),
              ]}
            />
          </div>

          {/* Driver Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Select Commercial Driver *
            </label>
            <Select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              options={[
                { label: "Select Available Driver", value: "" },
                ...availableDrivers.map((d) => ({
                  label: `${d.name} (${d.licenseType} - Exp: ${d.licenseExpiry})`,
                  value: d.id,
                })),
              ]}
            />
          </div>

          {/* Scheduled Pickup Date & Time */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Scheduled Dispatch Pickup Time *
            </label>
            <Input
              type="text"
              value={scheduledPickup}
              onChange={(e) => setScheduledPickup(e.target.value)}
              placeholder="YYYY-MM-DD HH:MM"
            />
          </div>
        </div>

        {/* Selected Vehicle & Driver Specs Box */}
        {selectedVehicle && selectedDriver && (
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-1 text-emerald-200">
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Assignment Preview Confirmed</span>
            </div>
            <p className="text-[11px]">
              Vehicle: <strong>{selectedVehicle.vehicleNumber}</strong> ({selectedVehicle.vehicleType}) • Driver:{" "}
              <strong>{selectedDriver.name}</strong> ({selectedDriver.phone})
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            icon={Truck}
            disabled={!!driverWarning || !selectedVehicleId || !selectedDriverId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Confirm & Dispatch Trip
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
