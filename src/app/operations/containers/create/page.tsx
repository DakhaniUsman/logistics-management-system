"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { containerSchema, ContainerFormValues } from "@/lib/validations/container";
import { useCreateContainer } from "@/hooks/use-containers";
import { useBookingStore } from "@/store/use-booking-store";
import { ISO_CODES } from "@/data/mock/container-data";
import { ArrowLeft, Save, RefreshCw, AlertTriangle, Compass, Scale, Lock, Briefcase, User } from "lucide-react";
import { toast } from "sonner";

function ContainerCreateFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryBookingId = searchParams.get("bookingId");

  const { bookings } = useBookingStore();
  const createContainerMutation = useCreateContainer();

  // Filter Confirmed Ocean, Road, or Rail bookings for assignment dropdown
  const assignableBookings = bookings.filter((b) =>
    ["Confirmed", "Pending Confirmation", "Requested", "Amended", "Amendment Requested"].includes(b.status) &&
    ["Sea", "Road", "Rail"].includes(b.transportMode)
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ContainerFormValues>({
    resolver: zodResolver(containerSchema),
    defaultValues: {
      containerNumber: "",
      containerType: "Dry Van",
      containerSize: "40FT HC",
      isoCode: "45G1",
      sealNumber: "",
      tareWeight: 3850,
      cargoWeight: 0,
      maxGrossWeight: 32500,
      bookingId: queryBookingId || "",
      shipmentId: "",
      jobId: "",
      customerId: "",
      customerName: "",
      currentLocation: "",
      currentCountry: "",
      origin: "",
      destination: "",
      assignedTo: "Operations Agent",
      notes: ""
    }
  });

  const watchSize = watch("containerSize");
  const watchType = watch("containerType");
  const watchBookingId = watch("bookingId");
  const watchTare = watch("tareWeight") || 0;
  const watchCargo = watch("cargoWeight") || 0;
  const watchMaxGross = watch("maxGrossWeight") || 32500;
  
  const currentGross = Number(watchTare) + Number(watchCargo);

  // 1. Auto-fill ISO Code and Weights based on Size and Type selection
  useEffect(() => {
    if (watchSize && watchType) {
      const iso = (ISO_CODES as any)[watchSize]?.[watchType];
      if (iso) {
        setValue("isoCode", iso, { shouldValidate: true });
      }

      // Default tare weight guidelines
      const defaultTare =
        watchSize === "20FT" ? 2250 :
        watchSize === "40FT" ? 3780 :
        watchSize === "40FT HC" ? 3850 : 4180;
      setValue("tareWeight", defaultTare, { shouldValidate: true });

      // Default max gross capacity guidelines
      const defaultMaxGross = watchSize === "20FT" ? 30480 : 32500;
      setValue("maxGrossWeight", defaultMaxGross, { shouldValidate: true });
    }
  }, [watchSize, watchType, setValue]);

  // 2. Auto-fill booking-related fields when a booking is selected
  useEffect(() => {
    if (watchBookingId && watchBookingId !== "STANDALONE") {
      const selectedBkg = bookings.find((b) => b.id === watchBookingId);
      if (selectedBkg) {
        setValue("shipmentId", selectedBkg.shipmentId, { shouldValidate: true });
        setValue("jobId", selectedBkg.jobId, { shouldValidate: true });
        setValue("customerId", selectedBkg.customerId, { shouldValidate: true });
        setValue("customerName", selectedBkg.customerName, { shouldValidate: true });
        setValue("origin", selectedBkg.origin, { shouldValidate: true });
        setValue("destination", selectedBkg.destination, { shouldValidate: true });
        setValue("currentLocation", selectedBkg.originPort || selectedBkg.pickupLocation || selectedBkg.origin, { shouldValidate: true });
        setValue("currentCountry", "Origin Country", { shouldValidate: true });
        setValue("assignedTo", selectedBkg.assignedTo || "Operations Agent", { shouldValidate: true });
      }
    } else if (watchBookingId === "STANDALONE") {
      setValue("shipmentId", "NONE", { shouldValidate: true });
      setValue("jobId", "NONE", { shouldValidate: true });
      setValue("customerId", "NONE", { shouldValidate: true });
      setValue("customerName", "Internal Depot Pool", { shouldValidate: true });
      setValue("origin", "Depot Yard", { shouldValidate: true });
      setValue("destination", "Depot Yard", { shouldValidate: true });
      setValue("currentLocation", "Yard Depot Container Stock", { shouldValidate: true });
      setValue("currentCountry", "India", { shouldValidate: true });
      setValue("assignedTo", "Shahbaj Borkar", { shouldValidate: true });
    }
  }, [watchBookingId, bookings, setValue]);

  const onSubmit = async (values: ContainerFormValues) => {
    const defaultVolume =
      values.containerSize === "20FT" ? 33.2 :
      values.containerSize === "40FT" ? 67.7 :
      values.containerSize === "40FT HC" ? 76.4 : 86.0;

    toast.promise(
      createContainerMutation.mutateAsync({
        ...values,
        condition: "Good",
        volume: defaultVolume,
        sealNumber: values.sealNumber || undefined,
        status: values.bookingId === "STANDALONE" ? "Available" : "Assigned",
        sealStatus: values.sealNumber ? "Assigned" : "Not Assigned"
      }),
      {
        loading: "Registering equipment parameters...",
        success: (data) => {
          router.push(`/operations/containers/${data.id}`);
          return `Container ${data.containerNumber} registered and stowed successfully.`;
        },
        error: (err) => `Failed to register container: ${err.message}`
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl pb-16">
      {/* Top action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Equipment specs */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-500" />
                Equipment Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Container Number */}
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Container Number *</span>
                <Input
                  {...register("containerNumber")}
                  placeholder="e.g. MSCU1234567"
                  className={errors.containerNumber ? "border-rose-500 focus:border-rose-500" : ""}
                />
                {errors.containerNumber && (
                  <p className="text-[10px] text-rose-400 font-semibold">{errors.containerNumber.message}</p>
                )}
                <span className="text-[9px] text-slate-500 block font-mono">Standard ISO format: 4 letters followed by 7 digits.</span>
              </div>

              {/* ISO Code */}
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">ISO Equipment Code *</span>
                <Input
                  {...register("isoCode")}
                  placeholder="e.g. 45G1, 22G1"
                  className={errors.isoCode ? "border-rose-500 focus:border-rose-500" : ""}
                />
                {errors.isoCode && (
                  <p className="text-[10px] text-rose-400 font-semibold">{errors.isoCode.message}</p>
                )}
              </div>

              {/* Container Size */}
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Container Size Length *</span>
                <Select
                  value={watchSize}
                  onChange={(e) => setValue("containerSize", e.target.value as any, { shouldValidate: true })}
                  options={[
                    { label: "20FT Container", value: "20FT" },
                    { label: "40FT Container", value: "40FT" },
                    { label: "40FT High Cube", value: "40FT HC" },
                    { label: "45FT Container", value: "45FT" }
                  ]}
                />
              </div>

              {/* Container Type */}
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Container Type *</span>
                <Select
                  value={watchType}
                  onChange={(e) => setValue("containerType", e.target.value as any, { shouldValidate: true })}
                  options={[
                    { label: "Dry Van (General)", value: "Dry Van" },
                    { label: "Reefer (Cold Chain)", value: "Reefer" },
                    { label: "Open Top", value: "Open Top" },
                    { label: "Flat Rack", value: "Flat Rack" },
                    { label: "Tank Container", value: "Tank" },
                    { label: "High Cube Dry", value: "High Cube" }
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Weights */}
          <Card className="p-5">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-500" />
                Weight Declarations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Tare Weight (kg) *</span>
                  <Input
                    type="number"
                    {...register("tareWeight", { valueAsNumber: true })}
                    placeholder="2250"
                  />
                  {errors.tareWeight && (
                    <p className="text-[10px] text-rose-400 font-semibold">{errors.tareWeight.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Cargo Payload (kg) *</span>
                  <Input
                    type="number"
                    {...register("cargoWeight", { valueAsNumber: true })}
                    placeholder="12000"
                  />
                  {errors.cargoWeight && (
                    <p className="text-[10px] text-rose-400 font-semibold">{errors.cargoWeight.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Max Gross capacity (kg) *</span>
                  <Input
                    type="number"
                    {...register("maxGrossWeight", { valueAsNumber: true })}
                    placeholder="32500"
                  />
                  {errors.maxGrossWeight && (
                    <p className="text-[10px] text-rose-400 font-semibold">{errors.maxGrossWeight.message}</p>
                  )}
                </div>
              </div>

              {/* Weight verification summary */}
              <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Calculated Gross Weight:</span>
                  <span className="font-bold text-slate-200 font-mono">{currentGross.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Remaining Payload Margin:</span>
                  <span className={`font-bold font-mono ${watchMaxGross - currentGross < 0 ? "text-rose-400 font-black" : "text-emerald-400"}`}>
                    {(watchMaxGross - currentGross).toLocaleString()} kg
                  </span>
                </div>
                {watchMaxGross - currentGross < 0 && (
                  <p className="text-[10px] text-rose-400 flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Gross weight exceeds maximum certified payload threshold. Lower cargo payload weight.</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Routing location details */}
          <Card className="p-5">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-500" />
                Current Yard/Position Position
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Current Location Terminal *</span>
                <Input
                  {...register("currentLocation")}
                  placeholder="e.g. JNPT Depot Yard or Mumbai Warehouse"
                />
                {errors.currentLocation && (
                  <p className="text-[10px] text-rose-400 font-semibold">{errors.currentLocation.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Current Country *</span>
                <Input
                  {...register("currentCountry")}
                  placeholder="e.g. India"
                />
                {errors.currentCountry && (
                  <p className="text-[10px] text-rose-400 font-semibold">{errors.currentCountry.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="p-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wide">Operational Remarks & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                {...register("notes")}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-white min-h-[90px] focus:outline-none focus:border-sky-500"
                placeholder="Stacking guidelines, temperature set points for reefers, hazard codes, special instructions..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Booking link & auditing */}
        <div className="space-y-6 col-span-1">
          {/* Booking allocation linkage */}
          <Card className="p-5">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-400" />
                Capacity Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Allocate to Booking Reference *</span>
                <Select
                  value={watchBookingId}
                  onChange={(e) => setValue("bookingId", e.target.value, { shouldValidate: true })}
                  options={[
                    { label: "-- Select Confirmed Booking --", value: "" },
                    { label: "Standalone pool (Unallocated)", value: "STANDALONE" },
                    ...assignableBookings.map((b) => ({
                      label: `${b.bookingNumber} (${b.customerName})`,
                      value: b.id
                    }))
                  ]}
                />
                {errors.bookingId && (
                  <p className="text-[10px] text-rose-400 font-semibold">{errors.bookingId.message}</p>
                )}
              </div>

              {watchBookingId && watchBookingId !== "STANDALONE" && (
                <div className="p-3 bg-slate-900/40 rounded-lg space-y-2.5 font-mono text-[10px] border border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[8px]">Job ID Reference</span>
                    <span className="text-slate-300 font-bold">{watch("jobId")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[8px]">Shipment ID Reference</span>
                    <span className="text-slate-300 font-bold">{watch("shipmentId")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[8px]">Client Account</span>
                    <span className="text-slate-200 font-bold">{watch("customerName")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[8px]">Origin POL</span>
                      <span className="text-slate-300 font-semibold truncate block">{watch("origin")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[8px]">Destination POD</span>
                      <span className="text-slate-300 font-semibold truncate block">{watch("destination")}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Seal */}
          <Card className="p-5">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                Security Lock
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Initial Seal Number</span>
                <Input
                  {...register("sealNumber")}
                  placeholder="e.g. SL-881942"
                />
                <span className="text-[9px] text-slate-500 block">Optional. Can be applied during gate out at port later.</span>
              </div>
            </CardContent>
          </Card>

          {/* Audit Agent */}
          <Card className="p-5">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                Auditor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Assigned Auditor Agent *</span>
                <Input
                  {...register("assignedTo")}
                  placeholder="Vikram Mehta"
                />
                {errors.assignedTo && (
                  <p className="text-[10px] text-rose-400 font-semibold">{errors.assignedTo.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3">
            <Link href="/operations/containers" className="w-1/2">
              <Button variant="outline" className="w-full text-xs font-semibold" type="button" icon={ArrowLeft}>
                Cancel
              </Button>
            </Link>
            <Button
              variant="primary"
              className="w-1/2 text-xs font-semibold"
              type="submit"
              icon={Save}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Container"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function ContainerCreatePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Register Container Equipment"
        subtitle="Register new physical cargo container units, apply high-security seals, log initial weights, and allocate capacity to confirmed space bookings."
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Containers", href: "/operations/containers" },
          { label: "Register Unit" }
        ]}
      />

      <Suspense fallback={
        <div className="p-16 text-center text-xs text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
          Loading registration context...
        </div>
      }>
        <ContainerCreateFormContent />
      </Suspense>
    </div>
  );
}
