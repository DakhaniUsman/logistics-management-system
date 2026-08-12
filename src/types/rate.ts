import { TransportMode } from "./common";

export type RateCategory =
  | "Ocean Freight"
  | "Air Freight"
  | "Road Transport"
  | "Rail Transport"
  | "Customs Clearance"
  | "Warehouse Handling"
  | "Documentation"
  | "Insurance"
  | "Other Charges";

export type RateStatus =
  | "Draft"
  | "Active"
  | "Expiring Soon"
  | "Expired"
  | "Suspended"
  | "Archived";

export type RateUnit =
  | "Per Container"
  | "Per KG"
  | "Per CBM"
  | "Per Shipment"
  | "Per Trip"
  | "Per Vehicle"
  | "Per Document"
  | "Flat Rate";

export interface Vendor {
  id: string;
  name: string;
  code: string;
  category: RateCategory;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number; // 1 to 5
}

export interface Carrier {
  id: string;
  name: string;
  code: string;
  type: "Shipping Line" | "Airline" | "Rail Operator";
}

export interface RateHistoryEntry {
  id: string;
  rateId: string;
  previousRate: number;
  newRate: number;
  changedBy: string;
  changedDate: string;
  reason: string;
}

export interface Rate {
  id: string;
  rateNumber: string;
  rateType: RateCategory;
  serviceType: string;
  vendorId: string;
  vendorName: string;
  carrierId?: string;
  carrierName?: string;
  origin: string;
  originCountry: string;
  destination: string;
  destinationCountry: string;
  transportMode: TransportMode;
  containerType?: string;
  containerSize?: string;
  rate: number;
  currency: string; // INR, USD, EUR
  unit: RateUnit;
  minimumCharge?: number;
  validFrom: string;
  validUntil: string;
  status: RateStatus;
  terms?: string;
  notes?: string;
  createdBy: string;
  updatedBy: string;
  history?: RateHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface SelectedCostComponent {
  rateId: string;
  rateNumber: string;
  category: RateCategory;
  vendorName: string;
  carrierName?: string;
  amount: number;
  currency: string;
  unit: RateUnit;
}

export interface CostComponentBasket {
  enquiryId: string;
  components: SelectedCostComponent[];
  totalEstimatedCost: number;
}
