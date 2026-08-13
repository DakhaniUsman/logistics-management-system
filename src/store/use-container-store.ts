import { create } from "zustand";
import { Container, ContainerStatus, ContainerCondition, SealStatus, ContainerMilestone, ContainerActivity } from "@/types/container";
import { MOCK_CONTAINERS } from "@/data/mock/container-data";

interface ContainerState {
  containers: Container[];
  
  // Queries
  getContainers: () => Container[];
  getContainerById: (id: string) => Container | undefined;
  getContainersByShipment: (shipmentId: string) => Container[];
  getContainersByBooking: (bookingId: string) => Container[];
  getContainersByJob: (jobId: string) => Container[];

  // Mutations
  createContainer: (data: Omit<Container, "id" | "createdAt" | "updatedAt" | "activities" | "milestones" | "sealHistory">) => Container;
  updateContainer: (id: string, data: Partial<Omit<Container, "id" | "activities" | "milestones" | "sealHistory">>) => Container | undefined;
  assignContainer: (id: string, assignment: { bookingId: string; shipmentId: string; jobId: string; customerId: string; customerName: string }) => Container | undefined;
  updateContainerStatus: (id: string, status: ContainerStatus, performedBy?: string) => Container | undefined;
  updateContainerLocation: (id: string, location: string, country: string, performedBy?: string) => Container | undefined;
  updateSeal: (id: string, sealNumber: string, reason: string, performedBy?: string) => Container | undefined;
  updateCondition: (id: string, condition: ContainerCondition, notes?: string, performedBy?: string) => Container | undefined;
  addMilestone: (id: string, milestone: Omit<ContainerMilestone, "id" | "containerId">, performedBy?: string) => Container | undefined;
  updateMilestone: (id: string, milestoneId: string, updates: Partial<ContainerMilestone>, performedBy?: string) => Container | undefined;
}

export const useContainerStore = create<ContainerState>((set, get) => ({
  containers: [...MOCK_CONTAINERS],

  getContainers: () => get().containers,

  getContainerById: (id) => get().containers.find((c) => c.id === id || c.containerNumber === id),

  getContainersByShipment: (shipmentId) => get().containers.filter((c) => c.shipmentId === shipmentId),

  getContainersByBooking: (bookingId) => get().containers.filter((c) => c.bookingId === bookingId),

  getContainersByJob: (jobId) => get().containers.filter((c) => c.jobId === jobId),

  createContainer: (data) => {
    const newId = `CON-2026-${String(get().containers.length + 1).padStart(5, "0")}`;
    const now = new Date().toISOString();
    
    // Initialize milestones
    const initialMilestones: ContainerMilestone[] = [
      {
        id: `M-${newId}-1`,
        containerId: newId,
        type: "Assigned",
        title: "Container Assigned",
        status: data.bookingId ? "Completed" : "Pending",
        location: data.currentLocation || "Depot Yard",
        actualDate: data.bookingId ? now.substring(0, 10) : undefined,
        createdBy: data.assignedTo
      },
      {
        id: `M-${newId}-2`,
        containerId: newId,
        type: "Empty Picked Up",
        title: "Empty Picked Up",
        status: data.bookingId ? "Completed" : "Pending",
        location: data.currentLocation || "Depot Yard",
        actualDate: data.bookingId ? now.substring(0, 10) : undefined,
        createdBy: data.assignedTo
      },
      {
        id: `M-${newId}-3`,
        containerId: newId,
        type: "Gate In",
        title: "Gate In at Origin",
        status: "Pending",
        location: data.origin || "Origin Port",
        createdBy: data.assignedTo
      },
      {
        id: `M-${newId}-4`,
        containerId: newId,
        type: "Loaded",
        title: "Loaded on Vessel",
        status: "Pending",
        location: data.origin || "Origin Port",
        createdBy: data.assignedTo
      },
      {
        id: `M-${newId}-5`,
        containerId: newId,
        type: "Departed",
        title: "Vessel Departed",
        status: "Pending",
        location: data.origin || "Origin Port",
        createdBy: data.assignedTo
      }
    ];

    const initialActivities: ContainerActivity[] = [
      {
        id: `ACT-${newId}-1`,
        containerId: newId,
        type: "Created",
        title: "Container Registered",
        description: data.bookingId 
          ? `Container registered and linked to Booking ${data.bookingId}`
          : "Container registered in the available equipment pool.",
        performedBy: data.assignedTo || "System",
        timestamp: now.substring(0, 16).replace("T", " ")
      }
    ];

    if (data.sealNumber) {
      initialActivities.push({
        id: `ACT-${newId}-2`,
        containerId: newId,
        type: "Seal Assigned",
        title: "Seal Applied",
        description: `High-security seal ${data.sealNumber} was applied.`,
        performedBy: data.assignedTo || "System",
        timestamp: now.substring(0, 16).replace("T", " ")
      });
    }

    const newContainer: Container = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
      activities: initialActivities,
      milestones: initialMilestones,
      sealHistory: data.sealNumber ? [
        {
          id: `SH-${newId}-1`,
          containerId: newId,
          oldSealNumber: "None",
          newSealNumber: data.sealNumber,
          status: "Assigned",
          changedAt: now,
          changedBy: data.assignedTo,
          reason: "Initial lock seal at booking registration."
        }
      ] : []
    };

    set((state) => ({
      containers: [newContainer, ...state.containers]
    }));

    return newContainer;
  },

  updateContainer: (id, data) => {
    let updated: Container | undefined;
    const now = new Date().toISOString();

    set((state) => {
      const idx = state.containers.findIndex((c) => c.id === id);
      if (idx === -1) return {};

      const current = state.containers[idx];
      updated = {
        ...current,
        ...data,
        updatedAt: now
      };

      const newContainers = [...state.containers];
      newContainers[idx] = updated;

      return { containers: newContainers };
    });

    return updated;
  },

  assignContainer: (id, assignment) => {
    let updated: Container | undefined;
    const now = new Date().toISOString();

    set((state) => {
      const idx = state.containers.findIndex((c) => c.id === id);
      if (idx === -1) return {};

      const current = state.containers[idx];
      
      const newActivities = [
        ...current.activities,
        {
          id: `ACT-${id}-${current.activities.length + 1}`,
          containerId: id,
          type: "Assigned",
          title: "Assigned to Shipment",
          description: `Container assigned to booking ${assignment.bookingId} and shipment ${assignment.shipmentId}.`,
          performedBy: current.assignedTo || "System",
          timestamp: now.substring(0, 16).replace("T", " ")
        }
      ];

      updated = {
        ...current,
        ...assignment,
        status: "Assigned",
        updatedAt: now,
        activities: newActivities
      };

      // Mark first milestone completed
      const newMilestones = current.milestones.map((m) => {
        if (m.type === "Assigned") {
          return { ...m, status: "Completed" as const, actualDate: now.substring(0, 10) };
        }
        return m;
      });
      updated.milestones = newMilestones;

      const newContainers = [...state.containers];
      newContainers[idx] = updated;

      return { containers: newContainers };
    });

    return updated;
  },

  updateContainerStatus: (id, status, performedBy = "Operations Agent") => {
    let updated: Container | undefined;
    const now = new Date().toISOString();

    set((state) => {
      const idx = state.containers.findIndex((c) => c.id === id);
      if (idx === -1) return {};

      const current = state.containers[idx];
      
      const newActivities = [
        ...current.activities,
        {
          id: `ACT-${id}-${current.activities.length + 1}`,
          containerId: id,
          type: "Status Changed",
          title: `Status: ${status}`,
          description: `Container state transit transitioned to ${status}.`,
          performedBy,
          timestamp: now.substring(0, 16).replace("T", " ")
        }
      ];

      updated = {
        ...current,
        status,
        updatedAt: now,
        activities: newActivities
      };

      // Automate updating relevant milestone statuses based on status change
      const newMilestones = current.milestones.map((m) => {
        if (m.type === "Gate In" && status === "Gate In") {
          return { ...m, status: "Completed" as const, actualDate: now.substring(0, 10) };
        }
        if (m.type === "Loaded" && status === "Loaded") {
          return { ...m, status: "Completed" as const, actualDate: now.substring(0, 10) };
        }
        if (m.type === "Departed" && status === "Departed") {
          return { ...m, status: "Completed" as const, actualDate: now.substring(0, 10) };
        }
        if (m.type === "In Transit" && status === "In Transit") {
          return { ...m, status: "Completed" as const, actualDate: now.substring(0, 10) };
        }
        if (m.type === "Arrived" && status === "At Destination") {
          return { ...m, status: "Completed" as const, actualDate: now.substring(0, 10) };
        }
        if (m.type === "Delivered" && status === "Delivered") {
          return { ...m, status: "Completed" as const, actualDate: now.substring(0, 10) };
        }
        if (m.type === "Empty Returned" && status === "Returned") {
          return { ...m, status: "Completed" as const, actualDate: now.substring(0, 10) };
        }
        return m;
      });
      updated.milestones = newMilestones;

      const newContainers = [...state.containers];
      newContainers[idx] = updated;

      return { containers: newContainers };
    });

    return updated;
  },

  updateContainerLocation: (id, location, country, performedBy = "Operations Agent") => {
    let updated: Container | undefined;
    const now = new Date().toISOString();

    set((state) => {
      const idx = state.containers.findIndex((c) => c.id === id);
      if (idx === -1) return {};

      const current = state.containers[idx];
      
      const newActivities = [
        ...current.activities,
        {
          id: `ACT-${id}-${current.activities.length + 1}`,
          containerId: id,
          type: "Location Updated",
          title: "Location Updated",
          description: `Container physical location updated to ${location}, ${country}.`,
          performedBy,
          timestamp: now.substring(0, 16).replace("T", " ")
        }
      ];

      updated = {
        ...current,
        currentLocation: location,
        currentCountry: country,
        updatedAt: now,
        activities: newActivities
      };

      const newContainers = [...state.containers];
      newContainers[idx] = updated;

      return { containers: newContainers };
    });

    return updated;
  },

  updateSeal: (id, sealNumber, reason, performedBy = "Customs Agent") => {
    let updated: Container | undefined;
    const now = new Date().toISOString();

    set((state) => {
      const idx = state.containers.findIndex((c) => c.id === id);
      if (idx === -1) return {};

      const current = state.containers[idx];
      const oldSeal = current.sealNumber || "None";
      
      const newActivities = [
        ...current.activities,
        {
          id: `ACT-${id}-${current.activities.length + 1}`,
          containerId: id,
          type: "Seal Changed",
          title: oldSeal === "None" ? "Seal Applied" : "Seal Replaced",
          description: oldSeal === "None" 
            ? `New seal lock ${sealNumber} applied.`
            : `Seal changed from ${oldSeal} to ${sealNumber}. Reason: ${reason}`,
          performedBy,
          timestamp: now.substring(0, 16).replace("T", " ")
        }
      ];

      const newSealHistory = [
        ...current.sealHistory,
        {
          id: `SH-${id}-${current.sealHistory.length + 1}`,
          containerId: id,
          oldSealNumber: oldSeal,
          newSealNumber: sealNumber,
          status: oldSeal === "None" ? "Assigned" : ("Replaced" as SealStatus),
          changedAt: now,
          changedBy: performedBy,
          reason
        }
      ];

      updated = {
        ...current,
        sealNumber,
        sealStatus: oldSeal === "None" ? "Assigned" : "Replaced",
        updatedAt: now,
        activities: newActivities,
        sealHistory: newSealHistory
      };

      const newContainers = [...state.containers];
      newContainers[idx] = updated;

      return { containers: newContainers };
    });

    return updated;
  },

  updateCondition: (id, condition, notes, performedBy = "Port Inspector") => {
    let updated: Container | undefined;
    const now = new Date().toISOString();

    set((state) => {
      const idx = state.containers.findIndex((c) => c.id === id);
      if (idx === -1) return {};

      const current = state.containers[idx];
      
      const newActivities = [
        ...current.activities,
        {
          id: `ACT-${id}-${current.activities.length + 1}`,
          containerId: id,
          type: "Condition Updated",
          title: `Condition: ${condition}`,
          description: `Container marked as ${condition}. Notes: ${notes || "None"}`,
          performedBy,
          timestamp: now.substring(0, 16).replace("T", " ")
        }
      ];

      updated = {
        ...current,
        condition,
        notes: notes ? `${current.notes || ""}\n[Inspection ${now.substring(0,10)}]: ${notes}` : current.notes,
        updatedAt: now,
        activities: newActivities
      };

      const newContainers = [...state.containers];
      newContainers[idx] = updated;

      return { containers: newContainers };
    });

    return updated;
  },

  addMilestone: (id, milestone, performedBy = "System") => {
    let updated: Container | undefined;
    const now = new Date().toISOString();

    set((state) => {
      const idx = state.containers.findIndex((c) => c.id === id);
      if (idx === -1) return {};

      const current = state.containers[idx];
      
      const newMilestoneId = `M-${id}-${current.milestones.length + 1}`;
      const newMilestone: ContainerMilestone = {
        ...milestone,
        id: newMilestoneId,
        containerId: id
      };

      const newActivities = [
        ...current.activities,
        {
          id: `ACT-${id}-${current.activities.length + 1}`,
          containerId: id,
          type: "Milestone Updated",
          title: `Milestone Added: ${milestone.title}`,
          description: `New operational milestone ${milestone.title} was logged for location ${milestone.location}.`,
          performedBy,
          timestamp: now.substring(0, 16).replace("T", " ")
        }
      ];

      updated = {
        ...current,
        milestones: [...current.milestones, newMilestone],
        updatedAt: now,
        activities: newActivities
      };

      const newContainers = [...state.containers];
      newContainers[idx] = updated;

      return { containers: newContainers };
    });

    return updated;
  },

  updateMilestone: (id, milestoneId, updates, performedBy = "Operations Supervisor") => {
    let updated: Container | undefined;
    const now = new Date().toISOString();

    set((state) => {
      const idx = state.containers.findIndex((c) => c.id === id);
      if (idx === -1) return {};

      const current = state.containers[idx];
      
      const milestoneIndex = current.milestones.findIndex((m) => m.id === milestoneId);
      if (milestoneIndex === -1) return {};

      const originalMilestone = current.milestones[milestoneIndex];
      const updatedMilestone = {
        ...originalMilestone,
        ...updates
      };

      const newMilestones = [...current.milestones];
      newMilestones[milestoneIndex] = updatedMilestone;

      const newActivities = [
        ...current.activities,
        {
          id: `ACT-${id}-${current.activities.length + 1}`,
          containerId: id,
          type: "Milestone Updated",
          title: `Milestone: ${originalMilestone.title} (${updates.status})`,
          description: `Milestone '${originalMilestone.title}' was updated to ${updates.status}.`,
          performedBy,
          timestamp: now.substring(0, 16).replace("T", " ")
        }
      ];

      updated = {
        ...current,
        milestones: newMilestones,
        updatedAt: now,
        activities: newActivities
      };

      const newContainers = [...state.containers];
      newContainers[idx] = updated;

      return { containers: newContainers };
    });

    return updated;
  }
}));
