export type LogisticsStatus =
  | "Draft"
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Active"
  | "Confirmed"
  | "In Transit"
  | "Customs Cleared"
  | "Delayed"
  | "Delivered"
  | "Completed"
  | "Cancelled"
  | "Paid"
  | "Partially Paid"
  | "Overdue"
  | "Missing"
  | "Verified"
  | "Needs Review";

export type TransportMode = "Ocean Freight" | "Air Freight" | "Road Freight" | "Rail Freight" | "Multimodal";

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}
