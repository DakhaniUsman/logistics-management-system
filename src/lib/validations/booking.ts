import { z } from "zod";

export const bookingSchema = z.object({
  shipmentId: z.string().min(1, "Parent Shipment selection is required"),
  jobId: z.string().min(1, "Parent Job is required"),
  customerId: z.string().min(1, "Customer is required"),
  customerName: z.string().min(1, "Customer name is required"),
  carrierId: z.string().min(1, "Carrier selection is required"),
  carrierName: z.string().min(1, "Carrier name is required"),
  bookingReference: z.string().optional(),
  transportMode: z.enum(["Sea", "Air", "Road", "Rail", "Multimodal"]),
  serviceType: z.string().min(1, "Service type is required"),
  
  // Route fields
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  originPort: z.string().optional(),
  destinationPort: z.string().optional(),
  originAirport: z.string().optional(),
  destinationAirport: z.string().optional(),
  originStation: z.string().optional(),
  destinationStation: z.string().optional(),
  pickupLocation: z.string().optional(),
  deliveryLocation: z.string().optional(),

  // Mode-specific optional fields
  vesselName: z.string().optional(),
  voyageNumber: z.string().optional(),
  flightNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
  vehicleType: z.string().optional(),
  railOperator: z.string().optional(),
  trainNumber: z.string().optional(),

  // Dates
  requestedDate: z.string().min(1, "Requested date is required"),
  etd: z.string().min(1, "ETD is required"),
  eta: z.string().min(1, "ETA is required"),

  // Cargo specs
  cargoDescription: z.string().min(2, "Cargo description is required"),
  cargoType: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  quantityUnit: z.string().min(1, "Quantity unit is required"),
  weight: z.number().min(0.1, "Weight must be greater than 0"),
  weightUnit: z.string().min(1, "Weight unit is required"),
  volume: z.number().min(0.01, "Volume must be greater than 0"),
  volumeUnit: z.string().min(1, "Volume unit is required"),
  containerType: z.string().optional(),
  containerQuantity: z.number().optional(),

  specialRequirements: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().min(1, "Assigned agent is required"),
}).refine((data) => {
  if (data.etd && data.eta) {
    return new Date(data.eta) >= new Date(data.etd);
  }
  return true;
}, {
  message: "Estimated Time of Arrival (ETA) cannot be earlier than Departure (ETD)",
  path: ["eta"],
}).refine((data) => {
  if (data.transportMode === "Sea") {
    return !!data.vesselName && !!data.voyageNumber && !!data.originPort && !!data.destinationPort;
  }
  return true;
}, {
  message: "Vessel name, Voyage number, Origin port, and Destination port are required for Sea freight bookings.",
  path: ["vesselName"],
}).refine((data) => {
  if (data.transportMode === "Air") {
    return !!data.flightNumber && !!data.originAirport && !!data.destinationAirport;
  }
  return true;
}, {
  message: "Flight number, Origin airport, and Destination airport are required for Air freight bookings.",
  path: ["flightNumber"],
}).refine((data) => {
  if (data.transportMode === "Road") {
    return !!data.pickupLocation && !!data.deliveryLocation;
  }
  return true;
}, {
  message: "Pickup and Delivery locations are required for Road transport bookings.",
  path: ["pickupLocation"],
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
