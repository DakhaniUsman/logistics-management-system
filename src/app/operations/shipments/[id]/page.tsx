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
import { useShipmentStore } from "@/store/use-shipment-store";
import { useJobStore } from "@/store/use-job-store";
import { useBookingStore } from "@/store/use-booking-store";
import { useTransportStore } from "@/store/use-transport-store";
import { useDocumentStore } from "@/store/use-document-store";
import { DocumentCompletenessWidget } from "@/components/documents/document-completeness-widget";
import { DocumentUploadModal } from "@/components/documents/document-upload-modal";
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal";
import { ShipmentStatus, ShipmentMilestoneStatus, TransportMode } from "@/types/shipment";
import { formatCurrency } from "@/lib/utils";
import {
  Ship,
  Plane,
  Truck,
  Train,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  FileText,
  DollarSign,
  Building2,
  Calendar,
  Plus,
  Edit,
  ShieldCheck,
  PackageCheck,
  ExternalLink,
  MapPin,
  Box,
  Anchor,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Upload,
  Eye,
  CheckSquare,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = (params.id as string) || "SHP-2026-00125";

  const {
    shipments,
    updateShipmentStatus,
    markShipmentDelayed,
    clearShipmentDelay,
    addShipmentMilestone,
    updateMilestoneStatus,
    addShipmentActivity,
  } = useShipmentStore();

  const shipment = shipments.find(
    (s) =>
      s.id.toLowerCase() === shipmentId.toLowerCase() ||
      s.shipmentNumber?.toLowerCase() === shipmentId.toLowerCase()
  ) || shipments[0];

  const { jobs } = useJobStore();
  const parentJob = jobs.find(
    (j) =>
      j.id.toLowerCase() === shipment?.jobId?.toLowerCase() ||
      j.jobNumber?.toLowerCase() === shipment?.jobNumber?.toLowerCase()
  );

  const { bookings } = useBookingStore();
  const linkedBookings = bookings.filter(
    (b) =>
      b.shipmentId?.toLowerCase() === shipment?.id?.toLowerCase() ||
      (b.jobId && b.jobId.toLowerCase() === shipment?.jobId?.toLowerCase())
  );

  const { getTransportForShipment } = useTransportStore();
  const linkedTransport = getTransportForShipment ? getTransportForShipment(shipment?.id) : [];

  const { getShipmentDocuments } = useDocumentStore();
  const linkedDocuments = getShipmentDocuments ? getShipmentDocuments(shipment?.id) : [];

  const [activeTab, setActiveTab] = useState("overview");

  // Modals State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>(shipment?.status || "In Transit");
  const [statusNotes, setStatusNotes] = useState("");

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [delayDays, setDelayDays] = useState(shipment?.delayDays || 2);
  const [delayReason, setDelayReason] = useState(shipment?.delayReason || "Port berthing delay / feeder reschedule");

  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    type: "Transit",
    location: shipment?.destination || "",
    plannedDate: shipment?.eta || new Date().toISOString().split("T")[0],
    description: "",
  });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityNote, setActivityNote] = useState("");

  // Document modal state
  const [isDocUploadOpen, setIsDocUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  if (!shipment) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <p>Shipment consignment record not found.</p>
        <Link href="/operations/shipments">
          <Button variant="outline" size="sm" className="mt-4">
            Back to Shipments
          </Button>
        </Link>
      </div>
    );
  }

  // Helper for mode icons
  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case "Sea":
        return <Ship className="w-4 h-4 text-sky-500" />;
      case "Air":
        return <Plane className="w-4 h-4 text-cyan-500" />;
      case "Road":
        return <Truck className="w-4 h-4 text-emerald-500" />;
      case "Rail":
        return <Train className="w-4 h-4 text-amber-500" />;
      default:
        return <Layers className="w-4 h-4 text-violet-500" />;
    }
  };

  // Profitability
  const revenue = shipment.estimatedRevenue || 0;
  const cost = shipment.estimatedCost || 0;
  const margin = revenue - cost;
  const marginPercent = revenue > 0 ? Math.round((margin / revenue) * 100) : 0;

  // Milestone Progress
  const milestones = shipment.milestones || [];
  const completedMilestones = milestones.filter((m) => m.status === "Completed").length;
  const milestoneProgressPercent = milestones.length > 0
    ? Math.round((completedMilestones / milestones.length) * 100)
    : 40;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <PageHeader
        title={shipment.shipmentNumber}
        statusBadge={
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1 rounded bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800">
              {getModeIcon(shipment.transportMode)}
            </span>
            <StatusBadge status={shipment.status} />
            {shipment.priority === "Urgent" && (
              <span className="text-[10px] bg-rose-500/20 text-rose-500 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                Urgent Priority
              </span>
            )}
            {shipment.isDelayed && (
              <span className="text-[10px] bg-rose-500/15 text-rose-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-500/20">
                <AlertTriangle className="w-3 h-3" />
                +{shipment.delayDays || 2}d Delay
              </span>
            )}
          </div>
        }
        subtitle={`${shipment.customerName} • Route: ${shipment.origin} (${shipment.originCountry}) → ${shipment.destination} (${shipment.destinationCountry}) • Carrier: ${shipment.carrierName || "Unassigned"}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => {
                setNewStatus(shipment.status);
                setStatusNotes("");
                setIsStatusModalOpen(true);
              }}
              className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs"
            >
              Update Status
            </Button>

            {!shipment.isDelayed && shipment.status !== "Delivered" && shipment.status !== "Completed" ? (
              <Button
                variant="outline"
                size="sm"
                icon={AlertTriangle}
                onClick={() => setIsDelayModalOpen(true)}
                className="border-rose-400/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
              >
                Report Delay
              </Button>
            ) : shipment.isDelayed ? (
              <Button
                variant="outline"
                size="sm"
                icon={CheckCircle2}
                onClick={() => clearShipmentDelay(shipment.id)}
                className="border-emerald-400/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs"
              >
                Clear Delay
              </Button>
            ) : null}

            <Link href={`/operations/bookings/create?shipmentId=${shipment.id}`}>
              <Button variant="primary" size="sm" icon={Anchor} className="bg-sky-600 hover:bg-sky-500 text-white text-xs shadow-xs">
                Carrier Space Booking
              </Button>
            </Link>
          </div>
        }
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Shipments", href: "/operations/shipments" },
          { label: shipment.shipmentNumber },
        ]}
      />

      {/* Delay Callout Banner if delayed */}
      {shipment.isDelayed && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
              <span>Operational Delay Active: +{shipment.delayDays || 2} Days Projected Impact</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-500 font-mono px-2 py-0.2 rounded font-bold">
                Revised ETA: {shipment.eta}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Reason: {shipment.delayReason || "Feeder vessel reschedule / port congestion hold"}
            </p>
          </div>
        </div>
      )}

      {/* Visual Journey Stepper Banner */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Consignment Journey Progression</span>
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {completedMilestones} of {milestones.length} Milestones Reached ({milestoneProgressPercent}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              shipment.isDelayed ? "bg-rose-500" : "bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500"
            }`}
            style={{ width: `${milestoneProgressPercent}%` }}
          />
        </div>

        {/* Milestone Steps Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {milestones.slice(0, 6).map((m, idx) => {
            const isCompleted = m.status === "Completed";
            const isCurrent = m.status === "Upcoming" && idx === completedMilestones;
            const isDelayed = m.status === "Delayed";

            return (
              <div
                key={m.id || idx}
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  isCompleted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                    : isCurrent
                    ? "bg-sky-50/50 dark:bg-sky-950/30 border-sky-400 shadow-xs"
                    : isDelayed
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-400"
                    : "bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : isDelayed ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  ) : (
                    <Clock className="w-3 h-3 text-slate-400" />
                  )}
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={m.title}>
                  {m.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {m.actualDate || m.plannedDate}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "overview", label: "Overview & Cargo Specs" },
          { id: "milestones", label: `Milestones & Tracking (${milestones.length})` },
          { id: "carrier", label: "Carrier & Route Details" },
          { id: "documents", label: `Documents & Compliance (${(shipment.documents || []).length})` },
          { id: "activities", label: `Activity & Audit Log (${(shipment.activities || []).length})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: OVERVIEW & CARGO SPECS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Weight</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {shipment.weight ? `${shipment.weight.toLocaleString()} ${shipment.weightUnit}` : "—"}
              </span>
            </Card>

            <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Volume</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {shipment.volume ? `${shipment.volume} ${shipment.volumeUnit}` : "—"}
              </span>
            </Card>

            <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Package Units</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {shipment.quantity} {shipment.quantityUnit}
              </span>
            </Card>

            <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Departure (ETD)</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {shipment.etd}
              </span>
            </Card>

            <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Arrival (ETA)</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {shipment.eta}
              </span>
            </Card>

            <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Profit</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(margin)} ({marginPercent}%)
              </span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cargo & Goods Profile */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs lg:col-span-2">
              <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Box className="w-4 h-4 text-sky-500" />
                  <span>Cargo Manifest & Handling Specifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Cargo Description
                  </span>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {shipment.cargoDescription}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Classification:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {shipment.cargoType || "General"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Container Spec:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {shipment.containerType ? `${shipment.containerQuantity || 1}x ${shipment.containerType}` : "Breakbulk / Loose"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Transport Mode:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {shipment.transportMode} ({shipment.serviceType})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target Delivery:</span>
                    <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                      {shipment.requiredDeliveryDate || shipment.eta}
                    </span>
                  </div>
                </div>

                {shipment.specialRequirements && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                    <span className="font-bold text-amber-600 dark:text-amber-400 block uppercase text-[10px] tracking-wider">
                      Special Handling & Compliance Instructions:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                      {shipment.specialRequirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Linked Operational Entities */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-500" />
                  <span>Linked Operations Network</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Core OS Linkage</span>
              </div>

              {/* Linked Job File */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Parent Job File:</span>
                  <Link
                    href={`/operations/jobs/${shipment.jobId}`}
                    className="font-mono font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>{shipment.jobNumber}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  Customer: <span className="font-semibold">{shipment.customerName}</span>
                </div>
              </div>

              {/* Linked Carrier Bookings */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Carrier Reservations:</span>
                  <Link
                    href={`/operations/bookings/create?shipmentId=${shipment.id}`}
                    className="text-[10px] text-sky-500 hover:underline font-bold"
                  >
                    + Add Booking
                  </Link>
                </div>
                {linkedBookings.length > 0 ? (
                  linkedBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-xs font-mono">
                      <Link href={`/operations/bookings/${b.id}`} className="text-sky-500 hover:underline font-semibold">
                        {b.bookingNumber} ({b.carrierName})
                      </Link>
                      <StatusBadge status={b.status} />
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic">No direct booking allocated yet.</div>
                )}
              </div>

              {/* Operations Lead */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-1 text-xs">
                <span className="font-semibold text-slate-400 block">Assigned Operations Controller:</span>
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>{shipment.assignedTo}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {shipment.assignedDepartment || "Logistics Operations Desk"}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES & TRACKING */}
      {activeTab === "milestones" && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-500" />
                <span>Tracking Milestones & Checkpoints</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time chronological progress logs from origin pickup to destination delivery.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="xs"
              icon={Plus}
              onClick={() => setIsAddMilestoneOpen(true)}
              className="text-xs"
            >
              Add Milestone
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        m.status === "Completed"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : m.status === "Delayed"
                          ? "bg-rose-500/20 text-rose-500"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {m.status === "Completed" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : m.status === "Delayed" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{m.title}</span>
                        {m.location && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            • {m.location}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {m.description || `Milestone ${m.type} for shipment execution.`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs font-mono">
                      <div className="text-slate-900 dark:text-slate-100 font-semibold">
                        {m.actualDate ? `Actual: ${m.actualDate}` : `Planned: ${m.plannedDate}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Status: <span className="font-sans font-medium">{m.status}</span>
                      </div>
                    </div>

                    {m.status !== "Completed" && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => updateMilestoneStatus(shipment.id, m.id, "Completed")}
                        className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: CARRIER & CONVEYANCE */}
      {activeTab === "carrier" && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Anchor className="w-4 h-4 text-sky-500" />
              <span>Carrier Conveyance, Vessels & Route Logistics</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Physical transportation linehaul details and conveyance identification numbers.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Carrier & Vessel / Equipment
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Operating Line / Carrier:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {shipment.carrierName || "Pending Carrier Assignment"}
                  </span>
                </div>
                {shipment.transportMode === "Sea" && (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Vessel Name:</span>
                      <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                        {shipment.vesselName || "TBN (To Be Nominated)"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Voyage Number:</span>
                      <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                        {shipment.voyageNumber || "—"}
                      </span>
                    </div>
                  </>
                )}
                {shipment.transportMode === "Air" && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Flight Number:</span>
                    <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                      {shipment.flightNumber || "Pending Flight Space"}
                    </span>
                  </div>
                )}
                {shipment.transportMode === "Road" && (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Truck / Trailer Number:</span>
                      <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                        {shipment.vehicleNumber || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Driver Contact:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {shipment.driverName} {shipment.driverPhone ? `(${shipment.driverPhone})` : ""}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Corridor Hubs & Transit Schedule
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Origin Terminal:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {shipment.originPort || shipment.originAirport || shipment.origin}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Destination Terminal:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {shipment.destinationPort || shipment.destinationAirport || shipment.destination}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Estimated Departure (ETD):</span>
                  <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                    {shipment.etd}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Estimated Arrival (ETA):</span>
                  <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                    {shipment.eta}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: DOCUMENTS & COMPLIANCE */}
      {activeTab === "documents" && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" />
                <span>Shipping Documents & Statutory Verification</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Master Bills of Lading, AWBs, Commercial Invoices, and customs clearance certificates.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="xs"
              icon={Upload}
              onClick={() => setIsDocUploadOpen(true)}
              className="text-xs"
            >
              Upload Document
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(shipment.documents || []).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {doc.documentType}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {doc.required ? "Mandatory Regulatory Document" : "Optional Reference"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.status} />
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Eye}
                      onClick={() => setPreviewDoc({ documentName: doc.documentType, status: doc.status, id: doc.id })}
                      className="h-7 text-xs"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Manage all shipping files in Document Command Center:</span>
              <Link href="/documents/center">
                <Button variant="outline" size="xs" icon={ExternalLink} className="text-xs">
                  Document Center
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: ACTIVITIES & AUDIT LOG */}
      {activeTab === "activities" && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" />
                <span>Operational Audit Trail & Activity Log</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Permanent immutable record of status transitions, delay alerts, and operator interventions.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="xs"
              icon={Plus}
              onClick={() => setIsActivityModalOpen(true)}
              className="text-xs"
            >
              Add Operator Note
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {(shipment.activities || []).map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {act.title}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    {act.description}
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400 shrink-0">
                  <div>{act.timestamp}</div>
                  <div className="font-sans font-semibold text-slate-600 dark:text-slate-300">
                    By {act.performedBy}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* STATUS UPDATE MODAL */}
      <Dialog
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Status: ${shipment.shipmentNumber}`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              New Lifecycle Status
            </label>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Scheduled", label: "Scheduled" },
                { value: "Booking Pending", label: "Booking Pending" },
                { value: "Booked", label: "Booked" },
                { value: "Cargo Ready", label: "Cargo Ready" },
                { value: "Picked Up", label: "Picked Up" },
                { value: "In Transit", label: "In Transit" },
                { value: "Arrived", label: "Arrived at Destination" },
                { value: "Delivered", label: "Delivered & POD Signed" },
                { value: "Delayed", label: "Delayed (Exception)" },
                { value: "Completed", label: "Completed" },
              ]}
              className="w-full text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Log Reason / Operational Notes
            </label>
            <Input
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="e.g. Vessel berthed at destination terminal. Offloading initiated."
              className="text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                updateShipmentStatus(shipment.id, newStatus, statusNotes);
                setIsStatusModalOpen(false);
              }}
              className="bg-sky-600 text-white"
            >
              Update Status
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DELAY REPORT MODAL */}
      <Dialog
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        title={`Report Delay: ${shipment.shipmentNumber}`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Delay Impact (Days)
            </label>
            <Input
              type="number"
              min={1}
              max={30}
              value={delayDays}
              onChange={(e) => setDelayDays(parseInt(e.target.value) || 1)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Delay Reason / Root Cause
            </label>
            <Input
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              placeholder="e.g. Port berth congestion / customs audit at transfer terminal"
              className="text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDelayModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                markShipmentDelayed(shipment.id, delayDays, delayReason);
                setIsDelayModalOpen(false);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white"
            >
              Confirm Delay
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ADD MILESTONE MODAL */}
      <Dialog
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
        title="Add Tracking Milestone Checkpoint"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Milestone Title *
            </label>
            <Input
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              placeholder="e.g. Customs Physical Examination Cleared"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Location / Port
              </label>
              <Input
                value={milestoneForm.location}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, location: e.target.value })}
                placeholder="e.g. Jebel Ali Port"
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Target Date
              </label>
              <Input
                type="date"
                value={milestoneForm.plannedDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, plannedDate: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Description
            </label>
            <Input
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              placeholder="e.g. Container unstuffed and examined by customs officers."
              className="text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAddMilestoneOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (milestoneForm.title) {
                  addShipmentMilestone(shipment.id, {
                    ...milestoneForm,
                    status: "Upcoming",
                  });
                  setIsAddMilestoneOpen(false);
                }
              }}
              className="bg-sky-600 text-white"
            >
              Add Milestone
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ADD ACTIVITY NOTE MODAL */}
      <Dialog
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title="Add Operator Audit Note"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Note Description
            </label>
            <Input
              value={activityNote}
              onChange={(e) => setActivityNote(e.target.value)}
              placeholder="Enter operational update or carrier dispatch note..."
              className="text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsActivityModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (activityNote) {
                  addShipmentActivity(shipment.id, "Operator Note", activityNote, "Note", "Operations Desk");
                  setIsActivityModalOpen(false);
                  setActivityNote("");
                }
              }}
              className="bg-sky-600 text-white"
            >
              Record Note
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Document Upload & Preview Modals */}
      <DocumentUploadModal
        isOpen={isDocUploadOpen}
        onClose={() => setIsDocUploadOpen(false)}
        defaultJobId={shipment.jobId}
        defaultShipmentId={shipment.id}
      />

      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
        />
      )}
    </div>
  );
}
