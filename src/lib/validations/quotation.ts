import { z } from "zod";

export const quotationLineItemSchema = z.object({
  description: z.string().min(2, "Line item description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  totalPrice: z.number().min(0, "Total price must be non-negative"),
  internalCostReference: z.number().optional(),
});

export const quotationSchema = z.object({
  enquiryId: z.string().min(1, "Source Enquiry selection is required"),
  customerId: z.string().min(1, "Customer selection is required"),
  customerName: z.string().min(2, "Customer name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Valid contact email is required"),
  contactPhone: z.string().min(6, "Valid contact phone is required"),
  validFrom: z.string().min(1, "Valid From date is required"),
  validUntil: z.string().min(1, "Valid Until date is required"),
  currency: z.string().min(3, "Currency code is required"),
  items: z.array(quotationLineItemSchema).min(1, "At least one line item is required"),
  internalCost: z.number().min(0),
  marginType: z.enum(["fixed", "percentage"]),
  marginValue: z.number().min(0),
  discountType: z.enum(["fixed", "percentage"]).optional(),
  discountValue: z.number().optional(),
  taxName: z.string().min(1, "Tax type is required"),
  taxPercentage: z.number().min(0),
  paymentTerms: z.string().min(2, "Payment terms required"),
  transitTime: z.string().min(2, "Transit time required"),
  incoterm: z.string().min(2, "Incoterm required"),
  origin: z.string().min(2, "Origin location is required"),
  destination: z.string().min(2, "Destination location is required"),
  transportMode: z.string().min(2, "Transport mode is required"),
  termsAndConditions: z.string().min(5, "Terms & conditions required"),
  notes: z.string().optional(),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;
