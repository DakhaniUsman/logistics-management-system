import { create } from "zustand";
import {
  Delivery,
  ProofOfDelivery,
  DeliveryFilterOptions,
  DeliveryStatus,
  PODStatus,
} from "@/types/delivery";
import { deliveryRepository } from "@/services/delivery.repository";
import { toast } from "sonner";
import { useCrmStore } from "./use-crm-store";

interface DeliveryStoreState {
  deliveries: Delivery[];
  pods: ProofOfDelivery[];
  filters: DeliveryFilterOptions;

  selectedDelivery: Delivery | null;
  selectedPOD: ProofOfDelivery | null;

  isLoading: boolean;

  // Dialog Controls
  isCreateModalOpen: boolean;
  isStatusModalOpen: boolean;
  isPodCaptureModalOpen: boolean;
  isPodVerifyModalOpen: boolean;
  isDelayModalOpen: boolean;
  isFailureModalOpen: boolean;

  // Actions
  fetchDeliveries: (customFilters?: DeliveryFilterOptions) => Promise<void>;
  fetchPODs: (status?: PODStatus | "ALL") => Promise<void>;
  getDeliveryById: (id: string) => Promise<Delivery | null>;
  getPODByDeliveryId: (deliveryId: string) => Promise<ProofOfDelivery | null>;

  setFilters: (newFilters: Partial<DeliveryFilterOptions>) => void;
  clearFilters: () => void;

  setSelectedDelivery: (d: Delivery | null) => void;
  setSelectedPOD: (p: ProofOfDelivery | null) => void;

  openCreateModal: (d?: Delivery | null) => void;
  closeCreateModal: () => void;

  openStatusModal: (d?: Delivery | null) => void;
  closeStatusModal: () => void;

  openPodCaptureModal: (d?: Delivery | null) => void;
  closePodCaptureModal: () => void;

  openPodVerifyModal: (p?: ProofOfDelivery | null) => void;
  closePodVerifyModal: () => void;

  openDelayModal: (d?: Delivery | null) => void;
  closeDelayModal: () => void;

  openFailureModal: (d?: Delivery | null) => void;
  closeFailureModal: () => void;

  // Workflow Mutations
  createDelivery: (data: Partial<Delivery>) => Promise<Delivery>;
  markOutForDelivery: (deliveryId: string, notes?: string) => Promise<boolean>;
  markArrived: (deliveryId: string, notes?: string) => Promise<boolean>;
  startUnloading: (deliveryId: string) => Promise<boolean>;
  markDelivered: (deliveryId: string) => Promise<boolean>;
  capturePOD: (deliveryId: string, podData: Partial<ProofOfDelivery>) => Promise<boolean>;
  verifyPOD: (podId: string) => Promise<boolean>;
  markFailed: (deliveryId: string, reason: string) => Promise<boolean>;
  rescheduleDelivery: (deliveryId: string, newDate: string, newWindow: string, reason: string) => Promise<boolean>;
  markDelayed: (deliveryId: string, reason: string) => Promise<boolean>;

  // Getters
  getDashboardKPIs: () => {
    total: number;
    scheduledToday: number;
    outForDelivery: number;
    arriving: number;
    deliveredToday: number;
    podPending: number;
    delayed: number;
    failed: number;
  };
}

export const useDeliveryStore = create<DeliveryStoreState>((set, get) => ({
  deliveries: [],
  pods: [],
  filters: { search: "", status: "ALL", podStatus: "ALL", priority: "ALL" },

  selectedDelivery: null,
  selectedPOD: null,

  isLoading: false,

  isCreateModalOpen: false,
  isStatusModalOpen: false,
  isPodCaptureModalOpen: false,
  isPodVerifyModalOpen: false,
  isDelayModalOpen: false,
  isFailureModalOpen: false,

  fetchDeliveries: async (customFilters) => {
    set({ isLoading: true });
    try {
      const activeFilters = customFilters || get().filters;
      const list = await deliveryRepository.getDeliveries(activeFilters);
      const podsList = await deliveryRepository.getPODs();
      set({ deliveries: list, pods: podsList, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
      set({ isLoading: false });
    }
  },

  fetchPODs: async (status) => {
    const podsList = await deliveryRepository.getPODs(status);
    set({ pods: podsList });
  },

  getDeliveryById: async (id) => {
    return await deliveryRepository.getDeliveryById(id);
  },

  getPODByDeliveryId: async (deliveryId) => {
    return await deliveryRepository.getPODByDeliveryId(deliveryId);
  },

  setFilters: (newFilters) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });
    get().fetchDeliveries(updated);
  },

  clearFilters: () => {
    const resetFilters: DeliveryFilterOptions = { search: "", status: "ALL", podStatus: "ALL", priority: "ALL" };
    set({ filters: resetFilters });
    get().fetchDeliveries(resetFilters);
  },

  setSelectedDelivery: (d) => set({ selectedDelivery: d }),
  setSelectedPOD: (p) => set({ selectedPOD: p }),

  openCreateModal: (d = null) => set({ selectedDelivery: d, isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openStatusModal: (d = null) => set({ selectedDelivery: d, isStatusModalOpen: true }),
  closeStatusModal: () => set({ isStatusModalOpen: false }),

  openPodCaptureModal: (d = null) => set({ selectedDelivery: d, isPodCaptureModalOpen: true }),
  closePodCaptureModal: () => set({ isPodCaptureModalOpen: false }),

  openPodVerifyModal: (p = null) => set({ selectedPOD: p, isPodVerifyModalOpen: true }),
  closePodVerifyModal: () => set({ isPodVerifyModalOpen: false }),

  openDelayModal: (d = null) => set({ selectedDelivery: d, isDelayModalOpen: true }),
  closeDelayModal: () => set({ isDelayModalOpen: false }),

  openFailureModal: (d = null) => set({ selectedDelivery: d, isFailureModalOpen: true }),
  closeFailureModal: () => set({ isFailureModalOpen: false }),

  createDelivery: async (data) => {
    set({ isLoading: true });
    try {
      const created = await deliveryRepository.createDelivery(data);
      set((state) => ({
        deliveries: [created, ...state.deliveries],
        isLoading: false,
        isCreateModalOpen: false,
      }));

      // Log CRM activity if customer linked
      if (created.customerId) {
        useCrmStore.getState().addActivity({
          type: "Note",
          title: `Delivery Order Scheduled: ${created.deliveryNumber}`,
          description: `Delivery order created for ${created.customerName}. Scheduled: ${created.scheduledDate} (${created.scheduledTimeWindow}).`,
          relatedEntity: "Customer",
          relatedEntityId: created.customerId,
          relatedEntityName: created.customerName,
          assignedTo: created.driverName || "Driver",
          status: "Completed",
        });
      }

      toast.success(`Delivery Order ${created.deliveryNumber} scheduled successfully.`);
      return created;
    } catch (err) {
      set({ isLoading: false });
      toast.error("Failed to create delivery order.");
      throw err;
    }
  },

  markOutForDelivery: async (deliveryId, notes) => {
    try {
      const updated = await deliveryRepository.markOutForDelivery(deliveryId, notes);
      if (updated) {
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === deliveryId ? updated : d)),
          selectedDelivery: state.selectedDelivery?.id === deliveryId ? updated : state.selectedDelivery,
          isStatusModalOpen: false,
        }));
        toast.success(`Delivery ${updated.deliveryNumber} status updated to Out for Delivery.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to update status.");
      return false;
    }
  },

  markArrived: async (deliveryId, notes) => {
    try {
      const updated = await deliveryRepository.markArrived(deliveryId, notes);
      if (updated) {
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === deliveryId ? updated : d)),
          selectedDelivery: state.selectedDelivery?.id === deliveryId ? updated : state.selectedDelivery,
          isStatusModalOpen: false,
        }));
        toast.success(`Delivery ${updated.deliveryNumber} status updated to Arrived at Destination.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to update status.");
      return false;
    }
  },

  startUnloading: async (deliveryId) => {
    try {
      const updated = await deliveryRepository.startUnloading(deliveryId);
      if (updated) {
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === deliveryId ? updated : d)),
          selectedDelivery: state.selectedDelivery?.id === deliveryId ? updated : state.selectedDelivery,
        }));
        toast.success(`Cargo unloading commenced for ${updated.deliveryNumber}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to start unloading.");
      return false;
    }
  },

  markDelivered: async (deliveryId) => {
    try {
      const updated = await deliveryRepository.markDelivered(deliveryId);
      if (updated) {
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === deliveryId ? updated : d)),
          selectedDelivery: state.selectedDelivery?.id === deliveryId ? updated : state.selectedDelivery,
        }));
        toast.success(`Cargo marked DELIVERED for ${updated.deliveryNumber}. Awaiting POD capture.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to mark delivered.");
      return false;
    }
  },

  capturePOD: async (deliveryId, podData) => {
    try {
      const result = await deliveryRepository.capturePOD(deliveryId, podData);
      if (result) {
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === deliveryId ? result.delivery : d)),
          pods: [result.pod, ...state.pods],
          selectedDelivery: state.selectedDelivery?.id === deliveryId ? result.delivery : state.selectedDelivery,
          isPodCaptureModalOpen: false,
        }));
        toast.success(`Proof of Delivery ${result.pod.podNumber} captured & submitted for verification.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to capture POD.");
      return false;
    }
  },

  verifyPOD: async (podId) => {
    try {
      const updatedDelivery = await deliveryRepository.verifyPOD(podId, "Aamir Khan (Operations Manager)");
      if (updatedDelivery) {
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === updatedDelivery.id ? updatedDelivery : d)),
          pods: state.pods.map((p) => (p.id === podId || p.podNumber === podId ? { ...p, status: "Verified" } : p)),
          selectedDelivery: state.selectedDelivery?.id === updatedDelivery.id ? updatedDelivery : state.selectedDelivery,
          isPodVerifyModalOpen: false,
        }));

        // Log CRM activity
        if (updatedDelivery.customerId) {
          useCrmStore.getState().addActivity({
            type: "Note",
            title: `POD Verified - Delivery Completed: ${updatedDelivery.deliveryNumber}`,
            description: `Proof of Delivery ${updatedDelivery.podNumber} verified. Cargo delivered to ${updatedDelivery.customerName}.`,
            relatedEntity: "Customer",
            relatedEntityId: updatedDelivery.customerId,
            relatedEntityName: updatedDelivery.customerName,
            assignedTo: "Aamir Khan",
            status: "Completed",
          });
        }

        toast.success(`POD verified successfully! Delivery ${updatedDelivery.deliveryNumber} status: COMPLETED.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to verify POD.");
      return false;
    }
  },

  markFailed: async (deliveryId, reason) => {
    try {
      const updated = await deliveryRepository.markFailed(deliveryId, reason);
      if (updated) {
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === deliveryId ? updated : d)),
          selectedDelivery: state.selectedDelivery?.id === deliveryId ? updated : state.selectedDelivery,
          isFailureModalOpen: false,
        }));
        toast.warning(`Delivery ${updated.deliveryNumber} marked Failed. Attempt #${updated.attemptNumber}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to mark delivery failed.");
      return false;
    }
  },

  rescheduleDelivery: async (deliveryId, newDate, newWindow, reason) => {
    try {
      const updated = await deliveryRepository.rescheduleDelivery(deliveryId, newDate, newWindow, reason);
      if (updated) {
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === deliveryId ? updated : d)),
          selectedDelivery: state.selectedDelivery?.id === deliveryId ? updated : state.selectedDelivery,
          isFailureModalOpen: false,
        }));
        toast.info(`Delivery ${updated.deliveryNumber} rescheduled for ${newDate}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to reschedule delivery.");
      return false;
    }
  },

  markDelayed: async (deliveryId, reason) => {
    try {
      const updated = await deliveryRepository.markDelayed(deliveryId, reason);
      if (updated) {
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === deliveryId ? updated : d)),
          selectedDelivery: state.selectedDelivery?.id === deliveryId ? updated : state.selectedDelivery,
          isDelayModalOpen: false,
        }));
        toast.warning(`Delivery ${updated.deliveryNumber} flagged Delayed.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to mark delay.");
      return false;
    }
  },

  getDashboardKPIs: () => {
    const list = get().deliveries;
    const total = list.length;
    const scheduledToday = list.filter((d) => d.status === "Scheduled").length;
    const outForDelivery = list.filter((d) => d.status === "Out for Delivery").length;
    const arriving = list.filter((d) => d.status === "Arrived" || d.status === "Arriving" || d.status === "Unloading").length;
    const deliveredToday = list.filter((d) => d.status === "Delivered" || d.status === "Completed").length;
    const podPending = list.filter((d) => d.status === "POD Pending" || d.podStatus === "Under Verification").length;
    const delayed = list.filter((d) => d.status === "Delayed").length;
    const failed = list.filter((d) => d.status === "Failed").length;

    return {
      total,
      scheduledToday,
      outForDelivery,
      arriving,
      deliveredToday,
      podPending,
      delayed,
      failed,
    };
  },
}));

// Initialize store data
useDeliveryStore.getState().fetchDeliveries();
