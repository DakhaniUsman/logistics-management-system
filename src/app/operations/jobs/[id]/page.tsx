"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Timeline } from "@/components/ui/timeline";
import { JobStatus, JobPriority } from "@/types/job";
import { useJobStore } from "@/store/use-job-store";
import { formatCurrency } from "@/lib/utils";
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  FileText,
  DollarSign,
  Building2,
  Calendar,
  Layers,
  Plus,
  Lock,
  Edit,
  ShieldCheck,
  PackageCheck,
  Ship,
  Plane,
  Truck,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params.id as string) || "JOB-2026-00001";

  const { jobs, updateJobStatus, assignJob, closeJob, addJobTask, toggleTaskStatus, addJobActivity } = useJobStore();

  const job = jobs.find((j) => j.id.toLowerCase() === jobId.toLowerCase() || (j.jobNumber || j.jobNo || "").toLowerCase() === jobId.toLowerCase()) || jobs[0];

  const [activeTab, setActiveTab] = useState("overview");

  // Modals State
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<JobStatus>(job?.status || "Active");
  const [statusNote, setStatusNote] = useState("");

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignedLead, setAssignedLead] = useState<string>(job?.assignedTo || "Vikram Mehta");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: job?.assignedTo || "Vikram Mehta",
    priority: "High" as JobPriority,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
  });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
  });

  if (!job) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <p>Job record not found.</p>
        <Link href="/operations/jobs">
          <Button variant="outline" size="sm" className="mt-4">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  // Activity events formatting
  const activityEvents = (job.activities || []).map((a) => ({
    id: a.id,
    title: a.title,
    description: `${a.description} • Performed by ${a.performedBy}`,
    timestamp: a.timestamp,
    completed: true,
  }));

  const handleStatusChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateJobStatus(job.id, newStatus, statusNote);
    toast.success(`Updated status of ${job.jobNumber} to ${newStatus}`);
    setIsStatusDialogOpen(false);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignJob(job.id, assignedLead, "Freight Operations");
    toast.success(`Reassigned ${job.jobNumber} to ${assignedLead}`);
    setIsAssignDialogOpen(false);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addJobTask(job.id, {
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: taskForm.assignedTo,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      status: "Pending",
    });
    toast.success(`Added task "${taskForm.title}" to ${job.jobNumber}`);
    setIsTaskModalOpen(false);
    setTaskForm({ ...taskForm, title: "", description: "" });
  };

  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addJobActivity(job.id, activityForm.title, activityForm.description, "Note");
    toast.success(`Logged note on ${job.jobNumber}`);
    setIsActivityModalOpen(false);
    setActivityForm({ title: "", description: "" });
  };

  const handleCloseJobAction = () => {
    closeJob(job.id, "Operational fulfillment complete.");
    toast.success(`Closed Job ${job.jobNumber}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <PageHeader
        title={`${job.jobNumber || job.jobNo || job.id}: ${job.customerName || "Customer"}`}
        subtitle={`Route: ${job.origin || "Mumbai"} → ${job.destination || "Dubai"} (${job.transportMode || "Ocean Freight"})`}
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Jobs", href: "/operations/jobs" },
          { label: job.jobNumber || job.jobNo || job.id },
        ]}
        statusBadge={
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              job.priority === "Urgent" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}>
              {job.priority} Priority
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => setIsStatusDialogOpen(true)}
            >
              Update Status
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={UserCheck}
              onClick={() => setIsAssignDialogOpen(true)}
            >
              Reassign Lead
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsTaskModalOpen(true)}
            >
              Add Task
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsActivityModalOpen(true)}
            >
              Log Note
            </Button>

            {job.status !== "Completed" && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={handleCloseJobAction}
              >
                Close & Complete Job
              </Button>
            )}
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Shipper Customer</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">{job.customerName}</span>
            <span className="text-[11px] text-slate-400">{job.contactName}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Prominent Route</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1">
              <span>{(job.origin || "Mumbai").split(" ")[0]}</span>
              <ArrowRight className="w-3 h-3 text-sky-500 shrink-0" />
              <span>{(job.destination || "Dubai").split(" ")[0]}</span>
            </span>
            <span className="text-[11px] text-slate-400">{job.transportMode} • {job.serviceType}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Revenue</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm block">
              {formatCurrency(job.estimatedRevenue || 0)}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">Est Cost: {formatCurrency(job.estimatedCost || 0)}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Required Delivery</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs block">
              {job.requiredDeliveryDate}
            </span>
            <span className="text-[11px] text-slate-400">Pickup: {job.pickupDate}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Operations</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">{job.assignedTo}</span>
            <span className="text-[11px] text-slate-400">{job.assignedDepartment}</span>
          </div>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: "overview", label: "Overview & Cargo Specs" },
              { id: "commercial", label: "Commercial & Inheritance" },
              { id: "operations", label: "Operations & Execution" },
              { id: "documents", label: "Documents Area", count: (job.documents || []).length },
              { id: "tasks", label: "Job Tasks", count: (job.tasks || []).length },
              { id: "timeline", label: "Activities & Timeline", count: (job.activities || []).length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Operational Job Specifications
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cargo Description</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{job.cargoDescription}</span>
                  <span className="text-slate-400 block">{job.quantity} {job.quantityUnit} {job.containerType ? `(${job.containerType})` : ""}</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Route Coordinates</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{job.origin} ({job.originCountry})</span>
                  <span className="text-sky-400 font-bold block">→ {job.destination} ({job.destinationCountry})</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Special Operational Notes</span>
                  <p className="text-slate-300">{job.specialRequirements || "Standard logistics handling requirements."}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMMERCIAL */}
          {activeTab === "commercial" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Commercial Contract & Quotation Inheritance
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-sky-400 font-bold uppercase block">Source Commercial Quotation</span>
                  {job.quotationId ? (
                    <Link href={`/sales/quotations/${job.quotationId}`} className="font-mono font-bold text-sm text-sky-400 hover:underline flex items-center gap-1">
                      <span>{job.quotationNumber}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic">Direct Operational Entry</span>
                  )}
                  <p className="text-slate-400">Payment Terms: <strong>{job.paymentTerms}</strong> • Incoterm: <strong>{job.incoterm}</strong></p>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Source Customer RFQ / Enquiry</span>
                  {job.enquiryId ? (
                    <Link href={`/sales/enquiries/${job.enquiryId}`} className="font-mono font-bold text-sm text-sky-400 hover:underline flex items-center gap-1">
                      <span>{job.enquiryNumber}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic">Direct Operational Entry</span>
                  )}
                  <p className="text-slate-400">Shipper Account: <strong>{job.customerName}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPERATIONS & FUTURE STRUCTURAL PLACEHOLDERS */}
          {activeTab === "operations" && (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-slate-100">Operational Execution Command Center</h4>
                <p className="text-slate-400">Origin: {job.origin} | Destination: {job.destination} | Mode: {job.transportMode}</p>
              </div>

              {/* Structured Future Operational Module Placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-dashed border-slate-700 bg-slate-900/30 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <Ship className="w-4 h-4" />
                    <span>Shipment Management (Phase 7)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Shipment records & BL allocation will attach here using <code>{job.id}</code>.</p>
                </Card>

                <Card className="p-4 border-dashed border-slate-700 bg-slate-900/30 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Layers className="w-4 h-4" />
                    <span>Carrier Bookings (Phase 8)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Shipping line & airline space confirmations will attach here using <code>{job.id}</code>.</p>
                </Card>

                <Card className="p-4 border-dashed border-slate-700 bg-slate-900/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Truck className="w-4 h-4" />
                    <span>Transport Execution (Phase 10)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">First-mile trailer pickup & feeder dispatch orders will attach here.</p>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS AREA */}
          {activeTab === "documents" && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Job Document Readiness Checklist
              </h4>
              <div className="space-y-2">
                {(job.documents || []).map((doc) => (
                  <div key={doc.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{doc.documentType}</span>
                      <span className="text-slate-400 text-[10px]">{doc.required ? "Mandatory Export Document" : "Optional Certificate"}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      doc.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Job Operational Tasks ({ (job.tasks || []).length })
                </h4>
                <Button variant="outline" size="xs" icon={Plus} onClick={() => setIsTaskModalOpen(true)}>
                  Add Job Task
                </Button>
              </div>

              {(job.tasks || []).length > 0 ? (
                <div className="space-y-2">
                  {(job.tasks || []).map((task) => (
                    <div key={task.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTaskStatus(job.id, task.id)} className="text-sky-500">
                          {task.status === "Completed" ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                        </button>
                        <div>
                          <span className={`font-bold text-slate-900 dark:text-slate-100 block ${task.status === "Completed" ? "line-through opacity-50" : ""}`}>
                            {task.title}
                          </span>
                          <span className="text-slate-400 text-[10px]">Assigned to: {task.assignedTo} • Due: {task.dueDate}</span>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-center py-4">No active operational tasks for this job yet.</p>
              )}
            </div>
          )}

          {/* TAB 6: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="max-w-xl mx-auto py-2">
              <Timeline events={activityEvents} />
            </div>
          )}
        </div>
      </Card>

      {/* UPDATE STATUS DIALOG */}
      <Dialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        title="Update Operational Job Status"
        description={`Change status for Job ${job.jobNumber}`}
      >
        <form onSubmit={handleStatusChangeSubmit} className="space-y-4 py-2">
          <Select
            label="New Operational Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as JobStatus)}
            options={[
              { label: "Active", value: "Active" },
              { label: "In Progress", value: "In Progress" },
              { label: "On Hold", value: "On Hold" },
              { label: "Delayed", value: "Delayed" },
              { label: "Completed", value: "Completed" },
              { label: "Cancelled", value: "Cancelled" },
            ]}
          />

          <Input
            label="Status Update Note"
            placeholder="e.g. Customs clearance verified. Container released for port gate-in."
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm Status Update
            </Button>
          </div>
        </form>
      </Dialog>

      {/* REASSIGN LEAD DIALOG */}
      <Dialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        title="Reassign Operations Lead"
        description={`Assign operations team lead for Job ${job.jobNumber}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 py-2">
          <Select
            label="Select Operations Lead"
            value={assignedLead}
            onChange={(e) => setAssignedLead(e.target.value)}
            options={[
              { label: "Vikram Mehta (Air Freight Lead)", value: "Vikram Mehta" },
              { label: "Siddharth Rao (Ocean Export Lead)", value: "Siddharth Rao" },
              { label: "Neha Kapoor (Customs Lead)", value: "Neha Kapoor" },
              { label: "Amit Patel (Road Feeder Lead)", value: "Amit Patel" },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Assignment
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ADD TASK DIALOG */}
      <Dialog
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Operational Job Task"
        description={`Create a fulfillment task for ${job.jobNumber}`}
      >
        <form onSubmit={handleAddTaskSubmit} className="space-y-4 py-2 text-xs">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Confirm BL draft with shipping line"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />

          <Input
            label="Task Description"
            placeholder="Details or special instructions..."
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned To"
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              options={[
                { label: "Vikram Mehta", value: "Vikram Mehta" },
                { label: "Siddharth Rao", value: "Siddharth Rao" },
                { label: "Neha Kapoor", value: "Neha Kapoor" },
              ]}
            />

            <Input
              label="Due Date"
              type="date"
              required
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Task
            </Button>
          </div>
        </form>
      </Dialog>

      {/* LOG ACTIVITY DIALOG */}
      <Dialog
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title="Log Activity Note"
        description={`Record operational note for ${job.jobNumber}`}
      >
        <form onSubmit={handleAddActivitySubmit} className="space-y-4 py-2 text-xs">
          <Input
            label="Activity Note Title"
            required
            placeholder="e.g. Container Gate-In Confirmed"
            value={activityForm.title}
            onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
          />

          <Input
            label="Note Details"
            required
            placeholder="Provide operational context..."
            value={activityForm.description}
            onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsActivityModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Activity Note
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
