export type CustomsType = "Import" | "Export" | "Transit";
export type CustomsDirection = "Inbound" | "Outbound";

export type CustomsStatus =
  | "Draft"
  | "Documents Pending"
  | "Ready to File"
  | "Filed"
  | "Under Assessment"
  | "Examination Required"
  | "Query Raised"
  | "Duty Pending"
  | "Duty Paid"
  | "Cleared"
  | "Released"
  | "On Hold"
  | "Cancelled";

export type DutyPaymentStatus = "Not Applicable" | "Pending" | "Paid";
export type ExaminationResult = "Pending" | "Passed" | "Issues Found";
export type QueryStatus = "Open" | "In Progress" | "Responded" | "Resolved" | "Rejected";
export type QueryPriority = "Low" | "Medium" | "High" | "Critical";

export interface CustomsQuery {
  id: string;
  declarationId: string;
  queryNumber: string;
  raisedDate: string;
  title: string;
  description: string;
  priority: QueryPriority;
  status: QueryStatus;
  response?: string;
  respondedDate?: string;
  respondedBy?: string;
  attachedDocumentId?: string;
}

export interface CustomsExamination {
  id: string;
  declarationId: string;
  examinationDate: string;
  examinationLocation: string;
  examinerName: string;
  result: ExaminationResult;
  remarks?: string;
  completedAt?: string;
}

export interface CustomsActivity {
  id: string;
  declarationId: string;
  type: string;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface CustomsMilestone {
  id: string;
  title: string;
  status: "Pending" | "Completed" | "Delayed" | "Skipped";
  timestamp?: string;
  completedBy?: string;
}

export interface CustomsDeclaration {
  id: string; // e.g. CUS-2026-00125
  declarationNumber: string; // e.g. CUS-2026-00125
  customsType: CustomsType;
  direction: CustomsDirection;
  status: CustomsStatus;

  // Hierarchical Entity Linkages
  jobId: string;
  jobNumber: string;
  shipmentId: string;
  shipmentNumber: string;
  bookingId?: string;
  bookingNumber?: string;
  containerIds: string[];
  containerNumbers: string[];

  // Parties & Customs Authority
  customerId: string;
  customerName: string;
  brokerId?: string;
  brokerName?: string;
  customsOffice: string;
  portOfEntry: string;
  portOfExit: string;
  countryOfOrigin: string;
  countryOfDestination: string;

  // Financial Assessment
  currency: string; // "INR" | "USD" | "EUR" | "GBP" | "AED" | "SGD"
  invoiceValue: number;
  freightValue: number;
  insuranceValue: number;
  customsValue: number;
  dutyAmount: number;
  taxAmount: number;
  otherCharges: number;
  totalPayable: number;
  dutyPaymentStatus: DutyPaymentStatus;
  paymentReference?: string;
  paymentDate?: string;

  // Dates
  filingDate?: string;
  assessmentDate?: string;
  examinationDate?: string;
  clearanceDate?: string;
  releaseDate?: string;
  expectedClearanceDate?: string;
  isDelayed?: boolean;
  delayDays?: number;

  // Management & Audit
  assignedTo: string;
  holdReason?: string;
  remarks?: string;

  // Sub-resources
  queries: CustomsQuery[];
  examination?: CustomsExamination;
  milestones: CustomsMilestone[];
  activities: CustomsActivity[];

  createdAt: string;
  updatedAt: string;
}

export interface CustomsFilterOptions {
  search?: string;
  customsType?: CustomsType | "ALL";
  status?: CustomsStatus | "ALL";
  customerId?: string;
  jobId?: string;
  shipmentId?: string;
  containerId?: string;
  customsOffice?: string;
  brokerId?: string;
  assignedTo?: string;
  dutyStatus?: DutyPaymentStatus | "ALL";
}

export const CUSTOMS_TYPES: CustomsType[] = ["Import", "Export", "Transit"];

export const CUSTOMS_CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];

export const MOCK_BROKERS = [
  { id: "BRK-001", name: "Nhava Sheva Customs Clearing Agency", contactPerson: "Suresh Patil" },
  { id: "BRK-002", name: "Apex Global Cargo Clearance Ltd", contactPerson: "Rohan Malhotra" },
  { id: "BRK-003", name: "Frankfurt Airport Customs Brokerage GmbH", contactPerson: "Hans Weber" },
  { id: "BRK-004", name: "Dubai Port Clearance Services", contactPerson: "Tariq Al-Mansoor" },
];

export const MOCK_CUSTOMS_OFFICES = [
  "Nhava Sheva Customs (JNPT), Mumbai",
  "Air Cargo Complex (ACC), BOM Airport",
  "Jebel Ali Port Customs, Dubai",
  "Frankfurt Airport Customs Authority (FRA)",
  "Chennai Sea Port Customs",
  "Delhi ICD Tughlakabad Customs",
];
