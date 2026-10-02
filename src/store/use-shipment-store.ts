import { create } from "zustand";
import {
  Shipment,
  ShipmentStatus,
  ShipmentMilestone,
  ShipmentMilestoneStatus,
  ShipmentActivity,
  ShipmentDocumentMeta,
  TransportMode,
} from "@/types/shipment";
import { MOCK_SHIPMENTS } from "@/data/mock/shipment-data";
import { useCrmStore } from "./use-crm-store";
import { toast } from "sonner";

interface ShipmentStoreState {
  shipments: Shipment[];

  // Actions
  addShipment: (
    data: Omit<Shipment, "id" | "shipmentNumber" | "createdAt" | "updatedAt">
  ) => Shipment;
  updateShipment: (id: string, data: Partial<Shipment>) => void;
  updateShipmentStatus: (
    id: string,
    newStatus: ShipmentStatus,
    notes?: string,
    reason?: string
  ) => void;
  markShipmentDelayed: (id: string, delayDays: number, reason: string) => void;
  clearShipmentDelay: (id: string) => void;
  addShipmentMilestone: (
    shipmentId: string,
    milestone: Omit<ShipmentMilestone, "id" | "shipmentId">
  ) => void;
  updateMilestoneStatus: (
    shipmentId: string,
    milestoneId: string,
    status: ShipmentMilestoneStatus,
    actualDate?: string
  ) => void;
  addShipmentActivity: (
    shipmentId: string,
    title: string,
    description: string,
    type?: string,
    performedBy?: string
  ) => void;
  addShipmentDocument: (
    shipmentId: string,
    documentType: string,
    status?: "Available" | "Pending" | "Missing" | "Approved",
    required?: boolean
  ) => void;
  deleteShipment: (id: string) => void;

  // Getters
  getShipmentById: (id: string) => Shipment | undefined;
  getShipmentsForJob: (jobId: string) => Shipment[];
}

export const useShipmentStore = create<ShipmentStoreState>((set, get) => ({
  shipments: MOCK_SHIPMENTS,

  addShipment: (data) => {
    const nextNum = get().shipments.length + 1;
    const shipmentId = `SHP-2026-${nextNum.toString().padStart(5, "0")}`;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split("T")[0];

    const defaultMilestones: ShipmentMilestone[] = [
      {
        id: `M-${Date.now()}-1`,
        shipmentId,
        type: "Created",
        title: "Shipment Registered",
        status: "Completed",
        location: data.origin,
        plannedDate: todayStr,
        actualDate: todayStr,
        description: `Operational freight shipment created under job ${data.jobNumber || data.jobId}`,
        createdBy: data.createdBy || "Operations Team",
      },
      {
        id: `M-${Date.now()}-2`,
        shipmentId,
        type: "Booking",
        title: "Carrier Booking Allocation",
        status: data.status === "Booked" || data.status === "In Transit" ? "Completed" : "Upcoming",
        location: data.carrierName || "Carrier Dispatch",
        plannedDate: data.etd,
        description: `Carrier space allocation for ${data.transportMode} transport`,
      },
      {
        id: `M-${Date.now()}-3`,
        shipmentId,
        type: "CargoReady",
        title: "Cargo Origin Stuffing / Loading",
        status: "Upcoming",
        location: data.origin,
        plannedDate: data.pickupDate || data.etd,
        description: "Cargo preparation, packaging check, and container loading",
      },
      {
        id: `M-${Date.now()}-4`,
        shipmentId,
        type: "Departure",
        title: "Main Leg Departure",
        status: "Upcoming",
        location: data.origin,
        plannedDate: data.etd,
        description: `Scheduled departure via ${data.carrierName || data.transportMode}`,
      },
      {
        id: `M-${Date.now()}-5`,
        shipmentId,
        type: "Arrival",
        title: "Destination Arrival",
        status: "Upcoming",
        location: data.destination,
        plannedDate: data.eta,
        description: `Arrival at ${data.destination}`,
      },
      {
        id: `M-${Date.now()}-6`,
        shipmentId,
        type: "Delivery",
        title: "Consignee Final Delivery",
        status: "Upcoming",
        location: data.deliveryLocation || data.destination,
        plannedDate: data.requiredDeliveryDate || data.eta,
        description: "Final delivery execution & POD receipt",
      },
    ];

    const defaultActivities: ShipmentActivity[] = [
      {
        id: `ACT-${Date.now()}`,
        shipmentId,
        type: "Created",
        title: "Shipment Created",
        description: `Shipment ${shipmentId} initialized for ${data.customerName} (${data.origin} → ${data.destination})`,
        performedBy: data.createdBy || "Operations Manager",
        timestamp: nowIso.replace("T", " ").slice(0, 16),
      },
    ];

    const defaultDocuments: ShipmentDocumentMeta[] = data.documents || [
      {
        id: `DOC-${Date.now()}-1`,
        shipmentId,
        documentType:
          data.transportMode === "Air"
            ? "Air Waybill (AWB)"
            : data.transportMode === "Sea"
            ? "Master Bill of Lading (MBL)"
            : "Lorry Receipt (LR) / Consignment Note",
        status: "Pending",
        required: true,
      },
      {
        id: `DOC-${Date.now()}-2`,
        shipmentId,
        documentType: "Commercial Invoice & Packing List",
        status: "Pending",
        required: true,
      },
      {
        id: `DOC-${Date.now()}-3`,
        shipmentId,
        documentType: "Packing Declaration / Weight Certificate",
        status: "Pending",
        required: false,
      },
    ];

    const newShipment: Shipment = {
      ...data,
      id: shipmentId,
      shipmentNumber: shipmentId,
      createdAt: nowIso,
      updatedAt: nowIso,
      milestones: data.milestones?.length ? data.milestones : defaultMilestones,
      activities: defaultActivities,
      documents: defaultDocuments,
    };

    set((state) => ({
      shipments: [newShipment, ...state.shipments],
    }));

    // Record CRM Activity if customerId present
    if (data.customerId) {
      useCrmStore.getState().addActivity({
        type: "Note",
        title: `Shipment ${newShipment.shipmentNumber} Created`,
        description: `New ${newShipment.transportMode} shipment initialized (${newShipment.origin} → ${newShipment.destination}). Cargo: ${newShipment.cargoDescription}`,
        relatedEntity: "Customer",
        relatedEntityId: newShipment.customerId,
        relatedEntityName: newShipment.customerName,
        assignedTo: newShipment.assignedTo || "Operations Desk",
        status: "Completed",
      });
    }

    toast.success(`Shipment ${newShipment.shipmentNumber} successfully registered`);
    return newShipment;
  },

  updateShipment: (id, data) => {
    set((state) => ({
      shipments: state.shipments.map((s) =>
        s.id.toLowerCase() === id.toLowerCase() ||
        s.shipmentNumber?.toLowerCase() === id.toLowerCase()
          ? { ...s, ...data, updatedAt: new Date().toISOString() }
          : s
      ),
    }));
    toast.success("Shipment details updated");
  },

  updateShipmentStatus: (id, newStatus, notes, reason) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
    const performedBy = "Operations Lead";

    set((state) => ({
      shipments: state.shipments.map((s) => {
        if (
          s.id.toLowerCase() === id.toLowerCase() ||
          s.shipmentNumber?.toLowerCase() === id.toLowerCase()
        ) {
          const newActivity: ShipmentActivity = {
            id: `ACT-${Date.now()}`,
            shipmentId: s.id,
            type: "StatusChange",
            title: `Status updated to ${newStatus}`,
            description: notes || `Shipment transitioned from ${s.status} to ${newStatus}.`,
            performedBy,
            timestamp,
          };

          const isDelayed = newStatus === "Delayed";

          // Auto-update milestones if completed or delivered
          const updatedMilestones = (s.milestones || []).map((m) => {
            if (newStatus === "Delivered" || newStatus === "Completed") {
              return { ...m, status: "Completed" as ShipmentMilestoneStatus };
            }
            if (newStatus === "In Transit" && m.type === "Departure") {
              return { ...m, status: "Completed" as ShipmentMilestoneStatus, actualDate: timestamp.split(" ")[0] };
            }
            if (newStatus === "Arrived" && m.type === "Arrival") {
              return { ...m, status: "Completed" as ShipmentMilestoneStatus, actualDate: timestamp.split(" ")[0] };
            }
            return m;
          });

          return {
            ...s,
            status: newStatus,
            isDelayed: isDelayed ? true : s.isDelayed,
            delayReason: isDelayed ? reason || notes || s.delayReason : s.delayReason,
            completedAt:
              newStatus === "Completed" || newStatus === "Delivered"
                ? new Date().toISOString()
                : s.completedAt,
            updatedAt: new Date().toISOString(),
            activities: [newActivity, ...(s.activities || [])],
            milestones: updatedMilestones,
          };
        }
        return s;
      }),
    }));

    toast.success(`Shipment status updated to ${newStatus}`);
  },

  markShipmentDelayed: (id, delayDays, reason) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
    set((state) => ({
      shipments: state.shipments.map((s) => {
        if (
          s.id.toLowerCase() === id.toLowerCase() ||
          s.shipmentNumber?.toLowerCase() === id.toLowerCase()
        ) {
          const newActivity: ShipmentActivity = {
            id: `ACT-${Date.now()}`,
            shipmentId: s.id,
            type: "DelayAlert",
            title: `Delay Reported (+${delayDays} Days)`,
            description: reason,
            performedBy: "Operations Controller",
            timestamp,
          };

          return {
            ...s,
            status: "Delayed",
            isDelayed: true,
            delayDays,
            delayReason: reason,
            updatedAt: new Date().toISOString(),
            activities: [newActivity, ...(s.activities || [])],
          };
        }
        return s;
      }),
    }));
    toast.error(`Shipment flagged as delayed (+${delayDays}d)`);
  },

  clearShipmentDelay: (id) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
    set((state) => ({
      shipments: state.shipments.map((s) => {
        if (
          s.id.toLowerCase() === id.toLowerCase() ||
          s.shipmentNumber?.toLowerCase() === id.toLowerCase()
        ) {
          const newActivity: ShipmentActivity = {
            id: `ACT-${Date.now()}`,
            shipmentId: s.id,
            type: "Note",
            title: "Delay Cleared / Resumed Normal Transit",
            description: "Operational delay resolution completed.",
            performedBy: "Operations Controller",
            timestamp,
          };

          return {
            ...s,
            status: "In Transit",
            isDelayed: false,
            delayDays: undefined,
            delayReason: undefined,
            updatedAt: new Date().toISOString(),
            activities: [newActivity, ...(s.activities || [])],
          };
        }
        return s;
      }),
    }));
    toast.success("Shipment delay cleared");
  },

  addShipmentMilestone: (shipmentId, milestone) => {
    const newM: ShipmentMilestone = {
      ...milestone,
      id: `M-${Date.now()}`,
      shipmentId,
    };
    set((state) => ({
      shipments: state.shipments.map((s) =>
        s.id.toLowerCase() === shipmentId.toLowerCase() ||
        s.shipmentNumber?.toLowerCase() === shipmentId.toLowerCase()
          ? {
              ...s,
              milestones: [...(s.milestones || []), newM],
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    }));
    toast.success("Milestone added");
  },

  updateMilestoneStatus: (shipmentId, milestoneId, status, actualDate) => {
    set((state) => ({
      shipments: state.shipments.map((s) => {
        if (
          s.id.toLowerCase() === shipmentId.toLowerCase() ||
          s.shipmentNumber?.toLowerCase() === shipmentId.toLowerCase()
        ) {
          const updated = (s.milestones || []).map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  status,
                  actualDate: actualDate || (status === "Completed" ? new Date().toISOString().split("T")[0] : m.actualDate),
                }
              : m
          );
          return { ...s, milestones: updated, updatedAt: new Date().toISOString() };
        }
        return s;
      }),
    }));
    toast.success("Milestone updated");
  },

  addShipmentActivity: (shipmentId, title, description, type = "Note", performedBy = "Ops Team") => {
    const newAct: ShipmentActivity = {
      id: `ACT-${Date.now()}`,
      shipmentId,
      type,
      title,
      description,
      performedBy,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    };

    set((state) => ({
      shipments: state.shipments.map((s) =>
        s.id.toLowerCase() === shipmentId.toLowerCase() ||
        s.shipmentNumber?.toLowerCase() === shipmentId.toLowerCase()
          ? {
              ...s,
              activities: [newAct, ...(s.activities || [])],
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    }));
    toast.success("Activity recorded");
  },

  addShipmentDocument: (shipmentId, documentType, status = "Pending", required = false) => {
    const newDoc: ShipmentDocumentMeta = {
      id: `DOC-${Date.now()}`,
      shipmentId,
      documentType,
      status,
      required,
    };
    set((state) => ({
      shipments: state.shipments.map((s) =>
        s.id.toLowerCase() === shipmentId.toLowerCase() ||
        s.shipmentNumber?.toLowerCase() === shipmentId.toLowerCase()
          ? {
              ...s,
              documents: [...(s.documents || []), newDoc],
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    }));
    toast.success("Document requirement attached");
  },

  deleteShipment: (id) => {
    set((state) => ({
      shipments: state.shipments.filter(
        (s) =>
          s.id.toLowerCase() !== id.toLowerCase() &&
          s.shipmentNumber?.toLowerCase() !== id.toLowerCase()
      ),
    }));
    toast.info("Shipment removed");
  },

  getShipmentById: (id) => {
    if (!id) return undefined;
    return get().shipments.find(
      (s) =>
        s.id.toLowerCase() === id.toLowerCase() ||
        s.shipmentNumber?.toLowerCase() === id.toLowerCase()
    );
  },

  getShipmentsForJob: (jobId) => {
    if (!jobId) return [];
    return get().shipments.filter(
      (s) =>
        s.jobId?.toLowerCase() === jobId.toLowerCase() ||
        s.jobNumber?.toLowerCase() === jobId.toLowerCase()
    );
  },
}));
