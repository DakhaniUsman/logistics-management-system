import { create } from "zustand";
import {
  TransportRequest,
  Trip,
  Vehicle,
  Driver,
  TransportVendor,
  TransportFilterOptions,
  TransportRequestStatus,
  TransportExpense,
} from "@/types/transport";
import { transportRepository } from "@/services/transport.repository";
import { toast } from "sonner";
import { useCrmStore } from "./use-crm-store";

interface TransportStoreState {
  requests: TransportRequest[];
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  vendors: TransportVendor[];
  filters: TransportFilterOptions;
  selectedRequest: TransportRequest | null;
  selectedTrip: Trip | null;
  isLoading: boolean;

  // Dialog Controls
  isRequestModalOpen: boolean;
  isAssignModalOpen: boolean;
  isStatusModalOpen: boolean;
  isDelayModalOpen: boolean;
  isExpenseModalOpen: boolean;

  // Actions
  fetchRequests: (customFilters?: TransportFilterOptions) => Promise<void>;
  getRequestById: (id: string) => Promise<TransportRequest | null>;
  getTripById: (id: string) => Promise<Trip | null>;
  fetchVehicles: () => Promise<void>;
  fetchDrivers: () => Promise<void>;
  fetchVendors: () => Promise<void>;

  setFilters: (newFilters: Partial<TransportFilterOptions>) => void;
  clearFilters: () => void;
  setSelectedRequest: (req: TransportRequest | null) => void;
  setSelectedTrip: (trip: Trip | null) => void;

  openRequestModal: (req?: TransportRequest | null) => void;
  closeRequestModal: () => void;

  openAssignModal: (req: TransportRequest) => void;
  closeAssignModal: () => void;

  openStatusModal: (trip: Trip) => void;
  closeStatusModal: () => void;

  openDelayModal: (trip: Trip) => void;
  closeDelayModal: () => void;

  openExpenseModal: (trip: Trip) => void;
  closeExpenseModal: () => void;

  // Workflow Mutations
  createTransportRequest: (data: Partial<TransportRequest>) => Promise<TransportRequest>;
  updateTransportRequest: (id: string, data: Partial<TransportRequest>) => Promise<TransportRequest | null>;

  assignVehicleAndDriver: (
    requestId: string,
    assignment: { vehicleId: string; driverId: string; vendorId: string; scheduledPickup: string }
  ) => Promise<boolean>;

  updateTripStatus: (tripId: string, status: TransportRequestStatus, notes?: string) => Promise<boolean>;
  markDelayed: (tripId: string, reason: string) => Promise<boolean>;
  addTransportExpense: (
    tripId: string,
    expense: { category: any; amount: number; description: string }
  ) => Promise<boolean>;

  // Getters
  getTransportForJob: (jobId: string) => TransportRequest[];
  getTransportForShipment: (shipmentId: string) => TransportRequest[];
  getTransportForContainer: (containerId: string) => TransportRequest[];
  getDashboardKPIs: () => {
    total: number;
    pendingAssignment: number;
    scheduled: number;
    inTransit: number;
    arrivingToday: number;
    delayed: number;
    completed: number;
    onHold: number;
  };
}

export const useTransportStore = create<TransportStoreState>((set, get) => ({
  requests: [],
  trips: [],
  vehicles: [],
  drivers: [],
  vendors: [],
  filters: {
    search: "",
    status: "ALL",
    priority: "ALL",
    vehicleType: "ALL",
  },
  selectedRequest: null,
  selectedTrip: null,
  isLoading: false,

  isRequestModalOpen: false,
  isAssignModalOpen: false,
  isStatusModalOpen: false,
  isDelayModalOpen: false,
  isExpenseModalOpen: false,

  fetchRequests: async (customFilters) => {
    set({ isLoading: true });
    try {
      const activeFilters = customFilters || get().filters;
      const reqs = await transportRepository.getTransportRequests(activeFilters);
      const tripsList = await transportRepository.getTrips();
      const vehiclesList = await transportRepository.getVehicles();
      const driversList = await transportRepository.getDrivers();
      const vendorsList = await transportRepository.getVendors();

      set({
        requests: reqs,
        trips: tripsList,
        vehicles: vehiclesList,
        drivers: driversList,
        vendors: vendorsList,
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch transport requests:", err);
      set({ isLoading: false });
    }
  },

  getRequestById: async (id: string) => {
    const cached = get().requests.find((r) => r.id === id || r.requestNumber === id);
    if (cached) return cached;
    return await transportRepository.getTransportRequestById(id);
  },

  getTripById: async (id: string) => {
    const cached = get().trips.find((t) => t.id === id || t.tripNumber === id);
    if (cached) return cached;
    return await transportRepository.getTripById(id);
  },

  fetchVehicles: async () => {
    const v = await transportRepository.getVehicles();
    set({ vehicles: v });
  },

  fetchDrivers: async () => {
    const d = await transportRepository.getDrivers();
    set({ drivers: d });
  },

  fetchVendors: async () => {
    const v = await transportRepository.getVendors();
    set({ vendors: v });
  },

  setFilters: (newFilters) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });
    get().fetchRequests(updated);
  },

  clearFilters: () => {
    const resetFilters: TransportFilterOptions = {
      search: "",
      status: "ALL",
      priority: "ALL",
      vehicleType: "ALL",
    };
    set({ filters: resetFilters });
    get().fetchRequests(resetFilters);
  },

  setSelectedRequest: (req) => set({ selectedRequest: req }),
  setSelectedTrip: (trip) => set({ selectedTrip: trip }),

  openRequestModal: (req = null) => set({ selectedRequest: req, isRequestModalOpen: true }),
  closeRequestModal: () => set({ isRequestModalOpen: false }),

  openAssignModal: (req) => set({ selectedRequest: req, isAssignModalOpen: true }),
  closeAssignModal: () => set({ isAssignModalOpen: false }),

  openStatusModal: (trip) => set({ selectedTrip: trip, isStatusModalOpen: true }),
  closeStatusModal: () => set({ isStatusModalOpen: false }),

  openDelayModal: (trip) => set({ selectedTrip: trip, isDelayModalOpen: true }),
  closeDelayModal: () => set({ isDelayModalOpen: false }),

  openExpenseModal: (trip) => set({ selectedTrip: trip, isExpenseModalOpen: true }),
  closeExpenseModal: () => set({ isExpenseModalOpen: false }),

  createTransportRequest: async (data) => {
    set({ isLoading: true });
    try {
      const count = get().requests.length + 1;
      const nextId = `TR-2026-${count.toString().padStart(5, "0")}`;
      const now = new Date().toISOString().replace("T", " ").slice(0, 16);

      const newReq: TransportRequest = {
        id: nextId,
        requestNumber: nextId,
        status: "Pending Assignment",
        priority: data.priority || "Normal",
        jobId: data.jobId || "JOB-2026-00001",
        jobNumber: data.jobNumber || data.jobId || "JOB-2026-00001",
        shipmentId: data.shipmentId || "SHP-2026-00125",
        shipmentNumber: data.shipmentNumber || data.shipmentId || "SHP-2026-00125",
        bookingId: data.bookingId,
        bookingNumber: data.bookingNumber,
        containerIds: data.containerIds || ["CON-2026-00001"],
        containerNumbers: data.containerNumbers || ["MSCU1234567"],
        customsId: data.customsId || "CUS-2026-00125",
        customsNumber: data.customsNumber || "CUS-2026-00125",
        customsStatus: "Released",
        customerId: data.customerId || "CUS-2026-001",
        customerName: data.customerName || "ABC Electronics Pvt Ltd",
        pickupLocation: data.pickupLocation || "JNPT Terminal Gate #3, Mumbai",
        pickupContactPerson: data.pickupContactPerson || "Yard Supervisor",
        destinationLocation: data.destinationLocation || "Bhiwandi Logistics Park, Thane",
        destinationContactPerson: data.destinationContactPerson || "Warehouse Manager",
        cargoDescription: data.cargoDescription || "Commercial Containerized Goods",
        cargoWeightKg: data.cargoWeightKg || 18500,
        requiredVehicleType: data.requiredVehicleType || "40 FT Container Truck",
        requiredCapacityTonnes: data.requiredCapacityTonnes || 25,
        pickupDate: data.pickupDate || new Date().toISOString().split("T")[0],
        pickupTime: data.pickupTime || "10:00 AM",
        expectedDeliveryDate: data.expectedDeliveryDate || new Date().toISOString().split("T")[0],
        specialInstructions: data.specialInstructions,
        createdBy: "Shahbaj Borkar (Ops Lead)",
        createdAt: now,
        updatedAt: now,
      };

      const created = await transportRepository.create(newReq);
      set((state) => ({
        requests: [created, ...state.requests],
        isLoading: false,
        isRequestModalOpen: false,
      }));

      // Log CRM Activity if customer linked
      if (created.customerId) {
        useCrmStore.getState().addActivity({
          type: "Note",
          title: `Transport Request Created: ${created.requestNumber}`,
          description: `Transport requested from ${created.pickupLocation} to ${created.destinationLocation}. Vehicle: ${created.requiredVehicleType}.`,
          relatedEntity: "Customer",
          relatedEntityId: created.customerId,
          relatedEntityName: created.customerName,
          assignedTo: created.createdBy,
          status: "Completed",
        });
      }

      toast.success(`Transport Request ${created.requestNumber} created successfully.`);
      return created;
    } catch (err) {
      set({ isLoading: false });
      toast.error("Failed to create transport request.");
      throw err;
    }
  },

  updateTransportRequest: async (id, data) => {
    try {
      const updated = await transportRepository.update(id, data);
      if (updated) {
        set((state) => ({
          requests: state.requests.map((r) => (r.id === id ? updated : r)),
          selectedRequest: state.selectedRequest?.id === id ? updated : state.selectedRequest,
          isRequestModalOpen: false,
        }));
        toast.success(`Transport Request ${updated.requestNumber} updated.`);
        return updated;
      }
      return null;
    } catch (err) {
      toast.error("Failed to update transport request.");
      return null;
    }
  },

  assignVehicleAndDriver: async (requestId, assignment) => {
    try {
      const result = await transportRepository.assignVehicleAndDriver(requestId, assignment);
      if (result) {
        const { request, trip } = result;
        set((state) => ({
          requests: state.requests.map((r) => (r.id === requestId ? request : r)),
          trips: [trip, ...state.trips],
          selectedRequest: state.selectedRequest?.id === requestId ? request : state.selectedRequest,
          isAssignModalOpen: false,
        }));
        toast.success(`Trip ${trip.tripNumber} created & vehicle ${trip.vehicleNumber} assigned.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to assign vehicle & driver.");
      return false;
    }
  },

  updateTripStatus: async (tripId, status, notes) => {
    try {
      const updatedTrip = await transportRepository.updateTripStatus(tripId, status, notes, "Shahbaj Borkar");
      if (updatedTrip) {
        set((state) => ({
          trips: state.trips.map((t) => (t.id === tripId ? updatedTrip : t)),
          requests: state.requests.map((r) => (r.tripId === tripId ? { ...r, status } : r)),
          selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip,
          isStatusModalOpen: false,
        }));
        toast.success(`Trip ${updatedTrip.tripNumber} status updated to ${status}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to update trip status.");
      return false;
    }
  },

  markDelayed: async (tripId, reason) => {
    try {
      const updatedTrip = await transportRepository.markDelayed(tripId, reason, "Shahbaj Borkar");
      if (updatedTrip) {
        set((state) => ({
          trips: state.trips.map((t) => (t.id === tripId ? updatedTrip : t)),
          requests: state.requests.map((r) => (r.tripId === tripId ? { ...r, status: "Delayed" } : r)),
          selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip,
          isDelayModalOpen: false,
        }));
        toast.warning(`Trip ${updatedTrip.tripNumber} marked DELAYED.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to mark trip delayed.");
      return false;
    }
  },

  addTransportExpense: async (tripId, expense) => {
    try {
      const updatedTrip = await transportRepository.addTransportExpense(tripId, {
        ...expense,
        createdBy: "Shahbaj Borkar",
      });
      if (updatedTrip) {
        set((state) => ({
          trips: state.trips.map((t) => (t.id === tripId ? updatedTrip : t)),
          selectedTrip: state.selectedTrip?.id === tripId ? updatedTrip : state.selectedTrip,
          isExpenseModalOpen: false,
        }));
        toast.success(`Expense of ${updatedTrip.currency} ${expense.amount.toLocaleString()} added.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to add transport expense.");
      return false;
    }
  },

  getTransportForJob: (jobId) => {
    if (!jobId) return [];
    return get().requests.filter(
      (r) => r.jobId?.toLowerCase() === jobId.toLowerCase() || r.jobNumber?.toLowerCase() === jobId.toLowerCase()
    );
  },

  getTransportForShipment: (shipmentId) => {
    if (!shipmentId) return [];
    return get().requests.filter(
      (r) =>
        r.shipmentId?.toLowerCase() === shipmentId.toLowerCase() ||
        r.shipmentNumber?.toLowerCase() === shipmentId.toLowerCase()
    );
  },

  getTransportForContainer: (containerId) => {
    if (!containerId) return [];
    return get().requests.filter(
      (r) =>
        r.containerIds.some((c) => c.toLowerCase() === containerId.toLowerCase()) ||
        r.containerNumbers.some((c) => c.toLowerCase() === containerId.toLowerCase())
    );
  },

  getDashboardKPIs: () => {
    const reqs = get().requests;
    const total = reqs.length;
    const pendingAssignment = reqs.filter((r) => r.status === "Pending Assignment").length;
    const scheduled = reqs.filter((r) => r.status === "Scheduled" || r.status === "Assigned").length;
    const inTransit = reqs.filter((r) => r.status === "In Transit" || r.status === "Departed" || r.status === "Picked Up" || r.status === "Loaded").length;
    const arrivingToday = reqs.filter((r) => r.status === "Arrived").length;
    const delayed = reqs.filter((r) => r.status === "Delayed").length;
    const completed = reqs.filter((r) => r.status === "Completed").length;
    const onHold = reqs.filter((r) => r.status === "On Hold").length;

    return {
      total,
      pendingAssignment,
      scheduled,
      inTransit,
      arrivingToday,
      delayed,
      completed,
      onHold,
    };
  },
}));

// Initialize store data
useTransportStore.getState().fetchRequests();
