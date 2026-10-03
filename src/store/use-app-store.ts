import { create } from "zustand";
import { useCrmStore } from "./use-crm-store";
import { useJobStore } from "./use-job-store";
import { useShipmentStore } from "./use-shipment-store";
import { useWarehouseStore } from "./use-warehouse-store";
import { useCustomsStore } from "./use-customs-store";
import { useTransportStore } from "./use-transport-store";
import { toast } from "sonner";

export type ActiveRegion = "chennai" | "mumbai" | "all";

export interface RegionConfig {
  id: ActiveRegion;
  name: string;
  code: string;
  tagline: string;
  branch: string;
  primaryPort: string;
  secondaryPort?: string;
  airportCode: string;
  state: string;
  country: string;
  corridor: string;
}

export const REGION_CONFIGS: Record<ActiveRegion, RegionConfig> = {
  chennai: {
    id: "chennai",
    name: "Chennai Operations Hub (HQ)",
    code: "ECLIPSE-HQ",
    tagline: "Coromandel Coast Gateway & South India Logistics Corridor",
    branch: "Chennai (HQ)",
    primaryPort: "Chennai Sea Port (Madras Port Trust)",
    secondaryPort: "Kattupalli Adani Port & Kamarajar Ennore",
    airportCode: "MAA - Chennai International Air Cargo Complex",
    state: "Tamil Nadu",
    country: "India",
    corridor: "Sriperumbudur - Oragadam - Guindy - Ambattur",
  },
  mumbai: {
    id: "mumbai",
    name: "Mumbai Regional Branch",
    code: "ECLIPSE-BOM",
    tagline: "JNPT Western Freight Corridor & Gateway Hub",
    branch: "Mumbai (West Hub)",
    primaryPort: "Jawaharlal Nehru Port Trust (JNPT)",
    secondaryPort: "Mumbai Port Trust (MbPT)",
    airportCode: "BOM - Chhatrapati Shivaji Maharaj Air Cargo",
    state: "Maharashtra",
    country: "India",
    corridor: "Bhiwandi - Panvel - Nhava Sheva",
  },
  all: {
    id: "all",
    name: "Consolidated Multi-Hub (All Regions)",
    code: "ECLIPSE-ALL",
    tagline: "Unified Multi-Region Enterprise Overview",
    branch: "All Branches",
    primaryPort: "Pan-India Gateway Ports (Chennai & JNPT)",
    secondaryPort: "Multi-Port Feeder Network",
    airportCode: "MAA / BOM Airport Network",
    state: "Pan-India",
    country: "India",
    corridor: "National Multi-Modal Freight Network",
  },
};

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
  // Regional Dataset Selection
  activeRegion: ActiveRegion;
  setActiveRegion: (region: ActiveRegion, showToast?: boolean) => void;

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
    title: "Vessel Weather Delay: JOB-2026-CHE-001",
    message: "ETA updated to Aug 18 for MAERSK CHENNAI due to Malacca Strait coastal weather adjustment.",
    timestamp: "10 mins ago",
    type: "warning",
    read: false,
    category: "operations",
  },
  {
    id: "notif-2",
    title: "Customs Cleared: CUS-2026-CHE-001",
    message: "Chennai Sea Port Custom House issued Out-of-Charge (OOC) for Apex Auto transmission gears.",
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
  // Default region is Chennai
  activeRegion: "chennai",

  setActiveRegion: (region: ActiveRegion, showToast = true) => {
    const config = REGION_CONFIGS[region];

    set({
      activeRegion: region,
      currentOrg: {
        id: `org-${region}`,
        name: "Eclipse Logistics Ltd",
        code: config.code,
        branch: config.branch,
      },
    });

    // Reactively synchronize all domain stores
    useCrmStore.getState().setRegion?.(region);
    useJobStore.getState().setRegion?.(region);
    useShipmentStore.getState().setRegion?.(region);
    useWarehouseStore.getState().setRegion?.(region);
    useCustomsStore.getState().setRegion?.(region);
    useTransportStore.getState().setRegion?.(region);

    if (showToast) {
      if (region === "chennai") {
        toast.success("Chennai Operations Hub (HQ) dataset active", {
          description: "Loaded 20+ Chennai leads, automotive & agro jobs, and Sriperumbudur warehouse data.",
        });
      } else if (region === "mumbai") {
        toast.success("Mumbai Regional Hub dataset active", {
          description: "Loaded JNPT & Western Corridor freight, pharma consignments, and Bhiwandi hub data.",
        });
      } else {
        toast.success("Consolidated Multi-Hub dataset active", {
          description: "All Chennai and Mumbai operational consignments loaded simultaneously.",
        });
      }
    }
  },

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
    id: "org-chennai",
    name: "Eclipse Logistics Ltd",
    code: "ECLIPSE-HQ",
    branch: "Chennai (HQ)",
  },
  setCurrentOrg: (org) => set({ currentOrg: org }),

  user: {
    name: "Dakhani Usman",
    email: "Usman@floq.com",
    role: "Operations Manager",
    department: "Global Freight Forwarding (Chennai HQ)",
  },

  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
