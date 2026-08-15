import { Delivery, ProofOfDelivery } from "@/types/delivery";

export const MOCK_PODS: ProofOfDelivery[] = [
  {
    id: "POD-2026-00125",
    podNumber: "POD-2026-00125",
    deliveryId: "DEL-2026-00125",
    deliveryNumber: "DEL-2026-00125",
    recipientName: "Ahmed Khan",
    recipientDesignation: "Warehouse Receiving Manager",
    recipientPhone: "+91 98211 44556",
    receivedDate: "2026-08-18",
    receivedTime: "18:30",
    expectedQuantity: 1000,
    deliveredQuantity: 995,
    shortQuantity: 5,
    damagedQuantity: 0,
    condition: "Good Condition",
    signatureCaptured: true,
    signatureDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 25 Q 30 5 50 25 T 90 25' stroke='%2338bdf8' fill='none' stroke-width='2'/></svg>",
    documentId: "DOC-2026-POD-125",
    documentNumber: "POD-2026-00125.pdf",
    remarks: "Cargo received in intact condition at Bhiwandi distribution warehouse. 5 units short noted.",
    status: "Verified",
    verifiedBy: "Aamir Khan (Operations Lead)",
    verifiedAt: "2026-08-18 19:00",
    verificationNotes: "Physical signature & recipient designation verified. Delivery completed.",
    createdAt: "2026-08-18 18:30",
    updatedAt: "2026-08-18 19:00",
  },
];

export const MOCK_DELIVERIES: Delivery[] = [
  {
    id: "DEL-2026-00125",
    deliveryNumber: "DEL-2026-00125",
    jobId: "JOB-2026-00001",
    jobNumber: "JOB-2026-00001",
    shipmentId: "SHP-2026-00125",
    shipmentNumber: "SHP-2026-00125",
    dispatchId: "DSP-2026-00125",
    dispatchNumber: "DSP-2026-00125",
    packingId: "PACK-2026-00125",
    packingNumber: "PACK-2026-00125",
    transportRequestId: "TR-2026-00125",
    tripId: "TRIP-2026-00125",
    vehicleNumber: "MH 04 AB 1234",
    driverName: "Rahul Shaikh",
    driverPhone: "+91 98700 12345",
    customerId: "CUS-2026-001",
    customerName: "ABC Electronics Pvt Ltd",
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    deliveryAddress: "Plot 42, MIDC Industrial Zone Phase 2, Bhiwandi",
    deliveryCity: "Thane",
    deliveryState: "Maharashtra",
    deliveryContactPerson: "Ahmed Khan",
    deliveryContactPhone: "+91 98211 44556",
    deliveryInstructions: "Call recipient 30 minutes prior to arrival. Dock Gate #4.",
    scheduledDate: "2026-08-18",
    scheduledTimeWindow: "Evening (05:00 PM - 08:00 PM)",
    expectedArrival: "2026-08-18 18:00",
    actualArrival: "2026-08-18 18:15",
    actualUnloaded: "2026-08-18 18:25",
    actualDelivered: "2026-08-18 18:30",
    status: "Completed",
    priority: "High",
    attemptNumber: 1,
    recipientName: "Ahmed Khan",
    recipientDesignation: "Warehouse Receiving Manager",
    recipientPhone: "+91 98211 44556",
    podId: "POD-2026-00125",
    podNumber: "POD-2026-00125",
    podStatus: "Verified",
    cargoDescription: "Microcontroller Board v4 & Electronic Assemblies",
    cargoWeightKg: 18500,
    packageCount: 24,
    deliveryNotes: "Delivered on schedule. Recipient signed digital POD.",
    activities: [
      { id: "ACT-DEL-1", deliveryId: "DEL-2026-00125", title: "Delivery Order Created", description: "DEL-2026-00125 generated from Warehouse Dispatch DSP-2026-00125.", performedBy: "System Dispatcher", timestamp: "2026-08-18 17:30" },
      { id: "ACT-DEL-2", deliveryId: "DEL-2026-00125", title: "Out for Delivery", description: "Truck MH 04 AB 1234 departed warehouse gate.", performedBy: "Rahul Shaikh", timestamp: "2026-08-18 17:45" },
      { id: "ACT-DEL-3", deliveryId: "DEL-2026-00125", title: "Arrived at Destination", description: "Vehicle arrived at customer MIDC dock gate.", performedBy: "Rahul Shaikh", timestamp: "2026-08-18 18:15" },
      { id: "ACT-DEL-4", deliveryId: "DEL-2026-00125", title: "Unloading Completed", description: "24 Pallets unloaded safely.", performedBy: "Rahul Shaikh", timestamp: "2026-08-18 18:25" },
      { id: "ACT-DEL-5", deliveryId: "DEL-2026-00125", title: "POD Captured & Submitted", description: "Digital signature captured from Ahmed Khan.", performedBy: "Rahul Shaikh", timestamp: "2026-08-18 18:30" },
      { id: "ACT-DEL-6", deliveryId: "DEL-2026-00125", title: "POD Verified - Delivery Completed", description: "POD-2026-00125 verified by Operations Manager.", performedBy: "Aamir Khan", timestamp: "2026-08-18 19:00" },
    ],
    milestones: [
      { id: "M1", title: "Dispatch Created", status: "Completed", timestamp: "2026-08-18 17:30" },
      { id: "M2", title: "Out for Delivery", status: "Completed", timestamp: "2026-08-18 17:45" },
      { id: "M3", title: "Arrived at Customer", status: "Completed", timestamp: "2026-08-18 18:15" },
      { id: "M4", title: "Unloading Completed", status: "Completed", timestamp: "2026-08-18 18:25" },
      { id: "M5", title: "Delivered", status: "Completed", timestamp: "2026-08-18 18:30" },
      { id: "M6", title: "POD Verified", status: "Completed", timestamp: "2026-08-18 19:00" },
    ],
    createdAt: "2026-08-18 17:30",
    updatedAt: "2026-08-18 19:00",
  },
];

// Generate additional 100 Deliveries and 80 PODs
const customerPool = [
  { id: "CUS-2026-001", name: "ABC Electronics Pvt Ltd", contact: "Ahmed Khan", phone: "+91 98211 44556" },
  { id: "CUS-2026-002", name: "Nexus Pharmaceuticals Ltd", contact: "Vikas Malhotra", phone: "+91 98332 11223" },
  { id: "CUS-2026-003", name: "Global Petrochem Inc", contact: "Sanjay Shah", phone: "+91 98771 99887" },
  { id: "CUS-2026-004", name: "Apex Automotives Ltd", contact: "Manoj Deshmukh", phone: "+91 98110 33445" },
  { id: "CUS-2026-005", name: "Titan Renewable Energy Corp", contact: "Preeti Nair", phone: "+91 98922 66778" },
];

const vehiclePool = [
  { veh: "MH 04 AB 1234", driver: "Rahul Shaikh", phone: "+91 98700 12345" },
  { veh: "MH 43 CC 5678", driver: "Vikram Rathore", phone: "+91 98700 54321" },
  { veh: "MH 02 FJ 9012", driver: "Rajesh Shinde", phone: "+91 98700 99887" },
  { veh: "MH 12 QW 3456", driver: "Sunil Yadav", phone: "+91 98700 44332" },
];

for (let i = 126; i <= 225; i++) {
  const numStr = i.toString().padStart(5, "0");
  const delId = `DEL-2026-${numStr}`;
  const podId = `POD-2026-${numStr}`;
  const cust = customerPool[(i - 126) % customerPool.length];
  const veh = vehiclePool[(i - 126) % vehiclePool.length];
  const jobNum = `JOB-2026-${((i % 15) + 1).toString().padStart(5, "0")}`;
  const shpNum = `SHP-2026-${(125 + (i % 12)).toString().padStart(5, "0")}`;
  const dspNum = `DSP-2026-${(125 + (i % 10)).toString().padStart(5, "0")}`;

  const isFailed = i % 8 === 0;
  const isDelayed = i % 6 === 0 && !isFailed;
  const isPODPending = i % 5 === 0 && !isFailed && !isDelayed;
  const isCompleted = !isFailed && !isDelayed && !isPODPending;

  let status: any = "Completed";
  let podStatus: any = "Verified";

  if (isFailed) {
    status = "Failed";
    podStatus = "Missing";
  } else if (isDelayed) {
    status = "Delayed";
    podStatus = "Pending";
  } else if (isPODPending) {
    status = "POD Pending";
    podStatus = "Under Verification";
  }

  if (isCompleted || isPODPending) {
    MOCK_PODS.push({
      id: podId,
      podNumber: podId,
      deliveryId: delId,
      deliveryNumber: delId,
      recipientName: cust.contact,
      recipientDesignation: "Warehouse In-Charge",
      recipientPhone: cust.phone,
      receivedDate: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")}`,
      receivedTime: "14:00",
      expectedQuantity: 500 + i * 5,
      deliveredQuantity: 500 + i * 5,
      shortQuantity: 0,
      damagedQuantity: 0,
      condition: "Good Condition",
      signatureCaptured: true,
      documentId: `DOC-${podId}`,
      documentNumber: `${podId}.pdf`,
      remarks: "Cargo received safely at destination.",
      status: podStatus,
      verifiedBy: isCompleted ? "Aamir Khan" : undefined,
      createdAt: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 14:00`,
      updatedAt: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 14:30`,
    });
  }

  MOCK_DELIVERIES.push({
    id: delId,
    deliveryNumber: delId,
    jobId: jobNum,
    jobNumber: jobNum,
    shipmentId: shpNum,
    shipmentNumber: shpNum,
    dispatchId: dspNum,
    dispatchNumber: dspNum,
    packingId: `PACK-2026-${(125 + (i % 10)).toString().padStart(5, "0")}`,
    packingNumber: `PACK-2026-${(125 + (i % 10)).toString().padStart(5, "0")}`,
    transportRequestId: `TR-2026-${(125 + (i % 10)).toString().padStart(5, "0")}`,
    tripId: `TRIP-2026-${(125 + (i % 10)).toString().padStart(5, "0")}`,
    vehicleNumber: veh.veh,
    driverName: veh.driver,
    driverPhone: veh.phone,
    customerId: cust.id,
    customerName: cust.name,
    warehouseId: "WH-BHW-001",
    warehouseName: "Bhiwandi Central Logistics Warehouse",
    deliveryAddress: `Plot ${i}, Industrial Zone Phase 2, Mumbai`,
    deliveryCity: "Mumbai",
    deliveryState: "Maharashtra",
    deliveryContactPerson: cust.contact,
    deliveryContactPhone: cust.phone,
    scheduledDate: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")}`,
    scheduledTimeWindow: "Afternoon (01:00 PM - 04:00 PM)",
    expectedArrival: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 14:00`,
    actualArrival: isCompleted || isPODPending ? `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 14:15` : undefined,
    actualDelivered: isCompleted || isPODPending ? `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 14:30` : undefined,
    status: status,
    priority: i % 4 === 0 ? "Urgent" : "Normal",
    attemptNumber: isFailed ? 2 : 1,
    recipientName: isCompleted || isPODPending ? cust.contact : undefined,
    recipientDesignation: isCompleted || isPODPending ? "Warehouse In-Charge" : undefined,
    podId: isCompleted || isPODPending ? podId : undefined,
    podNumber: isCompleted || isPODPending ? podId : undefined,
    podStatus: podStatus,
    cargoDescription: "General Commercial Freight",
    cargoWeightKg: 12000,
    packageCount: 15,
    failureReason: isFailed ? "Recipient Unavailable - Warehouse Closed" : undefined,
    delayReason: isDelayed ? "Highway Traffic Congestion Delay" : undefined,
    activities: [
      { id: `ACT-DEL-${i}-1`, deliveryId: delId, title: "Delivery Order Created", description: `Delivery order ${delId} initialized for ${cust.name}.`, performedBy: "System Dispatcher", timestamp: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 10:00` },
      { id: `ACT-DEL-${i}-2`, deliveryId: delId, title: "Out for Delivery", description: `Dispatched with vehicle ${veh.veh}.`, performedBy: veh.driver, timestamp: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 11:00` },
    ],
    milestones: [
      { id: `M-${i}-1`, title: "Dispatch Created", status: "Completed", timestamp: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 10:00` },
      { id: `M-${i}-2`, title: "Out for Delivery", status: "Completed", timestamp: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 11:00` },
      { id: `M-${i}-3`, title: "Arrived at Customer", status: isCompleted ? "Completed" : "Pending" },
      { id: `M-${i}-4`, title: "Delivered", status: isCompleted ? "Completed" : "Pending" },
      { id: `M-${i}-5`, title: "POD Verified", status: isCompleted ? "Completed" : "Pending" },
    ],
    createdAt: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 10:00`,
    updatedAt: `2026-08-${(10 + (i % 8)).toString().padStart(2, "0")} 14:30`,
  });
}
