import { z } from "zod";

export const containerSchema = z
  .object({
    containerNumber: z
      .string()
      .min(1, "Container number is required")
      .toUpperCase()
      .regex(/^[A-Z]{4}\d{7}$/, {
        message: "Must be a standard container number, e.g. MSCU1234567 (4 letters and 7 digits)"
      }),
    containerType: z.enum(["Dry Van", "Reefer", "Open Top", "Flat Rack", "Tank", "High Cube"], {
      errorMap: () => ({ message: "Select a valid container type" })
    }),
    containerSize: z.enum(["20FT", "40FT", "40FT HC", "45FT"], {
      errorMap: () => ({ message: "Select a valid container size" })
    }),
    isoCode: z
      .string()
      .min(1, "ISO code is required")
      .toUpperCase()
      .regex(/^[A-Z0-9]{4}$/, {
        message: "ISO code must be a 4-character code, e.g. 22G1, 42G1, 45G1"
      }),
    sealNumber: z.string().optional().or(z.literal("")),
    tareWeight: z
      .number({ required_error: "Tare weight is required", invalid_type_error: "Tare weight must be a number" })
      .min(0, "Tare weight must be 0 or more"),
    cargoWeight: z
      .number({ required_error: "Cargo weight is required", invalid_type_error: "Cargo weight must be a number" })
      .min(0, "Cargo weight must be 0 or more"),
    maxGrossWeight: z
      .number({ required_error: "Max gross weight is required", invalid_type_error: "Max gross weight must be a number" })
      .min(100, "Max gross weight must be at least 100 kg"),
    
    // Links
    shipmentId: z.string().min(1, "Shipment reference is required"),
    bookingId: z.string().min(1, "Booking reference is required"),
    jobId: z.string().min(1, "Job reference is required"),
    customerId: z.string().min(1, "Customer is required"),
    customerName: z.string().min(1, "Customer name is required"),

    // Routing
    currentLocation: z.string().min(1, "Current location is required"),
    currentCountry: z.string().min(1, "Current country is required"),
    origin: z.string().min(1, "Origin is required"),
    destination: z.string().min(1, "Destination is required"),

    // Audit
    assignedTo: z.string().min(1, "Assignee is required"),
    notes: z.string().optional().or(z.literal(""))
  })
  .refine(
    (data) => {
      const gross = data.tareWeight + data.cargoWeight;
      return gross <= data.maxGrossWeight;
    },
    {
      message: "Gross Weight (Tare + Cargo) cannot exceed Maximum Gross Weight capacity",
      path: ["cargoWeight"] // Link error to cargo weight input
    }
  );

export type ContainerFormValues = z.infer<typeof containerSchema>;
