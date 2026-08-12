import { z } from "zod";

export const jobTaskSchema = z.object({
  title: z.string().min(2, "Task title is required"),
  description: z.string().optional(),
  assignedTo: z.string().min(2, "Assigned user is required"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  dueDate: z.string().min(1, "Due date is required"),
});

export const jobSchema = z.object({
  customerId: z.string().min(1, "Customer selection is required"),
  customerName: z.string().min(2, "Customer name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Valid contact email is required"),
  contactPhone: z.string().min(6, "Valid contact phone is required"),
  jobType: z.enum([
    "Freight Forwarding",
    "Transportation",
    "Customs Clearance",
    "Warehousing",
    "3PL / Fulfillment",
    "Door-to-Door",
    "Port-to-Port",
    "Port-to-Door",
    "Door-to-Port",
    "Other",
  ]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  assignedTo: z.string().min(2, "Assigned operations lead is required"),
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  transportMode: z.string().min(2, "Transport mode is required"),
  serviceType: z.string().min(2, "Service type is required"),
  cargoDescription: z.string().min(2, "Cargo description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  quantityUnit: z.string().min(1, "Quantity unit is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  requiredDeliveryDate: z.string().min(1, "Required delivery date is required"),
  estimatedRevenue: z.number().min(0, "Estimated revenue must be non-negative"),
  estimatedCost: z.number().min(0, "Estimated cost must be non-negative"),
  currency: z.string().min(3, "Currency code is required"),
  paymentTerms: z.string().min(2, "Payment terms required"),
  incoterm: z.string().min(2, "Incoterm required"),
  specialRequirements: z.string().optional(),
  notes: z.string().optional(),
});

export type JobFormValues = z.infer<typeof jobSchema>;
