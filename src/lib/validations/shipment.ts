import { z } from "zod";

export const shipmentSchema = z.object({
  jobId: z.string().min(1, "Parent Job selection is required"),
  transportMode: z.enum(["Sea", "Air", "Road", "Rail", "Multimodal"]),
  serviceType: z.string().min(1, "Service type is required"),
  origin: z.string().min(2, "Origin location is required"),
  destination: z.string().min(2, "Destination location is required"),
  originCountry: z.string().min(2, "Origin country is required"),
  destinationCountry: z.string().min(2, "Destination country is required"),
  
  // Mode-specific optional fields
  originPort: z.string().optional(),
  destinationPort: z.string().optional(),
  originAirport: z.string().optional(),
  destinationAirport: z.string().optional(),
  pickupLocation: z.string().optional(),
  deliveryLocation: z.string().optional(),
  
  // Carrier details
  carrierName: z.string().optional(),
  vesselName: z.string().optional(),
  voyageNumber: z.string().optional(),
  flightNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),

  // Dates
  etd: z.string().min(1, "Estimated Time of Departure (ETD) is required"),
  eta: z.string().min(1, "Estimated Time of Arrival (ETA) is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  requiredDeliveryDate: z.string().min(1, "Required delivery date is required"),

  // Cargo
  cargoDescription: z.string().min(2, "Cargo description is required"),
  cargoType: z.string().min(1, "Cargo type is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  quantityUnit: z.string().min(1, "Quantity unit is required"),
  weight: z.number().min(0.1, "Weight must be greater than 0"),
  weightUnit: z.string().min(1, "Weight unit is required"),
  volume: z.number().min(0.01, "Volume must be greater than 0"),
  volumeUnit: z.string().min(1, "Volume unit is required"),
  containerType: z.string().optional(),
  containerQuantity: z.number().optional(),

  // Assignment & Special
  assignedTo: z.string().min(1, "Assigned operations lead is required"),
  specialRequirements: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.etd && data.eta) {
    return new Date(data.eta) >= new Date(data.etd);
  }
  return true;
}, {
  message: "Estimated Time of Arrival (ETA) cannot be earlier than Departure (ETD)",
  path: ["eta"],
});

export type ShipmentFormValues = z.infer<typeof shipmentSchema>;
