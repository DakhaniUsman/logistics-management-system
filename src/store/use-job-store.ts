import { create } from "zustand";
import { Job, JobStatus, JobTask, JobActivity } from "@/types/job";
import { MOCK_JOBS } from "@/data/mock/job-data";
import { useCrmStore } from "./use-crm-store";
import { useEnquiryStore } from "./use-enquiry-store";

interface JobStoreState {
  jobs: Job[];

  addJob: (data: Omit<Job, "id" | "jobNumber" | "createdAt" | "updatedAt">) => Job;
  createJobFromQuotation: (quotation: any) => Job;
  updateJob: (id: string, data: Partial<Job>) => void;
  updateJobStatus: (id: string, newStatus: JobStatus, note?: string) => void;
  assignJob: (id: string, assignedTo: string, department?: string) => void;
  closeJob: (id: string, note?: string) => void;

  addJobTask: (jobId: string, task: Omit<JobTask, "id" | "jobId" | "createdAt">) => void;
  toggleTaskStatus: (jobId: string, taskId: string) => void;
  addJobActivity: (jobId: string, title: string, description: string, type?: string) => void;
}

export const useJobStore = create<JobStoreState>((set, get) => ({
  jobs: MOCK_JOBS,

  addJob: (data) => {
    const nextNum = get().jobs.length + 1;
    const newJob: Job = {
      ...data,
      id: `JOB-2026-${nextNum.toString().padStart(5, "0")}`,
      jobNumber: `JOB-2026-${nextNum.toString().padStart(5, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      tasks: data.tasks || [],
      documents: data.documents || [
        { id: "D1", jobId: "", documentType: "Commercial Invoice", status: "Approved", required: true },
        { id: "D2", jobId: "", documentType: "Packing List", status: "Approved", required: true },
        { id: "D3", jobId: "", documentType: "Bill of Lading / AWB", status: "Pending", required: true },
      ],
      activities: [
        {
          id: `ACT-${Date.now()}`,
          jobId: `JOB-2026-${nextNum.toString().padStart(5, "0")}`,
          type: "Job Created",
          title: `Job Created`,
          description: `Operational job created for ${data.customerName} (${data.origin} → ${data.destination})`,
          performedBy: data.createdBy || "Shahbaj Borkar",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
        },
      ],
    };

    set((state) => ({ jobs: [newJob, ...state.jobs] }));

    // Log CRM Activity
    useCrmStore.getState().addActivity({
      type: "Note",
      title: `Job ${newJob.jobNumber} Activated`,
      description: `Operational Job created for ${newJob.customerName || "Customer"} (${newJob.origin || ""} → ${newJob.destination || ""}). Est Value: ₹${(newJob.estimatedRevenue || 0).toLocaleString()}`,
      relatedEntity: "Customer",
      relatedEntityId: newJob.customerId || "CUS-001",
      relatedEntityName: newJob.customerName || "Customer",
      assignedTo: newJob.assignedTo || "Ops Lead",
      status: "Completed",
    });

    return newJob;
  },

  createJobFromQuotation: (quotation) => {
    const nextNum = get().jobs.length + 1;
    const newJob: Job = {
      id: `JOB-2026-${nextNum.toString().padStart(5, "0")}`,
      jobNumber: `JOB-2026-${nextNum.toString().padStart(5, "0")}`,
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      enquiryId: quotation.enquiryId,
      enquiryNumber: quotation.enquiryNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      companyId: quotation.companyId || "COMP-001",
      contactId: quotation.contactId,
      contactName: quotation.contactName,
      contactEmail: quotation.contactEmail,
      contactPhone: quotation.contactPhone,
      jobType: quotation.transportMode === "Air Freight" ? "Freight Forwarding" : "Port-to-Port",
      status: "Active",
      priority: "High",
      assignedTo: "Vikram Mehta (Ops Lead)",
      assignedDepartment: "Operations & Logistics",
      origin: quotation.origin,
      destination: quotation.destination,
      originCountry: "India",
      destinationCountry: "UAE",
      transportMode: quotation.transportMode,
      serviceType: quotation.serviceType,
      cargoDescription: `Export Freight Shipment (${quotation.quotationNumber})`,
      quantity: 1,
      quantityUnit: "Shipment",
      pickupDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      requiredDeliveryDate: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0],
      estimatedRevenue: quotation.grandTotal,
      estimatedCost: quotation.internalCost,
      expectedProfit: quotation.marginAmount,
      expectedMarginPercentage: quotation.marginPercentage,
      currency: quotation.currency,
      paymentTerms: quotation.paymentTerms,
      incoterm: quotation.incoterm,
      notes: quotation.notes,
      specialRequirements: quotation.termsAndConditions,
      createdBy: "Shahbaj Borkar",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      tasks: [
        {
          id: `TASK-${Date.now()}-1`,
          jobId: `JOB-2026-${nextNum.toString().padStart(5, "0")}`,
          title: "Verify Shipping Instructions & Commercial Documents",
          description: "Inspect commercial invoice & packing list before booking release.",
          assignedTo: "Vikram Mehta",
          priority: "High",
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
          status: "Pending",
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
      documents: [
        { id: `D1-${Date.now()}`, jobId: "", documentType: "Commercial Invoice", status: "Approved", required: true },
        { id: `D2-${Date.now()}`, jobId: "", documentType: "Packing List", status: "Approved", required: true },
        { id: `D3-${Date.now()}`, jobId: "", documentType: "Bill of Lading / AWB", status: "Pending", required: true },
        { id: `D4-${Date.now()}`, jobId: "", documentType: "Certificate of Origin", status: "Available", required: false },
      ],
      activities: [
        {
          id: `ACT-${Date.now()}`,
          jobId: `JOB-2026-${nextNum.toString().padStart(5, "0")}`,
          type: "Job Created",
          title: `Job Created from Accepted Quotation ${quotation.quotationNumber}`,
          description: `Operational job initialized for ${quotation.customerName}.`,
          performedBy: "Shahbaj Borkar",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
        },
      ],
    };

    set((state) => ({ jobs: [newJob, ...state.jobs] }));

    // Update Enquiry status to "Won"
    if (quotation.enquiryId) {
      useEnquiryStore.getState().updateEnquiryStatus(quotation.enquiryId, "Won");
    }

    return newJob;
  },

  updateJob: (id, data) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id ? { ...j, ...data, updatedAt: new Date().toISOString().split("T")[0] } : j
      ),
    }));
  },

  updateJobStatus: (id, newStatus, note) => {
    const target = get().jobs.find((j) => j.id === id);
    if (!target) return;

    const activityNote: JobActivity = {
      id: `ACT-${Date.now()}`,
      jobId: id,
      type: "Status Change",
      title: `Status Changed to ${newStatus}`,
      description: note || `Operational status updated to ${newStatus}.`,
      performedBy: "Shahbaj Borkar",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    };

    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id
          ? {
              ...j,
              status: newStatus,
              updatedAt: new Date().toISOString().split("T")[0],
              activities: [activityNote, ...(j.activities || [])],
            }
          : j
      ),
    }));
  },

  assignJob: (id, assignedTo, department) => {
    const activityNote: JobActivity = {
      id: `ACT-${Date.now()}`,
      jobId: id,
      type: "Assignment",
      title: `Reassigned to ${assignedTo}`,
      description: `Job assigned to ${assignedTo} (${department || "Operations"}).`,
      performedBy: "Shahbaj Borkar",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    };

    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id
          ? {
              ...j,
              assignedTo,
              assignedDepartment: department || j.assignedDepartment,
              updatedAt: new Date().toISOString().split("T")[0],
              activities: [activityNote, ...(j.activities || [])],
            }
          : j
      ),
    }));
  },

  closeJob: (id, note) => {
    const activityNote: JobActivity = {
      id: `ACT-${Date.now()}`,
      jobId: id,
      type: "Job Closed",
      title: `Job Operation Closed & Completed`,
      description: note || "All logistics operations & fulfillment tasks successfully completed.",
      performedBy: "Shahbaj Borkar",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    };

    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id
          ? {
              ...j,
              status: "Completed",
              completedAt: new Date().toISOString().split("T")[0],
              closedAt: new Date().toISOString().split("T")[0],
              updatedAt: new Date().toISOString().split("T")[0],
              activities: [activityNote, ...(j.activities || [])],
            }
          : j
      ),
    }));
  },

  addJobTask: (jobId, taskData) => {
    const newTask: JobTask = {
      ...taskData,
      id: `TASK-${Date.now()}`,
      jobId,
      createdAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, tasks: [newTask, ...(j.tasks || [])] } : j
      ),
    }));
  },

  toggleTaskStatus: (jobId, taskId) => {
    set((state) => ({
      jobs: state.jobs.map((j) => {
        if (j.id === jobId) {
          const updatedTasks = (j.tasks || []).map((t) => {
            if (t.id === taskId) {
              const isComp = t.status === "Completed";
              return {
                ...t,
                status: (isComp ? "Pending" : "Completed") as any,
                completedAt: isComp ? undefined : new Date().toISOString().replace("T", " ").slice(0, 16),
              };
            }
            return t;
          });
          return { ...j, tasks: updatedTasks };
        }
        return j;
      }),
    }));
  },

  addJobActivity: (jobId, title, description, type = "Note") => {
    const newAct: JobActivity = {
      id: `ACT-${Date.now()}`,
      jobId,
      type,
      title,
      description,
      performedBy: "Shahbaj Borkar",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    };

    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, activities: [newAct, ...(j.activities || [])] } : j
      ),
    }));
  },
}));
