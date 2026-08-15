import { MockBaseRepository } from "./base.repository";
import {
  CustomsDeclaration,
  CustomsFilterOptions,
  CustomsStatus,
  CustomsQuery,
  CustomsExamination,
} from "@/types/customs";
import { MOCK_CUSTOMS_DECLARATIONS } from "@/data/mock/customs-data";

export class CustomsRepository extends MockBaseRepository<CustomsDeclaration> {
  constructor() {
    super(MOCK_CUSTOMS_DECLARATIONS, 100);
  }

  async getCustomsDeclarations(filters: CustomsFilterOptions = {}): Promise<CustomsDeclaration[]> {
    await this.delay();
    let filtered = [...this.items];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (dec) =>
          dec.declarationNumber.toLowerCase().includes(q) ||
          (dec.jobNumber && dec.jobNumber.toLowerCase().includes(q)) ||
          (dec.shipmentNumber && dec.shipmentNumber.toLowerCase().includes(q)) ||
          (dec.customerName && dec.customerName.toLowerCase().includes(q)) ||
          (dec.customsOffice && dec.customsOffice.toLowerCase().includes(q)) ||
          (dec.brokerName && dec.brokerName.toLowerCase().includes(q)) ||
          dec.containerNumbers.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (filters.customsType && filters.customsType !== "ALL") {
      filtered = filtered.filter((dec) => dec.customsType === filters.customsType);
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((dec) => dec.status === filters.status);
    }

    if (filters.customerId) {
      filtered = filtered.filter((dec) => dec.customerId === filters.customerId);
    }

    if (filters.jobId) {
      filtered = filtered.filter(
        (dec) => dec.jobId?.toLowerCase() === filters.jobId?.toLowerCase() || dec.jobNumber?.toLowerCase() === filters.jobId?.toLowerCase()
      );
    }

    if (filters.shipmentId) {
      filtered = filtered.filter(
        (dec) => dec.shipmentId?.toLowerCase() === filters.shipmentId?.toLowerCase() || dec.shipmentNumber?.toLowerCase() === filters.shipmentId?.toLowerCase()
      );
    }

    if (filters.containerId) {
      filtered = filtered.filter((dec) =>
        dec.containerIds.some((id) => id.toLowerCase() === filters.containerId?.toLowerCase()) ||
        dec.containerNumbers.some((num) => num.toLowerCase() === filters.containerId?.toLowerCase())
      );
    }

    if (filters.customsOffice) {
      filtered = filtered.filter((dec) => dec.customsOffice === filters.customsOffice);
    }

    if (filters.brokerId) {
      filtered = filtered.filter((dec) => dec.brokerId === filters.brokerId);
    }

    if (filters.dutyStatus && filters.dutyStatus !== "ALL") {
      filtered = filtered.filter((dec) => dec.dutyPaymentStatus === filters.dutyStatus);
    }

    return filtered;
  }

  async getCustomsDeclarationById(id: string): Promise<CustomsDeclaration | null> {
    await this.delay();
    return (
      this.items.find(
        (dec) => dec.id.toLowerCase() === id.toLowerCase() || dec.declarationNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  async fileDeclaration(id: string, filedBy: string): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === id || d.declarationNumber === id);
    if (!dec) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    dec.status = "Filed";
    dec.filingDate = now;
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-FILE-${Date.now()}`,
      declarationId: dec.id,
      type: "Filing",
      title: "Declaration Filed",
      description: `Customs declaration ${dec.declarationNumber} submitted to ${dec.customsOffice}.`,
      performedBy: filedBy,
      timestamp: now,
    });

    const milestone = dec.milestones.find((m) => m.title.includes("Filed"));
    if (milestone) {
      milestone.status = "Completed";
      milestone.timestamp = now;
      milestone.completedBy = filedBy;
    }

    return { ...dec };
  }

  async markDutyPaid(id: string, paymentRef: string, paidBy: string): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === id || d.declarationNumber === id);
    if (!dec) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    dec.dutyPaymentStatus = "Paid";
    dec.paymentReference = paymentRef;
    dec.paymentDate = now;
    dec.status = dec.status === "Duty Pending" ? "Duty Paid" : dec.status;
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-DUTY-${Date.now()}`,
      declarationId: dec.id,
      type: "DutyPaid",
      title: "Customs Duty Paid",
      description: `Duty payload ₹${dec.totalPayable.toLocaleString()} confirmed via ref ${paymentRef}.`,
      performedBy: paidBy,
      timestamp: now,
    });

    return { ...dec };
  }

  async scheduleExamination(
    id: string,
    examData: { date: string; location: string; examiner: string; remarks?: string },
    scheduledBy: string
  ): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === id || d.declarationNumber === id);
    if (!dec) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    dec.status = "Examination Required";
    dec.examinationDate = examData.date;
    dec.examination = {
      id: `EXM-${Date.now()}`,
      declarationId: dec.id,
      examinationDate: examData.date,
      examinationLocation: examData.location,
      examinerName: examData.examiner,
      result: "Pending",
      remarks: examData.remarks,
    };
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-EXM-${Date.now()}`,
      declarationId: dec.id,
      type: "Examination",
      title: "Physical Examination Scheduled",
      description: `Scheduled at ${examData.location} on ${examData.date} by examiner ${examData.examiner}.`,
      performedBy: scheduledBy,
      timestamp: now,
    });

    return { ...dec };
  }

  async completeExamination(
    id: string,
    result: "Passed" | "Issues Found",
    remarks: string,
    completedBy: string
  ): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === id || d.declarationNumber === id);
    if (!dec || !dec.examination) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    dec.examination.result = result;
    dec.examination.remarks = remarks;
    dec.examination.completedAt = now;

    if (result === "Passed") {
      dec.status = "Duty Pending";
    } else {
      dec.status = "Query Raised";
    }
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-EXM-CMP-${Date.now()}`,
      declarationId: dec.id,
      type: "ExaminationResult",
      title: `Examination Completed: ${result}`,
      description: `Result: ${result}. Remarks: ${remarks}`,
      performedBy: completedBy,
      timestamp: now,
    });

    return { ...dec };
  }

  async raiseQuery(
    id: string,
    queryData: { title: string; description: string; priority: any },
    raisedBy: string
  ): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === id || d.declarationNumber === id);
    if (!dec) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const qCount = dec.queries.length + 1;

    const newQuery: CustomsQuery = {
      id: `QRY-${Date.now()}`,
      declarationId: dec.id,
      queryNumber: `QRY-CUS-${qCount.toString().padStart(3, "0")}`,
      raisedDate: now,
      title: queryData.title,
      description: queryData.description,
      priority: queryData.priority || "High",
      status: "Open",
    };

    dec.queries.unshift(newQuery);
    dec.status = "Query Raised";
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-QRY-${Date.now()}`,
      declarationId: dec.id,
      type: "Query",
      title: `Customs Query Raised (${newQuery.queryNumber})`,
      description: queryData.title,
      performedBy: raisedBy,
      timestamp: now,
    });

    return { ...dec };
  }

  async respondToQuery(
    declarationId: string,
    queryId: string,
    response: string,
    attachedDocumentId?: string,
    respondedBy: string = "Dakhani Usman"
  ): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === declarationId || d.declarationNumber === declarationId);
    if (!dec) return null;

    const query = dec.queries.find((q) => q.id === queryId || q.queryNumber === queryId);
    if (!query) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    query.status = "Responded";
    query.response = response;
    query.respondedDate = now;
    query.respondedBy = respondedBy;
    query.attachedDocumentId = attachedDocumentId;

    dec.status = "Under Assessment";
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-QRY-RES-${Date.now()}`,
      declarationId: dec.id,
      type: "QueryResponded",
      title: `Query Response Submitted (${query.queryNumber})`,
      description: response,
      performedBy: respondedBy,
      timestamp: now,
    });

    return { ...dec };
  }

  async clearDeclaration(id: string, clearedBy: string): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === id || d.declarationNumber === id);
    if (!dec) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    dec.status = "Cleared";
    dec.clearanceDate = now;
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-CLR-${Date.now()}`,
      declarationId: dec.id,
      type: "Cleared",
      title: "Customs Out of Charge Granted",
      description: `Declaration ${dec.declarationNumber} cleared by customs authority.`,
      performedBy: clearedBy,
      timestamp: now,
    });

    return { ...dec };
  }

  async releaseDeclaration(id: string, releasedBy: string): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === id || d.declarationNumber === id);
    if (!dec) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    dec.status = "Released";
    dec.releaseDate = now;
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-REL-${Date.now()}`,
      declarationId: dec.id,
      type: "Released",
      title: "Cargo Released from Customs",
      description: "Gate pass issued and cargo released for transport dispatch.",
      performedBy: releasedBy,
      timestamp: now,
    });

    return { ...dec };
  }

  async putOnHold(id: string, reason: string, putBy: string): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === id || d.declarationNumber === id);
    if (!dec) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    dec.status = "On Hold";
    dec.holdReason = reason;
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-HLD-${Date.now()}`,
      declarationId: dec.id,
      type: "OnHold",
      title: "Declaration Placed On Hold",
      description: `Hold reason: ${reason}`,
      performedBy: putBy,
      timestamp: now,
    });

    return { ...dec };
  }

  async resumeProcessing(id: string, resumedBy: string): Promise<CustomsDeclaration | null> {
    await this.delay();
    const dec = this.items.find((d) => d.id === id || d.declarationNumber === id);
    if (!dec) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    dec.status = "Under Assessment";
    dec.holdReason = undefined;
    dec.updatedAt = now;

    dec.activities.unshift({
      id: `ACT-RES-${Date.now()}`,
      declarationId: dec.id,
      type: "Resumed",
      title: "Customs Hold Released — Processing Resumed",
      description: "Processing resumed after resolving hold condition.",
      performedBy: resumedBy,
      timestamp: now,
    });

    return { ...dec };
  }

  async getDashboardKPIs() {
    await this.delay();
    const total = this.items.length;
    const draft = this.items.filter((d) => d.status === "Draft").length;
    const documentsPending = this.items.filter((d) => d.status === "Documents Pending").length;
    const filed = this.items.filter((d) => d.status === "Filed").length;
    const underAssessment = this.items.filter((d) => d.status === "Under Assessment").length;
    const examination = this.items.filter((d) => d.status === "Examination Required").length;
    const queryRaised = this.items.filter((d) => d.status === "Query Raised").length;
    const dutyPending = this.items.filter((d) => d.status === "Duty Pending" || (d.dutyPaymentStatus === "Pending" && d.totalPayable > 0)).length;
    const cleared = this.items.filter((d) => d.status === "Cleared" || d.status === "Released").length;
    const onHold = this.items.filter((d) => d.status === "On Hold").length;

    const totalDutyPendingAmount = this.items
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
  }
}

export const customsRepository = new CustomsRepository();
