import { create } from "zustand";
import { Rate, RateStatus, SelectedCostComponent, CostComponentBasket } from "@/types/rate";
import { MOCK_RATES } from "@/data/mock/rate-data";

interface RateStoreState {
  rates: Rate[];

  // Cost component baskets keyed by enquiryId (e.g. ENQ-2026-001)
  baskets: Record<string, SelectedCostComponent[]>;

  addRate: (rate: Omit<Rate, "id" | "rateNumber" | "createdAt" | "updatedAt">) => Rate;
  updateRate: (id: string, data: Partial<Rate>, reason?: string) => void;
  duplicateRate: (id: string) => Rate | undefined;
  archiveRate: (id: string) => void;

  // Cost Component Basket Operations
  toggleComponentInBasket: (enquiryId: string, component: SelectedCostComponent) => void;
  getBasketForEnquiry: (enquiryId: string) => SelectedCostComponent[];
  getEstimatedTotalCost: (enquiryId: string) => number;
}

export const useRateStore = create<RateStoreState>((set, get) => ({
  rates: MOCK_RATES,
  baskets: {
    "ENQ-2026-001": [
      {
        rateId: "RATE-2026-001",
        rateNumber: "RATE-2026-001",
        category: "Ocean Freight",
        vendorName: "ABC Shipping Lines",
        carrierName: "Maersk Line",
        amount: 80000,
        currency: "INR",
        unit: "Per Container",
      },
      {
        rateId: "RATE-2026-003",
        rateNumber: "RATE-2026-003",
        category: "Road Transport",
        vendorName: "XYZ Logistics & Transport",
        amount: 15000,
        currency: "INR",
        unit: "Per Trip",
      },
      {
        rateId: "RATE-2026-004",
        rateNumber: "RATE-2026-004",
        category: "Customs Clearance",
        vendorName: "Global Customs Clearing Services",
        amount: 8000,
        currency: "INR",
        unit: "Per Shipment",
      },
      {
        rateId: "RATE-2026-005",
        rateNumber: "RATE-2026-005",
        category: "Documentation",
        vendorName: "ABC Shipping Lines",
        amount: 2500,
        currency: "INR",
        unit: "Per Document",
      },
      {
        rateId: "RATE-2026-006",
        rateNumber: "RATE-2026-006",
        category: "Insurance",
        vendorName: "HDFC ERGO Marine Insurance",
        amount: 3000,
        currency: "INR",
        unit: "Per Shipment",
      },
    ],
  },

  addRate: (data) => {
    const nextNum = get().rates.length + 1;
    const newRate: Rate = {
      ...data,
      id: `RATE-2026-${nextNum.toString().padStart(3, "0")}`,
      rateNumber: `RATE-2026-${nextNum.toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({ rates: [newRate, ...state.rates] }));
    return newRate;
  },

  updateRate: (id, data, reason) => {
    const target = get().rates.find((r) => r.id === id);
    if (!target) return;

    let updatedHistory = target.history || [];
    if (data.rate && data.rate !== target.rate) {
      updatedHistory = [
        {
          id: `HIST-${Date.now()}`,
          rateId: id,
          previousRate: target.rate,
          newRate: data.rate,
          changedBy: "Shahbaj Borkar",
          changedDate: new Date().toISOString().split("T")[0],
          reason: reason || "Manual rate adjustment",
        },
        ...updatedHistory,
      ];
    }

    set((state) => ({
      rates: state.rates.map((r) =>
        r.id === id
          ? {
              ...r,
              ...data,
              history: updatedHistory,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : r
      ),
    }));
  },

  duplicateRate: (id) => {
    const target = get().rates.find((r) => r.id === id);
    if (!target) return undefined;

    const nextNum = get().rates.length + 1;
    const duplicated: Rate = {
      ...target,
      id: `RATE-2026-${nextNum.toString().padStart(3, "0")}`,
      rateNumber: `RATE-2026-${nextNum.toString().padStart(3, "0")}`,
      status: "Draft",
      notes: `Duplicated from ${target.rateNumber}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({ rates: [duplicated, ...state.rates] }));
    return duplicated;
  },

  archiveRate: (id) => {
    set((state) => ({
      rates: state.rates.map((r) =>
        r.id === id ? { ...r, status: "Archived", updatedAt: new Date().toISOString().split("T")[0] } : r
      ),
    }));
  },

  toggleComponentInBasket: (enquiryId, component) => {
    set((state) => {
      const current = state.baskets[enquiryId] || [];
      const exists = current.some((c) => c.rateId === component.rateId);

      const nextList = exists
        ? current.filter((c) => c.rateId !== component.rateId)
        : [...current, component];

      return {
        baskets: {
          ...state.baskets,
          [enquiryId]: nextList,
        },
      };
    });
  },

  getBasketForEnquiry: (enquiryId) => {
    return get().baskets[enquiryId] || [];
  },

  getEstimatedTotalCost: (enquiryId) => {
    const basket = get().baskets[enquiryId] || [];
    return basket.reduce((sum, item) => sum + item.amount, 0);
  },
}));
