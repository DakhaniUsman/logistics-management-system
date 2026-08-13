import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContainerStore } from "@/store/use-container-store";
import { Container, ContainerStatus, ContainerCondition, SealStatus, ContainerMilestone } from "@/types/container";

// Helper to simulate network latency
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ContainerFilters {
  search?: string;
  status?: string;
  size?: string;
  type?: string;
  condition?: string;
  bookingId?: string;
  shipmentId?: string;
  jobId?: string;
  customerId?: string;
  location?: string;
}

export function useContainers(filters: ContainerFilters = {}) {
  const getContainers = useContainerStore((state) => state.getContainers);

  return useQuery({
    queryKey: ["containers", filters],
    queryFn: async () => {
      await delay(400); // 400ms simulated latency
      let list = [...getContainers()];

      const {
        search,
        status,
        size,
        type,
        condition,
        bookingId,
        shipmentId,
        jobId,
        customerId,
        location
      } = filters;

      if (search) {
        const term = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.containerNumber.toLowerCase().includes(term) ||
            c.sealNumber?.toLowerCase().includes(term) ||
            c.currentLocation.toLowerCase().includes(term) ||
            c.customerName.toLowerCase().includes(term)
        );
      }

      if (status) {
        list = list.filter((c) => c.status === status);
      }

      if (size) {
        list = list.filter((c) => c.containerSize === size);
      }

      if (type) {
        list = list.filter((c) => c.containerType === type);
      }

      if (condition) {
        list = list.filter((c) => c.condition === condition);
      }

      if (bookingId) {
        list = list.filter((c) => c.bookingId === bookingId);
      }

      if (shipmentId) {
        list = list.filter((c) => c.shipmentId === shipmentId);
      }

      if (jobId) {
        list = list.filter((c) => c.jobId === jobId);
      }

      if (customerId) {
        list = list.filter((c) => c.customerId === customerId);
      }

      if (location) {
        list = list.filter((c) => c.currentLocation.toLowerCase().includes(location.toLowerCase()));
      }

      return list;
    }
  });
}

export function useContainer(id: string) {
  const getContainerById = useContainerStore((state) => state.getContainerById);

  return useQuery({
    queryKey: ["container", id],
    queryFn: async () => {
      await delay(300);
      const container = getContainerById(id);
      if (!container) {
        throw new Error(`Container ${id} not found`);
      }
      return container;
    },
    enabled: !!id
  });
}

export function useCreateContainer() {
  const queryClient = useQueryClient();
  const createContainer = useContainerStore((state) => state.createContainer);

  return useMutation({
    mutationFn: async (data: Omit<Container, "id" | "createdAt" | "updatedAt" | "activities" | "milestones" | "sealHistory">) => {
      await delay(600);
      return createContainer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
    }
  });
}

export function useUpdateContainer() {
  const queryClient = useQueryClient();
  const updateContainer = useContainerStore((state) => state.updateContainer);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Container, "id" | "activities" | "milestones" | "sealHistory">> }) => {
      await delay(500);
      const res = updateContainer(id, data);
      if (!res) throw new Error("Failed to update container");
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["container", data.id] });
      queryClient.invalidateQueries({ queryKey: ["container", data.containerNumber] });
    }
  });
}

export function useAssignContainer() {
  const queryClient = useQueryClient();
  const assignContainer = useContainerStore((state) => state.assignContainer);

  return useMutation({
    mutationFn: async ({ id, assignment }: { id: string; assignment: { bookingId: string; shipmentId: string; jobId: string; customerId: string; customerName: string } }) => {
      await delay(500);
      const res = assignContainer(id, assignment);
      if (!res) throw new Error("Failed to assign container");
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["container", data.id] });
      queryClient.invalidateQueries({ queryKey: ["container", data.containerNumber] });
    }
  });
}

export function useUpdateContainerStatus() {
  const queryClient = useQueryClient();
  const updateContainerStatus = useContainerStore((state) => state.updateContainerStatus);

  return useMutation({
    mutationFn: async ({ id, status, performedBy }: { id: string; status: ContainerStatus; performedBy?: string }) => {
      await delay(400);
      const res = updateContainerStatus(id, status, performedBy);
      if (!res) throw new Error("Failed to update container status");
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["container", data.id] });
      queryClient.invalidateQueries({ queryKey: ["container", data.containerNumber] });
    }
  });
}

export function useUpdateContainerLocation() {
  const queryClient = useQueryClient();
  const updateContainerLocation = useContainerStore((state) => state.updateContainerLocation);

  return useMutation({
    mutationFn: async ({ id, location, country, performedBy }: { id: string; location: string; country: string; performedBy?: string }) => {
      await delay(400);
      const res = updateContainerLocation(id, location, country, performedBy);
      if (!res) throw new Error("Failed to update location");
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["container", data.id] });
      queryClient.invalidateQueries({ queryKey: ["container", data.containerNumber] });
    }
  });
}

export function useUpdateSeal() {
  const queryClient = useQueryClient();
  const updateSeal = useContainerStore((state) => state.updateSeal);

  return useMutation({
    mutationFn: async ({ id, sealNumber, reason, performedBy }: { id: string; sealNumber: string; reason: string; performedBy?: string }) => {
      await delay(500);
      const res = updateSeal(id, sealNumber, reason, performedBy);
      if (!res) throw new Error("Failed to update seal");
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["container", data.id] });
      queryClient.invalidateQueries({ queryKey: ["container", data.containerNumber] });
    }
  });
}

export function useUpdateCondition() {
  const queryClient = useQueryClient();
  const updateCondition = useContainerStore((state) => state.updateCondition);

  return useMutation({
    mutationFn: async ({ id, condition, notes, performedBy }: { id: string; condition: ContainerCondition; notes?: string; performedBy?: string }) => {
      await delay(450);
      const res = updateCondition(id, condition, notes, performedBy);
      if (!res) throw new Error("Failed to update condition");
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["container", data.id] });
      queryClient.invalidateQueries({ queryKey: ["container", data.containerNumber] });
    }
  });
}

export function useAddMilestone() {
  const queryClient = useQueryClient();
  const addMilestone = useContainerStore((state) => state.addMilestone);

  return useMutation({
    mutationFn: async ({ id, milestone, performedBy }: { id: string; milestone: Omit<ContainerMilestone, "id" | "containerId">; performedBy?: string }) => {
      await delay(400);
      const res = addMilestone(id, milestone, performedBy);
      if (!res) throw new Error("Failed to add milestone");
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["container", data.id] });
      queryClient.invalidateQueries({ queryKey: ["container", data.containerNumber] });
    }
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  const updateMilestone = useContainerStore((state) => state.updateMilestone);

  return useMutation({
    mutationFn: async ({ id, milestoneId, updates, performedBy }: { id: string; milestoneId: string; updates: Partial<ContainerMilestone>; performedBy?: string }) => {
      await delay(400);
      const res = updateMilestone(id, milestoneId, updates, performedBy);
      if (!res) throw new Error("Failed to update milestone");
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      queryClient.invalidateQueries({ queryKey: ["container", data.id] });
      queryClient.invalidateQueries({ queryKey: ["container", data.containerNumber] });
    }
  });
}
