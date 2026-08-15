export type TransportRequestStatus =
  | "Draft"
  | "Pending Assignment"
  | "Assigned"
  | "Scheduled"
  | "Picked Up"
  | "Loaded"
  | "Departed"
  | "In Transit"
  | "Arrived"
  | "Completed"
  | "Delayed"
  | "On Hold"
  | "Cancelled";

export type VehicleType =
  | "40 FT Container Truck"
  | "20 FT Container Truck"
  | "Trailer / Flatbed"
  | "Mini Truck"
  | "Pickup Van"
  | "Tanker Truck"
  | "Other";

export type VehicleStatus = "Available" | "Assigned" | "In Transit" | "Maintenance" | "Inactive";
export type DriverStatus = "Available" | "Assigned" | "On Trip" | "Inactive";
export type TransportPriority = "Normal" | "High" | "Urgent" | "Critical";

export interface TransportExpense {
  id: string;
  tripId: string;
  category: "Fuel" | "Toll" | "Parking" | "Driver Allowance" | "Loading" | "Unloading" | "Other";
  amount: number;
  currency: string;
  description: string;
  expenseDate: string;
  createdBy: string;
  createdAt: string;
}

export interface TransportActivity {
  id: string;
  requestId: string;
  tripId?: string;
  type: string;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface TransportMilestone {
  id: string;
  title: string;
  status: "Pending" | "Completed" | "Delayed" | "Skipped";
  timestamp?: string;
  completedBy?: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string; // e.g. MH 04 AB 1234
  vehicleType: VehicleType;
  vehicleModel: string;
  capacityTonnes: number;
  vendorId: string;
  vendorName: string;
  status: VehicleStatus;
  registrationExpiry: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  currentLocation?: string;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseType: string; // e.g. Heavy Motor Vehicle (HMV)
  licenseExpiry: string;
  vendorId: string;
  vendorName: string;
  status: DriverStatus;
  experienceYears: number;
  notes?: string;
}

export interface TransportVendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  vehicleCount: number;
  status: "Active" | "Inactive" | "Preferred";
  rating: number; // e.g. 4.8
}

export interface Trip {
  id: string; // e.g. TRIP-2026-00125
  tripNumber: string;
  transportRequestId: string;
  jobId: string;
  shipmentId: string;
  bookingId?: string;
  containerIds: string[];
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vendorId: string;
  vendorName: string;
  originLocation: string;
  destinationLocation: string;
  intermediateStops?: string[];
  scheduledPickupTime: string;
  actualPickupTime?: string;
  scheduledArrivalTime: string;
  actualArrivalTime?: string;
  actualDepartureTime?: string;
  actualLoadedTime?: string;
  odometerStart?: number;
  odometerEnd?: number;
  distanceKm?: number;
  estimatedCost: number;
  actualCost: number;
  currency: string; // "INR" | "USD"
  status: TransportRequestStatus;
  delayReason?: string;
  holdReason?: string;
  remarks?: string;
  expenses: TransportExpense[];
  milestones: TransportMilestone[];
  activities: TransportActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface TransportRequest {
  id: string; // e.g. TR-2026-00125
  requestNumber: string;
  status: TransportRequestStatus;
  priority: TransportPriority;

  // Hierarchical Entity Linkages
  jobId: string;
  jobNumber: string;
  shipmentId: string;
  shipmentNumber: string;
  bookingId?: string;
  bookingNumber?: string;
  containerIds: string[];
  containerNumbers: string[];
  customsId?: string;
  customsNumber?: string;
  customsStatus?: string; // e.g. "Released" -> Operational handoff

  // Customer & Route
  customerId: string;
  customerName: string;
  pickupLocation: string;
  pickupContactPerson?: string;
  pickupPhone?: string;
  destinationLocation: string;
  destinationContactPerson?: string;
  destinationPhone?: string;
  intermediateStops?: string[];

  // Cargo & Requirement
  cargoDescription: string;
  cargoWeightKg: number;
  requiredVehicleType: VehicleType;
  requiredCapacityTonnes: number;
  pickupDate: string;
  pickupTime: string;
  expectedDeliveryDate: string;
  specialInstructions?: string;

  // Assignment & Trip Link
  assignedVendorId?: string;
  assignedVendorName?: string;
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  tripId?: string;

  // Audit
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportFilterOptions {
  search?: string;
  status?: TransportRequestStatus | "ALL";
  priority?: TransportPriority | "ALL";
  vehicleType?: VehicleType | "ALL";
  vendorId?: string;
  customerId?: string;
  jobId?: string;
  shipmentId?: string;
  containerId?: string;
}

export const VEHICLE_TYPES: VehicleType[] = [
  "40 FT Container Truck",
  "20 FT Container Truck",
  "Trailer / Flatbed",
  "Mini Truck",
  "Pickup Van",
  "Tanker Truck",
  "Other",
];
