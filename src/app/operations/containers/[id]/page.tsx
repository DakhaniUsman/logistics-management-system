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
import { DocumentCompletenessWidget } from "@/components/documents/document-completeness-widget";
import {
  useContainer,
  useUpdateContainerStatus,
  useUpdateContainerLocation,
  useUpdateSeal,
  useUpdateCondition,
  useUpdateMilestone,
  useAddMilestone
} from "@/hooks/use-containers";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  Anchor,
  Compass,
  Briefcase,
  User,
  Plus,
  Scale,
  Activity,
  History,
  AlertCircle,
  MapPin,
  Calendar,
  Lock,
  Wrench,
  CheckSquare
} from "lucide-react";
import { toast } from "sonner";

export default function ContainerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const containerId = params.id as string;

  const { data: container, isLoading, isError, error } = useContainer(containerId);

  const [activeTab, setActiveTab] = useState("overview");

  // Modals state
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSealOpen, setIsSealOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);

  // Form states for modals
  const [newStatus, setNewStatus] = useState("");
  const [statusPerformedBy, setStatusPerformedBy] = useState("Operations Agent");

  const [newLoc, setNewLoc] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [locPerformedBy, setLocPerformedBy] = useState("Operations Agent");

  const [newSealNum, setNewSealNum] = useState("");
  const [sealReason, setSealReason] = useState("");
  const [sealPerformedBy, setSealPerformedBy] = useState("Customs Officer");

  const [newCondition, setNewCondition] = useState("");
  const [conditionNotes, setConditionNotes] = useState("");
  const [conditionPerformedBy, setConditionPerformedBy] = useState("Port Inspector");

  const [milestoneType, setMilestoneType] = useState("Gate In");
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneLoc, setMilestoneLoc] = useState("");
  const [milestonePlannedDate, setMilestonePlannedDate] = useState("");
  const [milestoneStatus, setMilestoneStatus] = useState("Pending");

  // Mutations
  const updateStatusMutation = useUpdateContainerStatus();
  const updateLocationMutation = useUpdateContainerLocation();
  const updateSealMutation = useUpdateSeal();
  const updateConditionMutation = useUpdateCondition();
  const updateMilestoneMutation = useUpdateMilestone();
  const addMilestoneMutation = useAddMilestone();

  if (isLoading) {
    return (
      <div className="p-16 text-center text-xs text-slate-400 space-y-2">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mx-auto"></div>
        <p>Fetching container physical parameters & location history...</p>
      </div>
    );
  }

  if (isError || !container) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Equipment Record Not Found</h2>
        <p className="text-slate-400 text-xs">{error?.message || "The requested container code cannot be resolved."}</p>
        <Link href="/operations/containers">
          <Button variant="primary" size="sm">Back to Containers Pool</Button>
        </Link>
      </div>
    );
  }

  // Pre-fill form state helpers
  const openStatusModal = () => {
    setNewStatus(container.status);
    setIsStatusOpen(true);
  };

  const openLocationModal = () => {
    setNewLoc(container.currentLocation);
    setNewCountry(container.currentCountry);
    setIsLocationOpen(true);
  };

  const openSealModal = () => {
    setNewSealNum(container.sealNumber || "");
    setSealReason("");
    setIsSealOpen(true);
  };

  const openConditionModal = () => {
    setNewCondition(container.condition);
    setConditionNotes("");
    setIsConditionOpen(true);
  };

  // Submit handlers
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus) return;

    toast.promise(
      updateStatusMutation.mutateAsync({
        id: container.id,
        status: newStatus as any,
        performedBy: statusPerformedBy
      }),
      {
        loading: "Updating equipment status...",
        success: (data) => {
          setIsStatusOpen(false);
          return `Container status changed to ${data.status} successfully.`;
        },
        error: "Failed to update status."
      }
    );
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc || !newCountry) return;

    toast.promise(
      updateLocationMutation.mutateAsync({
        id: container.id,
        location: newLoc,
        country: newCountry,
        performedBy: locPerformedBy
      }),
      {
        loading: "Logging geographical location...",
        success: (data) => {
          setIsLocationOpen(false);
          return `Location logged at ${data.currentLocation}, ${data.currentCountry}.`;
        },
        error: "Failed to update location."
      }
    );
  };

  const handleSealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSealNum || !sealReason) return;

    toast.promise(
      updateSealMutation.mutateAsync({
        id: container.id,
        sealNumber: newSealNum,
        reason: sealReason,
        performedBy: sealPerformedBy
      }),
      {
        loading: "Registering lock seal change...",
        success: (data) => {
          setIsSealOpen(false);
          return `Seal registered: ${data.sealNumber} (${data.sealStatus}).`;
        },
        error: "Failed to update seal."
      }
    );
  };

  const handleConditionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondition) return;

    toast.promise(
      updateConditionMutation.mutateAsync({
        id: container.id,
        condition: newCondition as any,
        notes: conditionNotes,
        performedBy: conditionPerformedBy
      }),
      {
        loading: "Saving yard inspection...",
        success: (data) => {
          setIsConditionOpen(false);
          return `Physical condition logged: ${data.condition}.`;
        },
        error: "Failed to save condition."
      }
    );
  };

  const handleAddMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle || !milestoneLoc) return;

    toast.promise(
      addMilestoneMutation.mutateAsync({
        id: container.id,
        milestone: {
          type: milestoneType,
          title: milestoneTitle,
          location: milestoneLoc,
          status: milestoneStatus as any,
          plannedDate: milestonePlannedDate || undefined
        },
        performedBy: "Operations Supervisor"
      }),
      {
        loading: "Adding operational milestone...",
        success: () => {
          setIsAddMilestoneOpen(false);
          setMilestoneTitle("");
          setMilestoneLoc("");
          setMilestonePlannedDate("");
          return "Milestone logged successfully.";
        },
        error: "Failed to add milestone."
      }
    );
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    const actualDate = nextStatus === "Completed" ? new Date().toISOString().split("T")[0] : undefined;

    toast.promise(
      updateMilestoneMutation.mutateAsync({
        id: container.id,
        milestoneId,
        updates: {
          status: nextStatus as any,
          actualDate
        },
        performedBy: "Operations Agent"
      }),
      {
        loading: "Updating milestone checklist...",
        success: "Milestone updated successfully.",
        error: "Failed to toggle milestone."
      }
    );
  };

  // Weight details calculation
  const grossWeight = container.tareWeight + container.cargoWeight;
  const weightUtil = container.maxGrossWeight ? ((grossWeight / container.maxGrossWeight) * 100).toFixed(0) : "0";
  const weightUtilNum = parseFloat(weightUtil);

  // Timeline events mapping for shared Timeline component
  const timelineEvents = container.activities.map((act) => ({
    id: act.id,
    title: act.title,
    description: act.description,
    timestamp: act.timestamp,
    performedBy: act.performedBy,
    type: act.type,
    completed: true
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title={`Container ${container.containerNumber}`}
        subtitle={`Audit specs, weights, seals, status timelines, and damage logs for physical equipment.`}
        statusBadge={<StatusBadge status={container.status} />}
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Containers", href: "/operations/containers" },
          { label: container.containerNumber }
        ]}
      />

      {/* Main Tabs */}
      <Tabs
        tabs={[
          { id: "overview", label: "Specs & Routing" },
          { id: "documents", label: "Container Documents" },
          { id: "seals", label: `Seal Logs (${container.sealHistory?.length || 0})` },
          { id: "milestones", label: `Milestones Checklist (${container.milestones?.length || 0})` },
          { id: "activities", label: `Yard Activity Log (${container.activities?.length || 0})` }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "documents" && (
        <div className="space-y-4">
          <DocumentCompletenessWidget containerId={container.id} />
        </div>
      )}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Specs Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Specs */}
            <Card className="p-5">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-500" />
                  Equipment Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Container Number</span>
                  <span className="text-slate-200 font-mono font-bold text-sm">{container.containerNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">ISO Code</span>
                  <span className="text-slate-200 font-mono font-bold text-sm">{container.isoCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Length Size</span>
                  <span className="text-slate-200 font-bold text-sm">{container.containerSize}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Type Category</span>
                  <span className="text-slate-200 font-bold text-sm">{container.containerType}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Physical Condition</span>
                  <span className={`font-black text-xs uppercase ${
                    container.condition === "Good" ? "text-emerald-400" 
                    : container.condition === "Minor Damage" ? "text-amber-400"
                    : "text-rose-500"
                  }`}>{container.condition}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Seal Reference</span>
                  <span className="text-teal-400 font-mono font-bold text-sm">{container.sealNumber || "No Seal Locked"}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Seal Integrity</span>
                  <span className="text-slate-200 font-bold">{container.sealStatus}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Allocated Operator</span>
                  <span className="text-slate-200 font-semibold">{container.assignedTo || "Unassigned"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Geographical Routing */}
            <Card className="p-5">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Routing & Current Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-b border-slate-800/60 pb-4">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Current Location</span>
                    <span className="text-slate-200 font-bold">{container.currentLocation || "Not Available"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Current Country</span>
                    <span className="text-slate-200 font-bold">{container.currentCountry || "Not Available"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Origin / Port of Loading (POL)</span>
                    <span className="text-slate-200 font-semibold">{container.origin || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Destination / Port of Discharge (POD)</span>
                    <span className="text-slate-200 font-semibold">{container.destination || "Not Specified"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weights and Capacities */}
            <Card className="p-5">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-500" />
                  Weights Audit & Load Utilization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Tare Weight (Empty)</span>
                    <span className="text-slate-200 font-mono font-bold text-sm">{container.tareWeight.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Payload (Cargo Weight)</span>
                    <span className="text-slate-200 font-mono font-bold text-sm">{container.cargoWeight.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Total Gross Weight</span>
                    <span className="text-sky-400 font-mono font-bold text-sm">{grossWeight.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Max Gross Capacity</span>
                    <span className="text-slate-200 font-mono font-bold text-sm">{container.maxGrossWeight.toLocaleString()} kg</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Safe Weight Utilization</span>
                    <span className={`font-bold ${weightUtilNum > 90 ? "text-rose-400" : "text-sky-400"}`}>{weightUtil}% ({grossWeight.toLocaleString()} / {container.maxGrossWeight.toLocaleString()} kg)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        weightUtilNum > 90 ? "bg-rose-500" 
                        : weightUtilNum > 75 ? "bg-amber-500" 
                        : "bg-sky-500"
                      }`}
                      style={{ width: `${Math.min(100, weightUtilNum)}%` }}
                    />
                  </div>
                  {weightUtilNum > 95 && (
                    <div className="text-[10px] text-rose-400 flex items-center gap-1 font-bold pt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>CRITICAL LOAD: Weight approaching maximum certified payload envelope limit.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {container.notes && (
              <Card className="p-5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wide">Equipment Notes & Log history</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300 bg-slate-950/40 border border-slate-800 p-3 rounded-lg font-mono whitespace-pre-line">
                  {container.notes}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info & Action Columns */}
          <div className="space-y-6 col-span-1">
            {/* Linkage and Parent Relations */}
            <Card className="p-5">
              <CardHeader className="pb-3 border-b border-slate-800/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-sky-400" />
                  Cargo Linkages
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                {container.bookingId ? (
                  <>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/40">
                      <div>
                        <span className="text-slate-500 block uppercase font-bold text-[8px]">Job ID</span>
                        <Link href={`/operations/jobs/${container.jobId}`} className="font-bold text-sky-400 font-mono hover:underline">
                          {container.jobId}
                        </Link>
                      </div>
                      <Link href={`/operations/jobs/${container.jobId}`}>
                        <Button variant="outline" size="xs">Open Job</Button>
                      </Link>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/40">
                      <div>
                        <span className="text-slate-500 block uppercase font-bold text-[8px]">Booking Number</span>
                        <Link href={`/operations/bookings/${container.bookingId}`} className="font-bold text-sky-400 font-mono hover:underline">
                          {container.bookingId}
                        </Link>
                      </div>
                      <Link href={`/operations/bookings/${container.bookingId}`}>
                        <Button variant="outline" size="xs">Open Booking</Button>
                      </Link>
                    </div>

                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[8px]">Customer Account</span>
                      <span className="font-semibold text-slate-200">{container.customerName}</span>
                      <span className="block text-[10px] text-slate-500 font-mono">ID: {container.customerId}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[8px]">Active Shipment Reference</span>
                      <span className="font-bold text-slate-300 font-mono">{container.shipmentId}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-slate-500 italic">
                    This unit is standing idle in the available equipment pool. Not currently allocated to an active cargo job.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <Card className="p-5">
              <CardHeader className="pb-3 border-b border-slate-800/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  Equipment Control Center
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs font-semibold" icon={Compass} onClick={openStatusModal}>
                  Update Status ({container.status})
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs font-semibold" icon={MapPin} onClick={openLocationModal}>
                  Log Position & Port
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs font-semibold" icon={Lock} onClick={openSealModal}>
                  Register Seal Number
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs font-semibold" icon={AlertTriangle} onClick={openConditionModal}>
                  Update Damage Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "seals" && (
        <Card className="p-5">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-teal-400" />
                High Security Seal Audit History
              </CardTitle>
              <CardDescription>
                Auditable log of customs lock, checks, and replacements.
              </CardDescription>
            </div>
            <Button variant="primary" size="xs" icon={Plus} onClick={openSealModal}>
              Apply/Replace Seal
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {container.sealHistory && container.sealHistory.length > 0 ? (
              container.sealHistory.map((sh, idx) => (
                <div
                  key={sh.id || idx}
                  className="p-4 rounded-lg border border-slate-800 bg-slate-900/20 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-teal-400 font-black">Audit ID: {sh.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{sh.changedAt.substring(0,16).replace("T", " ")}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Old Seal Number</span>
                      <span className="text-slate-400 font-mono line-through font-bold">{sh.oldSealNumber || "None"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">New Seal Number</span>
                      <span className="text-teal-400 font-mono font-black">{sh.newSealNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Integrity Status</span>
                      <span className="text-slate-200 font-semibold">{sh.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Recorded By</span>
                      <span className="text-slate-200 font-bold">{sh.changedBy}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/40 text-[11px]">
                    <span className="text-slate-400 font-bold block">Replacement Reason / Remarks:</span>
                    <p className="text-slate-300 italic">{sh.reason}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-center py-12 text-xs">
                No high-security seals have been registered on this equipment unit.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "milestones" && (
        <Card className="p-5">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                Transit Milestone Checklist
              </CardTitle>
              <CardDescription>
                Tick off logistics milestones to track the progress of this container unit.
              </CardDescription>
            </div>
            <Button variant="outline" size="xs" icon={Plus} onClick={() => setIsAddMilestoneOpen(true)}>
              Log Custom Milestone
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {container.milestones && container.milestones.length > 0 ? (
              <div className="space-y-3">
                {container.milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-lg border flex items-center justify-between text-xs transition-all ${
                      m.status === "Completed"
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-slate-800 bg-slate-900/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleMilestone(m.id, m.status)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                          m.status === "Completed"
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "border-slate-600 hover:border-slate-400 bg-slate-950"
                        }`}
                      >
                        {m.status === "Completed" && <CheckCircle2 className="w-4 h-4 font-bold" />}
                      </button>
                      <div>
                        <p className={`font-bold text-xs ${m.status === "Completed" ? "text-emerald-400 line-through opacity-70" : "text-slate-200"}`}>
                          {m.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Location: {m.location} • Type: {m.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[10px]">
                      {m.status === "Completed" && m.actualDate && (
                        <span className="text-emerald-400 font-mono font-bold block">Gated: {m.actualDate}</span>
                      )}
                      {m.status !== "Completed" && m.plannedDate && (
                        <span className="text-slate-500 font-mono block">Plan: {m.plannedDate}</span>
                      )}
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[8px] font-black uppercase tracking-wider ${
                        m.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : m.status === "Delayed" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-center py-12 text-xs">
                No tracking milestones populated. Assign to booking to initialize.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "activities" && (
        <Card className="p-5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-emerald-500" />
              Yard & Port Operations Audit History
            </CardTitle>
            <CardDescription>
              Chronological log of system modifications and equipment telemetry events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timelineEvents.length > 0 ? (
              <Timeline events={timelineEvents} />
            ) : (
              <p className="text-slate-500 italic text-center py-12 text-xs">
                No activity logs recorded.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals Dialog Section */}

      {/* Status Modal */}
      <Dialog isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title="Update Equipment Status">
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Select Transit Status *</span>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { label: "Available (In Pool)", value: "Available" },
                { label: "Assigned (Reserved)", value: "Assigned" },
                { label: "Empty (Yard Depot)", value: "Empty" },
                { label: "Picked Up (Shipper factory)", value: "Picked Up" },
                { label: "At Origin (POL)", value: "At Origin" },
                { label: "Gate In (Port Terminal)", value: "Gate In" },
                { label: "Loaded (On Vessel)", value: "Loaded" },
                { label: "Departed", value: "Departed" },
                { label: "In Transit", value: "In Transit" },
                { label: "At Destination (POD)", value: "At Destination" },
                { label: "Customs Hold", value: "Customs Hold" },
                { label: "Released", value: "Released" },
                { label: "Out for Delivery", value: "Out for Delivery" },
                { label: "Delivered (Consignee)", value: "Delivered" },
                { label: "Empty Return Pending", value: "Empty Return Pending" },
                { label: "Returned (Empty Yard)", value: "Returned" },
                { label: "Damaged (Repairs)", value: "Damaged" },
                { label: "Lost", value: "Lost" }
              ]}
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Logged By Agent *</span>
            <Input
              value={statusPerformedBy}
              onChange={(e) => setStatusPerformedBy(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsStatusOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Update Status
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Location Modal */}
      <Dialog isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} title="Log Physical Location">
        <form onSubmit={handleLocationSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Depot/Vessel/Port Name *</span>
              <Input
                value={newLoc}
                onChange={(e) => setNewLoc(e.target.value)}
                placeholder="e.g. JNPT Terminal 1 or Arabian Sea"
                required
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Country Location *</span>
              <Input
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                placeholder="e.g. India or UAE"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Logged By Agent *</span>
            <Input
              value={locPerformedBy}
              onChange={(e) => setLocPerformedBy(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsLocationOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Update Location
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Seal Modal */}
      <Dialog isOpen={isSealOpen} onClose={() => setIsSealOpen(false)} title="Apply / Replace Container Seal">
        <form onSubmit={handleSealSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">High Security Seal Number *</span>
            <Input
              value={newSealNum}
              onChange={(e) => setNewSealNum(e.target.value)}
              placeholder="e.g. SL-881940"
              required
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Audit Reason for Seal Log *</span>
            <textarea
              className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-white min-h-[80px] focus:outline-none focus:border-sky-500"
              placeholder="e.g. Initial factory lock, customs inspection check replacement, seal failure..."
              value={sealReason}
              onChange={(e) => setSealReason(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Logged By Officer/Agent *</span>
            <Input
              value={sealPerformedBy}
              onChange={(e) => setSealPerformedBy(e.target.value)}
              placeholder="Your name / title"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSealOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Apply Seal
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Condition Damage Modal */}
      <Dialog isOpen={isConditionOpen} onClose={() => setIsConditionOpen(false)} title="Yard Damage & Inspection Report">
        <form onSubmit={handleConditionSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Container Condition *</span>
            <Select
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              options={[
                { label: "Good Condition (Fit for use)", value: "Good" },
                { label: "Minor Damage (Scratches/Dents)", value: "Minor Damage" },
                { label: "Damaged (Requires Repair)", value: "Damaged" },
                { label: "Critical Damage (Out of service)", value: "Critical Damage" },
                { label: "Inspection Required", value: "Inspection Required" }
              ]}
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Inspection Details / Damage Notes *</span>
            <textarea
              className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-white min-h-[80px] focus:outline-none focus:border-rose-500"
              placeholder="Detail inspection report and items needing repair (e.g. door hinge dented, reefer motor check, side wall hole)"
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Port Inspector Name *</span>
            <Input
              value={conditionPerformedBy}
              onChange={(e) => setConditionPerformedBy(e.target.value)}
              placeholder="Inspector name"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsConditionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-rose-600 hover:bg-rose-500 text-white border-none">
              Save Report
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Custom Milestone Modal */}
      <Dialog isOpen={isAddMilestoneOpen} onClose={() => setIsAddMilestoneOpen(false)} title="Log Custom Milestone">
        <form onSubmit={handleAddMilestoneSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Milestone Title *</span>
              <Input
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="e.g. Customs Cleared"
                required
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Milestone Type *</span>
              <Select
                value={milestoneType}
                onChange={(e) => setMilestoneType(e.target.value)}
                options={[
                  { label: "Assigned", value: "Assigned" },
                  { label: "Empty Picked Up", value: "Empty Picked Up" },
                  { label: "Gate In", value: "Gate In" },
                  { label: "Loaded", value: "Loaded" },
                  { label: "Departed", value: "Departed" },
                  { label: "In Transit", value: "In Transit" },
                  { label: "Arrived", value: "Arrived" },
                  { label: "Delivered", value: "Delivered" },
                  { label: "Empty Returned", value: "Empty Returned" },
                  { label: "Customs Inspection", value: "Customs Inspection" }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Milestone Location *</span>
              <Input
                value={milestoneLoc}
                onChange={(e) => setMilestoneLoc(e.target.value)}
                placeholder="e.g. Mundra Port customs yard"
                required
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Milestone Status *</span>
              <Select
                value={milestoneStatus}
                onChange={(e) => setMilestoneStatus(e.target.value)}
                options={[
                  { label: "Pending", value: "Pending" },
                  { label: "Completed", value: "Completed" },
                  { label: "Delayed", value: "Delayed" },
                  { label: "Skipped", value: "Skipped" }
                ]}
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Planned Date</span>
            <Input
              type="date"
              value={milestonePlannedDate}
              onChange={(e) => setMilestonePlannedDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddMilestoneOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Milestone
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
