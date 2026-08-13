import { TransportMode } from "./shipment";

export type ContainerStatus =
  | "Available"
  | "Assigned"
  | "Empty"
  | "Picked Up"
  | "At Origin"
  | "Gate In"
  | "Loaded"
  | "Departed"
  | "In Transit"
  | "At Destination"
  | "Customs Hold"
  | "Released"
  | "Out for Delivery"
  | "Delivered"
  | "Empty Return Pending"
  | "Returned"
  | "Damaged"
  | "Lost";

export type ContainerCondition =
  | "Good"
  | "Minor Damage"
  | "Damaged"
  | "Critical Damage"
  | "Inspection Required";

export type SealStatus =
  | "Not Assigned"
  | "Assigned"
  | "Verified"
  | "Broken"
  | "Replaced";

export type ContainerMilestoneStatus =
  | "Pending"
  | "Upcoming"
  | "Completed"
  | "Delayed"
  | "Skipped";

export interface ContainerMilestone {
  id: string;
  containerId: string;
  type: string; // "Assigned" | "Empty Picked Up" | "Gate In" | "Loaded" | "Departed" | "In Transit" | "Arrived" | "Delivered" | "Empty Returned"
  title: string;
  status: ContainerMilestoneStatus;
  location: string;
  plannedDate?: string;
  actualDate?: string;
  description?: string;
  createdBy?: string;
}

export interface ContainerActivity {
  id: string;
  containerId: string;
  type: string; // "Created" | "Assigned" | "Status Changed" | "Location Updated" | "Seal Assigned" | "Seal Changed" | "Condition Updated" | "Weight Updated" | "Milestone Updated"
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface SealHistory {
  id: string;
  containerId: string;
  oldSealNumber: string;
  newSealNumber: string;
  status: SealStatus;
  changedAt: string;
  changedBy: string;
  reason: string;
}

export interface Container {
  id: string; // internal unique system ID, e.g. CON-2026-00001
  containerNumber: string; // standard physical container number, e.g. MSCU1234567
  shipmentId: string; // parent shipment reference
  bookingId: string; // parent booking reference
  jobId: string; // parent job reference
  customerId: string; // parent customer account
  customerName: string;
  containerType: "Dry Van" | "Reefer" | "Open Top" | "Flat Rack" | "Tank" | "High Cube";
  containerSize: "20FT" | "40FT" | "40FT HC" | "45FT";
  isoCode: string; // e.g. 22G1, 42G1, 45G1, 45R1
  status: ContainerStatus;
  sealNumber?: string;
  sealStatus: SealStatus;
  tareWeight: number; // in KG
  maxGrossWeight: number; // in KG (Max capacity)
  cargoWeight: number; // in KG (Payload)
  // Current Gross = tareWeight + cargoWeight
  volume: number; // in CBM
  currentLocation: string;
  currentCountry: string;
  origin: string;
  destination: string;
  
  // Important Dates
  gateInDate?: string;
  loadedDate?: string;
  departureDate?: string;
  arrivalDate?: string;
  deliveryDate?: string;
  emptyReturnDate?: string;

  condition: ContainerCondition;
  assignedTo: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  activities: ContainerActivity[];
  milestones: ContainerMilestone[];
  sealHistory: SealHistory[];
}
