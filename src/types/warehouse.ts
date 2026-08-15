export type WarehouseType =
  | "Distribution Center"
  | "Fulfillment Center"
  | "Storage Warehouse"
  | "Cold Storage"
  | "Bonded Warehouse"
  | "Cross-Dock"
  | "Other";

export type WarehouseStatus = "Operational" | "Near Capacity" | "At Capacity" | "Maintenance" | "Inactive";

export type ZoneType =
  | "Receiving"
  | "Storage"
  | "Picking"
  | "Packing"
  | "Dispatch"
  | "Quarantine"
  | "Returns";

export type LocationStatus = "Available" | "Partially Occupied" | "Full" | "Blocked" | "Maintenance";

export type GRNStatus =
  | "Draft"
  | "Receiving"
  | "Pending Verification"
  | "Verified"
  | "Discrepancy"
  | "Put Away Pending"
  | "Completed"
  | "Cancelled";

export type PutAwayStatus = "Pending" | "Assigned" | "In Progress" | "Completed" | "Blocked";

export type PickStatus =
  | "Pending"
  | "Assigned"
  | "In Progress"
  | "Partially Picked"
  | "Picked"
  | "Blocked"
  | "Cancelled";

export type PackingStatus =
  | "Pending"
  | "Assigned"
  | "In Progress"
  | "Packed"
  | "Quality Check"
  | "Ready for Dispatch"
  | "Blocked"
  | "Cancelled";

export type DispatchStatus =
  | "Pending"
  | "Ready"
  | "Scheduled"
  | "Loading"
  | "Dispatched"
  | "Cancelled"
  | "On Hold";

export type WarehouseTaskType = "Receiving" | "Put Away" | "Picking" | "Packing" | "Dispatch";

export type WarehouseTaskStatus = "Pending" | "Assigned" | "In Progress" | "Blocked" | "Completed";

export interface WarehouseZone {
  id: string;
  warehouseId: string;
  code: string; // e.g. ZONE-A01
  name: string; // e.g. General Storage
  zoneType: ZoneType;
  capacityUnits: number;
  occupiedUnits: number;
  status: "Operational" | "Full" | "Blocked";
}

export interface WarehouseLocation {
  id: string; // e.g. LOC-A-01-03-02
  warehouseId: string;
  zoneId: string;
  zoneName: string;
  locationCode: string; // e.g. A-01-03-02 (Aisle-Rack-Shelf-Bin)
  locationType: "Pallet Rack" | "Shelving Bin" | "Floor Spot" | "Cold Vault";
  capacityUnits: number;
  occupiedUnits: number;
  status: LocationStatus;
}

export interface WarehouseOperator {
  id: string;
  name: string;
  employeeCode: string;
  role: "Receiver" | "Picker" | "Packer" | "Supervisor" | "Warehouse Manager";
  warehouseId: string;
  warehouseName: string;
  status: "Available" | "Busy" | "Inactive";
  activeTaskCount: number;
}

export interface WarehouseActivity {
  id: string;
  warehouseId: string;
  taskType: WarehouseTaskType;
  entityId: string;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface WarehouseMilestone {
  id: string;
  title: string;
  status: "Pending" | "Completed" | "Delayed";
  timestamp?: string;
  completedBy?: string;
}

export interface GoodsReceipt {
  id: string; // e.g. GRN-2026-00125
  grnNumber: string;
  warehouseId: string;
  warehouseName: string;
  jobId: string;
  jobNumber: string;
  shipmentId: string;
  shipmentNumber: string;
  containerIds: string[];
  containerNumbers: string[];
  transportRequestId?: string;
  transportTripId?: string;
  vehicleNumber?: string;
  customerId: string;
  customerName: string;
  receivedDate: string;
  receivedBy: string;
  expectedQuantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  shortQuantity: number;
  excessQuantity: number;
  netAcceptedQuantity: number;
  status: GRNStatus;
  discrepancyReason?: string;
  remarks?: string;
  activities: WarehouseActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface PutAway {
  id: string; // e.g. PA-2026-00125
  putAwayNumber: string;
  grnId: string;
  grnNumber: string;
  warehouseId: string;
  warehouseName: string;
  zoneId: string;
  zoneName: string;
  locationId: string;
  locationCode: string;
  quantity: number;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  status: PutAwayStatus;
  startedAt?: string;
  completedAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickItem {
  id: string;
  itemCode: string;
  description: string;
  locationCode: string;
  requestedQuantity: number;
  pickedQuantity: number;
  status: "Pending" | "Picked" | "Short";
}

export interface PickList {
  id: string; // e.g. PICK-2026-00125
  pickNumber: string;
  warehouseId: string;
  warehouseName: string;
  jobId: string;
  jobNumber: string;
  shipmentId: string;
  shipmentNumber: string;
  customerId: string;
  customerName: string;
  items: PickItem[];
  totalRequestedQty: number;
  totalPickedQty: number;
  priority: "Normal" | "High" | "Urgent";
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  status: PickStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackageItem {
  id: string;
  packageNumber: string;
  packageType: "Carton" | "Pallet" | "Crate" | "Bag" | "Other";
  quantity: number;
  grossWeightKg: number;
  dimensionsCm?: string;
  remarks?: string;
}

export interface PackingOperation {
  id: string; // e.g. PACK-2026-00125
  packingNumber: string;
  warehouseId: string;
  warehouseName: string;
  pickListId: string;
  pickNumber: string;
  shipmentId: string;
  shipmentNumber: string;
  jobId: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  packages: PackageItem[];
  packageCount: number;
  totalWeightKg: number;
  packingType: "Standard Containerizing" | "Palletizing" | "Custom Crating";
  packedBy?: string;
  status: PackingStatus;
  startedAt?: string;
  completedAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dispatch {
  id: string; // e.g. DSP-2026-00125
  dispatchNumber: string;
  warehouseId: string;
  warehouseName: string;
  jobId: string;
  jobNumber: string;
  shipmentId: string;
  shipmentNumber: string;
  packingId: string;
  packingNumber: string;
  customerId: string;
  customerName: string;
  transportRequestId?: string;
  transportTripId?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  status: DispatchStatus;
  dispatchDate: string;
  dispatchedBy?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseTask {
  id: string;
  taskNumber: string;
  taskType: WarehouseTaskType;
  warehouseId: string;
  warehouseName: string;
  entityId: string;
  entityNumber: string;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  priority: "Normal" | "High" | "Urgent" | "Critical";
  status: WarehouseTaskStatus;
  dueTime: string;
  createdAt: string;
}

export interface Warehouse {
  id: string; // e.g. WH-BHW-001
  code: string;
  name: string;
  warehouseType: WarehouseType;
  address: string;
  city: string;
  state: string;
  country: string;
  capacitySqFt: number;
  occupiedSqFt: number;
  utilizationPercentage: number;
  status: WarehouseStatus;
  managerName: string;
  managerPhone: string;
  activeTaskCount: number;
  zones: WarehouseZone[];
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseFilterOptions {
  search?: string;
  warehouseId?: string;
  status?: string;
  taskType?: WarehouseTaskType | "ALL";
  customerId?: string;
  jobId?: string;
  shipmentId?: string;
}

export const WAREHOUSE_TYPES: WarehouseType[] = [
  "Distribution Center",
  "Fulfillment Center",
  "Storage Warehouse",
  "Cold Storage",
  "Bonded Warehouse",
  "Cross-Dock",
  "Other",
];
