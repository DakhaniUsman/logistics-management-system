import { JobPriority } from "./job";

export type ShipmentStatus =
  | "Draft"
  | "Scheduled"
  | "Booking Pending"
  | "Booked"
  | "Cargo Ready"
  | "Picked Up"
  | "In Transit"
  | "Arrived"
  | "Delivered"
  | "Delayed"
  | "Cancelled"
  | "Completed";

export type TransportMode = "Sea" | "Air" | "Road" | "Rail" | "Multimodal";

export type ShipmentMilestoneStatus =
  | "Pending"
  | "Upcoming"
  | "Completed"
  | "Delayed"
  | "Skipped";

export interface ShipmentMilestone {
  id: string;
  shipmentId: string;
  type: string;
  title: string;
  status: ShipmentMilestoneStatus;
  location?: string;
  plannedDate: string;
  actualDate?: string;
  description?: string;
  createdBy?: string;
}

export interface ShipmentActivity {
  id: string;
  shipmentId: string;
  type: string;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface ShipmentDocumentMeta {
  id: string;
  shipmentId: string;
  documentType: string;
  status: "Available" | "Pending" | "Missing" | "Approved";
  required: boolean;
}

export interface Shipment {
  id: string; // e.g. SHP-2026-00001
  shipmentNumber: string;
  jobId: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  companyId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  quotationId?: string;
  quotationNumber?: string;
  enquiryId?: string;
  enquiryNumber?: string;
  status: ShipmentStatus;
  priority?: JobPriority;
  transportMode: TransportMode;
  serviceType: string; // Port-to-Port, Door-to-Door, etc.
  
  // Route fields
  origin: string;
  destination: string;
  originCountry: string;
  destinationCountry: string;
  originPort?: string;
  destinationPort?: string;
  originAirport?: string;
  destinationAirport?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  originStation?: string;
  destinationStation?: string;

  // Carrier fields
  carrierId?: string;
  carrierName?: string; // Shipping Line / Airline / Transport Vendor
  vesselName?: string;
  voyageNumber?: string;
  flightNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  railOperator?: string;

  // Schedule & Dates
  etd: string; // Estimated Time of Departure
  eta: string; // Estimated Time of Arrival
  actualDeparture?: string;
  actualArrival?: string;
  pickupDate?: string;
  requiredDeliveryDate?: string;
  isDelayed?: boolean;
  delayDays?: number;
  delayReason?: string;

  // Cargo specs
  cargoDescription: string;
  cargoType: string; // General, Perishable, Hazardous, High Value, GDP Pharma
  quantity: number;
  quantityUnit: string; // Cartons, Pallets, Containers, Units
  weight: number;
  weightUnit: string; // KG, MT
  volume: number;
  volumeUnit: string; // CBM
  containerType?: string; // 20FT, 40FT HC, Reefer
  containerQuantity?: number;

  // Financial Estimates (inherited from Job)
  estimatedRevenue?: number;
  estimatedCost?: number;
  currency?: string;

  // Management
  assignedTo: string; // Operations Lead
  assignedDepartment?: string;
  specialRequirements?: string;
  notes?: string;

  // Embedded Sub-resources
  milestones?: ShipmentMilestone[];
  activities?: ShipmentActivity[];
  documents?: ShipmentDocumentMeta[];

  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
