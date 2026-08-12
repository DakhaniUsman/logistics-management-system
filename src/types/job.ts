export type JobStatus =
  | "Draft"
  | "Pending Activation"
  | "Active"
  | "In Progress"
  | "In Transit"
  | "Delivered"
  | "Customs Cleared"
  | "Confirmed"
  | "On Hold"
  | "Delayed"
  | "Completed"
  | "Cancelled"
  | "Closed";

export interface OperationalTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  completed?: boolean;
  isCurrent?: boolean;
}

export interface CustomerSummary {
  id: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  country?: string;
  category?: string;
  totalJobs?: number;
}

export interface DashboardMetrics {
  totalJobs?: number;
  activeJobs?: number;
  activeJobsCount?: number;
  activeShipmentsCount?: number;
  deliveredThisMonthCount?: number;
  delayedCount?: number;
  inTransit?: number;
  inTransitCount?: number;
  delivered?: number;
  exceptionCount?: number;
  totalRevenue?: number;
  totalActualCost?: number;
  totalProfit?: number;
  averageMarginPercentage?: number;
  outstandingReceivables?: number;
  pendingPayables?: number;
}

export type JobPriority = "Low" | "Medium" | "High" | "Urgent";

export type JobType =
  | "Freight Forwarding"
  | "Transportation"
  | "Customs Clearance"
  | "Warehousing"
  | "3PL / Fulfillment"
  | "Door-to-Door"
  | "Port-to-Port"
  | "Port-to-Door"
  | "Door-to-Port"
  | "Other";

export interface JobTask {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  assignedTo: string;
  priority: JobPriority;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  createdAt: string;
  completedAt?: string;
}

export interface JobActivity {
  id: string;
  jobId: string;
  type: string;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface JobDocumentMeta {
  id: string;
  jobId: string;
  documentType: string;
  status: "Available" | "Pending" | "Missing" | "Approved";
  required: boolean;
}

export interface Job {
  id: string; // e.g. JOB-2026-00001
  jobNumber?: string;
  jobNo?: string;
  customer?: any;
  route?: any;
  alerts?: any;
  quotationId?: string;
  quotationNumber?: string;
  quotationNo?: string;
  enquiryId?: string;
  enquiryNumber?: string;
  enquiryNo?: string;
  shipmentNo?: string;
  bookingNo?: string;
  containerNo?: string;
  containers?: any;
  financials?: any;
  assignedManager?: any;
  timeline?: any;
  customerId?: string;
  customerName?: string;
  companyId?: string;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  jobType?: JobType;
  status: JobStatus;
  priority?: JobPriority;
  assignedTo?: string; // Operations User
  assignedDepartment?: string;
  origin?: string;
  destination?: string;
  originCountry?: string;
  destinationCountry?: string;
  transportMode?: string;
  serviceType?: string;
  cargoDescription?: string;
  quantity?: number;
  quantityUnit?: string;
  weight?: number;
  weightUnit?: string;
  volume?: number;
  volumeUnit?: string;
  containerType?: string;
  containerQuantity?: number;
  pickupDate?: string;
  requiredDeliveryDate?: string;
  estimatedRevenue?: number; // Inherited from accepted quotation
  estimatedCost?: number; // Inherited from accepted quotation
  expectedProfit?: number;
  expectedMarginPercentage?: number;
  currency?: string;
  paymentTerms?: string;
  incoterm?: string;
  specialRequirements?: string;
  notes?: string;
  tasks?: JobTask[];
  activities?: JobActivity[];
  documents?: JobDocumentMeta[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  closedAt?: string;
}
