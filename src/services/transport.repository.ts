import { MockBaseRepository } from "./base.repository";
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
import {
  MOCK_TRANSPORT_REQUESTS,
  MOCK_TRIPS,
  MOCK_VEHICLES,
  MOCK_DRIVERS,
  MOCK_TRANSPORT_VENDORS,
} from "@/data/mock/transport-data";

export class TransportRepository extends MockBaseRepository<TransportRequest> {
  private trips: Trip[] = [...MOCK_TRIPS];
  private vehicles: Vehicle[] = [...MOCK_VEHICLES];
  private drivers: Driver[] = [...MOCK_DRIVERS];
  private vendors: TransportVendor[] = [...MOCK_TRANSPORT_VENDORS];

  constructor() {
    super(MOCK_TRANSPORT_REQUESTS, 100);
  }

  async getTransportRequests(filters: TransportFilterOptions = {}): Promise<TransportRequest[]> {
    await this.delay();
    let filtered = [...this.items];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.requestNumber.toLowerCase().includes(q) ||
          (req.tripId && req.tripId.toLowerCase().includes(q)) ||
          (req.jobNumber && req.jobNumber.toLowerCase().includes(q)) ||
          (req.shipmentNumber && req.shipmentNumber.toLowerCase().includes(q)) ||
          (req.customerName && req.customerName.toLowerCase().includes(q)) ||
          (req.assignedVehicleNumber && req.assignedVehicleNumber.toLowerCase().includes(q)) ||
          (req.assignedDriverName && req.assignedDriverName.toLowerCase().includes(q)) ||
          (req.assignedVendorName && req.assignedVendorName.toLowerCase().includes(q)) ||
          req.containerNumbers.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((req) => req.status === filters.status);
    }

    if (filters.priority && filters.priority !== "ALL") {
      filtered = filtered.filter((req) => req.priority === filters.priority);
    }

    if (filters.vehicleType && filters.vehicleType !== "ALL") {
      filtered = filtered.filter((req) => req.requiredVehicleType === filters.vehicleType);
    }

    if (filters.vendorId) {
      filtered = filtered.filter((req) => req.assignedVendorId === filters.vendorId);
    }

    if (filters.customerId) {
      filtered = filtered.filter((req) => req.customerId === filters.customerId);
    }

    if (filters.jobId) {
      filtered = filtered.filter(
        (req) => req.jobId?.toLowerCase() === filters.jobId?.toLowerCase() || req.jobNumber?.toLowerCase() === filters.jobId?.toLowerCase()
      );
    }

    if (filters.shipmentId) {
      filtered = filtered.filter(
        (req) => req.shipmentId?.toLowerCase() === filters.shipmentId?.toLowerCase() || req.shipmentNumber?.toLowerCase() === filters.shipmentId?.toLowerCase()
      );
    }

    if (filters.containerId) {
      filtered = filtered.filter(
        (req) =>
          req.containerIds.some((id) => id.toLowerCase() === filters.containerId?.toLowerCase()) ||
          req.containerNumbers.some((num) => num.toLowerCase() === filters.containerId?.toLowerCase())
      );
    }

    return filtered;
  }

  async getTransportRequestById(id: string): Promise<TransportRequest | null> {
    await this.delay();
    return (
      this.items.find(
        (req) => req.id.toLowerCase() === id.toLowerCase() || req.requestNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  async getTrips(): Promise<Trip[]> {
    await this.delay();
    return [...this.trips];
  }

  async getTripById(id: string): Promise<Trip | null> {
    await this.delay();
    return (
      this.trips.find(
        (t) => t.id.toLowerCase() === id.toLowerCase() || t.tripNumber.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  async getVehicles(): Promise<Vehicle[]> {
    await this.delay();
    return [...this.vehicles];
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    await this.delay();
    return this.vehicles.filter((v) => v.status === "Available");
  }

  async getDrivers(): Promise<Driver[]> {
    await this.delay();
    return [...this.drivers];
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    await this.delay();
    return this.drivers.filter((d) => d.status === "Available");
  }

  async getVendors(): Promise<TransportVendor[]> {
    await this.delay();
    return [...this.vendors];
  }

  async assignVehicleAndDriver(
    requestId: string,
    assignment: { vehicleId: string; driverId: string; vendorId: string; scheduledPickup: string }
  ): Promise<{ request: TransportRequest; trip: Trip } | null> {
    await this.delay();
    const req = this.items.find((r) => r.id === requestId || r.requestNumber === requestId);
    if (!req) return null;

    const vehicle = this.vehicles.find((v) => v.id === assignment.vehicleId);
    const driver = this.drivers.find((d) => d.id === assignment.driverId);
    const vendor = this.vendors.find((v) => v.id === assignment.vendorId);

    if (!vehicle || !driver || !vendor) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const tripId = `TRIP-2026-${(this.trips.length + 1).toString().padStart(5, "0")}`;

    // Update vehicle & driver status
    vehicle.status = "Assigned";
    driver.status = "Assigned";

    // Create Trip
    const newTrip: Trip = {
      id: tripId,
      tripNumber: tripId,
      transportRequestId: req.id,
      jobId: req.jobId,
      shipmentId: req.shipmentId,
      bookingId: req.bookingId,
      containerIds: req.containerIds,
      vehicleId: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      vendorId: vendor.id,
      vendorName: vendor.name,
      originLocation: req.pickupLocation,
      destinationLocation: req.destinationLocation,
      scheduledPickupTime: assignment.scheduledPickup,
      scheduledArrivalTime: req.expectedDeliveryDate,
      estimatedCost: 15000,
      actualCost: 0,
      currency: "INR",
      status: "Scheduled",
      expenses: [],
      milestones: [
        { id: "M1", title: "Transport Requested", status: "Completed", timestamp: req.createdAt },
        { id: "M2", title: "Vehicle & Driver Assigned", status: "Completed", timestamp: now, completedBy: "Dispatcher" },
        { id: "M3", title: "Trip Scheduled", status: "Completed", timestamp: now, completedBy: "Dispatcher" },
        { id: "M4", title: "Cargo Picked Up", status: "Pending" },
        { id: "M5", title: "Cargo Loaded", status: "Pending" },
        { id: "M6", title: "Trip Departed", status: "Pending" },
        { id: "M7", title: "In Transit", status: "Pending" },
        { id: "M8", title: "Arrived at Destination", status: "Pending" },
        { id: "M9", title: "Trip Completed", status: "Pending" },
      ],
      activities: [
        {
          id: `ACT-ASSIGN-${Date.now()}`,
          requestId: req.id,
          tripId: tripId,
          type: "Assignment",
          title: "Vehicle & Driver Assigned",
          description: `Assigned Vehicle ${vehicle.vehicleNumber} and Driver ${driver.name} (${vendor.name}).`,
          performedBy: "Dispatcher",
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.trips.unshift(newTrip);

    // Update Request
    req.status = "Scheduled";
    req.assignedVendorId = vendor.id;
    req.assignedVendorName = vendor.name;
    req.assignedVehicleId = vehicle.id;
    req.assignedVehicleNumber = vehicle.vehicleNumber;
    req.assignedDriverId = driver.id;
    req.assignedDriverName = driver.name;
    req.tripId = tripId;
    req.updatedAt = now;

    return { request: { ...req }, trip: { ...newTrip } };
  }

  async updateTripStatus(
    tripId: string,
    newStatus: TransportRequestStatus,
    notes?: string,
    performedBy: string = "Driver / Dispatcher"
  ): Promise<Trip | null> {
    await this.delay();
    const trip = this.trips.find((t) => t.id === tripId || t.tripNumber === tripId);
    if (!trip) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    trip.status = newStatus;
    trip.updatedAt = now;

    if (newStatus === "Picked Up") trip.actualPickupTime = now;
    if (newStatus === "Loaded") trip.actualLoadedTime = now;
    if (newStatus === "Departed") trip.actualDepartureTime = now;
    if (newStatus === "Arrived") trip.actualArrivalTime = now;

    // Update matching TransportRequest status
    const req = this.items.find((r) => r.id === trip.transportRequestId);
    if (req) {
      req.status = newStatus;
      req.updatedAt = now;
    }

    // Update vehicle status
    const vehicle = this.vehicles.find((v) => v.id === trip.vehicleId);
    if (vehicle) {
      if (newStatus === "In Transit" || newStatus === "Departed") vehicle.status = "In Transit";
      if (newStatus === "Completed") vehicle.status = "Available";
    }

    // Update driver status
    const driver = this.drivers.find((d) => d.id === trip.driverId);
    if (driver) {
      if (newStatus === "In Transit" || newStatus === "Departed") driver.status = "On Trip";
      if (newStatus === "Completed") driver.status = "Available";
    }

    trip.activities.unshift({
      id: `ACT-STAT-${Date.now()}`,
      requestId: trip.transportRequestId,
      tripId: trip.id,
      type: "StatusUpdate",
      title: `Trip Status Updated to ${newStatus}`,
      description: notes || `Trip ${trip.tripNumber} status set to ${newStatus}.`,
      performedBy,
      timestamp: now,
    });

    const milestoneMap: Record<string, string> = {
      "Picked Up": "Cargo Picked Up",
      Loaded: "Cargo Loaded",
      Departed: "Trip Departed",
      "In Transit": "In Transit",
      Arrived: "Arrived at Destination",
      Completed: "Trip Completed",
    };

    const targetTitle = milestoneMap[newStatus];
    if (targetTitle) {
      const milestone = trip.milestones.find((m) => m.title === targetTitle);
      if (milestone) {
        milestone.status = "Completed";
        milestone.timestamp = now;
        milestone.completedBy = performedBy;
      }
    }

    return { ...trip };
  }

  async markDelayed(tripId: string, reason: string, delayedBy: string): Promise<Trip | null> {
    await this.delay();
    const trip = this.trips.find((t) => t.id === tripId || t.tripNumber === tripId);
    if (!trip) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    trip.status = "Delayed";
    trip.delayReason = reason;
    trip.updatedAt = now;

    const req = this.items.find((r) => r.id === trip.transportRequestId);
    if (req) {
      req.status = "Delayed";
      req.updatedAt = now;
    }

    trip.activities.unshift({
      id: `ACT-DLY-${Date.now()}`,
      requestId: trip.transportRequestId,
      tripId: trip.id,
      type: "Delayed",
      title: "Trip Marked Delayed",
      description: `Delay reason: ${reason}`,
      performedBy: delayedBy,
      timestamp: now,
    });

    return { ...trip };
  }

  async addTransportExpense(
    tripId: string,
    expense: { category: any; amount: number; description: string; createdBy: string }
  ): Promise<Trip | null> {
    await this.delay();
    const trip = this.trips.find((t) => t.id === tripId || t.tripNumber === tripId);
    if (!trip) return null;

    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const newExp: TransportExpense = {
      id: `EXP-${Date.now()}`,
      tripId: trip.id,
      category: expense.category,
      amount: expense.amount,
      currency: trip.currency,
      description: expense.description,
      expenseDate: now,
      createdBy: expense.createdBy,
      createdAt: now,
    };

    trip.expenses.unshift(newExp);
    trip.actualCost = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    trip.updatedAt = now;

    trip.activities.unshift({
      id: `ACT-EXP-${Date.now()}`,
      requestId: trip.transportRequestId,
      tripId: trip.id,
      type: "ExpenseAdded",
      title: `Expense Added: ${expense.category}`,
      description: `Recorded ${trip.currency} ${expense.amount.toLocaleString()} for ${expense.description}.`,
      performedBy: expense.createdBy,
      timestamp: now,
    });

    return { ...trip };
  }

  async getDashboardKPIs() {
    await this.delay();
    const total = this.items.length;
    const pendingAssignment = this.items.filter((r) => r.status === "Pending Assignment").length;
    const scheduled = this.items.filter((r) => r.status === "Scheduled" || r.status === "Assigned").length;
    const inTransit = this.items.filter((r) => r.status === "In Transit" || r.status === "Departed" || r.status === "Picked Up" || r.status === "Loaded").length;
    const arrivingToday = this.items.filter((r) => r.status === "Arrived").length;
    const delayed = this.items.filter((r) => r.status === "Delayed").length;
    const completed = this.items.filter((r) => r.status === "Completed").length;
    const onHold = this.items.filter((r) => r.status === "On Hold").length;

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
  }
}

export const transportRepository = new TransportRepository();
