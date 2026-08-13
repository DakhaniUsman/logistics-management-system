"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { bookingSchema, BookingFormValues } from "@/lib/validations/booking";
import { useBookingStore } from "@/store/use-booking-store";
import { MOCK_SHIPMENTS } from "@/data/mock/shipment-data";
import { MOCK_CARRIERS } from "@/data/mock/booking-data";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  FileText,
  UserCheck,
  Calendar,
  Anchor,
  Plane,
  Truck,
  Train,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

function CreateBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultShipmentId = searchParams.get("shipmentId") || "";

  const { createBooking } = useBookingStore();

  const [selectedShipmentId, setSelectedShipmentId] = useState(defaultShipmentId);
  const [carriers, setCarriers] = useState<typeof MOCK_CARRIERS>([]);

  // Find selected shipment details
  const selectedShipment = MOCK_SHIPMENTS.find((s) => s.id === selectedShipmentId);

  // Filter carriers based on shipment transport mode
  useEffect(() => {
    if (selectedShipment) {
      const mode = selectedShipment.transportMode;
      const filtered = MOCK_CARRIERS.filter(
        (c) => c.mode.toLowerCase() === mode.toLowerCase()
      );
      setCarriers(filtered);
    } else {
      setCarriers([]);
    }
  }, [selectedShipment]);

  // Setup React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      shipmentId: "",
      jobId: "",
      customerId: "",
      customerName: "",
      carrierId: "",
      carrierName: "",
      bookingReference: "",
      transportMode: "Sea",
      serviceType: "Port-to-Port",
      origin: "",
      destination: "",
      originPort: "",
      destinationPort: "",
      originAirport: "",
      destinationAirport: "",
      originStation: "",
      destinationStation: "",
      pickupLocation: "",
      deliveryLocation: "",
      vesselName: "",
      voyageNumber: "",
      flightNumber: "",
      vehicleNumber: "",
      vehicleType: "",
      railOperator: "",
      trainNumber: "",
      requestedDate: new Date().toISOString().split("T")[0],
      etd: "",
      eta: "",
      cargoDescription: "",
      cargoType: "General",
      quantity: 1,
      quantityUnit: "Pallets",
      weight: 1000,
      weightUnit: "KG",
      volume: 10,
      volumeUnit: "CBM",
      containerType: "20FT Standard",
      containerQuantity: 1,
      specialRequirements: "",
      notes: "",
      assignedTo: "Shahbaj Borkar"
    }
  });

  const watchedTransportMode = watch("transportMode");

  // Autofill form when shipment is selected
  useEffect(() => {
    if (selectedShipment) {
      reset({
        shipmentId: selectedShipment.id,
        jobId: selectedShipment.jobId,
        customerId: selectedShipment.customerId,
        customerName: selectedShipment.customerName,
        transportMode: selectedShipment.transportMode as any,
        serviceType: selectedShipment.serviceType || "Port-to-Port",
        origin: selectedShipment.origin,
        destination: selectedShipment.destination,
        originPort: selectedShipment.originPort || "",
        destinationPort: selectedShipment.destinationPort || "",
        originAirport: selectedShipment.originAirport || "",
        destinationAirport: selectedShipment.destinationAirport || "",
        pickupLocation: selectedShipment.pickupLocation || "",
        deliveryLocation: selectedShipment.deliveryLocation || "",
        vesselName: selectedShipment.vesselName || "",
        voyageNumber: selectedShipment.voyageNumber || "",
        flightNumber: selectedShipment.flightNumber || "",
        vehicleNumber: selectedShipment.vehicleNumber || "",
        requestedDate: new Date().toISOString().split("T")[0],
        etd: selectedShipment.etd || "",
        eta: selectedShipment.eta || "",
        cargoDescription: selectedShipment.cargoDescription || "",
        cargoType: selectedShipment.cargoType || "General",
        quantity: selectedShipment.quantity || 1,
        quantityUnit: selectedShipment.quantityUnit || "Pallets",
        weight: selectedShipment.weight || 1000,
        weightUnit: selectedShipment.weightUnit || "KG",
        volume: selectedShipment.volume || 10,
        volumeUnit: selectedShipment.volumeUnit || "CBM",
        containerType: selectedShipment.containerType || "20FT Standard",
        containerQuantity: selectedShipment.containerQuantity || 1,
        specialRequirements: selectedShipment.specialRequirements || "",
        notes: selectedShipment.notes || "",
        assignedTo: selectedShipment.assignedTo || "Shahbaj Borkar"
      });
      
      // Update local state selector if prefilled
      setSelectedShipmentId(selectedShipment.id);
    }
  }, [selectedShipmentId, selectedShipment, reset]);

  // Handle carrier change
  const handleCarrierChange = (carrierId: string) => {
    const carrierObj = MOCK_CARRIERS.find((c) => c.id === carrierId);
    if (carrierObj) {
      setValue("carrierId", carrierObj.id);
      setValue("carrierName", carrierObj.name);
    }
  };

  // Submit Handler
  const onSubmit = (data: BookingFormValues) => {
    try {
      const newBooking = createBooking({
        ...data,
        status: "Requested", // Start as space request query
        bookingReference: data.bookingReference || undefined,
        createdBy: "Shahbaj Borkar"
      });
      toast.success(`Booking space reservation query initialized: ${newBooking.bookingNumber}`);
      router.push(`/operations/bookings/${newBooking.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking request");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Create Carrier Booking Request"
        subtitle="Match physical cargo requirements with commercial carriers to secure transport line allocations."
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Bookings", href: "/operations/bookings" },
          { label: "Create Request" }
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto text-xs">
        
        {/* STEP 1: PARENT SHIPMENT SELECTOR */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            1. Parent Shipment Allocation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Active Shipment Record"
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              options={[
                { label: "Select Shipment...", value: "" },
                ...MOCK_SHIPMENTS.map((s) => ({
                  label: `${s.id} - ${s.customerName} [${s.transportMode}]`,
                  value: s.id
                }))
              ]}
            />

            {/* Carrier select matching transport mode */}
            <Select
              label="Select Target Transport Carrier"
              {...register("carrierId", {
                onChange: (e) => handleCarrierChange(e.target.value)
              })}
              options={[
                { label: "Select Carrier...", value: "" },
                ...carriers.map((c) => ({
                  label: c.name,
                  value: c.id
                }))
              ]}
              error={errors.carrierId?.message}
            />
          </div>

          {selectedShipment && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Shipper Customer</span>
                <span className="font-bold text-slate-100">{selectedShipment.customerName}</span>
                <span className="block text-slate-500 text-[10px]">Job: {selectedShipment.jobId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Route</span>
                <span className="font-bold text-slate-100 flex items-center gap-1">
                  <span>{selectedShipment.origin}</span>
                  <ArrowRight className="w-3 h-3 text-sky-500" />
                  <span>{selectedShipment.destination}</span>
                </span>
                <span className="block text-slate-500 text-[10px]">{selectedShipment.transportMode} • {selectedShipment.serviceType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Cargo Summary</span>
                <span className="font-bold text-slate-100 block">
                  {selectedShipment.quantity} {selectedShipment.quantityUnit} ({selectedShipment.weight} {selectedShipment.weightUnit})
                </span>
                <span className="text-sky-400 font-mono text-[10px]">{selectedShipment.containerType}</span>
              </div>
            </div>
          )}
        </Card>

        {/* STEP 2: MODE-SPECIFIC TRANSIT ROUTING */}
        {selectedShipment && (
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              2. Leg Routing Specifics ({watchedTransportMode} Freight)
            </h3>

            {/* Sea Specifics */}
            {watchedTransportMode === "Sea" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Vessel Name *"
                  {...register("vesselName")}
                  error={errors.vesselName?.message}
                  placeholder="e.g. MSC ANNA"
                />
                <Input
                  label="Voyage Number *"
                  {...register("voyageNumber")}
                  error={errors.voyageNumber?.message}
                  placeholder="e.g. 024W"
                />
                <Input
                  label="Origin Port of Loading (POL) *"
                  {...register("originPort")}
                  error={errors.originPort?.message}
                  placeholder="e.g. JNPT Port, Mumbai"
                />
                <Input
                  label="Destination Port of Discharge (POD) *"
                  {...register("destinationPort")}
                  error={errors.destinationPort?.message}
                  placeholder="e.g. Jebel Ali Port, Dubai"
                />
              </div>
            )}

            {/* Air Specifics */}
            {watchedTransportMode === "Air" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  label="Flight Number *"
                  {...register("flightNumber")}
                  error={errors.flightNumber?.message}
                  placeholder="e.g. EK-501"
                />
                <Input
                  label="Origin Airport (Apt) *"
                  {...register("originAirport")}
                  error={errors.originAirport?.message}
                  placeholder="e.g. BOM Airport"
                />
                <Input
                  label="Destination Airport (Apt) *"
                  {...register("destinationAirport")}
                  error={errors.destinationAirport?.message}
                  placeholder="e.g. FRA Airport"
                />
              </div>
            )}

            {/* Road Specifics */}
            {watchedTransportMode === "Road" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Vehicle / Truck License Plate"
                  {...register("vehicleNumber")}
                  error={errors.vehicleNumber?.message}
                  placeholder="e.g. MH-12-PQ-9088"
                />
                <Input
                  label="Vehicle Cargo Type"
                  {...register("vehicleType")}
                  error={errors.vehicleType?.message}
                  placeholder="e.g. 32FT Covered Container Truck"
                />
                <Input
                  label="Cargo Pickup Location Address *"
                  {...register("pickupLocation")}
                  error={errors.pickupLocation?.message}
                  placeholder="Pickup address details..."
                />
                <Input
                  label="Cargo Destination Delivery Address *"
                  {...register("deliveryLocation")}
                  error={errors.deliveryLocation?.message}
                  placeholder="Consignee delivery address details..."
                />
              </div>
            )}

            {/* Rail Specifics */}
            {watchedTransportMode === "Rail" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Rail Operator"
                  {...register("railOperator")}
                  error={errors.railOperator?.message}
                  placeholder="CONCOR India"
                />
                <Input
                  label="Train / Wagon Number"
                  {...register("trainNumber")}
                  error={errors.trainNumber?.message}
                  placeholder="TR-9982"
                />
                <Input
                  label="Origin Rail Station"
                  {...register("originStation")}
                  error={errors.originStation?.message}
                  placeholder="Tughlakabad ICD"
                />
                <Input
                  label="Destination Rail Station"
                  {...register("destinationStation")}
                  error={errors.destinationStation?.message}
                  placeholder="Mundra Port Siding"
                />
              </div>
            )}

            {/* Multimodal Specifics */}
            {watchedTransportMode === "Multimodal" && (
              <div className="bg-slate-950/60 p-3 rounded border border-slate-800 text-slate-400">
                Multimodal transit parameters will incorporate sea, air, and road legs. Detailed parameters will be managed under execution orders.
              </div>
            )}
          </Card>
        )}

        {/* STEP 3: SCHEDULES, CAPACITY & GENERAL */}
        {selectedShipment && (
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              3. Schedules & Cargo Specifications
            </h3>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Space Request Submission Date"
                type="date"
                {...register("requestedDate")}
                error={errors.requestedDate?.message}
                required
              />
              <Input
                label="Estimated Leg Departure Date (ETD) *"
                type="date"
                {...register("etd")}
                error={errors.etd?.message}
                required
              />
              <Input
                label="Estimated Leg Arrival Date (ETA) *"
                type="date"
                {...register("eta")}
                error={errors.eta?.message}
                required
              />
            </div>

            {/* Cargo Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cargo Description Summary *"
                {...register("cargoDescription")}
                error={errors.cargoDescription?.message}
                required
              />
              <Input
                label="Special Temperature/Hazmat Class Code"
                {...register("cargoType")}
                error={errors.cargoType?.message}
                placeholder="GDP Cold Chain, General, Class 9 Hazmat..."
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Cargo Count *"
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  error={errors.quantity?.message}
                  required
                />
                <Input
                  label="Count Unit *"
                  {...register("quantityUnit")}
                  error={errors.quantityUnit?.message}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Gross Weight *"
                  type="number"
                  step="0.01"
                  {...register("weight", { valueAsNumber: true })}
                  error={errors.weight?.message}
                  required
                />
                <Input
                  label="Weight Unit *"
                  {...register("weightUnit")}
                  error={errors.weightUnit?.message}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Gross Volume *"
                  type="number"
                  step="0.01"
                  {...register("volume", { valueAsNumber: true })}
                  error={errors.volume?.message}
                  required
                />
                <Input
                  label="Volume Unit *"
                  {...register("volumeUnit")}
                  error={errors.volumeUnit?.message}
                  required
                />
              </div>
            </div>

            {/* Container and Assignee */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Equipment Allocation Type"
                {...register("containerType")}
                error={errors.containerType?.message}
                placeholder="40FT HC, LD3, 32FT Truck..."
              />
              <Input
                label="Equipment Count"
                type="number"
                {...register("containerQuantity", { valueAsNumber: true })}
                error={errors.containerQuantity?.message}
              />
              <Input
                label="Operations Staff Handover *"
                {...register("assignedTo")}
                error={errors.assignedTo?.message}
                required
              />
            </div>

            {/* Special Instructions & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Special Handling / Carrier Instructions"
                {...register("specialRequirements")}
                error={errors.specialRequirements?.message}
                placeholder="e.g. Dry ice monitoring, tilt watch sensors..."
              />
              <Input
                label="Internal Operations Notes"
                {...register("notes")}
                error={errors.notes?.message}
                placeholder="Internal references or instructions..."
              />
            </div>
          </Card>
        )}

        {/* Submit Control Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/operations/bookings">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" size="sm" type="submit" icon={CheckCircle2} disabled={!selectedShipment}>
            Initialize Space Booking Query
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateBookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Booking Request Form...</div>}>
      <CreateBookingContent />
    </Suspense>
  );
}
