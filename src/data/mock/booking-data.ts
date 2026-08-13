import { Booking } from "@/types/booking";
import { MOCK_SHIPMENTS } from "./shipment-data";

export const MOCK_CARRIERS = [
  { id: "CAR-001", name: "MSC Shipping Line", mode: "Sea" },
  { id: "CAR-002", name: "Maersk Line", mode: "Sea" },
  { id: "CAR-003", name: "CMA CGM", mode: "Sea" },
  { id: "CAR-004", name: "Hapag-Lloyd", mode: "Sea" },
  { id: "CAR-005", name: "ONE Line", mode: "Sea" },
  { id: "CAR-006", name: "Emirates SkyCargo", mode: "Air" },
  { id: "CAR-007", name: "Qatar Airways Cargo", mode: "Air" },
  { id: "CAR-008", name: "Lufthansa Cargo", mode: "Air" },
  { id: "CAR-009", name: "TCI Logistics", mode: "Road" },
  { id: "CAR-010", name: "VRL Logistics", mode: "Road" },
  { id: "CAR-011", name: "CONCOR India", mode: "Rail" },
  { id: "CAR-012", name: "Indian Railways", mode: "Rail" }
];

export const MOCK_BOOKINGS: Booking[] = [];

// Seed first few bookings manually for high fidelity
MOCK_BOOKINGS.push({
  id: "BKG-2026-00125",
  bookingNumber: "BKG-2026-00125",
  shipmentId: "SHP-2026-00125",
  jobId: "JOB-2026-00001",
  customerId: "CUS-2026-001",
  customerName: "ABC Electronics Pvt Ltd",
  carrierId: "CAR-001",
  carrierName: "MSC Shipping Line",
  bookingReference: "MSC-BKG-849302",
  status: "Confirmed",
  transportMode: "Sea",
  serviceType: "Port-to-Port",
  origin: "Mumbai Port (JNPT)",
  destination: "Jebel Ali Port",
  originPort: "JNPT Port, Mumbai",
  destinationPort: "Jebel Ali Port, Dubai",
  vesselName: "MSC ANNA",
  voyageNumber: "024W",
  requestedDate: "2026-08-12",
  confirmationDate: "2026-08-13",
  etd: "2026-08-18",
  eta: "2026-08-26",
  cargoDescription: "Consumer Electronics & Microcontrollers",
  cargoType: "High Value",
  quantity: 500,
  quantityUnit: "Cartons",
  weight: 18000,
  weightUnit: "KG",
  volume: 45,
  volumeUnit: "CBM",
  containerType: "40FT High Cube",
  containerQuantity: 1,
  equipmentType: "40FT High Cube",
  equipmentQuantity: 1,
  assignedTo: "Vikram Mehta",
  specialRequirements: "Provide shock-proof pallet wrapping & GDP temperature logging.",
  notes: "Primary ocean transport leg for JNPT to Jebel Ali.",
  createdBy: "Shahbaj Borkar",
  createdAt: "2026-08-12T10:00:00Z",
  updatedAt: "2026-08-13T16:00:00Z",
  activities: [
    {
      id: "ACT-BKG-1",
      bookingId: "BKG-2026-00125",
      type: "Created",
      title: "Booking Record Initialized",
      description: "Booking created from Shipment SHP-2026-00125",
      performedBy: "Shahbaj Borkar",
      timestamp: "2026-08-12 10:00"
    },
    {
      id: "ACT-BKG-2",
      bookingId: "BKG-2026-00125",
      type: "Submitted",
      title: "Booking Requested with MSC",
      description: "Requested space for 1x40HC on MSC ANNA Voyage 024W",
      performedBy: "Vikram Mehta",
      timestamp: "2026-08-12 14:30"
    },
    {
      id: "ACT-BKG-3",
      bookingId: "BKG-2026-00125",
      type: "Confirmed",
      title: "Booking Confirmed by Carrier",
      description: "MSC Shipping Line released booking reference MSC-BKG-849302.",
      performedBy: "Siddharth Rao",
      timestamp: "2026-08-13 11:30"
    }
  ],
  amendments: []
});

MOCK_BOOKINGS.push({
  id: "BKG-2026-00126",
  bookingNumber: "BKG-2026-00126",
  shipmentId: "SHP-2026-00126",
  jobId: "JOB-2026-00002",
  customerId: "CUS-2026-002",
  customerName: "Nexus Pharmaceuticals Ltd",
  carrierId: "CAR-006",
  carrierName: "Emirates SkyCargo",
  bookingReference: "EK-AWB-90214451",
  status: "Confirmed",
  transportMode: "Air",
  serviceType: "Door-to-Door",
  origin: "Mumbai Airport (BOM)",
  destination: "Frankfurt Airport (FRA)",
  originAirport: "Chhatrapati Shivaji Maharaj Airport (BOM)",
  destinationAirport: "Frankfurt Main Airport (FRA)",
  flightNumber: "EK-501 / EK-045",
  requestedDate: "2026-08-12",
  confirmationDate: "2026-08-13",
  etd: "2026-08-15",
  eta: "2026-08-17",
  cargoDescription: "Active Pharmaceutical Ingredients (2-8°C Cold Chain)",
  cargoType: "GDP Pharma",
  quantity: 12,
  quantityUnit: "Pallets",
  weight: 3400,
  weightUnit: "KG",
  volume: 14.5,
  volumeUnit: "CBM",
  containerType: "Cool Container (Reefer Pallet)",
  containerQuantity: 12,
  equipmentType: "LD3 Cold Chain Container",
  equipmentQuantity: 4,
  assignedTo: "Neha Kapoor",
  specialRequirements: "Maintain strictly between 2-8°C with dry-ice top-up at Dubai hub.",
  notes: "Express pharma shipment flagged for transfer inspection.",
  createdBy: "Neha Kapoor",
  createdAt: "2026-08-12T11:00:00Z",
  updatedAt: "2026-08-13T14:20:00Z",
  activities: [
    {
      id: "ACT-BKG-21",
      bookingId: "BKG-2026-00126",
      type: "Created",
      title: "Booking Draft Created",
      description: "Air freight booking created from Shipment SHP-2026-00126",
      performedBy: "Neha Kapoor",
      timestamp: "2026-08-12 11:00"
    },
    {
      id: "ACT-BKG-22",
      bookingId: "BKG-2026-00126",
      type: "Confirmed",
      title: "AWB Generated & Space Locked",
      description: "Emirates SkyCargo confirmed space on EK-501 flight. AWB #176-90214451.",
      performedBy: "Neha Kapoor",
      timestamp: "2026-08-13 14:20"
    }
  ],
  amendments: []
});

MOCK_BOOKINGS.push({
  id: "BKG-2026-00127",
  bookingNumber: "BKG-2026-00127",
  shipmentId: "SHP-2026-00127",
  jobId: "JOB-2026-00003",
  customerId: "CUS-2026-003",
  customerName: "SunRise Solar Energy",
  carrierId: "CAR-002",
  carrierName: "Maersk Line",
  bookingReference: "MAEU-887120",
  status: "Pending Confirmation",
  transportMode: "Sea",
  serviceType: "Door-to-Port",
  origin: "Shanghai Port",
  destination: "Mundra Port",
  originPort: "Shanghai Port, China",
  destinationPort: "Mundra Port, Gujarat",
  vesselName: "MAERSK MC-KINNEY",
  voyageNumber: "2609E",
  requestedDate: "2026-08-13",
  etd: "2026-08-22",
  eta: "2026-09-02",
  cargoDescription: "Photovoltaic Solar Modules & Inverters",
  cargoType: "General",
  quantity: 1200,
  quantityUnit: "Cartons",
  weight: 42000,
  weightUnit: "KG",
  volume: 110,
  volumeUnit: "CBM",
  containerType: "40FT High Cube",
  containerQuantity: 3,
  equipmentType: "40FT High Cube",
  equipmentQuantity: 3,
  assignedTo: "Siddharth Rao",
  specialRequirements: "Heavy lift container handling at Mundra Terminal 2.",
  createdBy: "Siddharth Rao",
  createdAt: "2026-08-13T09:00:00Z",
  updatedAt: "2026-08-13T09:00:00Z",
  activities: [
    {
      id: "ACT-BKG-31",
      bookingId: "BKG-2026-00127",
      type: "Created",
      title: "Booking Requested",
      description: "Ocean booking requested with Maersk Line.",
      performedBy: "Siddharth Rao",
      timestamp: "2026-08-13 09:00"
    }
  ],
  amendments: []
});

MOCK_BOOKINGS.push({
  id: "BKG-2026-00128",
  bookingNumber: "BKG-2026-00128",
  shipmentId: "SHP-2026-00128",
  jobId: "JOB-2026-00004",
  customerId: "CUS-2026-004",
  customerName: "Apex Auto Parts Pvt Ltd",
  carrierId: "CAR-009",
  carrierName: "TCI Logistics",
  bookingReference: "TCI-LR-998811",
  status: "Completed",
  transportMode: "Road",
  serviceType: "Door-to-Door",
  origin: "Pune Industrial Estate",
  destination: "Chennai Auto Hub",
  pickupLocation: "Plot 42, Chakan MIDC, Pune",
  deliveryLocation: "Sriperumbudur Auto Park, Chennai",
  vehicleNumber: "MH-12-PQ-9088",
  vehicleType: "32FT Closed Container Truck",
  requestedDate: "2026-08-09",
  confirmationDate: "2026-08-09",
  etd: "2026-08-10",
  eta: "2026-08-13",
  cargoDescription: "Automotive Transmission Gears & Assemblies",
  cargoType: "General",
  quantity: 450,
  quantityUnit: "Crates",
  weight: 12500,
  weightUnit: "KG",
  volume: 32,
  volumeUnit: "CBM",
  containerType: "32FT Container Truck",
  containerQuantity: 1,
  equipmentType: "Truck",
  equipmentQuantity: 1,
  assignedTo: "Amit Patel",
  notes: "Delivered cleanly on 13 Aug with signed POD.",
  createdBy: "Amit Patel",
  createdAt: "2026-08-09T14:00:00Z",
  updatedAt: "2026-08-13T16:45:00Z",
  activities: [
    {
      id: "ACT-BKG-41",
      bookingId: "BKG-2026-00128",
      type: "Created",
      title: "Road Booking Draft",
      description: "Truck booking requested from TCI Logistics.",
      performedBy: "Amit Patel",
      timestamp: "2026-08-09 14:00"
    },
    {
      id: "ACT-BKG-42",
      bookingId: "BKG-2026-00128",
      type: "Confirmed",
      title: "Truck Allocated & Confirmed",
      description: "Vehicle MH-12-PQ-9088 assigned with driver Ramesh Pawar.",
      performedBy: "Amit Patel",
      timestamp: "2026-08-09 16:30"
    },
    {
      id: "ACT-BKG-43",
      bookingId: "BKG-2026-00128",
      type: "Completed",
      title: "Fulfillment Completed",
      description: "Delivery completed at Chennai destination.",
      performedBy: "Amit Patel",
      timestamp: "2026-08-13 16:45"
    }
  ],
  amendments: []
});

// Generate 60+ bookings programmatically based on MOCK_SHIPMENTS
const bookingStatuses: Booking["status"][] = [
  "Confirmed", "Pending Confirmation", "Requested", "Confirmed", "Draft", 
  "Amendment Requested", "Amended", "Rejected", "Cancelled", "Completed"
];

const cancellationReasons = [
  "Carrier unavailable", "Customer cancelled", "Schedule change", "Duplicate booking", "Other"
];

// Let's populate mock bookings based on mock shipments (excluding those manually added)
MOCK_SHIPMENTS.forEach((shipment, index) => {
  // Skip the first 4 since we added them manually above
  if (["SHP-2026-00125", "SHP-2026-00126", "SHP-2026-00127", "SHP-2026-00128"].includes(shipment.id)) {
    return;
  }

  const bkgNumStr = String(index + 1).padStart(5, "0");
  const id = `BKG-2026-${bkgNumStr}`;
  const status = bookingStatuses[index % bookingStatuses.length];

  // Pick carrier matching the mode
  const modeCarriers = MOCK_CARRIERS.filter(c => c.mode === shipment.transportMode);
  const carrier = modeCarriers[index % modeCarriers.length] || MOCK_CARRIERS[0];

  const extRefPrefix = carrier.name.substring(0, 3).toUpperCase();
  const extRefNum = 100000 + index;
  const bookingReference = status !== "Draft" && status !== "Requested" 
    ? `${extRefPrefix}-BKG-${extRefNum}` 
    : undefined;

  const isCancelled = status === "Cancelled";
  const isCompleted = status === "Completed" || shipment.status === "Delivered" || shipment.status === "Completed";
  
  const bkgStatus = isCompleted ? "Completed" : isCancelled ? "Cancelled" : status;
  const cancellationReason = isCancelled ? cancellationReasons[index % cancellationReasons.length] : undefined;

  const bkgDate = new Date(new Date(shipment.etd).getTime() - 86400000 * 6);
  const bkgDateStr = bkgDate.toISOString().split("T")[0];

  const booking: Booking = {
    id,
    bookingNumber: id,
    shipmentId: shipment.id,
    jobId: shipment.jobId,
    customerId: shipment.customerId,
    customerName: shipment.customerName,
    carrierId: carrier.id,
    carrierName: carrier.name,
    bookingReference,
    status: bkgStatus,
    transportMode: shipment.transportMode,
    serviceType: shipment.serviceType,
    origin: shipment.origin,
    destination: shipment.destination,
    
    originPort: shipment.originPort || (shipment.transportMode === "Sea" ? `${shipment.origin} Port` : undefined),
    destinationPort: shipment.destinationPort || (shipment.transportMode === "Sea" ? `${shipment.destination} Port` : undefined),
    originAirport: shipment.originAirport || (shipment.transportMode === "Air" ? `${shipment.origin} Airport` : undefined),
    destinationAirport: shipment.destinationAirport || (shipment.transportMode === "Air" ? `${shipment.destination} Airport` : undefined),
    pickupLocation: shipment.pickupLocation,
    deliveryLocation: shipment.deliveryLocation,

    vesselName: shipment.vesselName,
    voyageNumber: shipment.voyageNumber,
    flightNumber: shipment.flightNumber,
    vehicleNumber: shipment.vehicleNumber,
    railOperator: shipment.railOperator || (shipment.transportMode === "Rail" ? carrier.name : undefined),

    requestedDate: bkgDateStr,
    confirmationDate: (bkgStatus !== "Draft" && bkgStatus !== "Requested" && bkgStatus !== "Pending Confirmation")
      ? new Date(bkgDate.getTime() + 86400000).toISOString().split("T")[0]
      : undefined,
    etd: shipment.etd,
    eta: shipment.eta,
    pickupDate: shipment.pickupDate,
    deliveryDate: shipment.requiredDeliveryDate,

    cargoDescription: shipment.cargoDescription,
    cargoType: shipment.cargoType,
    quantity: shipment.quantity || 1,
    quantityUnit: shipment.quantityUnit || "Shipment",
    weight: shipment.weight || 1000,
    weightUnit: shipment.weightUnit || "KG",
    volume: shipment.volume || 10,
    volumeUnit: shipment.volumeUnit || "CBM",
    containerType: shipment.containerType || (shipment.transportMode === "Sea" ? "20FT Standard" : "Truck"),
    containerQuantity: shipment.containerQuantity || 1,
    
    equipmentType: shipment.containerType || (shipment.transportMode === "Sea" ? "20FT Standard" : "Truck"),
    equipmentQuantity: shipment.containerQuantity || 1,
    
    specialRequirements: shipment.specialRequirements,
    assignedTo: shipment.assignedTo || "Vikram Mehta",
    createdBy: "System Admin",
    createdAt: bkgDate.toISOString(),
    updatedAt: bkgDate.toISOString(),
    cancelledAt: isCancelled ? new Date(bkgDate.getTime() + 86400000 * 2).toISOString() : undefined,
    cancellationReason,
    completedAt: isCompleted ? new Date(shipment.eta).toISOString() : undefined,

    activities: [
      {
        id: `ACT-${id}-1`,
        bookingId: id,
        type: "Created",
        title: "Booking Requested",
        description: `Space reservation query created for shipment ${shipment.id}`,
        performedBy: shipment.assignedTo || "System",
        timestamp: `${bkgDateStr} 09:30`
      }
    ],
    amendments: []
  };

  // Add confirmation activity if confirmed
  if (bkgStatus === "Confirmed" || bkgStatus === "Completed" || bkgStatus === "Amended") {
    booking.activities!.push({
      id: `ACT-${id}-2`,
      bookingId: id,
      type: "Confirmed",
      title: "Booking Confirmed",
      description: `Carrier released confirmation reference ${bookingReference}`,
      performedBy: "Carrier Feeder",
      timestamp: `${booking.confirmationDate} 14:00`
    });
  }

  // Add amendment if status is Amended or Amendment Requested
  if (bkgStatus === "Amended" || bkgStatus === "Amendment Requested") {
    const originalEtd = new Date(new Date(shipment.etd).getTime() - 86400000 * 2).toISOString().split("T")[0];
    booking.amendments = [
      {
        id: `AMD-${id}-1`,
        bookingId: id,
        fieldName: "etd",
        oldValue: originalEtd,
        newValue: shipment.etd,
        changedBy: "Carrier Agent",
        changedAt: `${bkgDateStr} 15:45`,
        reason: "Vessel schedule slide / port congestion"
      }
    ];

    booking.activities!.push({
      id: `ACT-${id}-3`,
      bookingId: id,
      type: "Amended",
      title: "Booking Amendment Processed",
      description: `ETD amended from ${originalEtd} to ${shipment.etd} due to Carrier Schedule Change.`,
      performedBy: "Carrier Agent",
      timestamp: `${bkgDateStr} 15:45`
    });
  }

  if (isCancelled) {
    booking.activities!.push({
      id: `ACT-${id}-4`,
      bookingId: id,
      type: "Cancelled",
      title: "Booking Cancelled",
      description: `Booking cancelled. Reason: ${cancellationReason}`,
      performedBy: "Shahbaj Borkar",
      timestamp: `${booking.cancelledAt?.substring(0, 10)} 10:15`
    });
  }

  MOCK_BOOKINGS.push(booking);
});

// If the count is still under 60 (we have 1+1+1+1 + 47-4 = 47 total), let's add 15 more bookings
// to ensure we satisfy "60+ bookings" requirement cleanly
const initialLen = MOCK_BOOKINGS.length;
for (let j = 1; j <= 20; j++) {
  const extraBkgIndex = initialLen + j;
  const id = `BKG-2026-${String(extraBkgIndex).padStart(5, "0")}`;
  const shipmentId = `SHP-2026-${String(j).padStart(5, "0")}`;
  const jobId = `JOB-2026-${String(j).padStart(5, "0")}`;
  const carrier = MOCK_CARRIERS[j % MOCK_CARRIERS.length];
  
  const bkgDate = new Date(Date.now() - 86400000 * (10 + j));
  const bkgDateStr = bkgDate.toISOString().split("T")[0];

  MOCK_BOOKINGS.push({
    id,
    bookingNumber: id,
    shipmentId,
    jobId,
    customerId: `CUS-2026-${String((j % 10) + 1).padStart(3, "0")}`,
    customerName: j % 2 === 0 ? "ABC Electronics Pvt Ltd" : "Nexus Pharmaceuticals Ltd",
    carrierId: carrier.id,
    carrierName: carrier.name,
    bookingReference: `CAR-REF-${99882 + j}`,
    status: j % 4 === 0 ? "Pending Confirmation" : j % 5 === 0 ? "Draft" : "Confirmed",
    transportMode: carrier.mode as any,
    serviceType: carrier.mode === "Sea" ? "Port-to-Port" : carrier.mode === "Air" ? "Airport-to-Airport" : "Door-to-Door",
    origin: j % 2 === 0 ? "Mumbai" : "Shanghai",
    destination: j % 2 === 0 ? "Dubai" : "Rotterdam",
    requestedDate: bkgDateStr,
    etd: new Date(bkgDate.getTime() + 86400000 * 5).toISOString().split("T")[0],
    eta: new Date(bkgDate.getTime() + 86400000 * 15).toISOString().split("T")[0],
    cargoDescription: "Commercial Machinery Parts",
    quantity: 10 + j,
    quantityUnit: "Pallets",
    weight: 4500 + (j * 200),
    weightUnit: "KG",
    volume: 12 + j,
    volumeUnit: "CBM",
    assignedTo: "Siddharth Rao",
    createdBy: "Siddharth Rao",
    createdAt: bkgDate.toISOString(),
    updatedAt: bkgDate.toISOString(),
    activities: [
      {
        id: `ACT-${id}-1`,
        bookingId: id,
        type: "Created",
        title: "Booking Requested",
        description: "Space reservation request created",
        performedBy: "Siddharth Rao",
        timestamp: `${bkgDateStr} 11:00`
      }
    ],
    amendments: []
  });
}
