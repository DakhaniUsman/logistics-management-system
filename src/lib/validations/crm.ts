import { z } from "zod";

export const leadSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number must be valid"),
  source: z.enum([
    "Website",
    "Referral",
    "Email",
    "Phone",
    "LinkedIn",
    "Advertisement",
    "Trade Show",
    "Partner",
    "Other",
  ]),
  status: z.enum([
    "New",
    "Contacted",
    "Qualified",
    "Proposal",
    "Won",
    "Lost",
    "Unqualified",
  ]),
  owner: z.string().min(2, "Owner name is required"),
  industry: z.string().min(2, "Industry is required"),
  location: z.string().min(2, "Location is required"),
  estimatedValue: z.number().min(0, "Estimated value must be non-negative"),
  expectedCloseDate: z.string().min(1, "Expected close date is required"),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  industry: z.string().min(2, "Industry is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Valid phone number is required"),
  website: z.string().optional(),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  taxId: z.string().optional(),
  status: z.enum(["Active Prospect", "Customer", "Inactive"]),
  owner: z.string().min(2, "Owner is required"),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

export const contactSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  designation: z.string().min(2, "Designation is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Valid phone number is required"),
  companyId: z.string().min(1, "Company selection is required"),
  department: z.string().min(2, "Department is required"),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const customerSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  industry: z.string().min(2, "Industry is required"),
  status: z.enum(["Active", "On Hold", "Inactive", "Prospect"]),
  category: z.enum(["VIP Enterprise", "Key Account", "Standard", "Prospect"]),
  accountOwner: z.string().min(2, "Account owner is required"),
  primaryContactName: z.string().min(2, "Contact name is required"),
  primaryContactEmail: z.string().email("Invalid contact email"),
  primaryContactPhone: z.string().min(6, "Valid contact phone is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
  creditLimit: z.number().min(0, "Credit limit must be positive"),
  paymentTerms: z.string().min(2, "Payment terms required"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const activitySchema = z.object({
  type: z.enum(["Call", "Email", "Meeting", "Follow-up", "Note", "Task"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  relatedEntity: z.enum(["Lead", "Company", "Customer", "Contact"]),
  relatedEntityId: z.string().min(1, "Related entity ID is required"),
  assignedTo: z.string().min(2, "Assigned user is required"),
  dueDate: z.string().optional(),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;

export const taskSchema = z.object({
  title: z.string().min(3, "Task title is required"),
  description: z.string().min(5, "Description is required"),
  assignee: z.string().min(2, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  status: z.enum(["Pending", "In Progress", "Completed", "Overdue"]),
  relatedEntity: z.enum(["Lead", "Company", "Customer", "Contact"]),
  relatedEntityId: z.string().min(1, "Related entity ID is required"),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
