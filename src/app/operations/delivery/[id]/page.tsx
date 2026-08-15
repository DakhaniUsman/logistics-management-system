"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/timeline";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { Delivery, ProofOfDelivery } from "@/types/delivery";
import { DocumentCompletenessWidget } from "@/components/documents/document-completeness-widget";
import { CreateDeliveryModal } from "@/components/delivery/create-delivery-modal";
import { DeliveryStatusModal } from "@/components/delivery/delivery-status-modal";
import { PodCaptureModal } from "@/components/delivery/pod-capture-modal";
import { PodVerifyModal } from "@/components/delivery/pod-verify-modal";
import { DeliveryDelayModal } from "@/components/delivery/delivery-delay-modal";
import { DeliveryFailureModal } from "@/components/delivery/delivery-failure-modal";
import {
  Truck,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Building2,
  Briefcase,
  Ship,
  Boxes,
  MapPin,
  FileCheck,
  ShieldCheck,
  AlertOctagon,
  PenTool,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const delId = (params.id as string) || "DEL-2026-00125";

  const {
    deliveries,
    pods,
    getDeliveryById,
    getPODByDeliveryId,
    openCreateModal,
    openStatusModal,
    openPodCaptureModal,
    openPodVerifyModal,
    openDelayModal,
    openFailureModal,
    isCreateModalOpen,
    closeCreateModal,
    isStatusModalOpen,
    closeStatusModal,
    isPodCaptureModalOpen,
    closePodCaptureModal,
    isPodVerifyModalOpen,
    closePodVerifyModal,
    isDelayModalOpen,
    closeDelayModal,
    isFailureModalOpen,
    closeFailureModal,
    selectedDelivery,
    selectedPOD,
  } = useDeliveryStore();

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [pod, setPod] = useState<ProofOfDelivery | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadData() {
      const foundDel = await getDeliveryById(delId);
      if (foundDel) {
        setDelivery(foundDel);
        const foundPOD = await getPODByDeliveryId(foundDel.id);
        setPod(foundPOD);
      } else if (deliveries.length > 0) {
        setDelivery(deliveries[0]);
        const p = await getPODByDeliveryId(deliveries[0].id);
        setPod(p);
      }
    }
    loadData();
  }, [delId, deliveries, getDeliveryById, getPODByDeliveryId]);

  if (!delivery) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <p>Loading delivery order details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="xs" icon={ArrowLeft} onClick={() => router.push("/operations/delivery")}>
          Back to Delivery Dashboard
        </Button>
      </div>

      {/* Page Header */}
      <PageHeader
        title={`${delivery.deliveryNumber}: Customer Delivery Order`}
        subtitle={`Destination: ${delivery.deliveryCity}, ${delivery.deliveryState} • Recipient: ${delivery.deliveryContactPerson}`}
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Delivery Execution", href: "/operations/delivery" },
          { label: delivery.deliveryNumber },
        ]}
        statusBadge={
          <div className="flex items-center gap-2">
            <StatusBadge status={delivery.status} />
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                delivery.podStatus === "Verified"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              POD: {delivery.podStatus || "Pending"}
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon={Edit} onClick={() => openCreateModal(delivery)}>
              Edit Specs
            </Button>

            {delivery.status !== "Completed" && delivery.status !== "Delivered" && (
              <Button
                variant="primary"
                size="sm"
                icon={Truck}
                className="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={() => openStatusModal(delivery)}
              >
                Update Milestone
              </Button>
            )}

            {(delivery.status === "Delivered" || delivery.status === "POD Pending") && (
              <Button
                variant="primary"
                size="sm"
                icon={FileCheck}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => openPodCaptureModal(delivery)}
              >
                Capture POD Signature
              </Button>
            )}

            {pod && pod.status === "Under Verification" && (
              <Button
                variant="primary"
                size="sm"
                icon={ShieldCheck}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => openPodVerifyModal(pod)}
              >
                Verify POD Document
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              icon={AlertTriangle}
              className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              onClick={() => openDelayModal(delivery)}
            >
              Flag Delay
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={AlertOctagon}
              className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              onClick={() => openFailureModal(delivery)}
            >
              Record Failure
            </Button>
          </div>
        }
      />

      {/* Context Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer / Recipient</span>
            <span className="font-bold text-slate-100 text-xs block">{delivery.customerName}</span>
            <span className="text-[11px] text-slate-400">Contact: {delivery.deliveryContactPerson}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Operational Job</span>
            <Link
              href={`/operations/jobs/${delivery.jobId || delivery.jobNumber}`}
              className="font-bold text-sky-400 hover:underline text-xs block"
            >
              {delivery.jobNumber}
            </Link>
            <span className="text-[11px] text-slate-400">Shipment: {delivery.shipmentNumber}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Carrier Vehicle & Driver</span>
            <Link
              href={`/operations/transport/${delivery.transportRequestId || "TR-2026-00125"}`}
              className="font-bold text-emerald-400 hover:underline text-xs block"
            >
              {delivery.vehicleNumber || "MH 04 AB 1234"}
            </Link>
            <span className="text-[11px] text-slate-400">Driver: {delivery.driverName}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Warehouse Handoff</span>
            <span className="font-mono font-bold text-purple-300 text-xs block">
              {delivery.dispatchNumber || "DSP-2026-00125"}
            </span>
            <span className="text-[11px] text-slate-400">Warehouse: {delivery.warehouseName || "Bhiwandi Central"}</span>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-900/40 border-b border-slate-800">
          <Tabs
            tabs={[
              { id: "overview", label: "Destination & Schedule" },
              { id: "pod", label: "Proof of Delivery (POD)", count: pod ? 1 : 0 },
              { id: "documents", label: "Delivery Documents" },
              { id: "timeline", label: "Execution Timeline" },
              { id: "activities", label: "Activity Audit Log", count: delivery.activities.length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Destination */}
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Destination & Recipient
                  </h4>
                  <p className="text-slate-300"><strong>Address:</strong> {delivery.deliveryAddress}</p>
                  <p className="text-slate-300"><strong>City/State:</strong> {delivery.deliveryCity}, {delivery.deliveryState}</p>
                  <p className="text-slate-300"><strong>Contact Person:</strong> {delivery.deliveryContactPerson}</p>
                  <p className="text-slate-300"><strong>Contact Phone:</strong> {delivery.deliveryContactPhone}</p>
                  {delivery.deliveryInstructions && (
                    <div className="p-2 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px] mt-2">
                      <strong>Instructions:</strong> {delivery.deliveryInstructions}
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Delivery Schedule & Window
                  </h4>
                  <p className="text-slate-300"><strong>Scheduled Date:</strong> {delivery.scheduledDate}</p>
                  <p className="text-slate-300"><strong>Time Window:</strong> {delivery.scheduledTimeWindow}</p>
                  <p className="text-slate-300"><strong>Expected Arrival:</strong> {delivery.expectedArrival}</p>
                  <p className="text-slate-300"><strong>Actual Arrival:</strong> {delivery.actualArrival || "Pending"}</p>
                  <p className="text-slate-300"><strong>Actual Delivered:</strong> {delivery.actualDelivered || "Pending"}</p>
                </div>

                {/* Cargo */}
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Cargo & Package Specs
                  </h4>
                  <p className="text-slate-300"><strong>Cargo Description:</strong> {delivery.cargoDescription}</p>
                  <p className="text-slate-300"><strong>Gross Weight:</strong> {delivery.cargoWeightKg.toLocaleString()} KG</p>
                  <p className="text-slate-300"><strong>Package Count:</strong> {delivery.packageCount} Units</p>
                  <p className="text-slate-300"><strong>Attempt Number:</strong> Attempt {delivery.attemptNumber}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POD */}
          {activeTab === "pod" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-slate-100">Proof of Delivery (POD) Documentation</h4>
                {delivery.status === "Delivered" && !pod && (
                  <Button variant="primary" size="xs" icon={FileCheck} onClick={() => openPodCaptureModal(delivery)}>
                    Capture POD Signature
                  </Button>
                )}
              </div>

              {pod ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                    <h5 className="font-bold text-emerald-400 text-xs border-b border-slate-800 pb-1">
                      Recipient & Sign-Off Details
                    </h5>
                    <p className="text-slate-200"><strong>POD Number:</strong> <span className="font-mono font-bold text-sky-400">{pod.podNumber}</span></p>
                    <p className="text-slate-300"><strong>Recipient Name:</strong> {pod.recipientName}</p>
                    <p className="text-slate-300"><strong>Designation:</strong> {pod.recipientDesignation}</p>
                    <p className="text-slate-300"><strong>Received Date & Time:</strong> {pod.receivedDate} ({pod.receivedTime})</p>
                    <p className="text-slate-300"><strong>Cargo Condition:</strong> <span className="text-emerald-400 font-bold">{pod.condition}</span></p>
                  </div>

                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                    <h5 className="font-bold text-sky-400 text-xs border-b border-slate-800 pb-1">
                      Digital Signature & Document Ref
                    </h5>
                    <div className="p-3 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-sky-400" />
                        <span className="font-mono text-slate-200 text-xs">E-Signature Validated</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">✓ Captured</span>
                    </div>
                    <p className="text-slate-300 pt-1">
                      <strong>Document Ref:</strong>{" "}
                      <span className="font-mono text-amber-300">{pod.documentNumber || `${pod.podNumber}.pdf`}</span>
                    </p>
                    <p className="text-slate-300"><strong>Verified By:</strong> {pod.verifiedBy || "Pending Operations Approval"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 py-4 italic">No Proof of Delivery (POD) captured yet.</p>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4 text-xs">
              <DocumentCompletenessWidget jobId={delivery.jobId} />
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
                Delivery Milestone Execution Timeline
              </h4>

              <Timeline
                events={delivery.milestones.map((m) => ({
                  id: m.id,
                  title: m.title,
                  description: m.timestamp ? `Completed at ${m.timestamp}` : "Pending milestone",
                  timestamp: m.timestamp || "Pending",
                  completed: m.status === "Completed",
                }))}
              />
            </div>
          )}

          {/* TAB 5: ACTIVITIES */}
          {activeTab === "activities" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
                Audit Trail & History Log
              </h4>

              <div className="space-y-2">
                {delivery.activities.map((act) => (
                  <div key={act.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-400">{act.title}</span>
                      <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{act.description}</p>
                    <span className="text-[10px] text-slate-500 block">By: {act.performedBy}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <CreateDeliveryModal isOpen={isCreateModalOpen} onClose={closeCreateModal} delivery={selectedDelivery} />

      <DeliveryStatusModal isOpen={isStatusModalOpen} onClose={closeStatusModal} delivery={selectedDelivery} />

      <PodCaptureModal isOpen={isPodCaptureModalOpen} onClose={closePodCaptureModal} delivery={selectedDelivery} />

      <PodVerifyModal isOpen={isPodVerifyModalOpen} onClose={closePodVerifyModal} pod={selectedPOD} />

      <DeliveryDelayModal isOpen={isDelayModalOpen} onClose={closeDelayModal} delivery={selectedDelivery} />

      <DeliveryFailureModal isOpen={isFailureModalOpen} onClose={closeFailureModal} delivery={selectedDelivery} />
    </div>
  );
}
