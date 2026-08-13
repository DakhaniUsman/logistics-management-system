import { Container, ContainerStatus, ContainerCondition, SealStatus } from "@/types/container";
import { MOCK_BOOKINGS } from "./booking-data";

// Pre-defined carrier prefixes for realistic container numbers
const CARRIER_PREFIXES = ["MSCU", "MAEU", "COSU", "HLXU", "NYKU", "APLU", "DFSU", "TGBU"];

// ISO codes lookup
export const ISO_CODES = {
  "20FT": { "Dry Van": "22G1", "Reefer": "22R1", "Open Top": "22U1", "Flat Rack": "22P1", "Tank": "22T1", "High Cube": "25G1" },
  "40FT": { "Dry Van": "42G1", "Reefer": "42R1", "Open Top": "42U1", "Flat Rack": "42P1", "Tank": "42T1", "High Cube": "45G1" },
  "40FT HC": { "Dry Van": "45G1", "Reefer": "45R1", "Open Top": "45U1", "Flat Rack": "45P1", "Tank": "45T1", "High Cube": "45G1" },
  "45FT": { "Dry Van": "46G1", "Reefer": "46R1", "Open Top": "46U1", "Flat Rack": "46P1", "Tank": "46T1", "High Cube": "46G1" }
};

export const MOCK_CONTAINERS: Container[] = [];

// Helper to generate a valid-looking container number
export function generateContainerNumber(index: number): string {
  const prefix = CARRIER_PREFIXES[index % CARRIER_PREFIXES.length];
  // 6 digits serial number
  const serial = String(100000 + (index * 13) % 900000);
  // 1 check digit
  const checkDigit = String((index * 7) % 10);
  return `${prefix}${serial}${checkDigit}`;
}

// Helper to generate a seal number
export function generateSealNumber(index: number): string {
  return `SL-${881000 + (index * 23) % 100000}`;
}

// 1. High fidelity manual seeding for active booking flow
MOCK_CONTAINERS.push({
  id: "CON-2026-00001",
  containerNumber: "MSCU1234567",
  shipmentId: "SHP-2026-00125",
  bookingId: "BKG-2026-00125",
  jobId: "JOB-2026-00001",
  customerId: "CUS-2026-001",
  customerName: "ABC Electronics Pvt Ltd",
  containerType: "Dry Van",
  containerSize: "40FT HC",
  isoCode: "45G1",
  status: "In Transit",
  sealNumber: "SL-984562",
  sealStatus: "Verified",
  tareWeight: 3800,
  maxGrossWeight: 32500,
  cargoWeight: 18000,
  volume: 67.5,
  currentLocation: "Arabian Sea",
  currentCountry: "International Waters",
  origin: "Mumbai Port (JNPT)",
  destination: "Jebel Ali Port",
  gateInDate: "2026-08-15",
  loadedDate: "2026-08-17",
  departureDate: "2026-08-18",
  condition: "Good",
  assignedTo: "Vikram Mehta",
  notes: "Contains electronic chips. Do not stack top-most on deck.",
  createdAt: "2026-08-14T08:00:00Z",
  updatedAt: "2026-08-18T10:00:00Z",
  activities: [
    {
      id: "ACT-CON-101",
      containerId: "CON-2026-00001",
      type: "Created",
      title: "Container Registered",
      description: "Container MSCU1234567 assigned to Booking BKG-2026-00125",
      performedBy: "Shahbaj Borkar",
      timestamp: "2026-08-14 08:00"
    },
    {
      id: "ACT-CON-102",
      containerId: "CON-2026-00001",
      type: "Seal Assigned",
      description: "High-security seal SL-984562 was verified and locked.",
      title: "Seal Applied",
      performedBy: "Port Operations",
      timestamp: "2026-08-15 11:30"
    },
    {
      id: "ACT-CON-103",
      containerId: "CON-2026-00001",
      type: "Status Changed",
      title: "Gated In at POL",
      description: "Status changed from Picked Up to Gate In at JNPT Terminal 1.",
      performedBy: "JNPT Yard Master",
      timestamp: "2026-08-15 15:45"
    },
    {
      id: "ACT-CON-104",
      containerId: "CON-2026-00001",
      type: "Status Changed",
      title: "Stowed on Vessel",
      description: "Container stowed on slot 12B-04 of MSC ANNA.",
      performedBy: "Stevedore Supervisor",
      timestamp: "2026-08-17 19:10"
    },
    {
      id: "ACT-CON-105",
      containerId: "CON-2026-00001",
      type: "Status Changed",
      title: "Vessel Departed",
      description: "Vessel MSC ANNA departed Mumbai port. Leg in transit.",
      performedBy: "Port Dispatch",
      timestamp: "2026-08-18 10:00"
    }
  ],
  milestones: [
    { id: "M-CON-101", containerId: "CON-2026-00001", type: "Assigned", title: "Container Assigned", status: "Completed", location: "Mumbai Yard", actualDate: "2026-08-14" },
    { id: "M-CON-102", containerId: "CON-2026-00001", type: "Empty Picked Up", title: "Empty Picked Up", status: "Completed", location: "JNPT Depot", actualDate: "2026-08-14" },
    { id: "M-CON-103", containerId: "CON-2026-00001", type: "Gate In", title: "Gated In at Port", status: "Completed", location: "JNPT Port Terminal", actualDate: "2026-08-15" },
    { id: "M-CON-104", containerId: "CON-2026-00001", type: "Loaded", title: "Loaded on Vessel", status: "Completed", location: "JNPT Berth 3", actualDate: "2026-08-17" },
    { id: "M-CON-105", containerId: "CON-2026-00001", type: "Departed", title: "Vessel Departed", status: "Completed", location: "Mumbai Port", actualDate: "2026-08-18" },
    { id: "M-CON-106", containerId: "CON-2026-00001", type: "In Transit", title: "In Transit", status: "Completed", location: "Arabian Sea", actualDate: "2026-08-18" },
    { id: "M-CON-107", containerId: "CON-2026-00001", type: "Arrived", title: "Arrived at destination", status: "Upcoming", location: "Jebel Ali Port", plannedDate: "2026-08-26" },
    { id: "M-CON-108", containerId: "CON-2026-00001", type: "Delivered", title: "Delivered to consignee", status: "Pending", location: "Dubai Warehouse", plannedDate: "2026-08-27" },
    { id: "M-CON-109", containerId: "CON-2026-00001", type: "Empty Returned", title: "Empty Container Returned", status: "Pending", location: "Dubai Empty Yard", plannedDate: "2026-08-29" }
  ],
  sealHistory: [
    { id: "SH-CON-101", containerId: "CON-2026-00001", oldSealNumber: "None", newSealNumber: "SL-984562", status: "Assigned", changedAt: "2026-08-15T11:30:00Z", changedBy: "Port Operations", reason: "Initial lock seal at factory gate out." }
  ]
});

// 2. Add Booking BKG-2026-00127 (Maersk Solar Solar, required 3x40FT HC, assigning 2 containers to show Partial Allocation)
MOCK_CONTAINERS.push({
  id: "CON-2026-00002",
  containerNumber: "MAEU8810245",
  shipmentId: "SHP-2026-00127",
  bookingId: "BKG-2026-00127",
  jobId: "JOB-2026-00003",
  customerId: "CUS-2026-003",
  customerName: "SunRise Solar Energy",
  containerType: "Dry Van",
  containerSize: "40FT HC",
  isoCode: "45G1",
  status: "Picked Up",
  sealNumber: "SL-882049",
  sealStatus: "Assigned",
  tareWeight: 3800,
  maxGrossWeight: 32500,
  cargoWeight: 14000,
  volume: 62.0,
  currentLocation: "Shanghai Factory Yard",
  currentCountry: "China",
  origin: "Shanghai Port",
  destination: "Mundra Port",
  condition: "Good",
  assignedTo: "Siddharth Rao",
  createdAt: "2026-08-13T10:00:00Z",
  updatedAt: "2026-08-13T14:00:00Z",
  activities: [
    {
      id: "ACT-CON-201",
      containerId: "CON-2026-00002",
      type: "Created",
      title: "Container Allocated",
      description: "Assigned to Maersk booking BKG-2026-00127",
      performedBy: "Siddharth Rao",
      timestamp: "2026-08-13 10:00"
    },
    {
      id: "ACT-CON-202",
      containerId: "CON-2026-00002",
      type: "Status Changed",
      title: "Empty Container Released",
      description: "Depot released empty container for factory loading.",
      performedBy: "Shanghai Depot Operator",
      timestamp: "2026-08-13 14:00"
    }
  ],
  milestones: [
    { id: "M-CON-201", containerId: "CON-2026-00002", type: "Assigned", title: "Container Assigned", status: "Completed", location: "Shanghai Depot", actualDate: "2026-08-13" },
    { id: "M-CON-202", containerId: "CON-2026-00002", type: "Empty Picked Up", title: "Empty Picked Up", status: "Completed", location: "Shanghai Depot", actualDate: "2026-08-13" },
    { id: "M-CON-203", containerId: "CON-2026-00002", type: "Gate In", title: "Gated In at Port", status: "Upcoming", location: "Shanghai Port", plannedDate: "2026-08-20" },
    { id: "M-CON-204", containerId: "CON-2026-00002", type: "Loaded", title: "Loaded on Vessel", status: "Pending", location: "Shanghai Berth 2", plannedDate: "2026-08-21" },
    { id: "M-CON-205", containerId: "CON-2026-00002", type: "Departed", title: "Vessel Departed", status: "Pending", location: "Shanghai Port", plannedDate: "2026-08-22" }
  ],
  sealHistory: [
    { id: "SH-CON-201", containerId: "CON-2026-00002", oldSealNumber: "None", newSealNumber: "SL-882049", status: "Assigned", changedAt: "2026-08-13T10:00:00Z", changedBy: "Siddharth Rao", reason: "Pre-allocated seal dispatched with driver." }
  ]
});

MOCK_CONTAINERS.push({
  id: "CON-2026-00003",
  containerNumber: "MAEU8810246",
  shipmentId: "SHP-2026-00127",
  bookingId: "BKG-2026-00127",
  jobId: "JOB-2026-00003",
  customerId: "CUS-2026-003",
  customerName: "SunRise Solar Energy",
  containerType: "Dry Van",
  containerSize: "40FT HC",
  isoCode: "45G1",
  status: "Empty",
  sealStatus: "Not Assigned",
  tareWeight: 3800,
  maxGrossWeight: 32500,
  cargoWeight: 0,
  volume: 0,
  currentLocation: "Shanghai Container Depot",
  currentCountry: "China",
  origin: "Shanghai Port",
  destination: "Mundra Port",
  condition: "Good",
  assignedTo: "Siddharth Rao",
  createdAt: "2026-08-13T10:10:00Z",
  updatedAt: "2026-08-13T10:10:00Z",
  activities: [
    {
      id: "ACT-CON-301",
      containerId: "CON-2026-00003",
      type: "Created",
      title: "Container Assigned",
      description: "Assigned to Maersk booking BKG-2026-00127",
      performedBy: "Siddharth Rao",
      timestamp: "2026-08-13 10:10"
    }
  ],
  milestones: [
    { id: "M-CON-301", containerId: "CON-2026-00003", type: "Assigned", title: "Container Assigned", status: "Completed", location: "Shanghai Depot", actualDate: "2026-08-13" },
    { id: "M-CON-302", containerId: "CON-2026-00003", type: "Empty Picked Up", title: "Empty Picked Up", status: "Upcoming", location: "Shanghai Depot", plannedDate: "2026-08-15" }
  ],
  sealHistory: []
});

// 3. Programmatically generate remaining containers (total 78 containers)
// Using sea and containerized road bookings from MOCK_BOOKINGS
const containerTypes: Container["containerType"][] = ["Dry Van", "Reefer", "Open Top", "Flat Rack", "Tank", "High Cube"];
const containerSizes: Container["containerSize"][] = ["20FT", "40FT", "40FT HC", "45FT"];
const conditions: ContainerCondition[] = ["Good", "Good", "Good", "Minor Damage", "Good", "Inspection Required", "Good"];

const containerStatuses: ContainerStatus[] = [
  "Gate In", "Loaded", "Departed", "In Transit", "At Destination", "Released", 
  "Out for Delivery", "Delivered", "Empty Return Pending", "Returned"
];

const locations = [
  { name: "JNPT Terminal 2", country: "India" },
  { name: "Sagar Port Yard", country: "India" },
  { name: "Singapore Transshipment Berth", country: "Singapore" },
  { name: "Colombo Port Anchorage", country: "Sri Lanka" },
  { name: "Suez Canal Anchorage", country: "Egypt" },
  { name: "Jebel Ali Container Yard", country: "UAE" },
  { name: "Rotterdam ECT Terminal", country: "Netherlands" },
  { name: "Hamburg Burchardkai", country: "Germany" },
  { name: "Mundra Port Terminal", country: "India" }
];

let globalContainerIdCount = 4;

// Iterate through the mock bookings and assign containers
MOCK_BOOKINGS.forEach((booking, idx) => {
  // Only assign containers to Sea and Road freight
  if (booking.transportMode !== "Sea" && booking.transportMode !== "Road" && booking.transportMode !== "Rail") {
    return;
  }
  
  // Skip the first three we manually seeded above
  if (booking.id === "BKG-2026-00125" || booking.id === "BKG-2026-00127") {
    return;
  }

  // Determine how many containers to assign (e.g. required 1, or 2)
  const reqQty = booking.containerQuantity || booking.quantity || 1;
  
  // Decide whether this booking is fully assigned, partially assigned, or unassigned (equipment shortage)
  let numToAssign = reqQty;
  if (idx % 8 === 0) {
    // Partially assigned: assign 1 if requires 2
    numToAssign = Math.max(0, reqQty - 1);
  } else if (idx % 12 === 0) {
    // Unassigned
    numToAssign = 0;
  }

  for (let c = 0; c < numToAssign; c++) {
    const containerIdNum = globalContainerIdCount++;
    const containerNumber = generateContainerNumber(containerIdNum);
    const id = `CON-2026-${String(containerIdNum).padStart(5, "0")}`;
    
    // Choose container type matching what booking requests or a default
    const typeIdx = containerIdNum % containerTypes.length;
    const type = booking.containerType?.includes("Reefer") ? "Reefer" : containerTypes[typeIdx];
    
    const sizeIdx = containerIdNum % containerSizes.length;
    const size = booking.containerType?.includes("20FT") ? "20FT" 
                 : booking.containerType?.includes("40FT HC") ? "40FT HC"
                 : booking.containerType?.includes("45FT") ? "45FT"
                 : containerSizes[sizeIdx];
    
    // ISO code
    const iso = (ISO_CODES as any)[size]?.[type] || "42G1";
    
    // Status
    let status: ContainerStatus = "Assigned";
    if (booking.status === "Completed") {
      status = containerIdNum % 2 === 0 ? "Returned" : "Delivered";
    } else if (booking.status === "Cancelled" || booking.status === "Rejected") {
      status = "Available"; // returned to pool
    } else {
      status = containerStatuses[containerIdNum % containerStatuses.length];
    }

    const seal = generateSealNumber(containerIdNum);
    const cond = conditions[containerIdNum % conditions.length];
    const loc = locations[containerIdNum % locations.length];

    const tare = size === "20FT" ? 2250 : size === "40FT" ? 3780 : size === "40FT HC" ? 3850 : 4180;
    const cargo = status === "Empty" || status === "Available" || status === "Returned" ? 0 : 5000 + (containerIdNum * 230) % 18000;
    const volume = status === "Empty" || status === "Available" || status === "Returned" ? 0 : 15 + (containerIdNum * 4) % 50;

    MOCK_CONTAINERS.push({
      id,
      containerNumber,
      shipmentId: booking.shipmentId,
      bookingId: booking.id,
      jobId: booking.jobId,
      customerId: booking.customerId,
      customerName: booking.customerName,
      containerType: type,
      containerSize: size,
      isoCode: iso,
      status,
      sealNumber: status !== "Empty" && status !== "Available" ? seal : undefined,
      sealStatus: status === "Empty" || status === "Available" ? "Not Assigned" : "Verified",
      tareWeight: tare,
      maxGrossWeight: size === "20FT" ? 30480 : 32500,
      cargoWeight: cargo,
      volume,
      currentLocation: status === "In Transit" ? `In Transit (${booking.carrierName})` : loc.name,
      currentCountry: loc.country,
      origin: booking.origin,
      destination: booking.destination,
      gateInDate: booking.confirmationDate,
      departureDate: booking.etd,
      arrivalDate: booking.eta,
      deliveryDate: booking.completedAt?.substring(0, 10),
      condition: cond,
      assignedTo: booking.assignedTo,
      createdAt: booking.createdAt,
      updatedAt: new Date(new Date(booking.createdAt).getTime() + 86400000 * 2).toISOString(),
      activities: [
        {
          id: `ACT-${id}-1`,
          containerId: id,
          type: "Created",
          title: "Container Allocated to Booking",
          description: `Assigned physical unit ${containerNumber} to booking ${booking.bookingNumber}`,
          performedBy: booking.assignedTo,
          timestamp: booking.createdAt.substring(0, 16).replace("T", " ")
        }
      ],
      milestones: [
        { id: `M-${id}-1`, containerId: id, type: "Assigned", title: "Container Assigned", status: "Completed", location: loc.name, actualDate: booking.createdAt.substring(0, 10) }
      ],
      sealHistory: status !== "Empty" && status !== "Available" ? [
        { id: `SH-${id}-1`, containerId: id, oldSealNumber: "None", newSealNumber: seal, status: "Assigned", changedAt: booking.createdAt, changedBy: booking.assignedTo, reason: "Lock seal at pickup yard" }
      ] : []
    });
  }
});

// 4. Add some standalone empty containers in the yard (not assigned to any booking)
for (let e = 1; e <= 10; e++) {
  const containerIdNum = globalContainerIdCount++;
  const containerNumber = generateContainerNumber(containerIdNum);
  const id = `CON-2026-${String(containerIdNum).padStart(5, "0")}`;
  const loc = locations[containerIdNum % locations.length];

  MOCK_CONTAINERS.push({
    id,
    containerNumber,
    shipmentId: "",
    bookingId: "",
    jobId: "",
    customerId: "",
    customerName: "",
    containerType: "Dry Van",
    containerSize: "20FT",
    isoCode: "22G1",
    status: "Available",
    sealStatus: "Not Assigned",
    tareWeight: 2250,
    maxGrossWeight: 30480,
    cargoWeight: 0,
    volume: 0,
    currentLocation: `${loc.name} Empty Yard`,
    currentCountry: loc.country,
    origin: "",
    destination: "",
    condition: e % 5 === 0 ? "Minor Damage" : "Good",
    assignedTo: "Shahbaj Borkar",
    createdAt: "2026-08-01T08:00:00Z",
    updatedAt: "2026-08-10T14:30:00Z",
    activities: [
      {
        id: `ACT-${id}-1`,
        containerId: id,
        type: "Created",
        title: "Container Pool Entry",
        description: "Empty container released back to yard stock pool.",
        performedBy: "Yard Inspector",
        timestamp: "2026-08-01 08:00"
      }
    ],
    milestones: [],
    sealHistory: []
  });
}
