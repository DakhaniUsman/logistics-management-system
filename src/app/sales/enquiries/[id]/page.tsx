"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Timeline } from "@/components/ui/timeline";
import { EnquiryStatus, EnquiryPriority } from "@/types/enquiry";
import { useEnquiryStore } from "@/store/use-enquiry-store";
import { useCrmStore } from "@/store/use-crm-store";
import { useRateStore } from "@/store/use-rate-store";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Ship,
  Plane,
  Truck,
  Train,
  ArrowRight,
  User,
  Calendar,
  Package,
  MapPin,
  Lock,
  Plus,
  Edit,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const enquiryId = (params.id as string) || "ENQ-2026-001";

  const { enquiries, updateEnquiryStatus, assignEnquiry, updateEnquiry, addEnquiry } = useEnquiryStore();
  const { activities, addActivity } = useCrmStore();

  const enquiry = enquiries.find((e) => e.id.toLowerCase() === enquiryId.toLowerCase() || e.enquiryNumber.toLowerCase() === enquiryId.toLowerCase()) || enquiries[0];

  const [activeTab, setActiveTab] = useState("overview");

  // Modals & Drawers
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState<EnquiryStatus>(enquiry?.status || "Under Review");
  const [assignedUser, setAssignedUser] = useState(enquiry?.assignedTo || "Shahbaj Borkar");
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
  });

  const [editForm, setEditForm] = useState({
    cargoDescription: enquiry?.cargoDescription || "",
    origin: enquiry?.origin || "",
    destination: enquiry?.destination || "",
    quantity: enquiry?.quantity || 100,
    weightKg: enquiry?.weightKg || 5000,
    specialRequirements: enquiry?.specialRequirements || "",
  });

  if (!enquiry) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Enquiry record not found.</p>
        <Link href="/sales/enquiries">
          <Button variant="outline" size="sm" className="mt-4">Back to Enquiries</Button>
        </Link>
      </div>
    );
  }

  // Linked Activities
  const enquiryActivities = activities
    .filter((a) => a.relatedEntity === "Customer" && a.relatedEntityId === enquiry.customerId)
    .map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      timestamp: a.createdAt,
      completed: a.status === "Completed",
    }));

  const handleStatusChangeSubmit = () => {
    updateEnquiryStatus(enquiry.id, selectedStatus);
    toast.success(`Enquiry ${enquiry.enquiryNumber} status updated to ${selectedStatus}`);
    setIsStatusDialogOpen(false);
  };

  const handleAssignSubmit = () => {
    assignEnquiry(enquiry.id, assignedUser);
    toast.success(`Assigned ${enquiry.enquiryNumber} to ${assignedUser}`);
    setIsAssignDialogOpen(false);
  };

  const handleLogActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity({
      type: "Note",
      title: activityForm.title,
      description: activityForm.description,
      relatedEntity: "Customer",
      relatedEntityId: enquiry.customerId,
      relatedEntityName: enquiry.customerName,
      assignedTo: enquiry.assignedTo,
      status: "Completed",
    });
    toast.success("Activity logged on enquiry timeline");
    setIsLogActivityOpen(false);
    setActivityForm({ title: "", description: "" });
  };

  const handleDuplicateEnquiry = () => {
    const duplicated = addEnquiry({
      ...enquiry,
      status: "New",
      notes: `Duplicated from ${enquiry.enquiryNumber}`,
    });
    toast.success(`Duplicated enquiry as ${duplicated.enquiryNumber}`);
    router.push(`/sales/enquiries/${duplicated.id}`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEnquiry(enquiry.id, editForm);
    toast.success(`Saved changes to ${enquiry.enquiryNumber}`);
    setIsEditDrawerOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <PageHeader
        title={`${enquiry.enquiryNumber}: ${enquiry.customerName}`}
        subtitle={`Route: ${enquiry.origin} → ${enquiry.destination} (${enquiry.transportMode})`}
        breadcrumbs={[
          { label: "Sales & CRM", href: "/sales/crm" },
          { label: "Enquiries", href: "/sales/enquiries" },
          { label: enquiry.enquiryNumber },
        ]}
        statusBadge={
          <div className="flex items-center gap-2">
            <StatusBadge status={enquiry.status} />
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                enquiry.priority === "Urgent"
                  ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400"
                  : enquiry.priority === "High"
                  ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400"
                  : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {enquiry.priority} Priority
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/sales/quotations/builder?enquiryId=${enquiry.id}`}>
              <Button variant="primary" size="sm" icon={FileText}>
                Generate Commercial Quotation
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => setIsEditDrawerOpen(true)}
            >
              Edit RFQ Specs
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => setIsStatusDialogOpen(true)}
            >
              Change Status
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={UserCheck}
              onClick={() => setIsAssignDialogOpen(true)}
            >
              Assign
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={handleDuplicateEnquiry}
            >
              Duplicate
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsLogActivityOpen(true)}
            >
              Log Activity
            </Button>
          </div>
        }
      />

      {/* Primary Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Cargo Specification</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate block">{enquiry.cargoType}</span>
            <span className="text-[11px] text-slate-400">{enquiry.quantity} {enquiry.quantityUnit} ({enquiry.weightKg} KG)</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
            {enquiry.transportMode === "Ocean Freight" ? <Ship className="w-5 h-5" /> : <Plane className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Mode & Equipment</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{enquiry.transportMode}</span>
            <span className="text-[11px] text-slate-400">{enquiry.containerQuantity}x {enquiry.containerType}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Commercial Route</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1">
              <span>{enquiry.origin.split(" ")[0]}</span>
              <ArrowRight className="w-3 h-3 text-sky-500" />
              <span>{enquiry.destination.split(" ")[0]}</span>
            </span>
            <span className="text-[11px] text-slate-400">Incoterm: {enquiry.incoterm}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Required Delivery</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{enquiry.requiredDeliveryDate}</span>
            <span className="text-[11px] text-slate-400">Pickup: {enquiry.pickupDate}</span>
          </div>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: "overview", label: "Overview & Contacts" },
              { id: "cargo", label: "Cargo & Packaging" },
              { id: "route", label: "Route & Schedule" },
              { id: "services", label: "Service Scope & Terms" },
              { id: "timeline", label: "Activity Timeline", count: enquiryActivities.length },
              { id: "rates", label: "Rate Calculation & Estimated Cost" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                  Shipper & Commercial Identity
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer Account:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{enquiry.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer ID:</span>
                    <span className="font-mono font-semibold text-sky-500">{enquiry.customerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Contact:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{enquiry.contactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact Email:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{enquiry.contactEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact Phone:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{enquiry.contactPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inquiry Source:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{enquiry.source}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                  Assignment & Operational Stage
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Representative:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{enquiry.assignedTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Lifecycle Stage:</span>
                    <StatusBadge status={enquiry.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Priority SLA:</span>
                    <span className="font-bold text-amber-500">{enquiry.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created Date:</span>
                    <span className="font-mono text-slate-400">{enquiry.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Modified:</span>
                    <span className="font-mono text-slate-400">{enquiry.updatedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARGO & PACKAGING */}
          {activeTab === "cargo" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Cargo Specifications & Equipment Requirements
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cargo Classification</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{enquiry.cargoType}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Weight</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{enquiry.weightKg} KG</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cubic Volume</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{enquiry.volumeCbm} CBM</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Equipment Allocation</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {enquiry.containerQuantity}x {enquiry.containerType}
                </span>
                <p className="text-slate-400 mt-1">Detailed Description: {enquiry.cargoDescription}</p>
              </div>
            </div>
          )}

          {/* TAB 3: ROUTE & SCHEDULE */}
          {activeTab === "route" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Origin & Destination Schedule Requirements
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-500/30 space-y-2">
                  <span className="text-[10px] text-sky-400 font-bold uppercase block">Origin Loading Point</span>
                  <p className="font-bold text-slate-100 text-sm">{enquiry.origin}</p>
                  <p className="text-slate-400">{enquiry.originCountry}</p>
                  <p className="text-sky-300 font-mono mt-2">Pickup Date: {enquiry.pickupDate}</p>
                </div>

                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Destination Discharge Point</span>
                  <p className="font-bold text-slate-100 text-sm">{enquiry.destination}</p>
                  <p className="text-slate-400">{enquiry.destinationCountry}</p>
                  <p className="text-emerald-300 font-mono mt-2">Required Delivery: {enquiry.requiredDeliveryDate}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SERVICE & INCOTERMS */}
          {activeTab === "services" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Commercial Scope & Special Handling Requirements
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Type Scope</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{enquiry.serviceType}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Commercial Incoterm</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{enquiry.incoterm}</span>
                </div>
              </div>

              {enquiry.specialRequirements && (
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-300 space-y-1">
                  <span className="text-[10px] font-bold uppercase block">Special Customs / Handling Instructions</span>
                  <p>{enquiry.specialRequirements}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="max-w-xl mx-auto py-2">
              <h4 className="text-sm font-bold text-slate-200 mb-4">
                Enquiry Lifecycle Stepper & Activity Feed
              </h4>
              <Timeline events={enquiryActivities} />
            </div>
          )}

          {/* TAB 6: RATE CALCULATION & ESTIMATED COST */}
          {activeTab === "rates" && (
            <div className="space-y-4 text-xs">
              {(() => {
                const { getBasketForEnquiry, getEstimatedTotalCost, toggleComponentInBasket, rates } = useRateStore.getState();
                const basket = getBasketForEnquiry(enquiry.id);
                const totalCost = getEstimatedTotalCost(enquiry.id);

                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-sky-400 font-bold uppercase block">Internal Operational Cost Estimate</span>
                        <h3 className="text-xl font-mono font-bold text-slate-100 mt-0.5">
                          {formatCurrency(totalCost)}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Total of {basket.length} selected vendor rate components. (Ready for Phase 5 Quotation Margin calculation).
                        </p>
                      </div>

                      <Link href="/sales/rates/comparison">
                        <Button variant="primary" size="sm" icon={ExternalLink}>
                          Open Rate Comparison Engine
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Selected Components Basket */}
                      <Card className="p-4 space-y-3">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                          <span>Selected Cost Components ({basket.length})</span>
                          <span className="text-sky-500 font-mono text-xs font-bold">{formatCurrency(totalCost)}</span>
                        </h4>

                        {basket.length > 0 ? (
                          <div className="space-y-2">
                            {basket.map((item) => (
                              <div key={item.rateId} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.category}</span>
                                  <span className="text-slate-400 text-[11px]">{item.vendorName} ({item.rateNumber})</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">{formatCurrency(item.amount)}</span>
                                  <span className="text-[10px] text-slate-400">{item.unit}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-slate-400 italic">
                            No cost components selected yet. Add rates from available vendor rates below.
                          </div>
                        )}
                      </Card>

                      {/* Locked Quotation Note */}
                      <Card className="p-4 space-y-3 border-dashed border-slate-700 bg-slate-900/30">
                        <div className="flex items-center gap-2 text-amber-400 font-bold">
                          <Lock className="w-4 h-4" />
                          <span>Phase 5 Quotation Margin Application (Locked)</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          Phase 4 establishes the internal estimated operational cost (<strong>{formatCurrency(totalCost)}</strong>). In Phase 5 (Quotation Management), sales managers will apply commercial profit margins (e.g. +₹22,000 margin) to generate final customer selling price (₹130,000).
                        </p>
                      </Card>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </Card>

      {/* CHANGE STATUS DIALOG */}
      <Dialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        title="Update Enquiry Lifecycle Status"
        description={`Change status for Enquiry ${enquiry.enquiryNumber}`}
      >
        <div className="space-y-4 py-2">
          <Select
            label="Target Status Stage"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as EnquiryStatus)}
            options={[
              { label: "New", value: "New" },
              { label: "Under Review", value: "Under Review" },
              { label: "Information Required", value: "Information Required" },
              { label: "Rate Pending", value: "Rate Pending" },
              { label: "Ready for Quotation", value: "Ready for Quotation" },
              { label: "Won", value: "Won" },
              { label: "Lost", value: "Lost" },
              { label: "Cancelled", value: "Cancelled" },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleStatusChangeSubmit}>
              Update Status
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ASSIGN USER DIALOG */}
      <Dialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        title="Assign Sales / Operations Representative"
        description={`Assign Enquiry ${enquiry.enquiryNumber} to team member`}
      >
        <div className="space-y-4 py-2">
          <Select
            label="Assigned Representative"
            value={assignedUser}
            onChange={(e) => setAssignedUser(e.target.value)}
            options={[
              { label: "Shahbaj Borkar (Ops Manager)", value: "Shahbaj Borkar" },
              { label: "Priya Nair (Sales Executive)", value: "Priya Nair" },
              { label: "Rohan Varma (Logistics Lead)", value: "Rohan Varma" },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAssignSubmit}>
              Save Assignment
            </Button>
          </div>
        </div>
      </Dialog>

      {/* LOG ACTIVITY DIALOG */}
      <Dialog
        isOpen={isLogActivityOpen}
        onClose={() => setIsLogActivityOpen(false)}
        title="Log Activity on Enquiry Timeline"
        description={`Add a call note or follow-up update for ${enquiry.enquiryNumber}`}
      >
        <form onSubmit={handleLogActivitySubmit} className="space-y-4 py-2">
          <Input
            label="Activity Title"
            required
            placeholder="e.g. Discussed container pickup dates with shipper"
            value={activityForm.title}
            onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
          />

          <Input
            label="Activity Description"
            required
            placeholder="Enter discussion summary or next steps..."
            value={activityForm.description}
            onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsLogActivityOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Activity
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT RFQ SPECS DRAWER */}
      <Drawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={`Edit RFQ Specs: ${enquiry.enquiryNumber}`}
        subtitle="Modify shipment specifications and cargo requirements."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Cargo Description"
            value={editForm.cargoDescription}
            onChange={(e) => setEditForm({ ...editForm, cargoDescription: e.target.value })}
          />

          <Input
            label="Origin Location"
            value={editForm.origin}
            onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })}
          />

          <Input
            label="Destination Location"
            value={editForm.destination}
            onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
          />

          <Input
            label="Quantity"
            type="number"
            value={editForm.quantity}
            onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
          />

          <Input
            label="Gross Weight (KG)"
            type="number"
            value={editForm.weightKg}
            onChange={(e) => setEditForm({ ...editForm, weightKg: Number(e.target.value) })}
          />

          <Input
            label="Special Customs / Handling Instructions"
            value={editForm.specialRequirements}
            onChange={(e) => setEditForm({ ...editForm, specialRequirements: e.target.value })}
          />

          <Button variant="primary" type="submit" className="w-full mt-4">
            Save RFQ Changes
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
