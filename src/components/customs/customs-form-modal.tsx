"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CUSTOMS_TYPES,
  CUSTOMS_CURRENCIES,
  MOCK_BROKERS,
  MOCK_CUSTOMS_OFFICES,
  CustomsDeclaration,
} from "@/types/customs";
import { useCustomsStore } from "@/store/use-customs-store";
import { useJobStore } from "@/store/use-job-store";
import { useBookingStore } from "@/store/use-booking-store";
import { MOCK_SHIPMENTS } from "@/data/mock/shipment-data";
import { MOCK_CONTAINERS } from "@/data/mock/container-data";
import { toast } from "sonner";

const customsSchema = z.object({
  customsType: z.enum(["Import", "Export", "Transit"]),
  direction: z.enum(["Inbound", "Outbound"]),
  jobId: z.string().min(1, "Job is required"),
  shipmentId: z.string().min(1, "Shipment is required"),
  bookingId: z.string().optional(),
  containerId: z.string().optional(),
  customerId: z.string().optional(),
  brokerId: z.string().min(1, "Customs broker is required"),
  customsOffice: z.string().min(1, "Customs office is required"),
  portOfEntry: z.string().min(1, "Port of entry is required"),
  portOfExit: z.string().min(1, "Port of exit is required"),
  countryOfOrigin: z.string().min(1, "Country of origin is required"),
  countryOfDestination: z.string().min(1, "Country of destination is required"),
  currency: z.string().default("INR"),
  invoiceValue: z.number().min(0, "Invoice value must be non-negative"),
  freightValue: z.number().min(0, "Freight value must be non-negative"),
  insuranceValue: z.number().min(0, "Insurance value must be non-negative"),
  remarks: z.string().optional(),
});

type CustomsFormData = z.infer<typeof customsSchema>;

interface CustomsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  declaration?: CustomsDeclaration | null;
}

export function CustomsFormModal({ isOpen, onClose, declaration }: CustomsFormModalProps) {
  const { createDeclaration, updateDeclaration } = useCustomsStore();
  const { jobs } = useJobStore();
  const { bookings } = useBookingStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomsFormData>({
    resolver: zodResolver(customsSchema),
    defaultValues: {
      customsType: "Import",
      direction: "Inbound",
      currency: "INR",
      invoiceValue: 1000000,
      freightValue: 50000,
      insuranceValue: 5000,
      customsOffice: "Nhava Sheva Customs (JNPT), Mumbai",
      portOfEntry: "JNPT Port, Mumbai",
      portOfExit: "Jebel Ali Port",
      countryOfOrigin: "India",
      countryOfDestination: "UAE",
      brokerId: "BRK-001",
    },
  });

  useEffect(() => {
    if (declaration) {
      setValue("customsType", declaration.customsType);
      setValue("direction", declaration.direction);
      setValue("jobId", declaration.jobId);
      setValue("shipmentId", declaration.shipmentId);
      setValue("bookingId", declaration.bookingId || "");
      setValue("containerId", declaration.containerIds[0] || "");
      setValue("customerId", declaration.customerId);
      setValue("brokerId", declaration.brokerId || "BRK-001");
      setValue("customsOffice", declaration.customsOffice);
      setValue("portOfEntry", declaration.portOfEntry);
      setValue("portOfExit", declaration.portOfExit);
      setValue("countryOfOrigin", declaration.countryOfOrigin);
      setValue("countryOfDestination", declaration.countryOfDestination);
      setValue("currency", declaration.currency);
      setValue("invoiceValue", declaration.invoiceValue);
      setValue("freightValue", declaration.freightValue);
      setValue("insuranceValue", declaration.insuranceValue);
      setValue("remarks", declaration.remarks || "");
    }
  }, [declaration, setValue]);

  const selectedJobId = watch("jobId");
  const selectedShipmentId = watch("shipmentId");
  const selectedBookingId = watch("bookingId");

  // Cascading options
  const availableShipments = selectedJobId
    ? MOCK_SHIPMENTS.filter((s) => s.jobId.toLowerCase() === selectedJobId.toLowerCase())
    : MOCK_SHIPMENTS;

  const availableBookings = selectedShipmentId
    ? bookings.filter((b) => b.shipmentId?.toLowerCase() === selectedShipmentId.toLowerCase())
    : selectedJobId
    ? bookings.filter((b) => b.jobId?.toLowerCase() === selectedJobId.toLowerCase())
    : bookings;

  const availableContainers = selectedBookingId
    ? MOCK_CONTAINERS.filter((c) => c.bookingId?.toLowerCase() === selectedBookingId.toLowerCase())
    : selectedShipmentId
    ? MOCK_CONTAINERS.filter((c) => c.shipmentId?.toLowerCase() === selectedShipmentId.toLowerCase())
    : MOCK_CONTAINERS;

  const onSubmit = async (data: CustomsFormData) => {
    try {
      const matchedJob = jobs.find((j) => j.id.toLowerCase() === data.jobId.toLowerCase());
      const matchedShipment = MOCK_SHIPMENTS.find((s) => s.id.toLowerCase() === data.shipmentId.toLowerCase());
      const matchedBooking = bookings.find((b) => b.id.toLowerCase() === data.bookingId?.toLowerCase());
      const matchedContainer = MOCK_CONTAINERS.find(
        (c) => c.id.toLowerCase() === data.containerId?.toLowerCase() || c.containerNumber === data.containerId
      );
      const matchedBroker = MOCK_BROKERS.find((b) => b.id === data.brokerId);

      const customerName = matchedJob?.customerName || matchedShipment?.customerName || "ABC Electronics Pvt Ltd";
      const customerId = matchedJob?.customerId || matchedShipment?.customerId || "CUS-2026-001";

      const payload = {
        customsType: data.customsType,
        direction: data.direction,
        jobId: data.jobId,
        jobNumber: matchedJob?.jobNumber || data.jobId,
        shipmentId: data.shipmentId,
        shipmentNumber: matchedShipment?.shipmentNumber || data.shipmentId,
        bookingId: data.bookingId,
        bookingNumber: matchedBooking?.bookingNumber || data.bookingId,
        containerIds: matchedContainer ? [matchedContainer.id] : ["CON-2026-00001"],
        containerNumbers: matchedContainer ? [matchedContainer.containerNumber] : ["MSCU1234567"],
        customerId,
        customerName,
        brokerId: data.brokerId,
        brokerName: matchedBroker?.name || "Nhava Sheva Customs Clearing Agency",
        customsOffice: data.customsOffice,
        portOfEntry: data.portOfEntry,
        portOfExit: data.portOfExit,
        countryOfOrigin: data.countryOfOrigin,
        countryOfDestination: data.countryOfDestination,
        currency: data.currency,
        invoiceValue: Number(data.invoiceValue),
        freightValue: Number(data.freightValue),
        insuranceValue: Number(data.insuranceValue),
        remarks: data.remarks,
      };

      if (declaration) {
        await updateDeclaration(declaration.id, payload);
      } else {
        await createDeclaration(payload);
      }

      reset();
      onClose();
    } catch (err) {
      console.error("Failed to submit customs form:", err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={declaration ? `Edit Declaration: ${declaration.declarationNumber}` : "Create Customs Declaration"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Customs Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Customs Type *
            </label>
            <Select
              value={watch("customsType")}
              onChange={(e) => {
                const val = e.target.value as any;
                setValue("customsType", val);
                setValue("direction", val === "Export" ? "Outbound" : "Inbound");
              }}
              options={CUSTOMS_TYPES.map((t) => ({ label: `${t} Declaration`, value: t }))}
            />
          </div>

          {/* Direction */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Direction *
            </label>
            <Select
              value={watch("direction")}
              onChange={(e) => setValue("direction", e.target.value as any)}
              options={[
                { label: "Inbound (Import)", value: "Inbound" },
                { label: "Outbound (Export)", value: "Outbound" },
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
                setValue("bookingId", "");
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

          {/* Booking Linkage */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Carrier Booking
            </label>
            <Select
              value={watch("bookingId") || ""}
              onChange={(e) => setValue("bookingId", e.target.value)}
              options={[
                { label: "None / Optional", value: "" },
                ...availableBookings.map((b) => ({ label: `${b.bookingNumber} (${b.carrierName})`, value: b.id })),
              ]}
            />
          </div>

          {/* Container Linkage */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Primary Container
            </label>
            <Select
              value={watch("containerId") || ""}
              onChange={(e) => setValue("containerId", e.target.value)}
              options={[
                { label: "None / Air Freight Cargo", value: "" },
                ...availableContainers.map((c) => ({
                  label: `${c.containerNumber} (${c.containerType})`,
                  value: c.id,
                })),
              ]}
            />
          </div>

          {/* Customs Office */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Customs Office *
            </label>
            <Select
              value={watch("customsOffice")}
              onChange={(e) => setValue("customsOffice", e.target.value)}
              options={MOCK_CUSTOMS_OFFICES.map((o) => ({ label: o, value: o }))}
            />
          </div>

          {/* Broker */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Customs Broker / Agent *
            </label>
            <Select
              value={watch("brokerId")}
              onChange={(e) => setValue("brokerId", e.target.value)}
              options={MOCK_BROKERS.map((b) => ({ label: `${b.name} (${b.contactPerson})`, value: b.id }))}
            />
          </div>

          {/* Port of Entry */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Port of Entry *
            </label>
            <Input {...register("portOfEntry")} placeholder="e.g. JNPT Port, Mumbai" />
          </div>

          {/* Port of Exit */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Port of Exit *
            </label>
            <Input {...register("portOfExit")} placeholder="e.g. Jebel Ali Port, Dubai" />
          </div>

          {/* Origin */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Country of Origin *
            </label>
            <Input {...register("countryOfOrigin")} placeholder="e.g. India" />
          </div>

          {/* Destination */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Country of Destination *
            </label>
            <Input {...register("countryOfDestination")} placeholder="e.g. UAE" />
          </div>

          {/* Currency */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Filing Currency *
            </label>
            <Select
              value={watch("currency")}
              onChange={(e) => setValue("currency", e.target.value)}
              options={CUSTOMS_CURRENCIES.map((c) => ({ label: c, value: c }))}
            />
          </div>

          {/* Invoice Value */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Invoice Value *
            </label>
            <Input
              type="number"
              {...register("invoiceValue", { valueAsNumber: true })}
              placeholder="1000000"
            />
          </div>

          {/* Freight Value */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Freight Amount
            </label>
            <Input
              type="number"
              {...register("freightValue", { valueAsNumber: true })}
              placeholder="50000"
            />
          </div>

          {/* Insurance Value */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Insurance Amount
            </label>
            <Input
              type="number"
              {...register("insuranceValue", { valueAsNumber: true })}
              placeholder="5000"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Filing Notes / Remarks
          </label>
          <Input {...register("remarks")} placeholder="Add operational notes or HS code information..." />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            {declaration ? "Update Declaration" : "Create Declaration"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
