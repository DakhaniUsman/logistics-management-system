import { create } from "zustand";
import {
  Document,
  DocumentFilterOptions,
  DocumentRequirement,
  DocumentCompleteness,
  DocumentType,
  DocumentCategory,
} from "@/types/document";
import { documentRepository } from "@/services/document.repository";
import { toast } from "sonner";
import { useCrmStore } from "./use-crm-store";
import { useJobStore } from "./use-job-store";

interface DocumentStoreState {
  documents: Document[];
  requirements: DocumentRequirement[];
  filters: DocumentFilterOptions;
  selectedDocument: Document | null;
  isLoading: boolean;

  // Modals state
  isUploadModalOpen: boolean;
  isPreviewModalOpen: boolean;
  isVerificationModalOpen: boolean;
  isReplaceModalOpen: boolean;

  // Actions
  fetchDocuments: (customFilters?: DocumentFilterOptions) => Promise<void>;
  getDocumentById: (id: string) => Promise<Document | null>;

  setFilters: (newFilters: Partial<DocumentFilterOptions>) => void;
  clearFilters: () => void;
  setSelectedDocument: (doc: Document | null) => void;

  openUploadModal: () => void;
  closeUploadModal: () => void;

  openPreviewModal: (doc: Document) => void;
  closePreviewModal: () => void;

  openVerificationModal: (doc: Document) => void;
  closeVerificationModal: () => void;

  openReplaceModal: (doc: Document) => void;
  closeReplaceModal: () => void;

  // Mutations
  uploadDocument: (data: {
    documentType: DocumentType;
    category: DocumentCategory;
    title?: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    isRequired?: boolean;
    isConfidential?: boolean;
    issueDate?: string;
    expiryDate?: string;
    description?: string;
    customerId?: string;
    customerName?: string;
    jobId?: string;
    jobNumber?: string;
    shipmentId?: string;
    shipmentNumber?: string;
    bookingId?: string;
    bookingNumber?: string;
    containerId?: string;
    containerNumber?: string;
    uploadedBy?: string;
  }) => Promise<Document>;

  verifyDocument: (id: string, verifiedBy?: string) => Promise<boolean>;
  rejectDocument: (id: string, reason: string, rejectedBy?: string) => Promise<boolean>;
  replaceDocument: (
    id: string,
    fileData: { fileName: string; fileType: string; fileSize: number; reason?: string },
    uploadedBy?: string
  ) => Promise<boolean>;
  archiveDocument: (id: string) => Promise<boolean>;

  // Helper getters for completeness
  getJobDocuments: (jobId: string) => Document[];
  getShipmentDocuments: (shipmentId: string) => Document[];
  getBookingDocuments: (bookingId: string) => Document[];
  getContainerDocuments: (containerId: string) => Document[];
  getJobCompleteness: (jobId: string) => DocumentCompleteness;
  getDashboardKPIs: () => {
    total: number;
    pendingVerification: number;
    verified: number;
    rejected: number;
    missing: number;
    expired: number;
    expiringSoon: number;
    uploadedToday: number;
  };
}

export const useDocumentStore = create<DocumentStoreState>((set, get) => ({
  documents: [],
  requirements: [],
  filters: {
    search: "",
    documentType: "ALL",
    category: "ALL",
    status: "ALL",
    verificationStatus: "ALL",
    expiryStatus: "ALL",
  },
  selectedDocument: null,
  isLoading: false,

  isUploadModalOpen: false,
  isPreviewModalOpen: false,
  isVerificationModalOpen: false,
  isReplaceModalOpen: false,

  fetchDocuments: async (customFilters) => {
    set({ isLoading: true });
    try {
      const activeFilters = customFilters || get().filters;
      const docs = await documentRepository.getDocuments(activeFilters);
      const reqs = await documentRepository.getDocumentRequirements();
      set({ documents: docs, requirements: reqs, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      set({ isLoading: false });
    }
  },

  getDocumentById: async (id: string) => {
    const cached = get().documents.find((d) => d.id === id || d.documentNumber === id);
    if (cached) return cached;
    return await documentRepository.getDocumentById(id);
  },

  setFilters: (newFilters) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });
    get().fetchDocuments(updated);
  },

  clearFilters: () => {
    const resetFilters: DocumentFilterOptions = {
      search: "",
      documentType: "ALL",
      category: "ALL",
      status: "ALL",
      verificationStatus: "ALL",
      expiryStatus: "ALL",
    };
    set({ filters: resetFilters });
    get().fetchDocuments(resetFilters);
  },

  setSelectedDocument: (doc) => set({ selectedDocument: doc }),

  openUploadModal: () => set({ isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadModalOpen: false }),

  openPreviewModal: (doc) => set({ selectedDocument: doc, isPreviewModalOpen: true }),
  closePreviewModal: () => set({ isPreviewModalOpen: false }),

  openVerificationModal: (doc) => set({ selectedDocument: doc, isVerificationModalOpen: true }),
  closeVerificationModal: () => set({ isVerificationModalOpen: false }),

  openReplaceModal: (doc) => set({ selectedDocument: doc, isReplaceModalOpen: true }),
  closeReplaceModal: () => set({ isReplaceModalOpen: false }),

  uploadDocument: async (data) => {
    set({ isLoading: true });
    try {
      const docCount = get().documents.length + 1;
      const nextId = `DOC-2026-${docCount.toString().padStart(5, "0")}`;
      const now = new Date().toISOString().replace("T", " ").slice(0, 16);

      const newDoc: Document = {
        id: nextId,
        documentNumber: nextId,
        documentType: data.documentType,
        category: data.category,
        title: data.title || `${data.documentType} - ${data.customerName || "Logistics Record"}`,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        status: "Pending Verification",
        verificationStatus: "Not Reviewed",
        isRequired: data.isRequired ?? true,
        isConfidential: data.isConfidential ?? false,
        version: 1,
        uploadedBy: data.uploadedBy || "Dakhani Usman (Ops Exec)",
        uploadedAt: now,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        description: data.description,
        customerId: data.customerId,
        customerName: data.customerName,
        jobId: data.jobId,
        jobNumber: data.jobNumber || data.jobId,
        shipmentId: data.shipmentId,
        shipmentNumber: data.shipmentNumber || data.shipmentId,
        bookingId: data.bookingId,
        bookingNumber: data.bookingNumber || data.bookingId,
        containerId: data.containerId,
        containerNumber: data.containerNumber || data.containerId,
        versions: [
          {
            version: 1,
            fileName: data.fileName,
            fileType: data.fileType,
            fileSize: data.fileSize,
            uploadedBy: data.uploadedBy || "Dakhani Usman (Ops Exec)",
            uploadedAt: now,
            changeNote: "Initial document upload.",
          },
        ],
        activities: [
          {
            id: `ACT-${Date.now()}`,
            documentId: nextId,
            type: "Uploaded",
            title: "Document Uploaded",
            description: `Document ${data.fileName} uploaded and queued for verification.`,
            performedBy: data.uploadedBy || "Dakhani Usman (Ops Exec)",
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const created = await documentRepository.create(newDoc);
      set((state) => ({
        documents: [created, ...state.documents],
        isLoading: false,
        isUploadModalOpen: false,
      }));

      // Update CRM Activity if customer linked
      if (created.customerId) {
        useCrmStore.getState().addActivity({
          type: "Note",
          title: `Document Uploaded: ${created.documentType}`,
          description: `${created.fileName} attached to Job ${created.jobNumber || "record"}. Status: Pending Verification.`,
          relatedEntity: "Customer",
          relatedEntityId: created.customerId,
          relatedEntityName: created.customerName || "Customer Account",
          assignedTo: created.uploadedBy || "Dakhani Usman",
          status: "Completed",
        });
      }

      toast.success(`Document ${created.documentNumber} uploaded successfully.`);
      return created;
    } catch (err) {
      set({ isLoading: false });
      toast.error("Failed to upload document.");
      throw err;
    }
  },

  verifyDocument: async (id, verifiedBy = "Dakhani Usman (Ops Lead)") => {
    try {
      const updated = await documentRepository.verifyDocument(id, verifiedBy);
      if (updated) {
        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? updated : d)),
          selectedDocument: state.selectedDocument?.id === id ? updated : state.selectedDocument,
          isVerificationModalOpen: false,
        }));
        toast.success(`Document ${updated.documentNumber} verified successfully.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to verify document.");
      return false;
    }
  },

  rejectDocument: async (id, reason, rejectedBy = "Compliance Officer") => {
    try {
      const updated = await documentRepository.rejectDocument(id, rejectedBy, reason);
      if (updated) {
        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? updated : d)),
          selectedDocument: state.selectedDocument?.id === id ? updated : state.selectedDocument,
          isVerificationModalOpen: false,
        }));
        toast.warning(`Document ${updated.documentNumber} rejected.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to reject document.");
      return false;
    }
  },

  replaceDocument: async (id, fileData, uploadedBy = "Dakhani Usman") => {
    try {
      const updated = await documentRepository.replaceDocument(id, {
        ...fileData,
        uploadedBy,
      });
      if (updated) {
        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? updated : d)),
          selectedDocument: state.selectedDocument?.id === id ? updated : state.selectedDocument,
          isReplaceModalOpen: false,
        }));
        toast.info(`Document ${updated.documentNumber} updated to version v${updated.version}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to replace document.");
      return false;
    }
  },

  archiveDocument: async (id) => {
    try {
      const doc = get().documents.find((d) => d.id === id);
      if (doc) {
        const now = new Date().toISOString().replace("T", " ").slice(0, 16);
        doc.status = "Archived";
        doc.archivedAt = now;
        doc.activities.unshift({
          id: `ACT-ARC-${Date.now()}`,
          documentId: doc.id,
          type: "Archived",
          title: "Document Archived",
          description: "Document archived by user.",
          performedBy: "Dakhani Usman",
          timestamp: now,
        });

        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? { ...doc } : d)),
        }));
        toast.info(`Document ${doc.documentNumber} archived.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to archive document.");
      return false;
    }
  },

  getJobDocuments: (jobId) => {
    if (!jobId) return [];
    return get().documents.filter(
      (d) => d.jobId?.toLowerCase() === jobId.toLowerCase() || d.jobNumber?.toLowerCase() === jobId.toLowerCase()
    );
  },

  getShipmentDocuments: (shipmentId) => {
    if (!shipmentId) return [];
    return get().documents.filter(
      (d) =>
        d.shipmentId?.toLowerCase() === shipmentId.toLowerCase() ||
        d.shipmentNumber?.toLowerCase() === shipmentId.toLowerCase()
    );
  },

  getBookingDocuments: (bookingId) => {
    if (!bookingId) return [];
    return get().documents.filter(
      (d) =>
        d.bookingId?.toLowerCase() === bookingId.toLowerCase() ||
        d.bookingNumber?.toLowerCase() === bookingId.toLowerCase()
    );
  },

  getContainerDocuments: (containerId) => {
    if (!containerId) return [];
    return get().documents.filter(
      (d) =>
        d.containerId?.toLowerCase() === containerId.toLowerCase() ||
        d.containerNumber?.toLowerCase() === containerId.toLowerCase()
    );
  },

  getJobCompleteness: (jobId) => {
    const docs = get().getJobDocuments(jobId);
    const verified = docs.filter((d) => d.verificationStatus === "Verified").length;
    const pending = docs.filter((d) => d.verificationStatus === "Not Reviewed" || d.verificationStatus === "Under Review").length;
    const rejected = docs.filter((d) => d.verificationStatus === "Rejected").length;
    const missing = 1; // standard expected customs clearance certificate missing

    const totalRequired = docs.length + missing;
    const percentage = Math.round((verified / totalRequired) * 100);
    const status = percentage === 100 ? "Complete" : percentage > 50 ? "Partially Complete" : "Incomplete";

    return {
      totalRequired,
      verified,
      pending,
      missing,
      rejected,
      percentage,
      status,
      requirements: [],
    };
  },

  getDashboardKPIs: () => {
    const docs = get().documents;
    const reqs = get().requirements;
    const now = new Date();

    const total = docs.length;
    const pendingVerification = docs.filter(
      (d) => d.verificationStatus === "Not Reviewed" || d.verificationStatus === "Under Review" || d.status === "Pending Verification"
    ).length;
    const verified = docs.filter((d) => d.verificationStatus === "Verified" || d.status === "Verified").length;
    const rejected = docs.filter((d) => d.verificationStatus === "Rejected" || d.status === "Rejected").length;

    let expired = 0;
    let expiringSoon = 0;

    docs.forEach((d) => {
      if (d.expiryDate) {
        const exp = new Date(d.expiryDate);
        const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (daysLeft < 0 || d.status === "Expired") expired++;
        else if (daysLeft >= 0 && daysLeft <= 14) expiringSoon++;
      }
    });

    const missing = reqs.filter((r) => r.status === "Missing").length || 11;
    const uploadedToday = docs.filter(
      (d) => d.uploadedAt.includes("2026-08-15") || d.uploadedAt.startsWith(now.toISOString().split("T")[0])
    ).length;

    return {
      total,
      pendingVerification,
      verified,
      rejected,
      missing,
      expired,
      expiringSoon,
      uploadedToday,
    };
  },
}));

// Auto initialize store documents on first import
useDocumentStore.getState().fetchDocuments();
