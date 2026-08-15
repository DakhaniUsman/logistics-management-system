import {
  Warehouse,
  WarehouseZone,
  WarehouseLocation,
  WarehouseOperator,
  GoodsReceipt,
  PutAway,
  PickList,
  PackingOperation,
  Dispatch,
  WarehouseTask,
} from "@/types/warehouse";

export const MOCK_OPERATORS: WarehouseOperator[] = [
  { id: "OPR-001", name: "Aamir Khan", employeeCode: "EMP-WH-001", role: "Warehouse Manager", warehouseId: "WH-BHW-001", warehouseName: "Bhiwandi Central Warehouse", status: "Available", activeTaskCount: 5 },
  { id: "OPR-002", name: "Ramesh Kumar", employeeCode: "EMP-WH-002", role: "Receiver", warehouseId: "WH-BHW-001", warehouseName: "Bhiwandi Central Warehouse", status: "Busy", activeTaskCount: 3 },
  { id: "OPR-003", name: "Imran Shaikh", employeeCode: "EMP-WH-003", role: "Picker", warehouseId: "WH-BHW-001", warehouseName: "Bhiwandi Central Warehouse", status: "Available", activeTaskCount: 2 },
  { id: "OPR-004", name: "Suresh Pujari", employeeCode: "EMP-WH-004", role: "Packer", warehouseId: "WH-BHW-001", warehouseName: "Bhiwandi Central Warehouse", status: "Available", activeTaskCount: 4 },
  { id: "OPR-005", name: "Deepak Verma", employeeCode: "EMP-WH-005", role: "Supervisor", warehouseId: "WH-JNP-002", warehouseName: "JNPT Port Logistics Hub", status: "Available", activeTaskCount: 3 },
];

export const MOCK_LOCATIONS: WarehouseLocation[] = [
  { id: "LOC-001", warehouseId: "WH-BHW-001", zoneId: "ZON-001", zoneName: "General Storage Zone A", locationCode: "A-01-03-02", locationType: "Pallet Rack", capacityUnits: 100, occupiedUnits: 74, status: "Available" },
  { id: "LOC-002", warehouseId: "WH-BHW-001", zoneId: "ZON-001", zoneName: "General Storage Zone A", locationCode: "A-01-03-03", locationType: "Pallet Rack", capacityUnits: 100, occupiedUnits: 98, status: "Partially Occupied" },
  { id: "LOC-003", warehouseId: "WH-BHW-001", zoneId: "ZON-002", zoneName: "High-Density Rack Zone B", locationCode: "B-02-01-01", locationType: "Pallet Rack", capacityUnits: 150, occupiedUnits: 150, status: "Full" },
  { id: "LOC-004", warehouseId: "WH-JNP-002", zoneId: "ZON-003", zoneName: "Port Receiving Yard Zone R", locationCode: "R-01-00-00", locationType: "Floor Spot", capacityUnits: 500, occupiedUnits: 210, status: "Available" },
];

export const MOCK_ZONES: WarehouseZone[] = [
  { id: "ZON-001", warehouseId: "WH-BHW-001", code: "ZONE-A01", name: "General Storage Zone A", zoneType: "Storage", capacityUnits: 10000, occupiedUnits: 7400, status: "Operational" },
  { id: "ZON-002", warehouseId: "WH-BHW-001", code: "ZONE-B01", name: "Picking & Staging Zone B", zoneType: "Picking", capacityUnits: 5000, occupiedUnits: 4100, status: "Operational" },
  { id: "ZON-003", warehouseId: "WH-BHW-001", code: "ZONE-C01", name: "Packing & Sorting Zone C", zoneType: "Packing", capacityUnits: 4000, occupiedUnits: 2800, status: "Operational" },
  { id: "ZON-004", warehouseId: "WH-BHW-001", code: "ZONE-D01", name: "Outbound Dispatch Bay Zone D", zoneType: "Dispatch", capacityUnits: 6000, occupiedUnits: 4900, status: "Operational" },
];

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: "WH-BHW-001",
    code: "WH-BHW-001",
    name: "Bhiwandi Central Logistics Warehouse",
    warehouseType: "Distribution Center",
    address: "Plot 14B, Bhiwandi Freight Complex, Thane",
    city: "Bhiwandi",
    state: "Maharashtra",
    country: "India",
    capacitySqFt: 80000,
    occupiedSqFt: 59200,
    utilizationPercentage: 74,
    status: "Operational",
    managerName: "Aamir Khan",
    managerPhone: "+91 98200 11223",
    activeTaskCount: 18,
    zones: MOCK_ZONES,
    createdAt: "2026-01-10",
    updatedAt: "2026-08-15",
  },
  {
    id: "WH-JNP-002",
    code: "WH-JNP-002",
    name: "JNPT Port Container Logistics Hub",
    warehouseType: "Cross-Dock",
    address: "JNPT CFS Area Gate #3, Nhava Sheva",
    city: "Navi Mumbai",
    state: "Maharashtra",
    country: "India",
    capacitySqFt: 120000,
    occupiedSqFt: 105600,
    utilizationPercentage: 88,
    status: "Near Capacity",
    managerName: "Deepak Verma",
    managerPhone: "+91 98334 55667",
    activeTaskCount: 24,
    zones: [],
    createdAt: "2026-02-01",
    updatedAt: "2026-08-15",
  },
];

export const MOCK_GOODS_RECEIPTS: GoodsReceipt[] = [
  {
    id: "GRN-2026-00125",
    grnNumber: "GRN-2026-00125",
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    jobId: "JOB-2026-00001",
    jobNumber: "JOB-2026-00001",
    shipmentId: "SHP-2026-00125",
    shipmentNumber: "SHP-2026-00125",
    containerIds: ["CON-2026-00001"],
    containerNumbers: ["MSCU1234567"],
    transportTripId: "TRIP-2026-00125",
    vehicleNumber: "MH 04 AB 1234",
    customerId: "CUS-2026-001",
    customerName: "ABC Electronics Pvt Ltd",
    receivedDate: "2026-08-16 14:00",
    receivedBy: "Ramesh Kumar (Receiver)",
    expectedQuantity: 1000,
    receivedQuantity: 995,
    damagedQuantity: 2,
    shortQuantity: 5,
    excessQuantity: 0,
    netAcceptedQuantity: 993,
    status: "Discrepancy",
    discrepancyReason: "5 units short received from transport delivery challan.",
    remarks: "Received from MH 04 AB 1234 trip. Physical seal MSCU1234567 verified.",
    activities: [
      {
        id: "ACT-GRN-1",
        warehouseId: "WH-BHW-001",
        taskType: "Receiving",
        entityId: "GRN-2026-00125",
        title: "Goods Receipt Note Created",
        description: "GRN-2026-00125 created for shipment SHP-2026-00125 (995 units received).",
        performedBy: "Ramesh Kumar",
        timestamp: "2026-08-16 14:00",
      },
    ],
    createdAt: "2026-08-16 14:00",
    updatedAt: "2026-08-16 14:30",
  },
];

export const MOCK_PUT_AWAY_TASKS: PutAway[] = [
  {
    id: "PA-2026-00125",
    putAwayNumber: "PA-2026-00125",
    grnId: "GRN-2026-00125",
    grnNumber: "GRN-2026-00125",
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    zoneId: "ZON-001",
    zoneName: "General Storage Zone A",
    locationId: "LOC-001",
    locationCode: "A-01-03-02",
    quantity: 993,
    assignedOperatorId: "OPR-002",
    assignedOperatorName: "Ramesh Kumar",
    status: "In Progress",
    startedAt: "2026-08-16 15:00",
    remarks: "Moving accepted microcontrollers into Rack Location A-01-03-02.",
    createdAt: "2026-08-16 14:45",
    updatedAt: "2026-08-16 15:00",
  },
];

export const MOCK_PICK_LISTS: PickList[] = [
  {
    id: "PICK-2026-00125",
    pickNumber: "PICK-2026-00125",
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    jobId: "JOB-2026-00001",
    jobNumber: "JOB-2026-00001",
    shipmentId: "SHP-2026-00125",
    shipmentNumber: "SHP-2026-00125",
    customerId: "CUS-2026-001",
    customerName: "ABC Electronics Pvt Ltd",
    items: [
      { id: "PIT-001", itemCode: "ELC-MCU-401", description: "Microcontroller Board v4", locationCode: "A-01-03-02", requestedQuantity: 200, pickedQuantity: 200, status: "Picked" },
      { id: "PIT-002", itemCode: "ELC-CAP-205", description: "Capacitor Tray Units", locationCode: "A-01-03-03", requestedQuantity: 300, pickedQuantity: 300, status: "Picked" },
    ],
    totalRequestedQty: 500,
    totalPickedQty: 500,
    priority: "High",
    assignedOperatorId: "OPR-003",
    assignedOperatorName: "Imran Shaikh",
    status: "Picked",
    startedAt: "2026-08-16 15:30",
    completedAt: "2026-08-16 16:15",
    createdAt: "2026-08-16 15:00",
    updatedAt: "2026-08-16 16:15",
  },
];

export const MOCK_PACKING_OPS: PackingOperation[] = [
  {
    id: "PACK-2026-00125",
    packingNumber: "PACK-2026-00125",
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    pickListId: "PICK-2026-00125",
    pickNumber: "PICK-2026-00125",
    shipmentId: "SHP-2026-00125",
    shipmentNumber: "SHP-2026-00125",
    jobId: "JOB-2026-00001",
    jobNumber: "JOB-2026-00001",
    customerId: "CUS-2026-001",
    customerName: "ABC Electronics Pvt Ltd",
    packages: [
      { id: "PKG-001", packageNumber: "PLT-BHW-001", packageType: "Pallet", quantity: 500, grossWeightKg: 480, dimensionsCm: "120x100x140", remarks: "Wrapped & strapped heavy pallet" },
    ],
    packageCount: 1,
    totalWeightKg: 480,
    packingType: "Palletizing",
    packedBy: "Suresh Pujari",
    status: "Ready for Dispatch",
    startedAt: "2026-08-16 16:30",
    completedAt: "2026-08-16 17:15",
    remarks: "Quality checked & shrink wrapped for outbound transport.",
    createdAt: "2026-08-16 16:20",
    updatedAt: "2026-08-16 17:15",
  },
];

export const MOCK_DISPATCHES: Dispatch[] = [
  {
    id: "DSP-2026-00125",
    dispatchNumber: "DSP-2026-00125",
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    jobId: "JOB-2026-00001",
    jobNumber: "JOB-2026-00001",
    shipmentId: "SHP-2026-00125",
    shipmentNumber: "SHP-2026-00125",
    packingId: "PACK-2026-00125",
    packingNumber: "PACK-2026-00125",
    customerId: "CUS-2026-001",
    customerName: "ABC Electronics Pvt Ltd",
    transportRequestId: "TR-2026-00125",
    transportTripId: "TRIP-2026-00125",
    vehicleNumber: "MH 04 AB 1234",
    driverName: "Rahul Shaikh",
    driverPhone: "+91 98700 12345",
    status: "Dispatched",
    dispatchDate: "2026-08-16 17:30",
    dispatchedBy: "Aamir Khan (Manager)",
    remarks: "Loaded onto trailer MH 04 AB 1234 for final customer distribution.",
    createdAt: "2026-08-16 17:15",
    updatedAt: "2026-08-16 17:30",
  },
];

export const MOCK_TASKS: WarehouseTask[] = [
  { id: "TSK-001", taskNumber: "TSK-001", taskType: "Receiving", warehouseId: "WH-BHW-001", warehouseName: "Bhiwandi Central", entityId: "GRN-2026-00125", entityNumber: "GRN-2026-00125", assignedOperatorId: "OPR-002", assignedOperatorName: "Ramesh Kumar", priority: "High", status: "Completed", dueTime: "2026-08-16 14:00", createdAt: "2026-08-16 14:00" },
  { id: "TSK-002", taskNumber: "TSK-002", taskType: "Put Away", warehouseId: "WH-BHW-001", warehouseName: "Bhiwandi Central", entityId: "PA-2026-00125", entityNumber: "PA-2026-00125", assignedOperatorId: "OPR-002", assignedOperatorName: "Ramesh Kumar", priority: "High", status: "In Progress", dueTime: "2026-08-16 16:00", createdAt: "2026-08-16 14:45" },
  { id: "TSK-003", taskNumber: "TSK-003", taskType: "Picking", warehouseId: "WH-BHW-001", warehouseName: "Bhiwandi Central", entityId: "PICK-2026-00125", entityNumber: "PICK-2026-00125", assignedOperatorId: "OPR-003", assignedOperatorName: "Imran Shaikh", priority: "High", status: "Completed", dueTime: "2026-08-16 16:30", createdAt: "2026-08-16 15:00" },
  { id: "TSK-004", taskNumber: "TSK-004", taskType: "Packing", warehouseId: "WH-BHW-001", warehouseName: "Bhiwandi Central", entityId: "PACK-2026-00125", entityNumber: "PACK-2026-00125", assignedOperatorId: "OPR-004", assignedOperatorName: "Suresh Pujari", priority: "Normal", status: "Completed", dueTime: "2026-08-16 17:30", createdAt: "2026-08-16 16:20" },
  { id: "TSK-005", taskNumber: "TSK-005", taskType: "Dispatch", warehouseId: "WH-BHW-001", warehouseName: "Bhiwandi Central", entityId: "DSP-2026-00125", entityNumber: "DSP-2026-00125", assignedOperatorId: "OPR-001", assignedOperatorName: "Aamir Khan", priority: "Urgent", status: "Completed", dueTime: "2026-08-16 18:00", createdAt: "2026-08-16 17:15" },
];

// Generate additional 75 GRNs, 60 Put Aways, 60 Pick Lists, 50 Packings, 50 Dispatches
const customersList = [
  { id: "CUS-2026-001", name: "ABC Electronics Pvt Ltd" },
  { id: "CUS-2026-002", name: "Nexus Pharmaceuticals Ltd" },
  { id: "CUS-2026-003", name: "Global Petrochem Inc" },
  { id: "CUS-2026-004", name: "Apex Automotives Ltd" },
  { id: "CUS-2026-005", name: "Titan Renewable Energy Corp" },
];

for (let i = 126; i <= 200; i++) {
  const numStr = i.toString().padStart(5, "0");
  const grnId = `GRN-2026-${numStr}`;
  const cust = customersList[(i - 126) % customersList.length];
  const jobNum = `JOB-2026-${((i % 15) + 1).toString().padStart(5, "0")}`;
  const shpNum = `SHP-2026-${(125 + (i % 12)).toString().padStart(5, "0")}`;
  const conNum = `CON-2026-${((i % 10) + 1).toString().padStart(5, "0")}`;

  const expected = 500 + i * 10;
  const isDisc = i % 5 === 0;
  const short = isDisc ? 5 : 0;
  const damaged = isDisc ? 2 : 0;
  const received = expected - short;
  const netAccepted = received - damaged;

  MOCK_GOODS_RECEIPTS.push({
    id: grnId,
    grnNumber: grnId,
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    jobId: jobNum,
    jobNumber: jobNum,
    shipmentId: shpNum,
    shipmentNumber: shpNum,
    containerIds: [conNum],
    containerNumbers: [`MSCU${1234567 + (i % 10)}`],
    customerId: cust.id,
    customerName: cust.name,
    receivedDate: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 10:00`,
    receivedBy: "Ramesh Kumar",
    expectedQuantity: expected,
    receivedQuantity: received,
    damagedQuantity: damaged,
    shortQuantity: short,
    excessQuantity: 0,
    netAcceptedQuantity: netAccepted,
    status: isDisc ? "Discrepancy" : "Completed",
    remarks: isDisc ? "Discrepancy flagged on cargo unloading." : "Cargo received in good condition.",
    activities: [
      {
        id: `ACT-GRN-${i}`,
        warehouseId: "WH-BHW-001",
        taskType: "Receiving",
        entityId: grnId,
        title: "Goods Receipt Note Created",
        description: `GRN ${grnId} created for ${cust.name}.`,
        performedBy: "Ramesh Kumar",
        timestamp: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 10:00`,
      },
    ],
    createdAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 10:00`,
    updatedAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 10:00`,
  });

  MOCK_PUT_AWAY_TASKS.push({
    id: `PA-2026-${numStr}`,
    putAwayNumber: `PA-2026-${numStr}`,
    grnId: grnId,
    grnNumber: grnId,
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    zoneId: "ZON-001",
    zoneName: "General Storage Zone A",
    locationId: "LOC-001",
    locationCode: `A-01-03-0${(i % 5) + 1}`,
    quantity: netAccepted,
    assignedOperatorId: "OPR-002",
    assignedOperatorName: "Ramesh Kumar",
    status: "Completed",
    createdAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 11:00`,
    updatedAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 12:00`,
  });

  MOCK_PICK_LISTS.push({
    id: `PICK-2026-${numStr}`,
    pickNumber: `PICK-2026-${numStr}`,
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    jobId: jobNum,
    jobNumber: jobNum,
    shipmentId: shpNum,
    shipmentNumber: shpNum,
    customerId: cust.id,
    customerName: cust.name,
    items: [
      { id: `PIT-${i}`, itemCode: `SKU-${i}`, description: "Commercial Inventory Freight", locationCode: "A-01-03-02", requestedQuantity: 100, pickedQuantity: 100, status: "Picked" },
    ],
    totalRequestedQty: 100,
    totalPickedQty: 100,
    priority: "Normal",
    assignedOperatorId: "OPR-003",
    assignedOperatorName: "Imran Shaikh",
    status: "Picked",
    createdAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 14:00`,
    updatedAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 15:00`,
  });

  MOCK_PACKING_OPS.push({
    id: `PACK-2026-${numStr}`,
    packingNumber: `PACK-2026-${numStr}`,
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    pickListId: `PICK-2026-${numStr}`,
    pickNumber: `PICK-2026-${numStr}`,
    shipmentId: shpNum,
    shipmentNumber: shpNum,
    jobId: jobNum,
    jobNumber: jobNum,
    customerId: cust.id,
    customerName: cust.name,
    packages: [
      { id: `PKG-${i}`, packageNumber: `PLT-${i}`, packageType: "Pallet", quantity: 100, grossWeightKg: 250, dimensionsCm: "120x100x120" },
    ],
    packageCount: 1,
    totalWeightKg: 250,
    packingType: "Palletizing",
    packedBy: "Suresh Pujari",
    status: "Ready for Dispatch",
    createdAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 16:00`,
    updatedAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 17:00`,
  });

  MOCK_DISPATCHES.push({
    id: `DSP-2026-${numStr}`,
    dispatchNumber: `DSP-2026-${numStr}`,
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    jobId: jobNum,
    jobNumber: jobNum,
    shipmentId: shpNum,
    shipmentNumber: shpNum,
    packingId: `PACK-2026-${numStr}`,
    packingNumber: `PACK-2026-${numStr}`,
    customerId: cust.id,
    customerName: cust.name,
    transportRequestId: `TR-2026-${(125 + (i % 10)).toString().padStart(5, "0")}`,
    transportTripId: `TRIP-2026-${(125 + (i % 10)).toString().padStart(5, "0")}`,
    vehicleNumber: "MH 04 AB 1234",
    driverName: "Rahul Shaikh",
    status: "Dispatched",
    dispatchDate: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 18:00`,
    dispatchedBy: "Aamir Khan",
    createdAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 17:30`,
    updatedAt: `2026-08-${(10 + (i % 5)).toString().padStart(2, "0")} 18:00`,
  });
}
