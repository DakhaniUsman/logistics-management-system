"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/timeline";
import { useTransportStore } from "@/store/use-transport-store";
import { TransportRequest, Trip } from "@/types/transport";
import { DocumentCompletenessWidget } from "@/components/documents/document-completeness-widget";
import { TransportRequestModal } from "@/components/transport/transport-request-modal";
import { AssignTransportModal } from "@/components/transport/assign-transport-modal";
import { TransportStatusModal } from "@/components/transport/transport-status-modal";
import { TransportDelayModal } from "@/components/transport/transport-delay-modal";
import { TransportExpenseModal } from "@/components/transport/transport-expense-modal";
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
  DollarSign,
  Plus,
  Lock,
  ShieldCheck,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function TransportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reqId = (params.id as string) || "TR-2026-00125";

  const {
    requests,
    trips,
    getRequestById,
    getTripById,
    openRequestModal,
    openAssignModal,
    openStatusModal,
    openDelayModal,
    openExpenseModal,
    isRequestModalOpen,
    closeRequestModal,
    isAssignModalOpen,
    closeAssignModal,
    isStatusModalOpen,
    closeStatusModal,
    isDelayModalOpen,
    closeDelayModal,
    isExpenseModalOpen,
    closeExpenseModal,
    selectedRequest,
    selectedTrip,
  } = useTransportStore();

  const [request, setRequest] = useState<TransportRequest | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadData() {
      const foundReq = await getRequestById(reqId);
      if (foundReq) {
        setRequest(foundReq);
        if (foundReq.tripId) {
          const foundTrip = await getTripById(foundReq.tripId);
          setTrip(foundTrip);
        }
      } else if (requests.length > 0) {
        setRequest(requests[0]);
        if (requests[0].tripId) {
          const t = await getTripById(requests[0].tripId);
          setTrip(t);
        }
      }
    }
    loadData();
  }, [reqId, requests, getRequestById, getTripById]);

  if (!request) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <p>Loading transport request details...</p>
      </div>
    );
  }

  const matchingTrip = trip || trips.find((t) => t.id === request.tripId || t.transportRequestId === request.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="xs" icon={ArrowLeft} onClick={() => router.push("/operations/transport")}>
          Back to Transport Dashboard
        </Button>
      </div>

      {/* Page Header */}
      <PageHeader
        title={`${request.requestNumber}: ${request.requiredVehicleType}`}
        subtitle={`Route: ${request.pickupLocation} → ${request.destinationLocation}`}
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Transport Execution", href: "/operations/transport" },
          { label: request.requestNumber },
        ]}
        statusBadge={
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {request.priority} Priority
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon={Edit} onClick={() => openRequestModal(request)}>
              Edit Specs
            </Button>

            <Link href="/warehouse/grn">
              <Button variant="outline" size="sm" icon={Boxes} className="text-sky-400 border-sky-500/30 hover:bg-sky-500/10">
                Receive at Warehouse (GRN)
              </Button>
            </Link>

            <Link href="/operations/delivery">
              <Button variant="outline" size="sm" icon={Truck} className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                Delivery Execution & POD
              </Button>
            </Link>

            {request.status === "Pending Assignment" && (
              <Button
                variant="primary"
                size="sm"
                icon={UserCheck}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => openAssignModal(request)}
              >
                Assign Vehicle & Driver
              </Button>
            )}

            {matchingTrip && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Truck}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                  onClick={() => openStatusModal(matchingTrip)}
                >
                  Update Trip Status
                </Button>

                <Button variant="outline" size="sm" icon={Plus} onClick={() => openExpenseModal(matchingTrip)}>
                  Add Expense
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={AlertTriangle}
                  className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  onClick={() => openDelayModal(matchingTrip)}
                >
                  Flag Delay
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Entity Context Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer / Shipper</span>
            <span className="font-bold text-slate-100 text-xs block">{request.customerName}</span>
            <span className="text-[11px] text-slate-400">Cargo: {request.cargoWeightKg.toLocaleString()} KG</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Operational Job</span>
            <Link
              href={`/operations/jobs/${request.jobId || request.jobNumber}`}
              className="font-bold text-sky-400 hover:underline text-xs block"
            >
              {request.jobNumber}
            </Link>
            <span className="text-[11px] text-slate-400">Shipment: {request.shipmentNumber}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Customs Clearance</span>
            {request.customsNumber ? (
              <Link
                href={`/operations/customs/${request.customsId || request.customsNumber}`}
                className="font-bold text-emerald-400 hover:underline text-xs block"
              >
                {request.customsNumber} ({request.customsStatus})
              </Link>
            ) : (
              <span className="text-slate-400 text-xs">Direct Inland Transport</span>
            )}
            <span className="text-[11px] text-slate-400">Operational Handoff Verified</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Containers Linked</span>
            <span className="font-mono font-bold text-cyan-400 text-xs block">
              {request.containerNumbers.join(", ") || "Container Load"}
            </span>
            <span className="text-[11px] text-slate-400">Equipment Verified</span>
          </div>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-900/40 border-b border-slate-800">
          <Tabs
            tabs={[
              { id: "overview", label: "Route & Transport Summary" },
              { id: "assignment", label: "Vehicle & Driver Specs" },
              { id: "expenses", label: "Expenses & Cost Summary", count: matchingTrip?.expenses.length || 0 },
              { id: "documents", label: "Transport Documents" },
              { id: "timeline", label: "Execution Milestone Timeline" },
              { id: "activities", label: "Activity Audit Log", count: matchingTrip?.activities.length || 0 },
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
                {/* Route Box */}
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-3">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Transport Route & Schedule
                  </h4>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">PICKUP TERMINAL</span>
                      <p className="font-bold text-slate-100 text-xs">{request.pickupLocation}</p>
                      {request.pickupContactPerson && (
                        <p className="text-slate-400 text-[10px]">Contact: {request.pickupContactPerson}</p>
                      )}
                      <span className="text-sky-400 text-[10px] font-mono font-bold block pt-1">
                        Scheduled: {request.pickupDate} ({request.pickupTime})
                      </span>
                    </div>

                    <div className="text-center text-slate-500 font-bold text-xs">↓</div>

                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">DESTINATION WAREHOUSE</span>
                      <p className="font-bold text-slate-100 text-xs">{request.destinationLocation}</p>
                      {request.destinationContactPerson && (
                        <p className="text-slate-400 text-[10px]">Contact: {request.destinationContactPerson}</p>
                      )}
                      <span className="text-emerald-400 text-[10px] font-mono font-bold block pt-1">
                        Expected Delivery: {request.expectedDeliveryDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cargo Specs */}
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Cargo & Requirement Specs
                  </h4>
                  <p className="text-slate-300"><strong>Cargo Description:</strong> {request.cargoDescription}</p>
                  <p className="text-slate-300"><strong>Gross Cargo Weight:</strong> {request.cargoWeightKg.toLocaleString()} KG</p>
                  <p className="text-slate-300"><strong>Required Vehicle Type:</strong> {request.requiredVehicleType}</p>
                  <p className="text-slate-300"><strong>Required Capacity:</strong> {request.requiredCapacityTonnes} Tonnes</p>
                  {request.specialInstructions && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] mt-2">
                      <strong>Special Instructions:</strong> {request.specialInstructions}
                    </div>
                  )}
                </div>

                {/* Execution Times */}
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Execution Milestones
                  </h4>
                  <p className="text-slate-300"><strong>Actual Pickup Time:</strong> {matchingTrip?.actualPickupTime || "Pending"}</p>
                  <p className="text-slate-300"><strong>Actual Loaded Time:</strong> {matchingTrip?.actualLoadedTime || "Pending"}</p>
                  <p className="text-slate-300"><strong>Actual Departure Time:</strong> {matchingTrip?.actualDepartureTime || "Pending"}</p>
                  <p className="text-slate-300"><strong>Actual Arrival Time:</strong> {matchingTrip?.actualArrivalTime || "Pending"}</p>
                  {matchingTrip?.delayReason && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] mt-2">
                      <strong>Delay Flag:</strong> {matchingTrip.delayReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VEHICLE & DRIVER */}
          {activeTab === "assignment" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-slate-100">Assigned Vehicle, Driver & Carrier Fleet</h4>
                {request.status === "Pending Assignment" && (
                  <Button variant="primary" size="xs" icon={UserCheck} onClick={() => openAssignModal(request)}>
                    Assign Now
                  </Button>
                )}
              </div>

              {request.assignedVehicleNumber ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                    <h5 className="font-bold text-sky-400 text-xs border-b border-slate-800 pb-1">Vehicle Details</h5>
                    <p className="text-slate-200 font-mono font-bold text-sm">{request.assignedVehicleNumber}</p>
                    <p className="text-slate-300"><strong>Vehicle Type:</strong> {request.requiredVehicleType}</p>
                    <p className="text-slate-300"><strong>Carrier Vendor:</strong> {request.assignedVendorName}</p>
                  </div>

                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                    <h5 className="font-bold text-emerald-400 text-xs border-b border-slate-800 pb-1">Driver Details</h5>
                    <p className="text-slate-200 font-bold text-sm">{request.assignedDriverName}</p>
                    <p className="text-slate-300"><strong>Driver Phone:</strong> {matchingTrip?.driverPhone || "+91 98700 12345"}</p>
                    <p className="text-slate-300"><strong>License Type:</strong> Heavy Motor Vehicle (HMV)</p>
                  </div>

                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                    <h5 className="font-bold text-slate-200 text-xs border-b border-slate-800 pb-1">Carrier Vendor</h5>
                    <p className="text-slate-200 font-bold">{request.assignedVendorName}</p>
                    <p className="text-slate-300"><strong>Vendor ID:</strong> {request.assignedVendorId}</p>
                    <p className="text-slate-300"><strong>Contract Status:</strong> Preferred Haulage Partner</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 py-4 italic">No vehicle or driver assigned yet.</p>
              )}
            </div>
          )}

          {/* TAB 3: EXPENSES */}
          {activeTab === "expenses" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-slate-100">Transport Expenses & Cost Variance</h4>
                {matchingTrip && (
                  <Button variant="outline" size="xs" icon={Plus} onClick={() => openExpenseModal(matchingTrip)}>
                    Add Expense Record
                  </Button>
                )}
              </div>

              {matchingTrip ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">ESTIMATED TRIP COST</span>
                      <span className="text-base font-extrabold font-mono text-slate-200">
                        {matchingTrip.currency} {matchingTrip.estimatedCost.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">ACTUAL COST TO DATE</span>
                      <span className="text-base font-extrabold font-mono text-emerald-400">
                        {matchingTrip.currency} {matchingTrip.actualCost.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">VARIANCE</span>
                      <span
                        className={`text-base font-extrabold font-mono ${
                          matchingTrip.actualCost > matchingTrip.estimatedCost ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {matchingTrip.currency}{" "}
                        {(matchingTrip.actualCost - matchingTrip.estimatedCost).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {matchingTrip.expenses.length > 0 ? (
                    <div className="space-y-2">
                      {matchingTrip.expenses.map((exp) => (
                        <div key={exp.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-200 text-xs block">{exp.category}</span>
                            <span className="text-slate-400 text-[11px]">{exp.description}</span>
                            <span className="text-slate-500 text-[10px] block">By {exp.createdBy} on {exp.expenseDate}</span>
                          </div>
                          <span className="font-mono font-extrabold text-emerald-400 text-sm">
                            {exp.currency} {exp.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 py-2 italic">No transport expenses recorded for this trip.</p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 py-4 italic">Assign vehicle to initialize trip cost accounting.</p>
              )}
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4 text-xs">
              <DocumentCompletenessWidget jobId={request.jobId} />
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
                Transport Execution Milestone Timeline
              </h4>

              {matchingTrip ? (
                <Timeline
                  events={matchingTrip.milestones.map((m) => ({
                    id: m.id,
                    title: m.title,
                    description: m.completedBy ? `Completed by ${m.completedBy}` : "Pending milestone",
                    timestamp: m.timestamp || "Pending",
                    completed: m.status === "Completed",
                  }))}
                />
              ) : (
                <p className="text-slate-400 py-4 italic">Timeline available after trip dispatch.</p>
              )}
            </div>
          )}

          {/* TAB 6: ACTIVITIES */}
          {activeTab === "activities" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
                Audit Trail & History Log
              </h4>

              {matchingTrip?.activities.length ? (
                <div className="space-y-2">
                  {matchingTrip.activities.map((act) => (
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
              ) : (
                <p className="text-slate-400 py-4 italic">No activity logs recorded.</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <TransportRequestModal
        isOpen={isRequestModalOpen}
        onClose={closeRequestModal}
        request={selectedRequest}
      />

      <AssignTransportModal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        request={selectedRequest}
      />

      <TransportStatusModal
        isOpen={isStatusModalOpen}
        onClose={closeStatusModal}
        trip={selectedTrip}
      />

      <TransportDelayModal
        isOpen={isDelayModalOpen}
        onClose={closeDelayModal}
        trip={selectedTrip}
      />

      <TransportExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={closeExpenseModal}
        trip={selectedTrip}
      />
    </div>
  );
}
