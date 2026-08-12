import { create } from "zustand";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "warning" | "success" | "danger" | "info";
  read: boolean;
  category: "operations" | "customs" | "finance" | "system";
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  department: string;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  code: string;
  branch: string;
}

interface AppStoreState {
  // Sidebar State
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  toggleSidebarCollapse: () => void;
  setMobileSidebarOpen: (open: boolean) => void;

  // Global Search
  isGlobalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Active Organization / Branch
  currentOrg: OrganizationInfo;
  setCurrentOrg: (org: OrganizationInfo) => void;

  // User Profile
  user: UserProfile;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Vessel Weather Delay: JOB-2026-00125",
    message: "ETA updated to Aug 18 due to Arabian Sea weather adjustment on MSC VIRTUOSA.",
    timestamp: "10 mins ago",
    type: "warning",
    read: false,
    category: "operations",
  },
  {
    id: "notif-2",
    title: "Customs Cleared: JOB-2026-00127",
    message: "BOM Airport customs cleared for Nexus Pharma shipment.",
    timestamp: "1 hour ago",
    type: "success",
    read: false,
    category: "customs",
  },
  {
    id: "notif-3",
    title: "Invoice Overdue: INV-2026-8804",
    message: "Payment overdue by 5 days for Global Freight Systems (₹450,000).",
    timestamp: "3 hours ago",
    type: "danger",
    read: false,
    category: "finance",
  },
];

export const useAppStore = create<AppStoreState>((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

  isGlobalSearchOpen: false,
  setGlobalSearchOpen: (open) => set({ isGlobalSearchOpen: open }),

  notifications: INITIAL_NOTIFICATIONS,
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearAllNotifications: () => set({ notifications: [] }),

  currentOrg: {
    id: "org-1",
    name: "Eclipse Logistics Ltd",
    code: "ECLIPSE-HQ",
    branch: "Mumbai (HQ)",
  },
  setCurrentOrg: (org) => set({ currentOrg: org }),

  user: {
    name: "Shahbaj Borkar",
    email: "shahbaj@eclipselogistics.com",
    role: "Operations Manager",
    department: "Global Freight Forwarding",
  },

  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
