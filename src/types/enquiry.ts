import { TransportMode } from "./common";

export type EnquiryStatus =
  | "New"
  | "Under Review"
  | "Information Required"
  | "Rate Pending"
  | "Ready for Quotation"
  | "Won"
  | "Lost"
  | "Cancelled";

export type EnquiryPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Urgent";

export type EnquirySource =
  | "Email"
  | "Phone"
  | "Website"
  | "Sales Team"
  | "Existing Customer"
  | "Referral"
  | "WhatsApp"
  | "Partner"
  | "Other";

export type CargoType =
  | "General Cargo"
  | "Consumer Electronics"
  | "Pharmaceuticals"
  | "Hazardous / Chemicals"
  | "Perishable / Cold Chain"
  | "Machinery & Equipment"
  | "Garments & Textiles"
  | "Auto Parts";

export type ServiceType =
  | "Freight Forwarding"
  | "Transportation"
  | "Customs Clearance"
  | "Warehousing"
  | "Door-to-Door"
  | "Port-to-Port"
  | "Door-to-Port"
  | "Port-to-Door"
  | "3PL / Fulfillment";

export interface Enquiry {
  id: string; // e.g. ENQ-2026-00125
  enquiryNumber: string;
  customerId: string;
  customerName: string;
  companyId: string;
  contactId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  source: EnquirySource;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  assignedTo: string;
  origin: string; // City / Port
  originCountry: string;
  destination: string; // City / Port
  destinationCountry: string;
  transportMode: TransportMode;
  serviceType: ServiceType;
  cargoType: CargoType;
  cargoDescription: string;
  quantity: number;
  quantityUnit: string;
  weightKg: number;
  volumeCbm: number;
  containerType: string;
  containerQuantity: number;
  pickupDate: string;
  requiredDeliveryDate: string;
  incoterm: string; // e.g. FOB, CIF, DDP, EXW
  specialRequirements?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
