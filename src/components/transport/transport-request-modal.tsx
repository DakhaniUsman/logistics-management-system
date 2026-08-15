"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { VEHICLE_TYPES, TransportRequest } from "@/types/transport";
import { useTransportStore } from "@/store/use-transport-store";
import { useJobStore } from "@/store/use-job-store";
import { useCustomsStore } from "@/store/use-customs-store";
import { MOCK_SHIPMENTS } from "@/data/mock/shipment-data";
import { MOCK_CONTAINERS } from "@/data/mock/container-data";

const transportRequestSchema = z.object({
  priority: z.enum(["Normal", "High", "Urgent", "Critical"]),
  jobId: z.string().min(1, "Job is required"),
  shipmentId: z.string().min(1, "Shipment is required"),
  bookingId: z.string().optional(),
  containerId: z.string().optional(),
  customsId: z.string().optional(),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  pickupContactPerson: z.string().optional(),
  destinationLocation: z.string().min(1, "Destination location is required"),
  destinationContactPerson: z.string().optional(),
  cargoDescription: z.string().min(1, "Cargo description is required"),
  cargoWeightKg: z.number().min(1, "Valid weight required"),
  requiredVehicleType: z.string().min(1, "Required vehicle type is required"),
  requiredCapacityTonnes: z.number().min(1, "Capacity required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTime: z.string().min(1, "Pickup time is required"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  specialInstructions: z.string().optional(),
});

type TransportRequestFormData = z.infer<typeof transportRequestSchema>;

interface TransportRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: TransportRequest | null;
}

export function TransportRequestModal({ isOpen, onClose, request }: TransportRequestModalProps) {
  const { createTransportRequest, updateTransportRequest } = useTransportStore();
  const { jobs } = useJobStore();
  const { declarations } = useCustomsStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransportRequestFormData>({
    resolver: zodResolver(transportRequestSchema),
    defaultValues: {
      priority: "Normal",
      requiredVehicleType: "40 FT Container Truck",
      requiredCapacityTonnes: 25,
      cargoWeightKg: 18500,
      cargoDescription: "Commercial Containerized Freight",
      pickupLocation: "JNPT Container Terminal Gate #3, Nhava Sheva",
      destinationLocation: "Bhiwandi Warehouse Logistics Complex, Thane",
      pickupDate: new Date().toISOString().split("T")[0],
      pickupTime: "10:00 AM",
      expectedDeliveryDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (request) {
      setValue("priority", request.priority);
      setValue("jobId", request.jobId);
      setValue("shipmentId", request.shipmentId);
      setValue("bookingId", request.bookingId || "");
      setValue("containerId", request.containerIds[0] || "");
      setValue("customsId", request.customsId || "");
      setValue("pickupLocation", request.pickupLocation);
      setValue("pickupContactPerson", request.pickupContactPerson || "");
      setValue("destinationLocation", request.destinationLocation);
      setValue("destinationContactPerson", request.destinationContactPerson || "");
      setValue("cargoDescription", request.cargoDescription);
      setValue("cargoWeightKg", request.cargoWeightKg);
      setValue("requiredVehicleType", request.requiredVehicleType);
      setValue("requiredCapacityTonnes", request.requiredCapacityTonnes);
      setValue("pickupDate", request.pickupDate);
      setValue("pickupTime", request.pickupTime);
      setValue("expectedDeliveryDate", request.expectedDeliveryDate);
      setValue("specialInstructions", request.specialInstructions || "");
    }
  }, [request, setValue]);

  const selectedJobId = watch("jobId");

  const availableShipments = selectedJobId
    ? MOCK_SHIPMENTS.filter((s) => s.jobId.toLowerCase() === selectedJobId.toLowerCase())
    : MOCK_SHIPMENTS;

  const availableCustoms = selectedJobId
    ? declarations.filter((d) => d.jobId.toLowerCase() === selectedJobId.toLowerCase())
    : declarations;

  const onSubmit = async (data: TransportRequestFormData) => {
    try {
      const matchedJob = jobs.find((j) => j.id.toLowerCase() === data.jobId.toLowerCase());
      const matchedShipment = MOCK_SHIPMENTS.find((s) => s.id.toLowerCase() === data.shipmentId.toLowerCase());
      const matchedContainer = MOCK_CONTAINERS.find(
        (c) => c.id.toLowerCase() === data.containerId?.toLowerCase() || c.containerNumber === data.containerId
      );
      const matchedCustoms = declarations.find((d) => d.id.toLowerCase() === data.customsId?.toLowerCase());

      const payload = {
        priority: data.priority,
        jobId: data.jobId,
        jobNumber: matchedJob?.jobNumber || data.jobId,
        shipmentId: data.shipmentId,
        shipmentNumber: matchedShipment?.shipmentNumber || data.shipmentId,
        bookingId: data.bookingId,
        containerIds: matchedContainer ? [matchedContainer.id] : ["CON-2026-00001"],
        containerNumbers: matchedContainer ? [matchedContainer.containerNumber] : ["MSCU1234567"],
        customsId: data.customsId,
        customsNumber: matchedCustoms?.declarationNumber || data.customsId,
        customsStatus: matchedCustoms?.status || "Released",
        customerId: matchedJob?.customerId || "CUS-2026-001",
        customerName: matchedJob?.customerName || "ABC Electronics Pvt Ltd",
        pickupLocation: data.pickupLocation,
        pickupContactPerson: data.pickupContactPerson,
        destinationLocation: data.destinationLocation,
        destinationContactPerson: data.destinationContactPerson,
        cargoDescription: data.cargoDescription,
        cargoWeightKg: Number(data.cargoWeightKg),
        requiredVehicleType: data.requiredVehicleType as any,
        requiredCapacityTonnes: Number(data.requiredCapacityTonnes),
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        expectedDeliveryDate: data.expectedDeliveryDate,
        specialInstructions: data.specialInstructions,
      };

      if (request) {
        await updateTransportRequest(request.id, payload);
      } else {
        await createTransportRequest(payload);
      }

      reset();
      onClose();
    } catch (err) {
      console.error("Failed to submit transport form:", err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={request ? `Edit Transport Request: ${request.requestNumber}` : "Create Transport Request"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Priority */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Request Priority *
            </label>
            <Select
              value={watch("priority")}
              onChange={(e) => setValue("priority", e.target.value as any)}
              options={[
                { label: "Normal Priority", value: "Normal" },
                { label: "High Priority", value: "High" },
                { label: "Urgent Priority", value: "Urgent" },
                { label: "Critical Priority", value: "Critical" },
              ]}
            />
          </div>

          {/* Job linkage */}
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
            {errors.jobId && <span className="text-rose-400 text-[10px] mt-0.5">{errors.jobId.message}</span>}
          </div>

          {/* Shipment linkage */}
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
            {errors.shipmentId && <span className="text-rose-400 text-[10px] mt-0.5">{errors.shipmentId.message}</span>}
          </div>

          {/* Customs Release Linkage */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Customs Clearance Linkage
            </label>
            <Select
              value={watch("customsId") || ""}
              onChange={(e) => setValue("customsId", e.target.value)}
              options={[
                { label: "None / Not Applicable", value: "" },
                ...availableCustoms.map((c) => ({
                  label: `${c.declarationNumber} (${c.status})`,
                  value: c.id,
                })),
              ]}
            />
          </div>

          {/* Pickup Location */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Pickup Terminal / Origin *
            </label>
            <Input {...register("pickupLocation")} placeholder="e.g. JNPT Terminal Gate #3, Nhava Sheva" />
          </div>

          {/* Pickup Contact */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Pickup Contact Person
            </label>
            <Input {...register("pickupContactPerson")} placeholder="e.g. Yard Supervisor" />
          </div>

          {/* Destination Location */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Destination Location *
            </label>
            <Input {...register("destinationLocation")} placeholder="e.g. Bhiwandi Warehouse, Thane" />
          </div>

          {/* Destination Contact */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Destination Contact Person
            </label>
            <Input {...register("destinationContactPerson")} placeholder="e.g. Warehouse Manager" />
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Required Vehicle Type *
            </label>
            <Select
              value={watch("requiredVehicleType")}
              onChange={(e) => setValue("requiredVehicleType", e.target.value)}
              options={VEHICLE_TYPES.map((v) => ({ label: v, value: v }))}
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Required Vehicle Capacity (Tonnes) *
            </label>
            <Input
              type="number"
              {...register("requiredCapacityTonnes", { valueAsNumber: true })}
              placeholder="25"
            />
          </div>

          {/* Pickup Date */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Pickup Date *
            </label>
            <Input type="date" {...register("pickupDate")} />
          </div>

          {/* Expected Delivery Date */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Expected Arrival Date *
            </label>
            <Input type="date" {...register("expectedDeliveryDate")} />
          </div>

          {/* Cargo Description */}
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Cargo Specifications & Description *
            </label>
            <Input {...register("cargoDescription")} placeholder="e.g. Consumer Electronics Parts & Accessories" />
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Dispatch Special Instructions
          </label>
          <Input {...register("specialInstructions")} placeholder="e.g. Verify container seal number before gate exit..." />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            {request ? "Update Request" : "Create Transport Request"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
