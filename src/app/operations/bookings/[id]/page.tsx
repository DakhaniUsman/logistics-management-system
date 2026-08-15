"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Timeline } from "@/components/ui/timeline";
import { useBookingStore } from "@/store/use-booking-store";
import { useContainers } from "@/hooks/use-containers";
import { DocumentCompletenessWidget } from "@/components/documents/document-completeness-widget";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  Ship,
  Plane,
  Truck,
  Train,
  Calendar,
  User,
  Plus,
  Undo,
  CheckSquare,
  Building,
  Anchor,
  Compass,
  Briefcase,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const {
    bookings,
    confirmBooking,
    rejectBooking,
    requestAmendment,
    createAmendment,
    cancelBooking,
    completeBooking
  } = useBookingStore();

  const booking = bookings.find(
    (b) => b.id.toLowerCase() === bookingId.toLowerCase() || b.bookingNumber.toLowerCase() === bookingId.toLowerCase()
  );

  const [activeTab, setActiveTab] = useState("overview");

  const { data: bookingContainers = [], isLoading: isContainersLoading } = useContainers({ bookingId: booking?.id });

  // Modals state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReqAmendmentOpen, setIsReqAmendmentOpen] = useState(false);
  const [isProcAmendmentOpen, setIsProcAmendmentOpen] = useState(false);

  // Form states for modals
  const [carrierRef, setCarrierRef] = useState("");
  const [vesselName, setVesselName] = useState(booking?.vesselName || "");
  const [voyageNum, setVoyageNum] = useState(booking?.voyageNumber || "");
  const [flightNum, setFlightNum] = useState(booking?.flightNumber || "");
  const [vehicleNum, setVehicleNum] = useState(booking?.vehicleNumber || "");
  const [etdDate, setEtdDate] = useState(booking?.etd || "");
  const [etaDate, setEtaDate] = useState(booking?.eta || "");

  const [rejectionReason, setRejectionReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("Carrier unavailable");
  const [cancellationComments, setCancellationComments] = useState("");

  const [amendmentField, setAmendmentField] = useState("etd");
  const [amendmentNewVal, setAmendmentNewVal] = useState("");
  const [amendmentReason, setAmendmentReason] = useState("");

  // Process amendment form states
  const [procField, setProcField] = useState("etd");
  const [procOldVal, setProcOldVal] = useState("");
  const [procNewVal, setProcNewVal] = useState("");
  const [procReason, setProcReason] = useState("");

  if (!booking) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Booking Record Not Found</h2>
        <p className="text-slate-400 text-xs">The booking ID {bookingId} could not be located in the operations directory.</p>
        <Link href="/operations/bookings">
          <Button variant="primary" size="sm">Back to Bookings Directory</Button>
        </Link>
      </div>
    );
  }

  // Handle Confirm Submission
  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrierRef) {
      toast.error("Carrier Reference is required");
      return;
    }

    confirmBooking(booking.id, {
      bookingReference: carrierRef,
      vesselName: booking.transportMode === "Sea" ? vesselName : undefined,
      voyageNumber: booking.transportMode === "Sea" ? voyageNum : undefined,
      flightNumber: booking.transportMode === "Air" ? flightNum : undefined,
      vehicleNumber: booking.transportMode === "Road" ? vehicleNum : undefined,
      etd: etdDate || undefined,
      eta: etaDate || undefined
    });

    setIsConfirmOpen(false);
    toast.success(`Booking space confirmed under reference ${carrierRef}`);
  };

  // Handle Reject Submission
  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason) {
      toast.error("Please provide a rejection reason");
      return;
    }
    rejectBooking(booking.id, rejectionReason);
    setIsRejectOpen(false);
    toast.warning("Booking space rejected. Carrier will be notified.");
  };

  // Handle Cancel Submission
  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonText = cancellationComments
      ? `${cancellationReason} - ${cancellationComments}`
      : cancellationReason;

    cancelBooking(booking.id, reasonText);
    setIsCancelOpen(false);
    toast.error("Booking space has been cancelled.");
  };

  // Handle Request Amendment Submission
  const handleRequestAmendmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendmentNewVal || !amendmentReason) {
      toast.error("Please fill in all amendment request fields");
      return;
    }
    requestAmendment(booking.id, amendmentField, amendmentNewVal, amendmentReason);
    setIsReqAmendmentOpen(false);
    toast.info("Amendment request logged and submitted to carrier desk.");
  };

  // Handle Process Amendment Submission
  const handleProcessAmendmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procNewVal || !procReason) {
      toast.error("Please provide new value and justification");
      return;
    }
    createAmendment(booking.id, {
      fieldName: procField,
      oldValue: procOldVal || (booking as any)[procField] || "Not Set",
      newValue: procNewVal,
      reason: procReason,
      changedBy: "Dakhani Usman"
    });
    setIsProcAmendmentOpen(false);
    toast.success(`Booking parameter updated. Status set to Amended.`);
  };

  const handleCompleteSubmit = () => {
    completeBooking(booking.id);
    toast.success("Booking space marked as fulfilled and completed.");
  };

  // Setup dynamic field auto-populating for amendment processing
  const handleProcFieldChange = (field: string) => {
    setProcField(field);
    setProcOldVal((booking as any)[field] || "");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Detail Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-sky-500/10 text-sky-400 font-bold px-2 py-0.5 rounded uppercase font-mono">
              {booking.transportMode} Freight Leg
            </span>
            <StatusBadge status={booking.status} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-500" />
            Booking {booking.bookingNumber}
          </h1>
          <p className="text-xs text-slate-400">
            Linked Shipment: <Link href={`/operations/jobs`} className="text-sky-500 hover:underline font-mono font-semibold">{booking.shipmentId}</Link> • Parent Job: <span className="font-mono">{booking.jobId}</span>
          </p>
        </div>

        {/* Action Controls based on status */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Confirmed / Amended Actions */}
          {(booking.status === "Confirmed" || booking.status === "Amended") && (
            <>
              <Button variant="outline" size="sm" icon={Undo} onClick={() => {
                setAmendmentField("etd");
                setAmendmentNewVal("");
                setAmendmentReason("");
                setIsReqAmendmentOpen(true);
              }}>
                Request Amendment
              </Button>
              <Button variant="primary" size="sm" icon={CheckSquare} onClick={handleCompleteSubmit}>
                Mark Completed
              </Button>
            </>
          )}

          {/* Pending Confirmations Actions */}
          {(booking.status === "Draft" || booking.status === "Requested" || booking.status === "Pending Confirmation") && (
            <>
              <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => {
                setCarrierRef(booking.bookingReference || "");
                setIsConfirmOpen(true);
              }}>
                Confirm Space
              </Button>
              <Button variant="outline" size="sm" className="text-rose-400 hover:bg-rose-950/20" onClick={() => setIsRejectOpen(true)}>
                Reject Space
              </Button>
            </>
          )}

          {/* Amendment Requested Actions */}
          {booking.status === "Amendment Requested" && (
            <>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => {
                handleProcFieldChange("etd");
                setIsProcAmendmentOpen(true);
              }}>
                Process Amendment
              </Button>
              <Button variant="outline" size="sm" className="text-rose-400 hover:bg-rose-950/20" onClick={() => setIsRejectOpen(true)}>
                Reject Space
              </Button>
            </>
          )}

          {/* Global Cancellation Button (Except Final States) */}
          {!["Cancelled", "Rejected", "Completed"].includes(booking.status) && (
            <Button variant="outline" size="sm" className="text-slate-400 hover:text-rose-400" onClick={() => setIsCancelOpen(true)}>
              Cancel Booking
            </Button>
          )}

          {/* Back button */}
          <Link href="/operations/bookings">
            <Button variant="outline" size="sm">
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        tabs={[
          { id: "overview", label: "Booking Overview" },
          { id: "transport", label: "Transport Details" },
          { id: "documents", label: "Documents Area" },
          { id: "containers", label: `Container Allocation`, count: bookingContainers.length },
          { id: "timeline", label: "Activities & Logs", count: booking.activities?.length || 0 },
          { id: "amendments", label: "Amendment History", count: booking.amendments?.length || 0 }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "documents" && (
        <div className="space-y-4">
          <DocumentCompletenessWidget bookingId={booking.id} />
        </div>
      )}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Customer & Commercial Linkage */}
          <Card className="p-5 lg:col-span-2 space-y-4">
            <CardHeader className="p-0 pb-2 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-sky-400" />
                Customer & Shipment Association
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer Account</span>
                <span className="text-slate-200 font-bold block mt-0.5">{booking.customerName}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ID: {booking.customerId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Operations Owner</span>
                <span className="text-slate-200 font-bold mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {booking.assignedTo}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Linked Shipment Number</span>
                <span className="font-mono text-slate-200 block font-bold mt-0.5">{booking.shipmentId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Linked Job Number</span>
                <span className="font-mono text-slate-200 block font-bold mt-0.5">{booking.jobId}</span>
              </div>
            </div>

            {/* Route Summary */}
            <div className="mt-4 p-3 bg-slate-900/30 rounded-lg border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Route Details</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-white">{booking.origin}</span>
                <ArrowRight className="w-4 h-4 text-sky-500" />
                <span className="font-bold text-white">{booking.destination}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-400 pt-1">
                <div>
                  <span className="font-semibold text-slate-500 block">Origin Location:</span>
                  <span>{booking.originPort || booking.originAirport || booking.pickupLocation || "Not Configured"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Destination Location:</span>
                  <span>{booking.destinationPort || booking.destinationAirport || booking.deliveryLocation || "Not Configured"}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Cargo & Carrier Allocations */}
          <Card className="p-5 lg:col-span-1 space-y-4">
            <CardHeader className="p-0 pb-2 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Anchor className="w-4 h-4 text-sky-400" />
                Carrier Allocation
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Carrier Agent</span>
                <span className="text-slate-200 font-bold text-sm block mt-0.5">{booking.carrierName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Booking Reference (Carrier Ref)</span>
                {booking.bookingReference ? (
                  <span className="text-teal-400 font-mono font-bold block mt-0.5 text-sm">{booking.bookingReference}</span>
                ) : (
                  <span className="text-amber-500 italic block mt-0.5">Awaiting reference confirmation</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block">Schedule Details</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[10px]">
                    <span className="text-slate-500 block font-bold">ETD</span>
                    <span className="text-slate-200 font-mono font-bold">{booking.etd}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-[10px]">
                    <span className="text-slate-500 block font-bold">ETA</span>
                    <span className="text-slate-200 font-mono font-bold">{booking.eta}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3: Cargo Details */}
          <Card className="p-5 lg:col-span-3 space-y-4">
            <CardHeader className="p-0 pb-2 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                Cargo Capacity & Dimensions
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Cargo Description</span>
                <span className="text-slate-200 font-bold block mt-0.5">{booking.cargoDescription}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Cargo Type</span>
                <span className="text-slate-200 font-bold block mt-0.5">{booking.cargoType || "General Cargo"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Weight & Volume</span>
                <span className="text-slate-200 font-bold block mt-0.5">
                  {booking.weight.toLocaleString()} {booking.weightUnit} • {booking.volume.toLocaleString()} {booking.volumeUnit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Quantity</span>
                <span className="text-slate-200 font-bold block mt-0.5">
                  {booking.quantity} {booking.quantityUnit}
                </span>
              </div>
            </div>

            {/* Container Type */}
            {(booking.containerType || booking.equipmentType) && (
              <div className="mt-3 p-3 bg-sky-950/20 rounded-lg border border-sky-800/30 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-sky-400">Allocated Equipment Type:</span>
                  <span className="text-slate-200 font-bold ml-2">
                    {booking.containerType || booking.equipmentType}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-sky-400">Reserved Equipment Qty:</span>
                  <span className="text-slate-200 font-bold ml-2">
                    {booking.containerQuantity || booking.equipmentQuantity || 1} unit(s)
                  </span>
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {booking.specialRequirements && (
              <div className="p-3 bg-amber-950/10 rounded-lg border border-amber-900/30 text-xs">
                <span className="text-amber-400 font-bold block mb-1">Special Handling Requirements:</span>
                <p className="text-slate-300 italic">{booking.specialRequirements}</p>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="p-3 bg-slate-900/20 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400 font-bold block mb-1">Operations Desk Notes:</span>
                <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "transport" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode-specific visual display */}
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0 pb-2 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                Leg Execution Details ({booking.transportMode})
              </CardTitle>
            </CardHeader>

            <div className="space-y-4 text-xs">
              {/* Sea Mode Fields */}
              {booking.transportMode === "Sea" && (
                <>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Vessel Name</span>
                    <span className="text-slate-100 font-bold">{booking.vesselName || "Pending Allocation"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Voyage Number</span>
                    <span className="text-slate-100 font-mono font-bold">{booking.voyageNumber || "Pending Allocation"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Origin Port</span>
                    <span className="text-slate-100 font-bold">{booking.originPort || "JNPT Mumbai"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Destination Port</span>
                    <span className="text-slate-100 font-bold">{booking.destinationPort || "Jebel Ali Dubai"}</span>
                  </div>
                </>
              )}

              {/* Air Mode Fields */}
              {booking.transportMode === "Air" && (
                <>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Flight Number</span>
                    <span className="text-slate-100 font-mono font-bold">{booking.flightNumber || "Pending Allocation"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Origin Airport</span>
                    <span className="text-slate-100 font-bold">{booking.originAirport || "BOM Airport"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Destination Airport</span>
                    <span className="text-slate-100 font-bold">{booking.destinationAirport || "FRA Airport"}</span>
                  </div>
                </>
              )}

              {/* Road Mode Fields */}
              {booking.transportMode === "Road" && (
                <>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Vehicle Allocation</span>
                    <span className="text-slate-100 font-bold">{booking.vehicleNumber || "Pending Vehicle Allocation"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Vehicle Type</span>
                    <span className="text-slate-100 font-bold">{booking.vehicleType || "Closed container truck"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Pickup Location</span>
                    <span className="text-slate-100 font-bold">{booking.pickupLocation || "Chakan MIDC Pune"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Delivery Location</span>
                    <span className="text-slate-100 font-bold">{booking.deliveryLocation || "Sriperumbudur Chennai"}</span>
                  </div>
                </>
              )}

              {/* Rail Mode Fields */}
              {booking.transportMode === "Rail" && (
                <>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Rail Operator</span>
                    <span className="text-slate-100 font-bold">{booking.railOperator || "CONCOR India"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Train Number / Wagon</span>
                    <span className="text-slate-100 font-mono font-bold">{booking.trainNumber || "TR-8821"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Origin Rail Station</span>
                    <span className="text-slate-100 font-bold">{booking.originStation || "TKD ICD Delhi"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 py-2">
                    <span className="text-slate-400">Destination Rail Station</span>
                    <span className="text-slate-100 font-bold">{booking.destinationStation || "Mundra Port Rail Siding"}</span>
                  </div>
                </>
              )}

              {/* Multimodal Mode Fields */}
              {booking.transportMode === "Multimodal" && (
                <>
                  <div className="bg-slate-950/60 p-3 rounded border border-slate-800/60 text-slate-400 leading-relaxed">
                    Multimodal booking incorporates multiple transit modes. Leg-specific transport details will be managed under execution orders.
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Schedule Summary Card */}
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0 pb-2 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                Transit Schedule Summary
              </CardTitle>
            </CardHeader>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-800/40 py-2">
                <span className="text-slate-400">Space Request Date</span>
                <span className="text-slate-200 font-mono font-bold">{booking.requestedDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 py-2">
                <span className="text-slate-400">Carrier Confirmation Date</span>
                <span className="text-slate-200 font-mono font-bold">{booking.confirmationDate || "Pending confirmation"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 py-2">
                <span className="text-slate-400">Estimated Departure (ETD)</span>
                <span className="text-emerald-400 font-mono font-bold">{booking.etd}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 py-2">
                <span className="text-slate-400">Estimated Arrival (ETA)</span>
                <span className="text-sky-400 font-mono font-bold">{booking.eta}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "timeline" && (
        <Card className="p-5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Booking Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {booking.activities && booking.activities.length > 0 ? (
              <Timeline
                events={booking.activities.map((act) => ({
                  id: act.id,
                  title: act.title,
                  description: `${act.description} (by ${act.performedBy})`,
                  timestamp: act.timestamp,
                  completed: act.type === "Confirmed" || act.type === "Completed",
                  isCurrent: act.type !== "Confirmed" && act.type !== "Completed" && act.type !== "Cancelled" && act.type !== "Rejected"
                }))}
              />
            ) : (
              <p className="text-slate-400 italic text-center py-12 text-xs">
                No activity logs recorded for this booking yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "amendments" && (
        <Card className="p-5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Amendment Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.amendments && booking.amendments.length > 0 ? (
              booking.amendments.map((amd) => (
                <div
                  key={amd.id}
                  className="p-4 rounded-lg border border-slate-800 bg-slate-900/20 text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-mono text-sky-400 font-bold">{amd.id}</span>
                    <span className="text-[10px] text-slate-500">{new Date(amd.changedAt).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-500 block font-bold uppercase text-[9px]">Parameter Changed</span>
                      <span className="text-slate-200 font-mono font-semibold">{amd.fieldName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-bold uppercase text-[9px]">Original Value</span>
                      <span className="text-slate-400 line-through font-mono">{amd.oldValue || "None"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-bold uppercase text-[9px]">New Confirmed Value</span>
                      <span className="text-emerald-400 font-mono font-bold">{amd.newValue}</span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800/40 text-[11px]">
                    <span className="text-slate-400 font-bold block">Amendment Reason / Justification:</span>
                    <p className="text-slate-300 italic">{amd.reason}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">
                    Processed by: <span className="font-bold">{amd.changedBy}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic text-center py-12 text-xs">
                No amendments have been processed for this booking record.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "containers" && (
        <Card className="p-5">
          <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-sky-500" />
                Physical Equipment Assignment
              </CardTitle>
              <CardDescription>
                Assigned container units stowed under carrier booking reference {booking.bookingReference || "Pending Confirmation"}.
              </CardDescription>
            </div>
            {["Confirmed", "Amended", "Pending Confirmation"].includes(booking.status) && (
              <Link href={`/operations/containers/create?bookingId=${booking.id}`}>
                <Button variant="primary" size="xs" icon={Plus}>
                  Register & Allocate Container
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Allocation Progress */}
            <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-slate-400">Allocated Units:</span>
                <span className="text-slate-200 font-mono">
                  {bookingContainers.length} / {booking.containerQuantity || booking.quantity || 1} units stowed
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (bookingContainers.length / (booking.containerQuantity || booking.quantity || 1)) * 100
                    )}%`
                  }}
                />
              </div>
            </div>

            {isContainersLoading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-sky-500" />
                Retrieving stowed containers...
              </div>
            ) : bookingContainers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Container #</th>
                      <th className="py-2.5 px-3">Size & Type</th>
                      <th className="py-2.5 px-3">Seal Number</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-3 text-right">Gross Weight</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingContainers.map((c) => {
                      const gross = c.tareWeight + c.cargoWeight;
                      let condColor = "text-emerald-400";
                      if (c.condition === "Minor Damage") condColor = "text-amber-400";
                      if (["Damaged", "Critical Damage"].includes(c.condition)) condColor = "text-rose-400";
                      if (c.condition === "Inspection Required") condColor = "text-sky-400";

                      return (
                        <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-900/10">
                          <td className="py-3 px-3 font-bold text-sky-400 font-mono">
                            {c.containerNumber}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {c.containerSize} • {c.containerType} ({c.isoCode})
                          </td>
                          <td className="py-3 px-3 text-teal-400 font-mono">
                            {c.sealNumber || <span className="text-slate-500 italic">None</span>}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={c.status} showIcon={false} />
                          </td>
                          <td className={`py-3 px-3 font-bold ${condColor}`}>
                            {c.condition}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-200">
                            {gross.toLocaleString()} kg
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link href={`/operations/containers/${c.id}`}>
                              <Button variant="ghost" size="xs" icon={ExternalLink}>
                                Open Detail
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs space-y-3">
                <p>No physical container units stowed for this booking yet.</p>
                {["Confirmed", "Amended", "Pending Confirmation"].includes(booking.status) && (
                  <Link href={`/operations/containers/create?bookingId=${booking.id}`}>
                    <Button variant="outline" size="xs" icon={Plus}>
                      Register & Allocate First Container
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog Modal */}
      <Dialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirm Carrier Space Booking">
        <form onSubmit={handleConfirmSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Carrier Reference / AWB / LR Number *</span>
            <Input
              value={carrierRef}
              onChange={(e) => setCarrierRef(e.target.value)}
              placeholder="e.g. MSC-BKG-849302 or AWB-176-90214"
              required
            />
          </div>

          {booking.transportMode === "Sea" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block">Vessel Name</span>
                <Input value={vesselName} onChange={(e) => setVesselName(e.target.value)} placeholder="MSC ANNA" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block">Voyage Number</span>
                <Input value={voyageNum} onChange={(e) => setVoyageNum(e.target.value)} placeholder="024W" />
              </div>
            </div>
          )}

          {booking.transportMode === "Air" && (
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Flight Number</span>
              <Input value={flightNum} onChange={(e) => setFlightNum(e.target.value)} placeholder="EK-501" />
            </div>
          )}

          {booking.transportMode === "Road" && (
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Vehicle/Truck License Plate</span>
              <Input value={vehicleNum} onChange={(e) => setVehicleNum(e.target.value)} placeholder="MH-12-PQ-9088" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Revised ETD</span>
              <Input type="date" value={etdDate} onChange={(e) => setEtdDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Revised ETA</span>
              <Input type="date" value={etaDate} onChange={(e) => setEtaDate(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm space
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Reject Space Dialog Modal */}
      <Dialog isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="Reject Carrier Space Booking">
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Rejection Reason *</span>
            <textarea
              className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-white min-h-[80px] focus:outline-none focus:border-rose-500"
              placeholder="e.g. Carrier unable to confirm 40HC space, slide to next week's feeder requested."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-rose-600 hover:bg-rose-500 text-white border-none">
              Reject Space
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Cancel Space Dialog Modal */}
      <Dialog isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} title="Cancel Booking Allocation">
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 block font-medium">Cancellation Reason Option</span>
            <Select
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              options={[
                { label: "Carrier unavailable", value: "Carrier unavailable" },
                { label: "Customer cancelled", value: "Customer cancelled" },
                { label: "Schedule change / Rolled over", value: "Schedule change" },
                { label: "Duplicate booking space", value: "Duplicate booking" },
                { label: "Other", value: "Other" }
              ]}
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Detailed Comments</span>
            <textarea
              className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-white min-h-[80px] focus:outline-none focus:border-rose-500"
              placeholder="Add explanation note regarding cancellation..."
              value={cancellationComments}
              onChange={(e) => setCancellationComments(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCancelOpen(false)}>
              Back
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-rose-600 hover:bg-rose-500 text-white border-none">
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Request Amendment Dialog Modal */}
      <Dialog isOpen={isReqAmendmentOpen} onClose={() => setIsReqAmendmentOpen(false)} title="Request Booking Amendment">
        <form onSubmit={handleRequestAmendmentSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 block font-medium">Parameter to Amend</span>
              <Select
                value={amendmentField}
                onChange={(e) => setAmendmentField(e.target.value)}
                options={[
                  { label: "ETD (Departure Date)", value: "etd" },
                  { label: "ETA (Arrival Date)", value: "eta" },
                  { label: "Vessel Name", value: "vesselName" },
                  { label: "Voyage Number", value: "voyageNumber" },
                  { label: "Flight Number", value: "flightNumber" },
                  { label: "Quantity (Equipment)", value: "quantity" },
                  { label: "Carrier Reference", value: "bookingReference" }
                ]}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">New Requested Value *</span>
              <Input
                value={amendmentNewVal}
                onChange={(e) => setAmendmentNewVal(e.target.value)}
                placeholder="e.g. 2026-08-25 or MSC GULSUN"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Justification / Reason for Amendment *</span>
            <textarea
              className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-white min-h-[80px] focus:outline-none focus:border-sky-500"
              placeholder="Provide reason for space amendment..."
              value={amendmentReason}
              onChange={(e) => setAmendmentReason(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsReqAmendmentOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Process Amendment Dialog Modal */}
      <Dialog isOpen={isProcAmendmentOpen} onClose={() => setIsProcAmendmentOpen(false)} title="Process & Confirm Amendment">
        <form onSubmit={handleProcessAmendmentSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 block font-medium">Select Parameter</span>
              <Select
                value={procField}
                onChange={(e) => handleProcFieldChange(e.target.value)}
                options={[
                  { label: "ETD (Departure Date)", value: "etd" },
                  { label: "ETA (Arrival Date)", value: "eta" },
                  { label: "Vessel Name", value: "vesselName" },
                  { label: "Voyage Number", value: "voyageNumber" },
                  { label: "Flight Number", value: "flightNumber" },
                  { label: "Quantity (Equipment)", value: "quantity" },
                  { label: "Carrier Reference", value: "bookingReference" }
                ]}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Old Value</span>
              <Input value={procOldVal} disabled className="bg-slate-900 border-slate-800 text-slate-500 font-mono" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">New Confirmed Value *</span>
            <Input
              value={procNewVal}
              onChange={(e) => setProcNewVal(e.target.value)}
              placeholder="Input final amended value..."
              required
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Carrier Confirmation / Resolution Notes *</span>
            <textarea
              className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-white min-h-[80px] focus:outline-none focus:border-sky-500"
              placeholder="e.g. Approved by Carrier Desk on revised feeder loop."
              value={procReason}
              onChange={(e) => setProcReason(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsProcAmendmentOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Apply Amendment
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
