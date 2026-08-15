import { create } from "zustand";
import {
  CustomsDeclaration,
  CustomsFilterOptions,
  CustomsType,
  CustomsDirection,
  CustomsStatus,
} from "@/types/customs";
import { customsRepository } from "@/services/customs.repository";
import { toast } from "sonner";
import { useCrmStore } from "./use-crm-store";

interface CustomsStoreState {
  declarations: CustomsDeclaration[];
  filters: CustomsFilterOptions;
  selectedDeclaration: CustomsDeclaration | null;
  isLoading: boolean;

  // Dialog Controls
  isFormModalOpen: boolean;
  isFilingModalOpen: boolean;
  isDutyModalOpen: boolean;
  isExaminationModalOpen: boolean;
  isQueryModalOpen: boolean;
  isHoldModalOpen: boolean;

  // Actions
  fetchDeclarations: (customFilters?: CustomsFilterOptions) => Promise<void>;
  getDeclarationById: (id: string) => Promise<CustomsDeclaration | null>;

  setFilters: (newFilters: Partial<CustomsFilterOptions>) => void;
  clearFilters: () => void;
  setSelectedDeclaration: (dec: CustomsDeclaration | null) => void;

  openFormModal: (dec?: CustomsDeclaration | null) => void;
  closeFormModal: () => void;

  openFilingModal: (dec: CustomsDeclaration) => void;
  closeFilingModal: () => void;

  openDutyModal: (dec: CustomsDeclaration) => void;
  closeDutyModal: () => void;

  openExaminationModal: (dec: CustomsDeclaration) => void;
  closeExaminationModal: () => void;

  openQueryModal: (dec: CustomsDeclaration) => void;
  closeQueryModal: () => void;

  openHoldModal: (dec: CustomsDeclaration) => void;
  closeHoldModal: () => void;

  // Workflow Mutations
  createDeclaration: (data: Partial<CustomsDeclaration>) => Promise<CustomsDeclaration>;
  updateDeclaration: (id: string, data: Partial<CustomsDeclaration>) => Promise<CustomsDeclaration | null>;

  fileDeclaration: (id: string, filedBy?: string) => Promise<boolean>;
  markDutyPaid: (id: string, paymentRef: string, paidBy?: string) => Promise<boolean>;
  scheduleExamination: (
    id: string,
    examData: { date: string; location: string; examiner: string; remarks?: string }
  ) => Promise<boolean>;
  completeExamination: (id: string, result: "Passed" | "Issues Found", remarks: string) => Promise<boolean>;
  raiseQuery: (id: string, queryData: { title: string; description: string; priority: any }) => Promise<boolean>;
  respondToQuery: (declarationId: string, queryId: string, response: string, docId?: string) => Promise<boolean>;

  clearDeclaration: (id: string) => Promise<boolean>;
  releaseDeclaration: (id: string) => Promise<boolean>;
  putOnHold: (id: string, reason: string) => Promise<boolean>;
  resumeProcessing: (id: string) => Promise<boolean>;

  // Getters
  getCustomsForJob: (jobId: string) => CustomsDeclaration[];
  getCustomsForShipment: (shipmentId: string) => CustomsDeclaration[];
  getCustomsForContainer: (containerId: string) => CustomsDeclaration[];
  getDashboardKPIs: () => {
    total: number;
    draft: number;
    documentsPending: number;
    filed: number;
    underAssessment: number;
    examination: number;
    queryRaised: number;
    dutyPending: number;
    cleared: number;
    onHold: number;
    totalDutyPendingAmount: number;
  };
}

export const useCustomsStore = create<CustomsStoreState>((set, get) => ({
  declarations: [],
  filters: {
    search: "",
    customsType: "ALL",
    status: "ALL",
    dutyStatus: "ALL",
  },
  selectedDeclaration: null,
  isLoading: false,

  isFormModalOpen: false,
  isFilingModalOpen: false,
  isDutyModalOpen: false,
  isExaminationModalOpen: false,
  isQueryModalOpen: false,
  isHoldModalOpen: false,

  fetchDeclarations: async (customFilters) => {
    set({ isLoading: true });
    try {
      const activeFilters = customFilters || get().filters;
      const decs = await customsRepository.getCustomsDeclarations(activeFilters);
      set({ declarations: decs, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch customs declarations:", err);
      set({ isLoading: false });
    }
  },

  getDeclarationById: async (id: string) => {
    const cached = get().declarations.find((d) => d.id === id || d.declarationNumber === id);
    if (cached) return cached;
    return await customsRepository.getCustomsDeclarationById(id);
  },

  setFilters: (newFilters) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });
    get().fetchDeclarations(updated);
  },

  clearFilters: () => {
    const resetFilters: CustomsFilterOptions = {
      search: "",
      customsType: "ALL",
      status: "ALL",
      dutyStatus: "ALL",
    };
    set({ filters: resetFilters });
    get().fetchDeclarations(resetFilters);
  },

  setSelectedDeclaration: (dec) => set({ selectedDeclaration: dec }),

  openFormModal: (dec = null) => set({ selectedDeclaration: dec, isFormModalOpen: true }),
  closeFormModal: () => set({ isFormModalOpen: false }),

  openFilingModal: (dec) => set({ selectedDeclaration: dec, isFilingModalOpen: true }),
  closeFilingModal: () => set({ isFilingModalOpen: false }),

  openDutyModal: (dec) => set({ selectedDeclaration: dec, isDutyModalOpen: true }),
  closeDutyModal: () => set({ isDutyModalOpen: false }),

  openExaminationModal: (dec) => set({ selectedDeclaration: dec, isExaminationModalOpen: true }),
  closeExaminationModal: () => set({ isExaminationModalOpen: false }),

  openQueryModal: (dec) => set({ selectedDeclaration: dec, isQueryModalOpen: true }),
  closeQueryModal: () => set({ isQueryModalOpen: false }),

  openHoldModal: (dec) => set({ selectedDeclaration: dec, isHoldModalOpen: true }),
  closeHoldModal: () => set({ isHoldModalOpen: false }),

  createDeclaration: async (data) => {
    set({ isLoading: true });
    try {
      const decCount = get().declarations.length + 1;
      const nextId = `CUS-2026-${decCount.toString().padStart(5, "0")}`;
      const now = new Date().toISOString().replace("T", " ").slice(0, 16);

      const invVal = data.invoiceValue || 1000000;
      const duty = Math.round(invVal * 0.05);
      const tax = Math.round(invVal * 0.18);
      const total = duty + tax + (data.otherCharges || 2000);

      const newDec: CustomsDeclaration = {
        id: nextId,
        declarationNumber: nextId,
        customsType: data.customsType || "Import",
        direction: data.direction || (data.customsType === "Export" ? "Outbound" : "Inbound"),
        status: "Draft",
        jobId: data.jobId || "JOB-2026-00001",
        jobNumber: data.jobNumber || data.jobId || "JOB-2026-00001",
        shipmentId: data.shipmentId || "SHP-2026-00125",
        shipmentNumber: data.shipmentNumber || data.shipmentId || "SHP-2026-00125",
        bookingId: data.bookingId,
        bookingNumber: data.bookingNumber,
        containerIds: data.containerIds || ["CON-2026-00001"],
        containerNumbers: data.containerNumbers || ["MSCU1234567"],
        customerId: data.customerId || "CUS-2026-001",
        customerName: data.customerName || "ABC Electronics Pvt Ltd",
        brokerId: data.brokerId || "BRK-001",
        brokerName: data.brokerName || "Nhava Sheva Customs Clearing Agency",
        customsOffice: data.customsOffice || "Nhava Sheva Customs (JNPT), Mumbai",
        portOfEntry: data.portOfEntry || "JNPT Port, Mumbai",
        portOfExit: data.portOfExit || "Jebel Ali Port",
        countryOfOrigin: data.countryOfOrigin || "India",
        countryOfDestination: data.countryOfDestination || "UAE",
        currency: data.currency || "INR",
        invoiceValue: invVal,
        freightValue: data.freightValue || 50000,
        insuranceValue: data.insuranceValue || 5000,
        customsValue: invVal + 55000,
        dutyAmount: duty,
        taxAmount: tax,
        otherCharges: data.otherCharges || 2000,
        totalPayable: total,
        dutyPaymentStatus: "Pending",
        assignedTo: data.assignedTo || "Dakhani Usman (Ops Lead)",
        remarks: data.remarks,
        queries: [],
        milestones: [
          { id: "M1", title: "Declaration Created", status: "Completed", timestamp: now, completedBy: "Dakhani Usman" },
          { id: "M2", title: "Declaration Filed", status: "Pending" },
          { id: "M3", title: "Assessment Completed", status: "Pending" },
          { id: "M4", title: "Duty Paid", status: "Pending" },
          { id: "M5", title: "Customs Cleared", status: "Pending" },
          { id: "M6", title: "Cargo Released", status: "Pending" },
        ],
        activities: [
          {
            id: `ACT-${Date.now()}`,
            declarationId: nextId,
            type: "Created",
            title: "Customs Declaration Created",
            description: `Declaration ${nextId} created for ${data.customerName || "Customer"} (${data.customsOffice}).`,
            performedBy: "Dakhani Usman",
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const created = await customsRepository.create(newDec);
      set((state) => ({
        declarations: [created, ...state.declarations],
        isLoading: false,
        isFormModalOpen: false,
      }));

      // Log CRM Activity if customer linked
      if (created.customerId) {
        useCrmStore.getState().addActivity({
          type: "Note",
          title: `Customs Declaration Created: ${created.declarationNumber}`,
          description: `${created.customsType} declaration created for ${created.customsOffice}. Status: Draft.`,
          relatedEntity: "Customer",
          relatedEntityId: created.customerId,
          relatedEntityName: created.customerName,
          assignedTo: created.assignedTo,
          status: "Completed",
        });
      }

      toast.success(`Customs Declaration ${created.declarationNumber} created.`);
      return created;
    } catch (err) {
      set({ isLoading: false });
      toast.error("Failed to create customs declaration.");
      throw err;
    }
  },

  updateDeclaration: async (id, data) => {
    try {
      const updated = await customsRepository.update(id, data);
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
          isFormModalOpen: false,
        }));
        toast.success(`Declaration ${updated.declarationNumber} updated.`);
        return updated;
      }
      return null;
    } catch (err) {
      toast.error("Failed to update declaration.");
      return null;
    }
  },

  fileDeclaration: async (id, filedBy = "Dakhani Usman (Customs Lead)") => {
    try {
      const updated = await customsRepository.fileDeclaration(id, filedBy);
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
          isFilingModalOpen: false,
        }));
        toast.success(`Declaration ${updated.declarationNumber} filed successfully.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to file declaration.");
      return false;
    }
  },

  markDutyPaid: async (id, paymentRef, paidBy = "Dakhani Usman") => {
    try {
      const updated = await customsRepository.markDutyPaid(id, paymentRef, paidBy);
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
          isDutyModalOpen: false,
        }));
        toast.success(`Duty payment recorded for ${updated.declarationNumber}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to record duty payment.");
      return false;
    }
  },

  scheduleExamination: async (id, examData) => {
    try {
      const updated = await customsRepository.scheduleExamination(id, examData, "Dakhani Usman");
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
          isExaminationModalOpen: false,
        }));
        toast.info(`Examination scheduled for ${updated.declarationNumber}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to schedule examination.");
      return false;
    }
  },

  completeExamination: async (id, result, remarks) => {
    try {
      const updated = await customsRepository.completeExamination(id, result, remarks, "Customs Inspector");
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
          isExaminationModalOpen: false,
        }));
        toast.success(`Examination completed with result: ${result}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to record examination result.");
      return false;
    }
  },

  raiseQuery: async (id, queryData) => {
    try {
      const updated = await customsRepository.raiseQuery(id, queryData, "Customs Officer");
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
          isQueryModalOpen: false,
        }));
        toast.warning(`Customs query raised on ${updated.declarationNumber}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to raise query.");
      return false;
    }
  },

  respondToQuery: async (declarationId, queryId, response, docId) => {
    try {
      const updated = await customsRepository.respondToQuery(declarationId, queryId, response, docId, "Dakhani Usman");
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === declarationId ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === declarationId ? updated : state.selectedDeclaration,
          isQueryModalOpen: false,
        }));
        toast.success(`Query response submitted.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to respond to query.");
      return false;
    }
  },

  clearDeclaration: async (id) => {
    try {
      const updated = await customsRepository.clearDeclaration(id, "Customs Superintendent");
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
        }));
        toast.success(`Customs declaration ${updated.declarationNumber} marked CLEARED.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to clear declaration.");
      return false;
    }
  },

  releaseDeclaration: async (id) => {
    try {
      const updated = await customsRepository.releaseDeclaration(id, "Port Gate Superintendent");
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
        }));
        toast.success(`Cargo for ${updated.declarationNumber} RELEASED.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to release cargo.");
      return false;
    }
  },

  putOnHold: async (id, reason) => {
    try {
      const updated = await customsRepository.putOnHold(id, reason, "Compliance Officer");
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
          isHoldModalOpen: false,
        }));
        toast.warning(`Declaration ${updated.declarationNumber} placed on hold.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to put on hold.");
      return false;
    }
  },

  resumeProcessing: async (id) => {
    try {
      const updated = await customsRepository.resumeProcessing(id, "Dakhani Usman");
      if (updated) {
        set((state) => ({
          declarations: state.declarations.map((d) => (d.id === id ? updated : d)),
          selectedDeclaration: state.selectedDeclaration?.id === id ? updated : state.selectedDeclaration,
        }));
        toast.info(`Hold released. Processing resumed.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to resume processing.");
      return false;
    }
  },

  getCustomsForJob: (jobId) => {
    if (!jobId) return [];
    return get().declarations.filter(
      (d) => d.jobId?.toLowerCase() === jobId.toLowerCase() || d.jobNumber?.toLowerCase() === jobId.toLowerCase()
    );
  },

  getCustomsForShipment: (shipmentId) => {
    if (!shipmentId) return [];
    return get().declarations.filter(
      (d) =>
        d.shipmentId?.toLowerCase() === shipmentId.toLowerCase() ||
        d.shipmentNumber?.toLowerCase() === shipmentId.toLowerCase()
    );
  },

  getCustomsForContainer: (containerId) => {
    if (!containerId) return [];
    return get().declarations.filter(
      (d) =>
        d.containerIds.some((c) => c.toLowerCase() === containerId.toLowerCase()) ||
        d.containerNumbers.some((c) => c.toLowerCase() === containerId.toLowerCase())
    );
  },

  getDashboardKPIs: () => {
    const decs = get().declarations;
    const total = decs.length;
    const draft = decs.filter((d) => d.status === "Draft").length;
    const documentsPending = decs.filter((d) => d.status === "Documents Pending").length;
    const filed = decs.filter((d) => d.status === "Filed").length;
    const underAssessment = decs.filter((d) => d.status === "Under Assessment").length;
    const examination = decs.filter((d) => d.status === "Examination Required").length;
    const queryRaised = decs.filter((d) => d.status === "Query Raised").length;
    const dutyPending = decs.filter((d) => d.status === "Duty Pending" || (d.dutyPaymentStatus === "Pending" && d.totalPayable > 0)).length;
    const cleared = decs.filter((d) => d.status === "Cleared" || d.status === "Released").length;
    const onHold = decs.filter((d) => d.status === "On Hold").length;

    const totalDutyPendingAmount = decs
      .filter((d) => d.dutyPaymentStatus === "Pending")
      .reduce((sum, d) => sum + d.totalPayable, 0);

    return {
      total,
      draft,
      documentsPending,
      filed,
      underAssessment,
      examination,
      queryRaised,
      dutyPending,
      cleared,
      onHold,
      totalDutyPendingAmount,
    };
  },
}));

// Initialize store data
useCustomsStore.getState().fetchDeclarations();
