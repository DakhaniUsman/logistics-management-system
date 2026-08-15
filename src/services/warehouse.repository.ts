import { MockBaseRepository } from "./base.repository";
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
  GRNStatus,
} from "@/types/warehouse";
import {
  MOCK_WAREHOUSES,
  MOCK_ZONES,
  MOCK_LOCATIONS,
  MOCK_OPERATORS,
  MOCK_GOODS_RECEIPTS,
  MOCK_PUT_AWAY_TASKS,
  MOCK_PICK_LISTS,
  MOCK_PACKING_OPS,
  MOCK_DISPATCHES,
  MOCK_TASKS,
} from "@/data/mock/warehouse-data";

export class WarehouseRepository extends MockBaseRepository<Warehouse> {
  private zones: WarehouseZone[] = [...MOCK_ZONES];
  private locations: WarehouseLocation[] = [...MOCK_LOCATIONS];
  private operators: WarehouseOperator[] = [...MOCK_OPERATORS];
  private grns: GoodsReceipt[] = [...MOCK_GOODS_RECEIPTS];
  private putAways: PutAway[] = [...MOCK_PUT_AWAY_TASKS];
  private pickLists: PickList[] = [...MOCK_PICK_LISTS];
  private packingOps: PackingOperation[] = [...MOCK_PACKING_OPS];
  private dispatches: Dispatch[] = [...MOCK_DISPATCHES];
  private tasks: WarehouseTask[] = [...MOCK_TASKS];

  constructor() {
    super(MOCK_WAREHOUSES, 100);
  }

  async getWarehouses(filters: WarehouseFilterOptions = {}): Promise<Warehouse[]> {
    await this.delay();
    let filtered = [...this.items];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.code.toLowerCase().includes(q) ||
          w.city.toLowerCase().includes(q) ||
          w.managerName.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((w) => w.status === filters.status);
    }

    return filtered;
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    await this.delay();
    return (
      this.items.find(
        (w) => w.id.toLowerCase() === id.toLowerCase() || w.code.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  async getZones(warehouseId?: string): Promise<WarehouseZone[]> {
    await this.delay();
    if (warehouseId) {
      return this.zones.filter((z) => z.warehouseId === warehouseId);
    }
    return [...this.zones];
  }

  async getLocations(warehouseId?: string): Promise<WarehouseLocation[]> {
    await this.delay();
    if (warehouseId) {
      return this.locations.filter((l) => l.warehouseId === warehouseId);
    }
    return [...this.locations];
  }

  async getOperators(): Promise<WarehouseOperator[]> {
    await this.delay();
    return [...this.operators];
  }

  // GOODS RECEIPT (GRN) METHODS
  async getGoodsReceipts(filters: WarehouseFilterOptions = {}): Promise<GoodsReceipt[]> {
    await this.delay();
    let filtered = [...this.grns];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.grnNumber.toLowerCase().includes(q) ||
          g.jobNumber.toLowerCase().includes(q) ||
          g.shipmentNumber.toLowerCase().includes(q) ||
          g.customerName.toLowerCase().includes(q) ||
          (g.vehicleNumber && g.vehicleNumber.toLowerCase().includes(q))
      );
    }

    if (filters.warehouseId) {
      filtered = filtered.filter((g) => g.warehouseId === filters.warehouseId);
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((g) => g.status === filters.status);
    }

    return filtered;
  }

  async getGRNById(id: string): Promise<GoodsReceipt | null> {
    await this.delay();
    return (
      this.grns.find(
        (g) => g.id.toLowerCase() === id.toLowerCase() || g.grnNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  async createGRN(data: Partial<GoodsReceipt>): Promise<GoodsReceipt> {
    await this.delay();
    const count = this.grns.length + 1;
    const nextId = `GRN-2026-${count.toString().padStart(5, "0")}`;
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);

    const exp = data.expectedQuantity || 1000;
    const rec = data.receivedQuantity ?? exp;
    const dam = data.damagedQuantity || 0;
    const srt = data.shortQuantity || 0;
    const exc = data.excessQuantity || 0;
    const net = rec - dam;
    const hasDiscrepancy = dam > 0 || srt > 0 || exc > 0;

    const newGRN: GoodsReceipt = {
      id: nextId,
      grnNumber: nextId,
      warehouseId: data.warehouseId || "WH-BHW-001",
      warehouseName: data.warehouseName || "Bhiwandi Central Logistics Warehouse",
      jobId: data.jobId || "JOB-2026-00001",
      jobNumber: data.jobNumber || data.jobId || "JOB-2026-00001",
      shipmentId: data.shipmentId || "SHP-2026-00125",
      shipmentNumber: data.shipmentNumber || data.shipmentId || "SHP-2026-00125",
      containerIds: data.containerIds || ["CON-2026-00001"],
      containerNumbers: data.containerNumbers || ["MSCU1234567"],
      transportTripId: data.transportTripId,
      vehicleNumber: data.vehicleNumber,
      customerId: data.customerId || "CUS-2026-001",
      customerName: data.customerName || "ABC Electronics Pvt Ltd",
      receivedDate: now,
      receivedBy: data.receivedBy || "Ramesh Kumar (Receiver)",
      expectedQuantity: exp,
      receivedQuantity: rec,
      damagedQuantity: dam,
      shortQuantity: srt,
      excessQuantity: exc,
      netAcceptedQuantity: net,
      status: hasDiscrepancy ? "Discrepancy" : "Verified",
      discrepancyReason: data.discrepancyReason,
      remarks: data.remarks,
      activities: [
        {
          id: `ACT-GRN-${Date.now()}`,
          warehouseId: data.warehouseId || "WH-BHW-001",
          taskType: "Receiving",
          entityId: nextId,
          title: "Goods Receipt Note Created",
          description: `GRN ${nextId} generated for shipment ${data.shipmentNumber || "record"}. Accepted Qty: ${net}.`,
          performedBy: data.receivedBy || "Ramesh Kumar",
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.grns.unshift(newGRN);

    // Create Put-Away task
    const paCount = this.putAways.length + 1;
    const paId = `PA-2026-${paCount.toString().padStart(5, "0")}`;
    this.putAways.unshift({
      id: paId,
      putAwayNumber: paId,
      grnId: nextId,
      grnNumber: nextId,
      warehouseId: newGRN.warehouseId,
      warehouseName: newGRN.warehouseName,
      zoneId: "ZON-001",
      zoneName: "General Storage Zone A",
      locationId: "LOC-001",
      locationCode: "A-01-03-02",
      quantity: net,
      assignedOperatorId: "OPR-002",
      assignedOperatorName: "Ramesh Kumar",
      status: "Pending",
      createdAt: now,
      updatedAt: now,
    });

    return { ...newGRN };
  }

  async verifyGRN(grnId: string, verifiedBy: string = "Aamir Khan"): Promise<GoodsReceipt | null> {
    await this.delay();
    const grn = this.grns.find((g) => g.id === grnId || g.grnNumber === grnId);
    if (!grn) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    grn.status = "Verified";
    grn.updatedAt = now;

    grn.activities.unshift({
      id: `ACT-GRN-VRF-${Date.now()}`,
      warehouseId: grn.warehouseId,
      taskType: "Receiving",
      entityId: grn.id,
      title: "GRN Quantity Verified & Approved",
      description: `GRN ${grn.grnNumber} verified by ${verifiedBy}. Ready for storage put-away.`,
      performedBy: verifiedBy,
      timestamp: now,
    });

    return { ...grn };
  }

  // PUT AWAY METHODS
  async getPutAwayTasks(): Promise<PutAway[]> {
    await this.delay();
    return [...this.putAways];
  }

  async completePutAway(putAwayId: string, locationCode: string, operatorName: string = "Ramesh Kumar"): Promise<PutAway | null> {
    await this.delay();
    const pa = this.putAways.find((p) => p.id === putAwayId || p.putAwayNumber === putAwayId);
    if (!pa) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    pa.locationCode = locationCode;
    pa.status = "Completed";
    pa.completedAt = now;
    pa.assignedOperatorName = operatorName;
    pa.updatedAt = now;

    // Update matching GRN status to Put Away Completed
    const grn = this.grns.find((g) => g.id === pa.grnId);
    if (grn) {
      grn.status = "Completed";
      grn.updatedAt = now;
    }

    return { ...pa };
  }

  // PICKING METHODS
  async getPickLists(): Promise<PickList[]> {
    await this.delay();
    return [...this.pickLists];
  }

  async completePicking(pickId: string, operatorName: string = "Imran Shaikh"): Promise<PickList | null> {
    await this.delay();
    const pick = this.pickLists.find((p) => p.id === pickId || p.pickNumber === pickId);
    if (!pick) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    pick.status = "Picked";
    pick.totalPickedQty = pick.totalRequestedQty;
    pick.completedAt = now;
    pick.assignedOperatorName = operatorName;
    pick.updatedAt = now;

    return { ...pick };
  }

  // PACKING METHODS
  async getPackingOperations(): Promise<PackingOperation[]> {
    await this.delay();
    return [...this.packingOps];
  }

  async completePacking(packingId: string, packedBy: string = "Suresh Pujari"): Promise<PackingOperation | null> {
    await this.delay();
    const pack = this.packingOps.find((p) => p.id === packingId || p.packingNumber === packingId);
    if (!pack) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    pack.status = "Ready for Dispatch";
    pack.completedAt = now;
    pack.packedBy = packedBy;
    pack.updatedAt = now;

    return { ...pack };
  }

  // DISPATCH METHODS
  async getDispatches(): Promise<Dispatch[]> {
    await this.delay();
    return [...this.dispatches];
  }

  async confirmDispatch(dispatchId: string, dispatchedBy: string = "Aamir Khan"): Promise<Dispatch | null> {
    await this.delay();
    const dsp = this.dispatches.find((d) => d.id === dispatchId || d.dispatchNumber === dispatchId);
    if (!dsp) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    dsp.status = "Dispatched";
    dsp.dispatchDate = now;
    dsp.dispatchedBy = dispatchedBy;
    dsp.updatedAt = now;

    return { ...dsp };
  }

  async getWarehouseTasks(): Promise<WarehouseTask[]> {
    await this.delay();
    return [...this.tasks];
  }

  async getDashboardKPIs() {
    await this.delay();
    const warehouses = this.items.length;
    const receivingToday = this.grns.filter((g) => g.status === "Receiving" || g.status === "Pending Verification").length;
    const pendingGRNs = this.grns.filter((g) => g.status === "Pending Verification" || g.status === "Discrepancy").length;
    const putAwayPending = this.putAways.filter((p) => p.status === "Pending" || p.status === "In Progress").length;
    const pickingPending = this.pickLists.filter((p) => p.status === "Pending" || p.status === "In Progress").length;
    const packingPending = this.packingOps.filter((p) => p.status === "Pending" || p.status === "In Progress").length;
    const readyForDispatch = this.dispatches.filter((d) => d.status === "Ready" || d.status === "Scheduled").length;
    const delayedTasks = this.tasks.filter((t) => t.status === "Blocked").length;

    return {
      warehouses,
      receivingToday,
      pendingGRNs,
      putAwayPending,
      pickingPending,
      packingPending,
      readyForDispatch,
      delayedTasks,
    };
  }
}

export const warehouseRepository = new WarehouseRepository();
