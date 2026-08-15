import { MockBaseRepository } from "./base.repository";
import {
  Delivery,
  ProofOfDelivery,
  DeliveryStatus,
  PODStatus,
  DeliveryFilterOptions,
} from "@/types/delivery";
import { MOCK_DELIVERIES, MOCK_PODS } from "@/data/mock/delivery-data";

export class DeliveryRepository extends MockBaseRepository<Delivery> {
  private pods: ProofOfDelivery[] = [...MOCK_PODS];

  constructor() {
    super(MOCK_DELIVERIES, 100);
  }

  async getDeliveries(filters: DeliveryFilterOptions = {}): Promise<Delivery[]> {
    await this.delay();
    let filtered = [...this.items];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.deliveryNumber.toLowerCase().includes(q) ||
          d.jobNumber.toLowerCase().includes(q) ||
          d.shipmentNumber.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          (d.vehicleNumber && d.vehicleNumber.toLowerCase().includes(q)) ||
          (d.driverName && d.driverName.toLowerCase().includes(q)) ||
          (d.recipientName && d.recipientName.toLowerCase().includes(q)) ||
          d.deliveryCity.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((d) => d.status === filters.status);
    }

    if (filters.podStatus && filters.podStatus !== "ALL") {
      filtered = filtered.filter((d) => d.podStatus === filters.podStatus);
    }

    if (filters.priority && filters.priority !== "ALL") {
      filtered = filtered.filter((d) => d.priority === filters.priority);
    }

    return filtered;
  }

  async getDeliveryById(id: string): Promise<Delivery | null> {
    await this.delay();
    return (
      this.items.find(
        (d) => d.id.toLowerCase() === id.toLowerCase() || d.deliveryNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  async getPODs(status?: PODStatus | "ALL"): Promise<ProofOfDelivery[]> {
    await this.delay();
    if (status && status !== "ALL") {
      return this.pods.filter((p) => p.status === status);
    }
    return [...this.pods];
  }

  async getPODByDeliveryId(deliveryId: string): Promise<ProofOfDelivery | null> {
    await this.delay();
    return (
      this.pods.find(
        (p) => p.deliveryId.toLowerCase() === deliveryId.toLowerCase() || p.deliveryNumber.toLowerCase() === deliveryId.toLowerCase()
      ) || null
    );
  }

  async createDelivery(data: Partial<Delivery>): Promise<Delivery> {
    await this.delay();
    const count = this.items.length + 1;
    const nextId = `DEL-2026-${count.toString().padStart(5, "0")}`;
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);

    const newDelivery: Delivery = {
      id: nextId,
      deliveryNumber: nextId,
      jobId: data.jobId || "JOB-2026-00001",
      jobNumber: data.jobNumber || data.jobId || "JOB-2026-00001",
      shipmentId: data.shipmentId || "SHP-2026-00125",
      shipmentNumber: data.shipmentNumber || data.shipmentId || "SHP-2026-00125",
      dispatchId: data.dispatchId || "DSP-2026-00125",
      dispatchNumber: data.dispatchNumber || data.dispatchId || "DSP-2026-00125",
      packingId: data.packingId || "PACK-2026-00125",
      packingNumber: data.packingNumber || data.packingId || "PACK-2026-00125",
      transportRequestId: data.transportRequestId || "TR-2026-00125",
      tripId: data.tripId || "TRIP-2026-00125",
      vehicleNumber: data.vehicleNumber || "MH 04 AB 1234",
      driverName: data.driverName || "Rahul Shaikh",
      driverPhone: data.driverPhone || "+91 98700 12345",
      customerId: data.customerId || "CUS-2026-001",
      customerName: data.customerName || "ABC Electronics Pvt Ltd",
      warehouseId: data.warehouseId || "WH-BHW-001",
      warehouseName: data.warehouseName || "Bhiwandi Central Logistics Warehouse",
      deliveryAddress: data.deliveryAddress || "Plot 42, MIDC Industrial Zone Phase 2, Bhiwandi",
      deliveryCity: data.deliveryCity || "Thane",
      deliveryState: data.deliveryState || "Maharashtra",
      deliveryContactPerson: data.deliveryContactPerson || "Ahmed Khan",
      deliveryContactPhone: data.deliveryContactPhone || "+91 98211 44556",
      deliveryInstructions: data.deliveryInstructions || "Call recipient 30 minutes prior to arrival.",
      scheduledDate: data.scheduledDate || new Date().toISOString().split("T")[0],
      scheduledTimeWindow: data.scheduledTimeWindow || "Evening (05:00 PM - 08:00 PM)",
      expectedArrival: data.expectedArrival || `${new Date().toISOString().split("T")[0]} 18:00`,
      status: "Scheduled",
      priority: data.priority || "Normal",
      attemptNumber: 1,
      cargoDescription: data.cargoDescription || "Microcontroller Board v4 & Electronic Assemblies",
      cargoWeightKg: data.cargoWeightKg || 18500,
      packageCount: data.packageCount || 24,
      activities: [
        {
          id: `ACT-DEL-${Date.now()}`,
          deliveryId: nextId,
          title: "Delivery Order Created",
          description: `Delivery ${nextId} created for ${data.customerName || "customer"}. Scheduled: ${data.scheduledDate}.`,
          performedBy: "System Dispatcher",
          timestamp: now,
        },
      ],
      milestones: [
        { id: "M1", title: "Dispatch Created", status: "Completed", timestamp: now },
        { id: "M2", title: "Delivery Scheduled", status: "Completed", timestamp: now },
        { id: "M3", title: "Out for Delivery", status: "Pending" },
        { id: "M4", title: "Arrived at Customer", status: "Pending" },
        { id: "M5", title: "Delivered", status: "Pending" },
        { id: "M6", title: "POD Verified", status: "Pending" },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.items.unshift(newDelivery);
    return { ...newDelivery };
  }

  async markOutForDelivery(deliveryId: string, notes?: string): Promise<Delivery | null> {
    await this.delay();
    const d = this.items.find((item) => item.id === deliveryId || item.deliveryNumber === deliveryId);
    if (!d) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    d.status = "Out for Delivery";
    d.updatedAt = now;

    d.activities.unshift({
      id: `ACT-DEL-OUT-${Date.now()}`,
      deliveryId: d.id,
      title: "Out for Delivery",
      description: `Carrier truck ${d.vehicleNumber} (${d.driverName}) departed for destination. ${notes || ""}`,
      performedBy: d.driverName || "Driver",
      timestamp: now,
    });

    const m = d.milestones.find((m) => m.title === "Out for Delivery");
    if (m) {
      m.status = "Completed";
      m.timestamp = now;
    }

    return { ...d };
  }

  async markArrived(deliveryId: string, notes?: string): Promise<Delivery | null> {
    await this.delay();
    const d = this.items.find((item) => item.id === deliveryId || item.deliveryNumber === deliveryId);
    if (!d) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    d.status = "Arrived";
    d.actualArrival = now;
    d.updatedAt = now;

    d.activities.unshift({
      id: `ACT-DEL-ARR-${Date.now()}`,
      deliveryId: d.id,
      title: "Arrived at Destination",
      description: `Vehicle arrived at customer dock gate. ${notes || ""}`,
      performedBy: d.driverName || "Driver",
      timestamp: now,
    });

    const m = d.milestones.find((m) => m.title === "Arrived at Customer");
    if (m) {
      m.status = "Completed";
      m.timestamp = now;
    }

    return { ...d };
  }

  async startUnloading(deliveryId: string): Promise<Delivery | null> {
    await this.delay();
    const d = this.items.find((item) => item.id === deliveryId || item.deliveryNumber === deliveryId);
    if (!d) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    d.status = "Unloading";
    d.updatedAt = now;

    d.activities.unshift({
      id: `ACT-DEL-UNL-${Date.now()}`,
      deliveryId: d.id,
      title: "Cargo Unloading Started",
      description: `Cargo unloading commenced at customer bay.`,
      performedBy: d.driverName || "Driver",
      timestamp: now,
    });

    return { ...d };
  }

  async markDelivered(deliveryId: string): Promise<Delivery | null> {
    await this.delay();
    const d = this.items.find((item) => item.id === deliveryId || item.deliveryNumber === deliveryId);
    if (!d) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    d.status = "Delivered";
    d.actualDelivered = now;
    d.podStatus = "Pending";
    d.updatedAt = now;

    d.activities.unshift({
      id: `ACT-DEL-DLV-${Date.now()}`,
      deliveryId: d.id,
      title: "Cargo Physically Delivered",
      description: `Cargo handed over to recipient. Awaiting Proof of Delivery (POD) signature.`,
      performedBy: d.driverName || "Driver",
      timestamp: now,
    });

    const m = d.milestones.find((m) => m.title === "Delivered");
    if (m) {
      m.status = "Completed";
      m.timestamp = now;
    }

    return { ...d };
  }

  async capturePOD(deliveryId: string, podData: Partial<ProofOfDelivery>): Promise<{ delivery: Delivery; pod: ProofOfDelivery } | null> {
    await this.delay();
    const d = this.items.find((item) => item.id === deliveryId || item.deliveryNumber === deliveryId);
    if (!d) return null;

    const count = this.pods.length + 1;
    const podNum = `POD-2026-${count.toString().padStart(5, "0")}`;
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);

    const newPOD: ProofOfDelivery = {
      id: podNum,
      podNumber: podNum,
      deliveryId: d.id,
      deliveryNumber: d.deliveryNumber,
      recipientName: podData.recipientName || "Ahmed Khan",
      recipientDesignation: podData.recipientDesignation || "Warehouse Receiving Manager",
      recipientPhone: podData.recipientPhone || "+91 98211 44556",
      receivedDate: now.split(" ")[0],
      receivedTime: now.split(" ")[1] || "14:00",
      expectedQuantity: podData.expectedQuantity || 1000,
      deliveredQuantity: podData.deliveredQuantity || 1000,
      shortQuantity: podData.shortQuantity || 0,
      damagedQuantity: podData.damagedQuantity || 0,
      condition: podData.condition || "Good Condition",
      signatureCaptured: true,
      signatureDataUrl: podData.signatureDataUrl,
      documentId: `DOC-${podNum}`,
      documentNumber: `${podNum}.pdf`,
      remarks: podData.remarks || "Digital signature captured.",
      status: "Under Verification",
      createdAt: now,
      updatedAt: now,
    };

    this.pods.unshift(newPOD);

    d.recipientName = newPOD.recipientName;
    d.recipientDesignation = newPOD.recipientDesignation;
    d.podId = newPOD.id;
    d.podNumber = newPOD.podNumber;
    d.podStatus = "Under Verification";
    d.status = "POD Pending";
    d.updatedAt = now;

    d.activities.unshift({
      id: `ACT-DEL-POD-${Date.now()}`,
      deliveryId: d.id,
      title: "Proof of Delivery (POD) Captured",
      description: `POD ${newPOD.podNumber} captured from recipient ${newPOD.recipientName}. Submitted for operations verification.`,
      performedBy: d.driverName || "Driver",
      timestamp: now,
    });

    return { delivery: { ...d }, pod: { ...newPOD } };
  }

  async verifyPOD(podId: string, verifiedBy: string = "Aamir Khan (Operations Lead)"): Promise<Delivery | null> {
    await this.delay();
    const pod = this.pods.find((p) => p.id === podId || p.podNumber === podId);
    if (!pod) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    pod.status = "Verified";
    pod.verifiedBy = verifiedBy;
    pod.verifiedAt = now;
    pod.updatedAt = now;

    const d = this.items.find((item) => item.id === pod.deliveryId || item.deliveryNumber === pod.deliveryNumber);
    if (d) {
      d.status = "Completed";
      d.podStatus = "Verified";
      d.updatedAt = now;

      d.activities.unshift({
        id: `ACT-DEL-PODVRF-${Date.now()}`,
        deliveryId: d.id,
        title: "POD Verified - Delivery Completed",
        description: `Proof of Delivery ${pod.podNumber} verified by ${verifiedBy}. Final delivery lifecycle COMPLETED.`,
        performedBy: verifiedBy,
        timestamp: now,
      });

      const m = d.milestones.find((m) => m.title === "POD Verified");
      if (m) {
        m.status = "Completed";
        m.timestamp = now;
      }

      return { ...d };
    }

    return null;
  }

  async markFailed(deliveryId: string, reason: string): Promise<Delivery | null> {
    await this.delay();
    const d = this.items.find((item) => item.id === deliveryId || item.deliveryNumber === deliveryId);
    if (!d) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    d.status = "Failed";
    d.attemptNumber += 1;
    d.failureReason = reason;
    d.updatedAt = now;

    d.activities.unshift({
      id: `ACT-DEL-FAIL-${Date.now()}`,
      deliveryId: d.id,
      title: `Delivery Attempt #${d.attemptNumber} Failed`,
      description: `Delivery attempt failed: ${reason}. Rescheduling required.`,
      performedBy: d.driverName || "Driver",
      timestamp: now,
    });

    return { ...d };
  }

  async rescheduleDelivery(deliveryId: string, newDate: string, newWindow: string, reason: string): Promise<Delivery | null> {
    await this.delay();
    const d = this.items.find((item) => item.id === deliveryId || item.deliveryNumber === deliveryId);
    if (!d) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    d.status = "Scheduled";
    d.scheduledDate = newDate;
    d.scheduledTimeWindow = newWindow;
    d.expectedArrival = `${newDate} 14:00`;
    d.failureReason = undefined;
    d.updatedAt = now;

    d.activities.unshift({
      id: `ACT-DEL-RESCHED-${Date.now()}`,
      deliveryId: d.id,
      title: "Delivery Order Rescheduled",
      description: `Rescheduled to ${newDate} (${newWindow}). Reason: ${reason}`,
      performedBy: "Dispatcher",
      timestamp: now,
    });

    return { ...d };
  }

  async markDelayed(deliveryId: string, reason: string): Promise<Delivery | null> {
    await this.delay();
    const d = this.items.find((item) => item.id === deliveryId || item.deliveryNumber === deliveryId);
    if (!d) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    d.status = "Delayed";
    d.delayReason = reason;
    d.updatedAt = now;

    d.activities.unshift({
      id: `ACT-DEL-DLY-${Date.now()}`,
      deliveryId: d.id,
      title: "Delivery Exception - Delayed",
      description: `Delivery flagged delayed: ${reason}`,
      performedBy: d.driverName || "Driver",
      timestamp: now,
    });

    return { ...d };
  }

  async getDashboardKPIs() {
    await this.delay();
    const total = this.items.length;
    const scheduledToday = this.items.filter((d) => d.status === "Scheduled").length;
    const outForDelivery = this.items.filter((d) => d.status === "Out for Delivery").length;
    const arriving = this.items.filter((d) => d.status === "Arrived" || d.status === "Arriving" || d.status === "Unloading").length;
    const deliveredToday = this.items.filter((d) => d.status === "Delivered" || d.status === "Completed").length;
    const podPending = this.items.filter((d) => d.status === "POD Pending" || d.podStatus === "Under Verification").length;
    const delayed = this.items.filter((d) => d.status === "Delayed").length;
    const failed = this.items.filter((d) => d.status === "Failed").length;

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
  }
}

export const deliveryRepository = new DeliveryRepository();
