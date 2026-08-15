export type DocumentCategory =
  | "Commercial"
  | "Shipping"
  | "Compliance"
  | "Customs"
  | "Transport"
  | "Warehouse"
  | "Container"
  | "Delivery"
  | "Customer"
  | "Internal"
  | "Other";

export type DocumentType =
  // Commercial
  | "Commercial Invoice"
  | "Purchase Order"
  | "Sales Order"
  | "Quotation"
  | "Contract"
  // Shipping
  | "Bill of Lading"
  | "Air Waybill"
  | "Packing List"
  | "Shipping Instruction"
  | "Booking Confirmation"
  | "Delivery Order"
  // Compliance
  | "Certificate of Origin"
  | "Insurance Certificate"
  | "Inspection Certificate"
  | "Permit"
  // Customs
  | "Customs Declaration"
  | "Customs Clearance Certificate"
  // Container
  | "Container Release"
  | "Equipment Interchange Receipt"
  | "Seal Record"
  | "Inspection Report"
  // Delivery
  | "Proof of Delivery"
  // Other
  | "Other";

export type DocumentStatus =
  | "Uploaded"
  | "Pending Verification"
  | "Verified"
  | "Rejected"
  | "Expired"
  | "Archived"
  | "Missing";

export type VerificationStatus =
  | "Not Reviewed"
  | "Under Review"
  | "Verified"
  | "Rejected";

export interface DocumentVersion {
  version: number;
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  changeNote?: string;
}

export interface DocumentActivity {
  id: string;
  documentId: string;
  type:
  | "Created"
  | "Uploaded"
  | "Verified"
  | "Rejected"
  | "Replaced"
  | "Downloaded"
  | "Archived"
  | "RelationshipUpdated"
  | "ExpiryUpdated";
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface Document {
  id: string; // e.g. DOC-2026-00125
  documentNumber: string; // e.g. DOC-2026-00125
  documentType: DocumentType;
  category: DocumentCategory;
  title: string;
  fileName: string;
  fileType: string; // "PDF" | "PNG" | "JPG" | "JPEG" | "XLSX" | "XLS" | "DOCX"
  fileSize: number; // e.g. 2450000 bytes
  fileUrl?: string;
  status: DocumentStatus;
  verificationStatus: VerificationStatus;
  isRequired: boolean;
  isConfidential: boolean;
  version: number;

  uploadedBy: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  issueDate?: string;
  expiryDate?: string;
  description?: string;
  tags?: string[];

  // Hierarchical Entity Relationships (Optional)
  customerId?: string;
  customerName?: string;
  enquiryId?: string;
  enquiryNumber?: string;
  quotationId?: string;
  quotationNumber?: string;
  jobId?: string;
  jobNumber?: string;
  shipmentId?: string;
  shipmentNumber?: string;
  bookingId?: string;
  bookingNumber?: string;
  containerId?: string;
  containerNumber?: string;

  // Sub-resources
  versions: DocumentVersion[];
  activities: DocumentActivity[];

  // Audit
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;

  // Extensibility for future AI metadata (Phase 11+)
  extractionStatus?: "Pending" | "Extracted" | "Failed";
  verificationConfidence?: number;
}

export interface DocumentRequirement {
  id: string;
  jobId?: string;
  jobNumber?: string;
  shipmentId?: string;
  shipmentNumber?: string;
  customerName?: string;
  documentType: DocumentType;
  category: DocumentCategory;
  isRequired: boolean;
  status: "Missing" | "Uploaded" | "Pending Verification" | "Verified" | "Rejected" | "Not Applicable";
  dueDate?: string;
  notes?: string;
  documentId?: string;
}

export interface DocumentCompleteness {
  totalRequired: number;
  verified: number;
  pending: number;
  missing: number;
  rejected: number;
  percentage: number;
  status: "Complete" | "Partially Complete" | "Incomplete";
  requirements: DocumentRequirement[];
}

export interface DocumentFilterOptions {
  search?: string;
  documentType?: DocumentType | "ALL";
  category?: DocumentCategory | "ALL";
  status?: DocumentStatus | "ALL";
  verificationStatus?: VerificationStatus | "ALL";
  customerId?: string;
  jobId?: string;
  shipmentId?: string;
  bookingId?: string;
  containerId?: string;
  uploadedBy?: string;
  expiryStatus?: "ALL" | "Valid" | "Expiring Soon" | "Expired";
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  "Commercial",
  "Shipping",
  "Compliance",
  "Customs",
  "Transport",
  "Warehouse",
  "Container",
  "Delivery",
  "Customer",
  "Internal",
  "Other",
];

export const DOCUMENT_TYPES: { type: DocumentType; category: DocumentCategory }[] = [
  // Commercial
  { type: "Commercial Invoice", category: "Commercial" },
  { type: "Purchase Order", category: "Commercial" },
  { type: "Sales Order", category: "Commercial" },
  { type: "Quotation", category: "Commercial" },
  { type: "Contract", category: "Commercial" },

  // Shipping
  { type: "Bill of Lading", category: "Shipping" },
  { type: "Air Waybill", category: "Shipping" },
  { type: "Packing List", category: "Shipping" },
  { type: "Shipping Instruction", category: "Shipping" },
  { type: "Booking Confirmation", category: "Shipping" },
  { type: "Delivery Order", category: "Shipping" },

  // Compliance
  { type: "Certificate of Origin", category: "Compliance" },
  { type: "Insurance Certificate", category: "Compliance" },
  { type: "Inspection Certificate", category: "Compliance" },
  { type: "Permit", category: "Compliance" },

  // Customs
  { type: "Customs Declaration", category: "Customs" },
  { type: "Customs Clearance Certificate", category: "Customs" },

  // Container
  { type: "Container Release", category: "Container" },
  { type: "Equipment Interchange Receipt", category: "Container" },
  { type: "Seal Record", category: "Container" },
  { type: "Inspection Report", category: "Container" },

  // Delivery
  { type: "Proof of Delivery", category: "Delivery" },

  // Other
  { type: "Other", category: "Other" },
]; 
