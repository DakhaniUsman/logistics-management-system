"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useShipmentStore } from "@/store/use-shipment-store";
import { useJobStore } from "@/store/use-job-store";
import { TransportMode, ShipmentStatus } from "@/types/shipment";
import { JobPriority } from "@/types/job";
import {
  Ship,
  Plane,
  Truck,
  Train,
  Layers,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Briefcase,
  User,
  MapPin,
  Box,
  DollarSign,
  AlertTriangle,
  FileText,
  Anchor,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

function CreateShipmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultJobId = searchParams.get("jobId") || "";

  const { addShipment } = useShipmentStore();
  const { jobs } = useJobStore();

  const [selectedJobId, setSelectedJobId] = useState(defaultJobId || (jobs[0]?.id || ""));

  // Form State
  const [transportMode, setTransportMode] = useState<TransportMode>("Sea");
  const [serviceType, setServiceType] = useState("Port-to-Port");
  const [status, setStatus] = useState<ShipmentStatus>("Scheduled");
  const [priority, setPriority] = useState<JobPriority>("High");

  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [contactName, setContactName] = useState("Operations Desk");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [origin, setOrigin] = useState("Mumbai Port (JNPT)");
  const [destination, setDestination] = useState("Jebel Ali Port");
  const [originCountry, setOriginCountry] = useState("India");
  const [destinationCountry, setDestinationCountry] = useState("UAE");
  const [originPort, setOriginPort] = useState("JNPT Terminal 3");
  const [destinationPort, setDestinationPort] = useState("Jebel Ali Terminal 2");

  const [carrierName, setCarrierName] = useState("MSC Shipping Line");
  const [vesselName, setVesselName] = useState("MSC ANNA");
  const [voyageNumber, setVoyageNumber] = useState("024W");
  const [flightNumber, setFlightNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeekStr = new Date(Date.now() + 86400000 * 8).toISOString().split("T")[0];

  const [etd, setEtd] = useState(todayStr);
  const [eta, setEta] = useState(nextWeekStr);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState(new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0]);

  const [cargoDescription, setCargoDescription] = useState("Consumer Electronics & High Tech Components");
  const [cargoType, setCargoType] = useState("High Value");
  const [quantity, setQuantity] = useState(450);
  const [quantityUnit, setQuantityUnit] = useState("Cartons");
  const [weight, setWeight] = useState(14500);
  const [weightUnit, setWeightUnit] = useState("KG");
  const [volume, setVolume] = useState(38);
  const [volumeUnit, setVolumeUnit] = useState("CBM");
  const [containerType, setContainerType] = useState("40FT High Cube");
  const [containerQuantity, setContainerQuantity] = useState(1);

  const [estimatedRevenue, setEstimatedRevenue] = useState(185000);
  const [estimatedCost, setEstimatedCost] = useState(130000);
  const [currency, setCurrency] = useState("INR");

  const [assignedTo, setAssignedTo] = useState("Vikram Mehta");
  const [assignedDepartment, setAssignedDepartment] = useState("Ocean Export Operations");
  const [specialRequirements, setSpecialRequirements] = useState("Maintain tamper-evident security seal. Handle in accordance with ISO cargo standards.");

  // When job changes, pre-populate
  useEffect(() => {
    if (selectedJobId) {
      const foundJob = jobs.find(
        (j) => j.id.toLowerCase() === selectedJobId.toLowerCase() || j.jobNumber?.toLowerCase() === selectedJobId.toLowerCase()
      );
      if (foundJob) {
        setCustomerName(foundJob.customerName || "");
        setCustomerId(foundJob.customerId || "CUS-001");
        setContactName(foundJob.contactName || "Operations Desk");
        setContactEmail(foundJob.contactEmail || "");
        setContactPhone(foundJob.contactPhone || "");
        setOrigin(foundJob.origin || "Mumbai");
        setDestination(foundJob.destination || "Dubai");
        setOriginCountry(foundJob.originCountry || "India");
        setDestinationCountry(foundJob.destinationCountry || "UAE");
        if (foundJob.transportMode === "Air" || foundJob.transportMode === "Air Freight") {
          setTransportMode("Air");
          setCarrierName("Emirates SkyCargo");
          setFlightNumber("EK-501");
          setServiceType("Airport-to-Airport");
        } else if (foundJob.transportMode === "Road" || foundJob.transportMode === "Road Transport") {
          setTransportMode("Road");
          setCarrierName("TCI Logistics");
          setVehicleNumber("MH-04-AB-9821");
          setServiceType("Door-to-Door");
        } else {
          setTransportMode("Sea");
          setCarrierName("MSC Shipping Line");
          setVesselName("MSC AURORA");
          setVoyageNumber("042E");
          setServiceType("Port-to-Port");
        }
        if (foundJob.cargoDescription) setCargoDescription(foundJob.cargoDescription);
        if (foundJob.estimatedRevenue) setEstimatedRevenue(foundJob.estimatedRevenue);
        if (foundJob.estimatedCost) setEstimatedCost(foundJob.estimatedCost);
        if (foundJob.assignedTo) setAssignedTo(foundJob.assignedTo);
      }
    }
  }, [selectedJobId, jobs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedJob = jobs.find((j) => j.id.toLowerCase() === selectedJobId.toLowerCase());
    const jobNumber = selectedJob?.jobNumber || selectedJobId || "JOB-2026-00001";

    const newShipment = addShipment({
      jobId: selectedJobId || "JOB-2026-00001",
      jobNumber,
      customerId: customerId || "CUS-2026-001",
      customerName: customerName || "Enterprise Client",
      contactName,
      contactEmail,
      contactPhone,
      status,
      priority,
      transportMode,
      serviceType,
      origin,
      destination,
      originCountry,
      destinationCountry,
      originPort: transportMode === "Sea" ? originPort : undefined,
      destinationPort: transportMode === "Sea" ? destinationPort : undefined,
      carrierName,
      vesselName: transportMode === "Sea" ? vesselName : undefined,
      voyageNumber: transportMode === "Sea" ? voyageNumber : undefined,
      flightNumber: transportMode === "Air" ? flightNumber : undefined,
      vehicleNumber: transportMode === "Road" ? vehicleNumber : undefined,
      driverName: transportMode === "Road" ? driverName : undefined,
      driverPhone: transportMode === "Road" ? driverPhone : undefined,
      etd,
      eta,
      pickupDate,
      requiredDeliveryDate,
      cargoDescription,
      cargoType,
      quantity,
      quantityUnit,
      weight,
      weightUnit,
      volume,
      volumeUnit,
      containerType: transportMode === "Sea" ? containerType : undefined,
      containerQuantity: transportMode === "Sea" ? containerQuantity : undefined,
      estimatedRevenue,
      estimatedCost,
      currency,
      assignedTo,
      assignedDepartment,
      specialRequirements,
      createdBy: "Dakhani Usman",
    });

    router.push(`/operations/shipments/${newShipment.id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="CREATE OPERATIONAL SHIPMENT"
        subtitle="Initialize an operational consignment leg under an active job file with route, carrier, and cargo details."
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Shipments", href: "/operations/shipments" },
          { label: "New Shipment" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Parent Job & Commercial Anchor */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-500" />
              <span>1. Operational Job Association & Customer Anchor</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Every shipment operational leg must be anchored to an authorized Operational Job File.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Select Operational Job *
              </label>
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                options={jobs.map((j) => ({
                  value: j.id,
                  label: `${j.jobNumber} — ${j.customerName} (${j.origin} → ${j.destination})`,
                }))}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Customer Name
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enterprise Customer"
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Customer Contact Name / Phone
              </label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Rahul Sharma (+91 98200 11223)"
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Transport Mode & Route Corridor */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Anchor className="w-4 h-4 text-sky-500" />
              <span>2. Transport Mode, Carrier & Corridor Logistics</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Define the multimodal conveyance, ocean line or airline, and transit terminals.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Transport Mode *
                </label>
                <Select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as TransportMode)}
                  options={[
                    { value: "Sea", label: "Ocean Freight (Sea)" },
                    { value: "Air", label: "Air Cargo (Air)" },
                    { value: "Road", label: "Road Freight (Road)" },
                    { value: "Rail", label: "Rail Intermodal (Rail)" },
                    { value: "Multimodal", label: "Multimodal" },
                  ]}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Service Scope
                </label>
                <Select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  options={[
                    { value: "Port-to-Port", label: "Port-to-Port" },
                    { value: "Door-to-Door", label: "Door-to-Door" },
                    { value: "Airport-to-Airport", label: "Airport-to-Airport" },
                    { value: "Door-to-Port", label: "Door-to-Port" },
                    { value: "Port-to-Door", label: "Port-to-Door" },
                  ]}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Initial Status
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
                  options={[
                    { value: "Scheduled", label: "Scheduled" },
                    { value: "Booking Pending", label: "Booking Pending" },
                    { value: "Booked", label: "Booked" },
                    { value: "Cargo Ready", label: "Cargo Ready" },
                    { value: "Picked Up", label: "Picked Up" },
                    { value: "In Transit", label: "In Transit" },
                  ]}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Priority
                </label>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as JobPriority)}
                  options={[
                    { value: "Medium", label: "Standard / Medium" },
                    { value: "High", label: "High Priority" },
                    { value: "Urgent", label: "Urgent Expedited" },
                  ]}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Route row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Origin Hub / City *
                </label>
                <Input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Mumbai Port (JNPT)"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Origin Country
                </label>
                <Input
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                  placeholder="India"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Destination Hub / City *
                </label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Jebel Ali Port"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Destination Country
                </label>
                <Input
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  placeholder="UAE"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Carrier & Vessel/Flight row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Carrier / Line Name
                </label>
                <Input
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  placeholder="e.g. MSC / Maersk / Emirates SkyCargo"
                  className="text-xs"
                />
              </div>

              {transportMode === "Sea" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Vessel Name
                    </label>
                    <Input
                      value={vesselName}
                      onChange={(e) => setVesselName(e.target.value)}
                      placeholder="e.g. MSC ANNA"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Voyage Number
                    </label>
                    <Input
                      value={voyageNumber}
                      onChange={(e) => setVoyageNumber(e.target.value)}
                      placeholder="e.g. 024W"
                      className="text-xs"
                    />
                  </div>
                </>
              )}

              {transportMode === "Air" && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Flight Number
                  </label>
                  <Input
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="e.g. EK-501 / EK-045"
                    className="text-xs"
                  />
                </div>
              )}

              {transportMode === "Road" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Vehicle / Trailer Number
                    </label>
                    <Input
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="e.g. MH-12-PQ-9088"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Driver Name & Contact
                    </label>
                    <Input
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="e.g. Ramesh Pawar (+91 99220 88771)"
                      className="text-xs"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Schedule Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Estimated Departure (ETD) *
                </label>
                <Input
                  type="date"
                  value={etd}
                  onChange={(e) => setEtd(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Estimated Arrival (ETA) *
                </label>
                <Input
                  type="date"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Cargo Ready / Pickup Date
                </label>
                <Input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Target Consignee Delivery
                </label>
                <Input
                  type="date"
                  value={requiredDeliveryDate}
                  onChange={(e) => setRequiredDeliveryDate(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Cargo Specifications & Equipment */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Box className="w-4 h-4 text-sky-500" />
              <span>3. Cargo Specifications, Weight, Volume & Special Handling</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Physical attributes, weight certifications, and handling constraints.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Cargo Description *
                </label>
                <Input
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                  placeholder="e.g. Consumer Electronics & High-precision microcontrollers"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Cargo Classification
                </label>
                <Select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  options={[
                    { value: "General", label: "General Dry Cargo" },
                    { value: "High Value", label: "High Value / Secure Freight" },
                    { value: "GDP Pharma", label: "GDP Pharma (Cold Chain 2-8°C)" },
                    { value: "Perishable", label: "Perishable (Food / Agri)" },
                    { value: "Hazardous", label: "Hazardous / DG (IMDG / IATA)" },
                  ]}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Quantity Unit
                </label>
                <Select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  options={[
                    { value: "Cartons", label: "Cartons" },
                    { value: "Pallets", label: "Pallets" },
                    { value: "Boxes", label: "Boxes" },
                    { value: "Containers", label: "Containers" },
                    { value: "Crates", label: "Crates" },
                  ]}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Gross Weight
                </label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Weight Unit
                </label>
                <Select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  options={[
                    { value: "KG", label: "Kilograms (KG)" },
                    { value: "MT", label: "Metric Tonnes (MT)" },
                  ]}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Volume (CBM)
                </label>
                <Input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono"
                />
              </div>

              {transportMode === "Sea" ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Container Type
                  </label>
                  <Select
                    value={containerType}
                    onChange={(e) => setContainerType(e.target.value)}
                    options={[
                      { value: "40FT High Cube", label: "40FT High Cube" },
                      { value: "20FT Standard", label: "20FT Standard" },
                      { value: "40FT Reefer", label: "40FT Reefer" },
                      { value: "20FT Flat Rack", label: "20FT Flat Rack" },
                    ]}
                    className="text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Operations Lead
                  </label>
                  <Input
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="text-xs"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Special Handling & Security Instructions
              </label>
              <Input
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g. GDP temperature audit, shock-proof pallet wrapping, bonded customs escort"
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/operations/shipments">
            <Button variant="outline" size="sm">
              Cancel & Return
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-xs"
          >
            Register Operational Shipment
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateShipmentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading shipment creation form...</div>}>
      <CreateShipmentContent />
    </Suspense>
  );
}
