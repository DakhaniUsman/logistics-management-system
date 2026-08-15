"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { GoodsReceipt } from "@/types/warehouse";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { useJobStore } from "@/store/use-job-store";
import { useTransportStore } from "@/store/use-transport-store";
import { MOCK_SHIPMENTS } from "@/data/mock/shipment-data";
import { MOCK_CONTAINERS } from "@/data/mock/container-data";
import { AlertTriangle, CheckCircle2, FileCheck } from "lucide-react";

const grnSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse is required"),
  jobId: z.string().min(1, "Job is required"),
  shipmentId: z.string().min(1, "Shipment is required"),
  containerId: z.string().optional(),
  transportTripId: z.string().optional(),
  expectedQuantity: z.number().min(1, "Expected quantity required"),
  receivedQuantity: z.number().min(0, "Received quantity required"),
  damagedQuantity: z.number().min(0, "Damaged quantity required"),
  shortQuantity: z.number().min(0, "Short quantity required"),
  excessQuantity: z.number().min(0, "Excess quantity required"),
  receivedBy: z.string().min(1, "Receiver name required"),
  discrepancyReason: z.string().optional(),
  remarks: z.string().optional(),
});

type GRNFormData = z.infer<typeof grnSchema>;

interface GRNFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  grn?: GoodsReceipt | null;
}

export function GrnFormModal({ isOpen, onClose, grn }: GRNFormModalProps) {
  const { warehouses, createGRN } = useWarehouseStore();
  const { jobs } = useJobStore();
  const { trips } = useTransportStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GRNFormData>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      warehouseId: "WH-BHW-001",
      expectedQuantity: 1000,
      receivedQuantity: 995,
      damagedQuantity: 2,
      shortQuantity: 5,
      excessQuantity: 0,
      receivedBy: "Ramesh Kumar (Receiver)",
    },
  });

  useEffect(() => {
    if (grn) {
      setValue("warehouseId", grn.warehouseId);
      setValue("jobId", grn.jobId);
      setValue("shipmentId", grn.shipmentId);
      setValue("containerId", grn.containerIds[0] || "");
      setValue("transportTripId", grn.transportTripId || "");
      setValue("expectedQuantity", grn.expectedQuantity);
      setValue("receivedQuantity", grn.receivedQuantity);
      setValue("damagedQuantity", grn.damagedQuantity);
      setValue("shortQuantity", grn.shortQuantity);
      setValue("excessQuantity", grn.excessQuantity);
      setValue("receivedBy", grn.receivedBy);
      setValue("discrepancyReason", grn.discrepancyReason || "");
      setValue("remarks", grn.remarks || "");
    }
  }, [grn, setValue]);

  const selectedJobId = watch("jobId");
  const expQty = watch("expectedQuantity") || 0;
  const recQty = watch("receivedQuantity") || 0;
  const damQty = watch("damagedQuantity") || 0;
  const srtQty = watch("shortQuantity") || 0;
  const excQty = watch("excessQuantity") || 0;

  const netAccepted = recQty - damQty;
  const hasDiscrepancy = damQty > 0 || srtQty > 0 || excQty > 0;

  const availableShipments = selectedJobId
    ? MOCK_SHIPMENTS.filter((s) => s.jobId.toLowerCase() === selectedJobId.toLowerCase())
    : MOCK_SHIPMENTS;

  const onSubmit = async (data: GRNFormData) => {
    try {
      const matchedJob = jobs.find((j) => j.id.toLowerCase() === data.jobId.toLowerCase());
      const matchedShipment = MOCK_SHIPMENTS.find((s) => s.id.toLowerCase() === data.shipmentId.toLowerCase());
      const matchedWH = warehouses.find((w) => w.id === data.warehouseId);
      const matchedTrip = trips.find((t) => t.id === data.transportTripId);
      const matchedContainer = MOCK_CONTAINERS.find(
        (c) => c.id.toLowerCase() === data.containerId?.toLowerCase() || c.containerNumber === data.containerId
      );

      await createGRN({
        warehouseId: data.warehouseId,
        warehouseName: matchedWH?.name || "Bhiwandi Central Logistics Warehouse",
        jobId: data.jobId,
        jobNumber: matchedJob?.jobNumber || data.jobId,
        shipmentId: data.shipmentId,
        shipmentNumber: matchedShipment?.shipmentNumber || data.shipmentId,
        containerIds: matchedContainer ? [matchedContainer.id] : ["CON-2026-00001"],
        containerNumbers: matchedContainer ? [matchedContainer.containerNumber] : ["MSCU1234567"],
        transportTripId: data.transportTripId,
        vehicleNumber: matchedTrip?.vehicleNumber,
        customerId: matchedJob?.customerId || "CUS-2026-001",
        customerName: matchedJob?.customerName || "ABC Electronics Pvt Ltd",
        receivedBy: data.receivedBy,
        expectedQuantity: Number(data.expectedQuantity),
        receivedQuantity: Number(data.receivedQuantity),
        damagedQuantity: Number(data.damagedQuantity),
        shortQuantity: Number(data.shortQuantity),
        excessQuantity: Number(data.excessQuantity),
        discrepancyReason: data.discrepancyReason,
        remarks: data.remarks,
      });

      reset();
      onClose();
    } catch (err) {
      console.error("Failed to submit GRN:", err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={grn ? `Edit GRN: ${grn.grnNumber}` : "Create Goods Receipt Note (GRN)"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs pt-1">
        {/* Net Quantity & Discrepancy Indicator Box */}
        <div
          className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
            hasDiscrepancy
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {hasDiscrepancy ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <span className="font-bold text-xs block">
                {hasDiscrepancy ? "CARGO RECEIVING DISCREPANCY DETECTED" : "CARGO QUANTITY MATCHED VERIFIED"}
              </span>
              <span className="text-[11px] opacity-90 block">
                Expected: {expQty} • Received: {recQty} • Damaged: {damQty} • Short: {srtQty}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase block opacity-75">NET ACCEPTED</span>
            <span className="font-mono text-base font-extrabold">{netAccepted} Units</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Warehouse Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Receiving Warehouse *
            </label>
            <Select
              value={watch("warehouseId")}
              onChange={(e) => setValue("warehouseId", e.target.value)}
              options={warehouses.map((w) => ({ label: `${w.code} - ${w.name}`, value: w.id }))}
            />
          </div>

          {/* Receiver */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Received By (Operator / Inspector) *
            </label>
            <Input {...register("receivedBy")} placeholder="Ramesh Kumar (Receiver)" />
          </div>

          {/* Job Linkage */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Operational Job *
            </label>
            <Select
              value={watch("jobId") || ""}
              onChange={(e) => {
                setValue("jobId", e.target.value);
                setValue("shipmentId", "");
              }}
              options={[
                { label: "Select Operational Job", value: "" },
                ...jobs.map((j) => ({ label: `${j.jobNumber || j.id} - ${j.customerName}`, value: j.id })),
              ]}
            />
            {errors.jobId && <span className="text-rose-400 text-[10px]">{errors.jobId.message}</span>}
          </div>

          {/* Shipment Linkage */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Shipment *
            </label>
            <Select
              value={watch("shipmentId") || ""}
              onChange={(e) => setValue("shipmentId", e.target.value)}
              options={[
                { label: "Select Shipment", value: "" },
                ...availableShipments.map((s) => ({
                  label: `${s.shipmentNumber} (${s.origin} → ${s.destination})`,
                  value: s.id,
                })),
              ]}
            />
            {errors.shipmentId && <span className="text-rose-400 text-[10px]">{errors.shipmentId.message}</span>}
          </div>

          {/* Transport Trip Handoff */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Arriving Transport Trip Handoff
            </label>
            <Select
              value={watch("transportTripId") || ""}
              onChange={(e) => setValue("transportTripId", e.target.value)}
              options={[
                { label: "None / Direct Delivery", value: "" },
                ...trips.map((t) => ({ label: `${t.tripNumber} (${t.vehicleNumber} - ${t.driverName})`, value: t.id })),
              ]}
            />
          </div>

          {/* Container Code */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Container Number
            </label>
            <Input {...register("containerId")} placeholder="e.g. MSCU1234567" />
          </div>

          {/* Expected Quantity */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Expected Cargo Quantity *
            </label>
            <Input
              type="number"
              {...register("expectedQuantity", { valueAsNumber: true })}
              placeholder="1000"
            />
          </div>

          {/* Received Quantity */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Actual Physical Received Qty *
            </label>
            <Input
              type="number"
              {...register("receivedQuantity", { valueAsNumber: true })}
              placeholder="995"
            />
          </div>

          {/* Damaged Quantity */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Damaged Cargo Units
            </label>
            <Input
              type="number"
              {...register("damagedQuantity", { valueAsNumber: true })}
              placeholder="0"
            />
          </div>

          {/* Short Quantity */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Shortage Units (Unreceived)
            </label>
            <Input
              type="number"
              {...register("shortQuantity", { valueAsNumber: true })}
              placeholder="0"
            />
          </div>
        </div>

        {/* Discrepancy Reason */}
        {hasDiscrepancy && (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Discrepancy Justification / Damage Reason *
            </label>
            <Input {...register("discrepancyReason")} placeholder="e.g. 5 units short received from transport delivery challan." />
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Receiving Remarks & Inspection Notes
          </label>
          <Input {...register("remarks")} placeholder="Enter container seal status, packaging condition notes..." />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} icon={FileCheck}>
            {grn ? "Update GRN" : "Generate GRN Note"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
