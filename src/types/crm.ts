export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal"
  | "Won"
  | "Lost"
  | "Unqualified";

export type LeadSource =
  | "Website"
  | "Referral"
  | "Email"
  | "Phone"
  | "LinkedIn"
  | "Advertisement"
  | "Trade Show"
  | "Partner"
  | "Other";

export type CustomerCategory =
  | "VIP Enterprise"
  | "Key Account"
  | "Standard"
  | "Prospect";

export type CustomerStatus =
  | "Active"
  | "On Hold"
  | "Inactive"
  | "Prospect";

export type ActivityType =
  | "Call"
  | "Email"
  | "Meeting"
  | "Follow-up"
  | "Note"
  | "Task";

export type ActivityStatus =
  | "Upcoming"
  | "In Progress"
  | "Completed"
  | "Overdue";

export type TaskPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Urgent";

export type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Overdue";

export interface Lead {
  id: string;
  leadNumber: string; // e.g. LEAD-2026-001
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  owner: string; // Sales agent name
  industry: string;
  location: string;
  estimatedValue: number;
  expectedCloseDate: string;
  notes?: string;
  convertedCustomerId?: string; // Link to customer if converted
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  companyName: string;
  industry: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  taxId?: string;
  primaryContactId?: string;
  primaryContactName?: string;
  status: "Active Prospect" | "Customer" | "Inactive";
  owner: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  phone: string;
  companyId: string;
  companyName: string;
  department: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerNumber: string; // e.g. CUS-2026-001
  companyId: string;
  companyName: string;
  industry: string;
  status: CustomerStatus;
  category: CustomerCategory;
  accountOwner: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  country: string;
  city: string;
  creditLimit: number;
  paymentTerms: string;
  convertedFromLeadId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  relatedEntity: "Lead" | "Company" | "Customer" | "Contact";
  relatedEntityId: string;
  relatedEntityName: string;
  assignedTo: string;
  dueDate?: string;
  completedAt?: string;
  status: ActivityStatus;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  relatedEntity: "Lead" | "Company" | "Customer" | "Contact";
  relatedEntityId: string;
  relatedEntityName: string;
  createdAt: string;
}
