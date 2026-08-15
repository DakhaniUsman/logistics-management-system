import { create } from "zustand";
import {
  Warehouse,
  WarehouseZone,
  WarehouseLocation,
  WarehouseOperator,
  GoodsReceipt,
  PutAway,
  PickList,
  PackingOperation,
  Dispatch,
  WarehouseTask,
  WarehouseFilterOptions,
} from "@/types/warehouse";
import { warehouseRepository } from "@/services/warehouse.repository";
import { toast } from "sonner";
import { useCrmStore } from "./use-crm-store";

interface WarehouseStoreState {
  warehouses: Warehouse[];
  zones: WarehouseZone[];
  locations: WarehouseLocation[];
  operators: WarehouseOperator[];
  grns: GoodsReceipt[];
  putAways: PutAway[];
  pickLists: PickList[];
  packingOps: PackingOperation[];
  dispatches: Dispatch[];
  tasks: WarehouseTask[];
  filters: WarehouseFilterOptions;

  selectedWarehouse: Warehouse | null;
  selectedGRN: GoodsReceipt | null;
  selectedPickList: PickList | null;
  selectedPacking: PackingOperation | null;
  selectedDispatch: Dispatch | null;

  isLoading: boolean;

  // Dialog Controls
  isWarehouseModalOpen: boolean;
  isGrnModalOpen: boolean;
  isPutAwayModalOpen: boolean;
  isPickingModalOpen: boolean;
  isPackingModalOpen: boolean;
  isDispatchModalOpen: boolean;

  // Actions
  fetchWarehouses: (customFilters?: WarehouseFilterOptions) => Promise<void>;
  fetchGRNs: (customFilters?: WarehouseFilterOptions) => Promise<void>;
  fetchPutAways: () => Promise<void>;
  fetchPickLists: () => Promise<void>;
  fetchPackingOps: () => Promise<void>;
  fetchDispatches: () => Promise<void>;

  setFilters: (newFilters: Partial<WarehouseFilterOptions>) => void;
  clearFilters: () => void;

  setSelectedWarehouse: (w: Warehouse | null) => void;
  setSelectedGRN: (g: GoodsReceipt | null) => void;
  setSelectedPickList: (p: PickList | null) => void;
  setSelectedPacking: (p: PackingOperation | null) => void;
  setSelectedDispatch: (d: Dispatch | null) => void;

  openWarehouseModal: (w?: Warehouse | null) => void;
  closeWarehouseModal: () => void;

  openGrnModal: (g?: GoodsReceipt | null) => void;
  closeGrnModal: () => void;

  openPutAwayModal: () => void;
  closePutAwayModal: () => void;

  openPickingModal: (p?: PickList | null) => void;
  closePickingModal: () => void;

  openPackingModal: (p?: PackingOperation | null) => void;
  closePackingModal: () => void;

  openDispatchModal: (d?: Dispatch | null) => void;
  closeDispatchModal: () => void;

  // Mutations
  createGRN: (data: Partial<GoodsReceipt>) => Promise<GoodsReceipt>;
  verifyGRN: (grnId: string) => Promise<boolean>;
  completePutAway: (putAwayId: string, locationCode: string) => Promise<boolean>;
  completePicking: (pickId: string) => Promise<boolean>;
  completePacking: (packingId: string) => Promise<boolean>;
  confirmDispatch: (dispatchId: string) => Promise<boolean>;

  // Getters
  getDashboardKPIs: () => {
    warehouses: number;
    receivingToday: number;
    pendingGRNs: number;
    putAwayPending: number;
    pickingPending: number;
    packingPending: number;
    readyForDispatch: number;
    delayedTasks: number;
  };
}

export const useWarehouseStore = create<WarehouseStoreState>((set, get) => ({
  warehouses: [],
  zones: [],
  locations: [],
  operators: [],
  grns: [],
  putAways: [],
  pickLists: [],
  packingOps: [],
  dispatches: [],
  tasks: [],
  filters: { search: "", status: "ALL" },

  selectedWarehouse: null,
  selectedGRN: null,
  selectedPickList: null,
  selectedPacking: null,
  selectedDispatch: null,

  isLoading: false,

  isWarehouseModalOpen: false,
  isGrnModalOpen: false,
  isPutAwayModalOpen: false,
  isPickingModalOpen: false,
  isPackingModalOpen: false,
  isDispatchModalOpen: false,

  fetchWarehouses: async (customFilters) => {
    set({ isLoading: true });
    try {
      const activeFilters = customFilters || get().filters;
      const whs = await warehouseRepository.getWarehouses(activeFilters);
      const zonesList = await warehouseRepository.getZones();
      const locationsList = await warehouseRepository.getLocations();
      const operatorsList = await warehouseRepository.getOperators();
      const grnsList = await warehouseRepository.getGoodsReceipts();
      const putAwaysList = await warehouseRepository.getPutAwayTasks();
      const pickListsData = await warehouseRepository.getPickLists();
      const packingData = await warehouseRepository.getPackingOperations();
      const dispatchesData = await warehouseRepository.getDispatches();
      const tasksData = await warehouseRepository.getWarehouseTasks();

      set({
        warehouses: whs,
        zones: zonesList,
        locations: locationsList,
        operators: operatorsList,
        grns: grnsList,
        putAways: putAwaysList,
        pickLists: pickListsData,
        packingOps: packingData,
        dispatches: dispatchesData,
        tasks: tasksData,
        isLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch warehouse data:", err);
      set({ isLoading: false });
    }
  },

  fetchGRNs: async (customFilters) => {
    const grnsList = await warehouseRepository.getGoodsReceipts(customFilters);
    set({ grns: grnsList });
  },

  fetchPutAways: async () => {
    const p = await warehouseRepository.getPutAwayTasks();
    set({ putAways: p });
  },

  fetchPickLists: async () => {
    const p = await warehouseRepository.getPickLists();
    set({ pickLists: p });
  },

  fetchPackingOps: async () => {
    const p = await warehouseRepository.getPackingOperations();
    set({ packingOps: p });
  },

  fetchDispatches: async () => {
    const d = await warehouseRepository.getDispatches();
    set({ dispatches: d });
  },

  setFilters: (newFilters) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });
    get().fetchWarehouses(updated);
  },

  clearFilters: () => {
    const resetFilters: WarehouseFilterOptions = { search: "", status: "ALL" };
    set({ filters: resetFilters });
    get().fetchWarehouses(resetFilters);
  },

  setSelectedWarehouse: (w) => set({ selectedWarehouse: w }),
  setSelectedGRN: (g) => set({ selectedGRN: g }),
  setSelectedPickList: (p) => set({ selectedPickList: p }),
  setSelectedPacking: (p) => set({ selectedPacking: p }),
  setSelectedDispatch: (d) => set({ selectedDispatch: d }),

  openWarehouseModal: (w = null) => set({ selectedWarehouse: w, isWarehouseModalOpen: true }),
  closeWarehouseModal: () => set({ isWarehouseModalOpen: false }),

  openGrnModal: (g = null) => set({ selectedGRN: g, isGrnModalOpen: true }),
  closeGrnModal: () => set({ isGrnModalOpen: false }),

  openPutAwayModal: () => set({ isPutAwayModalOpen: true }),
  closePutAwayModal: () => set({ isPutAwayModalOpen: false }),

  openPickingModal: (p = null) => set({ selectedPickList: p, isPickingModalOpen: true }),
  closePickingModal: () => set({ isPickingModalOpen: false }),

  openPackingModal: (p = null) => set({ selectedPacking: p, isPackingModalOpen: true }),
  closePackingModal: () => set({ isPackingModalOpen: false }),

  openDispatchModal: (d = null) => set({ selectedDispatch: d, isDispatchModalOpen: true }),
  closeDispatchModal: () => set({ isDispatchModalOpen: false }),

  createGRN: async (data) => {
    set({ isLoading: true });
    try {
      const created = await warehouseRepository.createGRN(data);
      set((state) => ({
        grns: [created, ...state.grns],
        isLoading: false,
        isGrnModalOpen: false,
      }));

      // Log CRM Activity if customer linked
      if (created.customerId) {
        useCrmStore.getState().addActivity({
          type: "Note",
          title: `Warehouse GRN Created: ${created.grnNumber}`,
          description: `Goods Receipt Note created at ${created.warehouseName}. Net Accepted Qty: ${created.netAcceptedQuantity}. Status: ${created.status}.`,
          relatedEntity: "Customer",
          relatedEntityId: created.customerId,
          relatedEntityName: created.customerName,
          assignedTo: created.receivedBy,
          status: "Completed",
        });
      }

      toast.success(`Goods Receipt Note ${created.grnNumber} generated successfully.`);
      return created;
    } catch (err) {
      set({ isLoading: false });
      toast.error("Failed to create GRN.");
      throw err;
    }
  },

  verifyGRN: async (grnId) => {
    try {
      const updated = await warehouseRepository.verifyGRN(grnId, "Aamir Khan (Warehouse Manager)");
      if (updated) {
        set((state) => ({
          grns: state.grns.map((g) => (g.id === grnId ? updated : g)),
          selectedGRN: state.selectedGRN?.id === grnId ? updated : state.selectedGRN,
        }));
        toast.success(`GRN ${updated.grnNumber} verified & approved for storage.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to verify GRN.");
      return false;
    }
  },

  completePutAway: async (putAwayId, locationCode) => {
    try {
      const updated = await warehouseRepository.completePutAway(putAwayId, locationCode);
      if (updated) {
        set((state) => ({
          putAways: state.putAways.map((p) => (p.id === putAwayId ? updated : p)),
          isPutAwayModalOpen: false,
        }));
        toast.success(`Cargo put-away completed to Location ${locationCode}.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to complete put-away.");
      return false;
    }
  },

  completePicking: async (pickId) => {
    try {
      const updated = await warehouseRepository.completePicking(pickId);
      if (updated) {
        set((state) => ({
          pickLists: state.pickLists.map((p) => (p.id === pickId ? updated : p)),
          isPickingModalOpen: false,
        }));
        toast.success(`Picking operation ${updated.pickNumber} completed.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to complete picking.");
      return false;
    }
  },

  completePacking: async (packingId) => {
    try {
      const updated = await warehouseRepository.completePacking(packingId);
      if (updated) {
        set((state) => ({
          packingOps: state.packingOps.map((p) => (p.id === packingId ? updated : p)),
          isPackingModalOpen: false,
        }));
        toast.success(`Packing ${updated.packingNumber} marked Ready for Dispatch.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to complete packing.");
      return false;
    }
  },

  confirmDispatch: async (dispatchId) => {
    try {
      const updated = await warehouseRepository.confirmDispatch(dispatchId);
      if (updated) {
        set((state) => ({
          dispatches: state.dispatches.map((d) => (d.id === dispatchId ? updated : d)),
          isDispatchModalOpen: false,
        }));
        toast.success(`Outbound Dispatch ${updated.dispatchNumber} confirmed.`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to confirm dispatch.");
      return false;
    }
  },

  getDashboardKPIs: () => {
    const whs = get().warehouses.length;
    const grnsList = get().grns;
    const receivingToday = grnsList.filter((g) => g.status === "Receiving" || g.status === "Pending Verification").length;
    const pendingGRNs = grnsList.filter((g) => g.status === "Pending Verification" || g.status === "Discrepancy").length;
    const putAwayPending = get().putAways.filter((p) => p.status === "Pending" || p.status === "In Progress").length;
    const pickingPending = get().pickLists.filter((p) => p.status === "Pending" || p.status === "In Progress").length;
    const packingPending = get().packingOps.filter((p) => p.status === "Pending" || p.status === "In Progress").length;
    const readyForDispatch = get().dispatches.filter((d) => d.status === "Ready" || d.status === "Scheduled").length;
    const delayedTasks = get().tasks.filter((t) => t.status === "Blocked").length;

    return {
      warehouses: whs,
      receivingToday,
      pendingGRNs,
      putAwayPending,
      pickingPending,
      packingPending,
      readyForDispatch,
      delayedTasks,
    };
  },
}));

// Initialize store data
useWarehouseStore.getState().fetchWarehouses();
