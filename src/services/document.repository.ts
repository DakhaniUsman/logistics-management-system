import { MockBaseRepository } from "./base.repository";
import {
  Document,
  DocumentFilterOptions,
  DocumentRequirement,
  DocumentCompleteness,
} from "@/types/document";
import { MOCK_DOCUMENTS, MOCK_JOB_REQUIREMENTS } from "@/data/mock/document-data";

export class DocumentRepository extends MockBaseRepository<Document> {
  private requirements: DocumentRequirement[];

  constructor() {
    super(MOCK_DOCUMENTS, 100);
    this.requirements = [...MOCK_JOB_REQUIREMENTS];
  }

  async getDocuments(filters: DocumentFilterOptions = {}): Promise<Document[]> {
    await this.delay();
    let filtered = [...this.items];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.documentNumber.toLowerCase().includes(q) ||
          doc.title.toLowerCase().includes(q) ||
          doc.fileName.toLowerCase().includes(q) ||
          doc.documentType.toLowerCase().includes(q) ||
          (doc.customerName && doc.customerName.toLowerCase().includes(q)) ||
          (doc.jobNumber && doc.jobNumber.toLowerCase().includes(q)) ||
          (doc.shipmentNumber && doc.shipmentNumber.toLowerCase().includes(q)) ||
          (doc.bookingNumber && doc.bookingNumber.toLowerCase().includes(q)) ||
          (doc.containerNumber && doc.containerNumber.toLowerCase().includes(q))
      );
    }

    if (filters.documentType && filters.documentType !== "ALL") {
      filtered = filtered.filter((doc) => doc.documentType === filters.documentType);
    }

    if (filters.category && filters.category !== "ALL") {
      filtered = filtered.filter((doc) => doc.category === filters.category);
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }

    if (filters.verificationStatus && filters.verificationStatus !== "ALL") {
      filtered = filtered.filter((doc) => doc.verificationStatus === filters.verificationStatus);
    }

    if (filters.customerId) {
      filtered = filtered.filter((doc) => doc.customerId === filters.customerId);
    }

    if (filters.jobId) {
      filtered = filtered.filter(
        (doc) => doc.jobId?.toLowerCase() === filters.jobId?.toLowerCase()
      );
    }

    if (filters.shipmentId) {
      filtered = filtered.filter(
        (doc) => doc.shipmentId?.toLowerCase() === filters.shipmentId?.toLowerCase()
      );
    }

    if (filters.bookingId) {
      filtered = filtered.filter(
        (doc) => doc.bookingId?.toLowerCase() === filters.bookingId?.toLowerCase()
      );
    }

    if (filters.containerId) {
      filtered = filtered.filter(
        (doc) =>
          doc.containerId?.toLowerCase() === filters.containerId?.toLowerCase() ||
          doc.containerNumber?.toLowerCase() === filters.containerId?.toLowerCase()
      );
    }

    if (filters.uploadedBy) {
      filtered = filtered.filter((doc) => doc.uploadedBy === filters.uploadedBy);
    }

    if (filters.expiryStatus && filters.expiryStatus !== "ALL") {
      const now = new Date();
      filtered = filtered.filter((doc) => {
        if (!doc.expiryDate) return false;
        const exp = new Date(doc.expiryDate);
        const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (filters.expiryStatus === "Expired") return daysLeft < 0 || doc.status === "Expired";
        if (filters.expiryStatus === "Expiring Soon") return daysLeft >= 0 && daysLeft <= 14;
        if (filters.expiryStatus === "Valid") return daysLeft > 14;
        return true;
      });
    }

    return filtered;
  }

  async getDocumentById(id: string): Promise<Document | null> {
    await this.delay();
    return (
      this.items.find(
        (doc) => doc.id.toLowerCase() === id.toLowerCase() || doc.documentNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  async verifyDocument(id: string, verifiedBy: string): Promise<Document | null> {
    await this.delay();
    const doc = this.items.find((d) => d.id === id || d.documentNumber === id);
    if (!doc) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    doc.verificationStatus = "Verified";
    doc.status = "Verified";
    doc.verifiedBy = verifiedBy;
    doc.verifiedAt = now;
    doc.updatedAt = now;

    doc.activities.unshift({
      id: `ACT-VER-${Date.now()}`,
      documentId: doc.id,
      type: "Verified",
      title: "Document Verified",
      description: `Document compliance verified by ${verifiedBy}.`,
      performedBy: verifiedBy,
      timestamp: now,
    });

    // Update requirement status if linked
    const req = this.requirements.find((r) => r.documentId === doc.id || (r.jobId === doc.jobId && r.documentType === doc.documentType));
    if (req) {
      req.status = "Verified";
      req.documentId = doc.id;
    }

    return { ...doc };
  }

  async rejectDocument(id: string, rejectedBy: string, reason: string): Promise<Document | null> {
    await this.delay();
    const doc = this.items.find((d) => d.id === id || d.documentNumber === id);
    if (!doc) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    doc.verificationStatus = "Rejected";
    doc.status = "Rejected";
    doc.rejectedBy = rejectedBy;
    doc.rejectedAt = now;
    doc.rejectionReason = reason;
    doc.updatedAt = now;

    doc.activities.unshift({
      id: `ACT-REJ-${Date.now()}`,
      documentId: doc.id,
      type: "Rejected",
      title: "Document Rejected",
      description: `Rejected by ${rejectedBy}: "${reason}"`,
      performedBy: rejectedBy,
      timestamp: now,
    });

    // Update requirement status if linked
    const req = this.requirements.find((r) => r.documentId === doc.id || (r.jobId === doc.jobId && r.documentType === doc.documentType));
    if (req) {
      req.status = "Rejected";
    }

    return { ...doc };
  }

  async replaceDocument(
    id: string,
    replacementData: {
      fileName: string;
      fileType: string;
      fileSize: number;
      uploadedBy: string;
      reason?: string;
    }
  ): Promise<Document | null> {
    await this.delay();
    const doc = this.items.find((d) => d.id === id || d.documentNumber === id);
    if (!doc) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);

    // Save previous version to history
    doc.versions.unshift({
      version: doc.version,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      fileUrl: doc.fileUrl,
      uploadedBy: doc.uploadedBy,
      uploadedAt: doc.uploadedAt,
      changeNote: replacementData.reason || "Replaced by user.",
    });

    doc.version += 1;
    doc.fileName = replacementData.fileName;
    doc.fileType = replacementData.fileType;
    doc.fileSize = replacementData.fileSize;
    doc.uploadedBy = replacementData.uploadedBy;
    doc.uploadedAt = now;
    doc.status = "Pending Verification";
    doc.verificationStatus = "Not Reviewed";
    doc.verifiedBy = undefined;
    doc.verifiedAt = undefined;
    doc.rejectedBy = undefined;
    doc.rejectedAt = undefined;
    doc.rejectionReason = undefined;
    doc.updatedAt = now;

    doc.activities.unshift({
      id: `ACT-REP-${Date.now()}`,
      documentId: doc.id,
      type: "Replaced",
      title: `Document Replaced (v${doc.version})`,
      description: `Replaced with ${replacementData.fileName}. Reason: ${replacementData.reason || "N/A"}`,
      performedBy: replacementData.uploadedBy,
      timestamp: now,
    });

    return { ...doc };
  }

  async getDocumentRequirements(jobId?: string, shipmentId?: string): Promise<DocumentRequirement[]> {
    await this.delay();
    let result = [...this.requirements];
    if (jobId) {
      result = result.filter((r) => r.jobId?.toLowerCase() === jobId.toLowerCase());
    }
    if (shipmentId) {
      result = result.filter((r) => r.shipmentId?.toLowerCase() === shipmentId.toLowerCase());
    }
    return result;
  }

  async getDocumentCompleteness(jobId?: string, shipmentId?: string): Promise<DocumentCompleteness> {
    await this.delay();
    const reqs = await this.getDocumentRequirements(jobId, shipmentId);
    
    // Also include mandatory documents attached to job if any missing in requirements array
    const jobDocs = this.items.filter((d) => (jobId && d.jobId?.toLowerCase() === jobId.toLowerCase()) || (shipmentId && d.shipmentId?.toLowerCase() === shipmentId.toLowerCase()));

    let verified = 0;
    let pending = 0;
    let missing = 0;
    let rejected = 0;

    reqs.forEach((r) => {
      if (r.status === "Verified") verified++;
      else if (r.status === "Pending Verification" || r.status === "Uploaded") pending++;
      else if (r.status === "Rejected") rejected++;
      else if (r.status === "Missing") missing++;
    });

    const total = reqs.length || jobDocs.length || 1;
    if (reqs.length === 0 && jobDocs.length > 0) {
      jobDocs.forEach((d) => {
        if (d.verificationStatus === "Verified") verified++;
        else if (d.verificationStatus === "Rejected") rejected++;
        else pending++;
      });
    }

    const totalRequired = reqs.length || jobDocs.length;
    const percentage = totalRequired > 0 ? Math.round((verified / totalRequired) * 100) : 100;
    const status = percentage === 100 ? "Complete" : percentage > 50 ? "Partially Complete" : "Incomplete";

    return {
      totalRequired,
      verified,
      pending,
      missing,
      rejected,
      percentage,
      status,
      requirements: reqs,
    };
  }

  async getDashboardKPIs() {
    await this.delay();
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const total = this.items.length;
    const pendingVerification = this.items.filter(
      (d) => d.verificationStatus === "Not Reviewed" || d.verificationStatus === "Under Review" || d.status === "Pending Verification"
    ).length;
    const verified = this.items.filter((d) => d.verificationStatus === "Verified" || d.status === "Verified").length;
    const rejected = this.items.filter((d) => d.verificationStatus === "Rejected" || d.status === "Rejected").length;
    
    let expired = 0;
    let expiringSoon = 0;

    this.items.forEach((d) => {
      if (d.expiryDate) {
        const exp = new Date(d.expiryDate);
        const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (daysLeft < 0 || d.status === "Expired") expired++;
        else if (daysLeft >= 0 && daysLeft <= 14) expiringSoon++;
      }
    });

    const missing = this.requirements.filter((r) => r.status === "Missing").length;
    const uploadedToday = this.items.filter((d) => d.uploadedAt.startsWith(todayStr) || d.uploadedAt.includes("2026-08-15")).length;

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
  }
}

export const documentRepository = new DocumentRepository();
