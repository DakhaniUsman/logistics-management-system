import { TransportMode } from "./shipment";

export type BookingStatus =
  | "Draft"
  | "Requested"
  | "Pending Confirmation"
  | "Confirmed"
  | "Amendment Requested"
  | "Amended"
  | "Rejected"
  | "Cancelled"
  | "Completed";

export interface BookingAmendment {
  id: string;
  bookingId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  reason: string;
}

export interface BookingActivity {
  id: string;
  bookingId: string;
  type: string; // "Created" | "Submitted" | "Confirmed" | "Amended" | "Cancelled" | etc.
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface Booking {
  id: string; // e.g. BKG-2026-00001
  bookingNumber: string;
  shipmentId: string;
  jobId: string;
  customerId: string;
  customerName: string;
  carrierId: string;
  carrierName: string; // MSC, Maersk, Qatar Cargo, Emirates SkyCargo, etc.
  bookingReference?: string; // External Carrier Reference, e.g. MSC-BKG-849302
  status: BookingStatus;
  transportMode: TransportMode;
  serviceType: string; // Port-to-Port, Door-to-Door, Airport-to-Airport, etc.
  
  // Route details
  origin: string;
  destination: string;
  originPort?: string;
  destinationPort?: string;
  originAirport?: string;
  destinationAirport?: string;
  originStation?: string;
  destinationStation?: string;
  pickupLocation?: string;
  deliveryLocation?: string;

  // Mode-specific equipment / transportation details
  vesselName?: string;
  voyageNumber?: string;
  flightNumber?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  railOperator?: string;
  trainNumber?: string;

  // Schedules
  requestedDate: string;
  confirmationDate?: string;
  etd: string; // Estimated Time of Departure / Pickup Date
  eta: string; // Estimated Time of Arrival / Delivery Date
  pickupDate?: string; // For road
  deliveryDate?: string; // For road

  // Capacity / Cargo Details
  cargoDescription: string;
  cargoType?: string;
  quantity: number;
  quantityUnit: string;
  weight: number;
  weightUnit: string; // KG, MT
  volume: number;
  volumeUnit: string; // CBM
  containerType?: string; // 20FT, 40FT, 40FT HC, Reefer, Truck, etc.
  containerQuantity?: number;
  equipmentType?: string; // 40FT, Truck, Wagon, etc.
  equipmentQuantity?: number;

  // Management & Audit
  specialRequirements?: string;
  assignedTo: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  completedAt?: string;
  cancellationReason?: string;

  // Sub-resources
  amendments?: BookingAmendment[];
  activities?: BookingActivity[];
}
