export type QuotationStatus =
  | "Draft"
  | "Pending Approval"
  | "Sent"
  | "Viewed"
  | "Negotiation"
  | "Accepted"
  | "Rejected"
  | "Expired"
  | "Cancelled";

export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string; // e.g. Container, KG, CBM, Shipment
  unitPrice: number; // Customer selling unit price
  totalPrice: number; // quantity * unitPrice
  taxPercentage?: number;
  notes?: string;
  internalCostReference?: number; // confidential internal cost
}

export interface QuotationRevision {
  revisionNumber: number;
  createdAt: string;
  createdBy: string;
  reason: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  marginAmount: number;
}

export interface Quotation {
  id: string; // e.g. QT-2026-00125
  quotationNumber: string;
  enquiryId: string;
  enquiryNumber: string;
  customerId: string;
  customerName: string;
  companyId: string;
  contactId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  revisionNumber: number;
  status: QuotationStatus;
  validFrom: string;
  validUntil: string;
  currency: string; // INR, USD, EUR
  items: QuotationLineItem[];
  internalCost: number; // confidential internal vendor cost estimate
  marginType: "fixed" | "percentage";
  marginValue: number;
  marginAmount: number; // confidential margin in currency
  marginPercentage: number; // confidential margin %
  subtotal: number; // customer selling subtotal before discount
  discountType?: "fixed" | "percentage";
  discountValue?: number;
  discountAmount: number;
  taxableAmount: number;
  taxName: string; // e.g. GST
  taxPercentage: number; // e.g. 18
  taxAmount: number;
  grandTotal: number;
  paymentTerms: string; // e.g. Net 30 Days
  transitTime: string; // e.g. 7-9 Days
  incoterm: string; // e.g. FOB, CIF, DDP
  serviceType: string;
  origin: string;
  destination: string;
  transportMode: string;
  notes?: string;
  termsAndConditions: string;
  createdBy: string;
  approvedBy?: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  revisions?: QuotationRevision[];
  createdAt: string;
  updatedAt: string;
}
