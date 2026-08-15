export type DeliveryStatus =
  | "Pending"
  | "Scheduled"
  | "Ready for Dispatch"
  | "Out for Delivery"
  | "Arriving"
  | "Arrived"
  | "Unloading"
  | "Delivered"
  | "POD Pending"
  | "POD Verified"
  | "Completed"
  | "Partially Delivered"
  | "Failed"
  | "Delayed"
  | "Rescheduled"
  | "Rejected"
  | "Cancelled";

export type PODStatus =
  | "Pending"
  | "Captured"
  | "Under Verification"
  | "Verified"
  | "Rejected"
  | "Missing";

export type CargoCondition =
  | "Good Condition"
  | "Damaged"
  | "Partially Damaged"
  | "Packaging Damaged"
  | "Rejected";

export type DeliveryPriority = "Normal" | "High" | "Urgent" | "Critical";

export type DeliveryWindow = "Morning (10:00 AM - 12:00 PM)" | "Afternoon (01:00 PM - 04:00 PM)" | "Evening (05:00 PM - 08:00 PM)" | "Custom";

export interface ProofOfDelivery {
  id: string; // e.g. POD-2026-00125
  podNumber: string;
  deliveryId: string;
  deliveryNumber: string;
  recipientName: string;
  recipientDesignation: string;
  recipientPhone?: string;
  receivedDate: string;
  receivedTime: string;
  expectedQuantity: number;
  deliveredQuantity: number;
  shortQuantity: number;
  damagedQuantity: number;
  condition: CargoCondition;
  signatureCaptured: boolean;
  signatureDataUrl?: string;
  photoEvidenceUrls?: string[];
  documentId?: string;
  documentNumber?: string;
  remarks?: string;
  status: PODStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryException {
  id: string;
  deliveryId: string;
  exceptionType:
    | "Recipient Unavailable"
    | "Wrong Address"
    | "Customer Closed"
    | "Vehicle Breakdown"
    | "Traffic Delay"
    | "Damaged Cargo"
    | "Documentation Issue"
    | "Customer Rejected"
    | "Other";
  attemptNumber: number;
  remarks: string;
  reportedBy: string;
  reportedAt: string;
  resolved: boolean;
}

export interface DeliveryActivity {
  id: string;
  deliveryId: string;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface DeliveryMilestone {
  id: string;
  title: string;
  status: "Pending" | "Completed" | "Delayed" | "Failed";
  timestamp?: string;
  completedBy?: string;
}

export interface Delivery {
  id: string; // e.g. DEL-2026-00125
  deliveryNumber: string;
  jobId: string;
  jobNumber: string;
  shipmentId: string;
  shipmentNumber: string;
  dispatchId?: string;
  dispatchNumber?: string;
  packingId?: string;
  packingNumber?: string;
  transportRequestId?: string;
  tripId?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  customerId: string;
  customerName: string;
  warehouseId?: string;
  warehouseName?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryContactPerson: string;
  deliveryContactPhone: string;
  deliveryInstructions?: string;
  scheduledDate: string;
  scheduledTimeWindow: string;
  expectedArrival: string;
  actualArrival?: string;
  actualUnloaded?: string;
  actualDelivered?: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  attemptNumber: number;
  recipientName?: string;
  recipientDesignation?: string;
  recipientPhone?: string;
  podId?: string;
  podNumber?: string;
  podStatus?: PODStatus;
  cargoDescription: string;
  cargoWeightKg: number;
  packageCount: number;
  deliveryNotes?: string;
  failureReason?: string;
  delayReason?: string;
  holdReason?: string;
  activities: DeliveryActivity[];
  milestones: DeliveryMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryFilterOptions {
  search?: string;
  status?: DeliveryStatus | "ALL";
  podStatus?: PODStatus | "ALL";
  priority?: DeliveryPriority | "ALL";
  customerId?: string;
  jobId?: string;
  shipmentId?: string;
  driverName?: string;
  vehicleNumber?: string;
}
