"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Delivery, DeliveryWindow, DeliveryPriority } from "@/types/delivery";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { useTransportStore } from "@/store/use-transport-store";
import { useJobStore } from "@/store/use-job-store";
import { MapPin, Truck, Calendar, UserCheck } from "lucide-react";

const deliverySchema = z.object({
  dispatchId: z.string().optional(),
  jobId: z.string().min(1, "Job is required"),
  shipmentId: z.string().min(1, "Shipment is required"),
  transportTripId: z.string().optional(),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryCity: z.string().min(1, "City is required"),
  deliveryState: z.string().min(1, "State is required"),
  deliveryContactPerson: z.string().min(1, "Recipient contact person is required"),
  deliveryContactPhone: z.string().min(1, "Recipient phone is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  scheduledTimeWindow: z.string().min(1, "Time window is required"),
  priority: z.string().min(1, "Priority is required"),
  deliveryInstructions: z.string().optional(),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

interface CreateDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery?: Delivery | null;
}

export function CreateDeliveryModal({ isOpen, onClose, delivery }: CreateDeliveryModalProps) {
  const { createDelivery } = useDeliveryStore();
  const { dispatches } = useWarehouseStore();
  const { trips } = useTransportStore();
  const { jobs } = useJobStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTimeWindow: "Evening (05:00 PM - 08:00 PM)",
      priority: "Normal",
      deliveryCity: "Thane",
      deliveryState: "Maharashtra",
      deliveryContactPerson: "Ahmed Khan",
      deliveryContactPhone: "+91 98211 44556",
      deliveryAddress: "Plot 42, MIDC Industrial Zone Phase 2, Bhiwandi",
    },
  });

  const selectedDispatchId = watch("dispatchId");

  useEffect(() => {
    if (selectedDispatchId) {
      const dsp = dispatches.find((d) => d.id === selectedDispatchId || d.dispatchNumber === selectedDispatchId);
      if (dsp) {
        setValue("jobId", dsp.jobId);
        setValue("shipmentId", dsp.shipmentId);
        setValue("transportTripId", dsp.transportTripId || "");
      }
    }
  }, [selectedDispatchId, dispatches, setValue]);

  const onSubmit = async (data: DeliveryFormData) => {
    try {
      const matchedJob = jobs.find((j) => j.id.toLowerCase() === data.jobId.toLowerCase());
      const matchedTrip = trips.find((t) => t.id === data.transportTripId);
      const matchedDispatch = dispatches.find((d) => d.id === data.dispatchId);

      await createDelivery({
        dispatchId: data.dispatchId,
        dispatchNumber: matchedDispatch?.dispatchNumber || data.dispatchId,
        jobId: data.jobId,
        jobNumber: matchedJob?.jobNumber || data.jobId,
        shipmentId: data.shipmentId,
        shipmentNumber: matchedDispatch?.shipmentNumber || data.shipmentId,
        transportRequestId: matchedTrip?.transportRequestId,
        tripId: data.transportTripId,
        vehicleNumber: matchedTrip?.vehicleNumber || "MH 04 AB 1234",
        driverName: matchedTrip?.driverName || "Rahul Shaikh",
        driverPhone: matchedTrip?.driverPhone || "+91 98700 12345",
        customerId: matchedJob?.customerId || "CUS-2026-001",
        customerName: matchedJob?.customerName || "ABC Electronics Pvt Ltd",
        warehouseId: matchedDispatch?.warehouseId || "WH-BHW-001",
        warehouseName: matchedDispatch?.warehouseName || "Bhiwandi Central Logistics Warehouse",
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
        deliveryState: data.deliveryState,
        deliveryContactPerson: data.deliveryContactPerson,
        deliveryContactPhone: data.deliveryContactPhone,
        scheduledDate: data.scheduledDate,
        scheduledTimeWindow: data.scheduledTimeWindow,
        priority: data.priority as any,
        deliveryInstructions: data.deliveryInstructions,
      });

      reset();
      onClose();
    } catch (err) {
      console.error("Failed to submit delivery form:", err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={delivery ? `Edit Delivery: ${delivery.deliveryNumber}` : "Create Customer Delivery Order"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dispatch Link */}
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Select Confirmed Warehouse Dispatch *
            </label>
            <Select
              value={watch("dispatchId") || ""}
              onChange={(e) => setValue("dispatchId", e.target.value)}
              options={[
                { label: "Select Dispatched Cargo", value: "" },
                ...dispatches.map((d) => ({
                  label: `${d.dispatchNumber} - ${d.customerName} (Shipment: ${d.shipmentNumber})`,
                  value: d.id,
                })),
              ]}
            />
          </div>

          {/* Job ID */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Operational Job *
            </label>
            <Select
              value={watch("jobId") || ""}
              onChange={(e) => setValue("jobId", e.target.value)}
              options={[
                { label: "Select Operational Job", value: "" },
                ...jobs.map((j) => ({ label: `${j.jobNumber || j.id} - ${j.customerName}`, value: j.id })),
              ]}
            />
            {errors.jobId && <span className="text-rose-400 text-[10px]">{errors.jobId.message}</span>}
          </div>

          {/* Transport Trip */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Assigned Transport Trip & Carrier Truck
            </label>
            <Select
              value={watch("transportTripId") || ""}
              onChange={(e) => setValue("transportTripId", e.target.value)}
              options={[
                { label: "MH 04 AB 1234 (Rahul Shaikh)", value: "TRIP-2026-00125" },
                ...trips.map((t) => ({ label: `${t.tripNumber} - Vehicle ${t.vehicleNumber} (${t.driverName})`, value: t.id })),
              ]}
            />
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Scheduled Delivery Date *
            </label>
            <Input type="date" {...register("scheduledDate")} />
          </div>

          {/* Time Window */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Delivery Time Window *
            </label>
            <Select
              value={watch("scheduledTimeWindow")}
              onChange={(e) => setValue("scheduledTimeWindow", e.target.value)}
              options={[
                { label: "Morning (10:00 AM - 12:00 PM)", value: "Morning (10:00 AM - 12:00 PM)" },
                { label: "Afternoon (01:00 PM - 04:00 PM)", value: "Afternoon (01:00 PM - 04:00 PM)" },
                { label: "Evening (05:00 PM - 08:00 PM)", value: "Evening (05:00 PM - 08:00 PM)" },
              ]}
            />
          </div>

          {/* Recipient Contact */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Recipient Contact Person *
            </label>
            <Input {...register("deliveryContactPerson")} placeholder="Ahmed Khan" />
          </div>

          {/* Recipient Phone */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Recipient Contact Phone *
            </label>
            <Input {...register("deliveryContactPhone")} placeholder="+91 98211 44556" />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Destination Delivery Address *
            </label>
            <Input {...register("deliveryAddress")} placeholder="Plot 42, MIDC Industrial Zone Phase 2" />
          </div>

          {/* Priority */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Delivery Priority *
            </label>
            <Select
              value={watch("priority")}
              onChange={(e) => setValue("priority", e.target.value)}
              options={[
                { label: "Normal", value: "Normal" },
                { label: "High", value: "High" },
                { label: "Urgent", value: "Urgent" },
                { label: "Critical", value: "Critical" },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Special Delivery Instructions
          </label>
          <Input {...register("deliveryInstructions")} placeholder="e.g. Call recipient 30 minutes prior to arrival. Gate #4 entry." />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} icon={Truck}>
            Schedule Delivery Order
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
