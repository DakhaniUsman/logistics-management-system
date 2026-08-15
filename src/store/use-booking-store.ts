import { create } from "zustand";
import { Booking, BookingStatus, BookingAmendment, BookingActivity } from "@/types/booking";
import { MOCK_BOOKINGS } from "@/data/mock/booking-data";

interface BookingStoreState {
  bookings: Booking[];

  createBooking: (data: Omit<Booking, "id" | "bookingNumber" | "createdAt" | "updatedAt" | "activities" | "amendments">) => Booking;
  createBookingFromShipment: (shipment: any, carrierId: string, carrierName: string, additionalDetails: Partial<Booking>) => Booking;
  updateBooking: (id: string, data: Partial<Booking>) => void;
  confirmBooking: (id: string, confirmationDetails: { bookingReference: string; vesselName?: string; voyageNumber?: string; flightNumber?: string; vehicleNumber?: string; etd?: string; eta?: string }) => void;
  rejectBooking: (id: string, reason: string) => void;
  requestAmendment: (id: string, fieldName: string, newValue: string, reason: string) => void;
  createAmendment: (id: string, amendment: Omit<BookingAmendment, "id" | "bookingId" | "changedAt">) => void;
  cancelBooking: (id: string, reason: string) => void;
  completeBooking: (id: string) => void;
  addBookingActivity: (bookingId: string, type: string, title: string, description: string, performedBy?: string) => void;
}

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  bookings: MOCK_BOOKINGS,

  createBooking: (data) => {
    const nextNum = get().bookings.length + 1;
    const bookingId = `BKG-2026-${nextNum.toString().padStart(5, "0")}`;

    const newBooking: Booking = {
      ...data,
      id: bookingId,
      bookingNumber: bookingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [
        {
          id: `ACT-${Date.now()}`,
          bookingId,
          type: "Created",
          title: "Booking Created",
          description: `Booking created manually for Shipment ${data.shipmentId}.`,
          performedBy: data.createdBy || "Operations Manager",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 16)
        }
      ],
      amendments: []
    };

    set((state) => ({ bookings: [newBooking, ...state.bookings] }));
    return newBooking;
  },

  createBookingFromShipment: (shipment, carrierId, carrierName, additionalDetails) => {
    const nextNum = get().bookings.length + 1;
    const bookingId = `BKG-2026-${nextNum.toString().padStart(5, "0")}`;

    const newBooking: Booking = {
      id: bookingId,
      bookingNumber: bookingId,
      shipmentId: shipment.id,
      jobId: shipment.jobId,
      customerId: shipment.customerId,
      customerName: shipment.customerName,
      carrierId,
      carrierName,
      bookingReference: additionalDetails.bookingReference || "",
      status: "Draft",
      transportMode: shipment.transportMode,
      serviceType: shipment.serviceType || "Port-to-Port",

      origin: shipment.origin,
      destination: shipment.destination,
      originPort: shipment.originPort || (shipment.transportMode === "Sea" ? shipment.origin : undefined),
      destinationPort: shipment.destinationPort || (shipment.transportMode === "Sea" ? shipment.destination : undefined),
      originAirport: shipment.originAirport || (shipment.transportMode === "Air" ? shipment.origin : undefined),
      destinationAirport: shipment.destinationAirport || (shipment.transportMode === "Air" ? shipment.destination : undefined),
      pickupLocation: shipment.pickupLocation,
      deliveryLocation: shipment.deliveryLocation,

      vesselName: additionalDetails.vesselName || shipment.vesselName || "",
      voyageNumber: additionalDetails.voyageNumber || shipment.voyageNumber || "",
      flightNumber: additionalDetails.flightNumber || shipment.flightNumber || "",
      vehicleNumber: additionalDetails.vehicleNumber || shipment.vehicleNumber || "",
      vehicleType: additionalDetails.vehicleType || "",
      railOperator: additionalDetails.railOperator || shipment.railOperator || "",
      trainNumber: additionalDetails.trainNumber || "",

      requestedDate: new Date().toISOString().split("T")[0],
      etd: additionalDetails.etd || shipment.etd || "",
      eta: additionalDetails.eta || shipment.eta || "",
      pickupDate: shipment.pickupDate,
      deliveryDate: shipment.requiredDeliveryDate,

      cargoDescription: shipment.cargoDescription || "",
      cargoType: shipment.cargoType || "",
      quantity: shipment.quantity || 1,
      quantityUnit: shipment.quantityUnit || "Shipment",
      weight: shipment.weight || 0,
      weightUnit: shipment.weightUnit || "KG",
      volume: shipment.volume || 0,
      volumeUnit: shipment.volumeUnit || "CBM",
      containerType: shipment.containerType || additionalDetails.containerType || "",
      containerQuantity: shipment.containerQuantity || additionalDetails.containerQuantity || 1,
      equipmentType: shipment.containerType || additionalDetails.containerType || "",
      equipmentQuantity: shipment.containerQuantity || additionalDetails.containerQuantity || 1,

      specialRequirements: additionalDetails.specialRequirements || shipment.specialRequirements || "",
      notes: additionalDetails.notes || shipment.notes || "",
      assignedTo: shipment.assignedTo || "Dakhani Usman",
      createdBy: "Dakhani Usman",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [
        {
          id: `ACT-${Date.now()}-1`,
          bookingId,
          type: "Created",
          title: "Booking Created",
          description: `Booking initiated from Shipment ${shipment.id}`,
          performedBy: "Dakhani Usman",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 16)
        }
      ],
      amendments: []
    };

    set((state) => ({ bookings: [newBooking, ...state.bookings] }));
    return newBooking;
  },

  updateBooking: (id, data) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
      )
    }));
  },

  confirmBooking: (id, confirmationDetails) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);

    set((state) => ({
      bookings: state.bookings.map((b) => {
        if (b.id === id) {
          const act: BookingActivity = {
            id: `ACT-${Date.now()}`,
            bookingId: id,
            type: "Confirmed",
            title: "Booking Confirmed by Carrier",
            description: `Space reservation confirmed with reference ${confirmationDetails.bookingReference} by Operations Manager.`,
            performedBy: "Dakhani Usman",
            timestamp
          };

          return {
            ...b,
            ...confirmationDetails,
            status: "Confirmed",
            confirmationDate: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString(),
            activities: [act, ...(b.activities || [])]
          };
        }
        return b;
      })
    }));
  },

  rejectBooking: (id, reason) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);

    set((state) => ({
      bookings: state.bookings.map((b) => {
        if (b.id === id) {
          const act: BookingActivity = {
            id: `ACT-${Date.now()}`,
            bookingId: id,
            type: "Rejected",
            title: "Booking Space Rejected",
            description: `Carrier rejected space allocation query. Reason: ${reason}`,
            performedBy: "Dakhani Usman",
            timestamp
          };

          return {
            ...b,
            status: "Rejected",
            notes: b.notes ? `${b.notes}\nRejected Reason: ${reason}` : `Rejected Reason: ${reason}`,
            updatedAt: new Date().toISOString(),
            activities: [act, ...(b.activities || [])]
          };
        }
        return b;
      })
    }));
  },

  requestAmendment: (id, fieldName, newValue, reason) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);

    set((state) => ({
      bookings: state.bookings.map((b) => {
        if (b.id === id) {
          const act: BookingActivity = {
            id: `ACT-${Date.now()}`,
            bookingId: id,
            type: "Amendment Requested",
            title: "Booking Amendment Requested",
            description: `Request sent to amend ${fieldName} to "${newValue}". Reason: ${reason}`,
            performedBy: "Dakhani Usman",
            timestamp
          };

          return {
            ...b,
            status: "Amendment Requested",
            updatedAt: new Date().toISOString(),
            activities: [act, ...(b.activities || [])]
          };
        }
        return b;
      })
    }));
  },

  createAmendment: (id, amendmentData) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
    const amendmentId = `AMD-${Date.now()}`;

    set((state) => ({
      bookings: state.bookings.map((b) => {
        if (b.id === id) {
          const newAmendment: BookingAmendment = {
            ...amendmentData,
            id: amendmentId,
            bookingId: id,
            changedAt: new Date().toISOString()
          };

          const act: BookingActivity = {
            id: `ACT-${Date.now()}`,
            bookingId: id,
            type: "Amended",
            title: `Booking Parameter Changed`,
            description: `Field "${amendmentData.fieldName}" amended from "${amendmentData.oldValue}" to "${amendmentData.newValue}" by ${amendmentData.changedBy}. Reason: ${amendmentData.reason}`,
            performedBy: amendmentData.changedBy,
            timestamp
          };

          // Dynamically apply the amendment value to the booking fields
          const updatedFields: Partial<Booking> = {};
          if (amendmentData.fieldName in b) {
            (updatedFields as any)[amendmentData.fieldName] = amendmentData.newValue;
          }

          return {
            ...b,
            ...updatedFields,
            status: "Amended",
            updatedAt: new Date().toISOString(),
            amendments: [newAmendment, ...(b.amendments || [])],
            activities: [act, ...(b.activities || [])]
          };
        }
        return b;
      })
    }));
  },

  cancelBooking: (id, reason) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);

    set((state) => ({
      bookings: state.bookings.map((b) => {
        if (b.id === id) {
          const act: BookingActivity = {
            id: `ACT-${Date.now()}`,
            bookingId: id,
            type: "Cancelled",
            title: "Booking Cancelled",
            description: `Booking space cancelled. Reason: ${reason}`,
            performedBy: "Dakhani Usman",
            timestamp
          };

          return {
            ...b,
            status: "Cancelled",
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activities: [act, ...(b.activities || [])]
          };
        }
        return b;
      })
    }));
  },

  completeBooking: (id) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);

    set((state) => ({
      bookings: state.bookings.map((b) => {
        if (b.id === id) {
          const act: BookingActivity = {
            id: `ACT-${Date.now()}`,
            bookingId: id,
            type: "Completed",
            title: "Booking Marked Completed",
            description: "Carrier space assignment and delivery legs fulfilled.",
            performedBy: "System",
            timestamp
          };

          return {
            ...b,
            status: "Completed",
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activities: [act, ...(b.activities || [])]
          };
        }
        return b;
      })
    }));
  },

  addBookingActivity: (bookingId, type, title, description, performedBy = "Dakhani Usman") => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
    const act: BookingActivity = {
      id: `ACT-${Date.now()}`,
      bookingId,
      type,
      title,
      description,
      performedBy,
      timestamp
    };

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? {
            ...b,
            updatedAt: new Date().toISOString(),
            activities: [act, ...(b.activities || [])]
          }
          : b
      )
    }));
  }
}));
