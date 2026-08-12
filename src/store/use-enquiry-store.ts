import { create } from "zustand";
import { Enquiry, EnquiryStatus } from "@/types/enquiry";
import { MOCK_ENQUIRIES } from "@/data/mock/enquiry-data";
import { useCrmStore } from "./use-crm-store";

interface EnquiryStoreState {
  enquiries: Enquiry[];

  addEnquiry: (enquiry: Omit<Enquiry, "id" | "enquiryNumber" | "createdAt" | "updatedAt">) => Enquiry;
  updateEnquiry: (id: string, data: Partial<Enquiry>) => void;
  updateEnquiryStatus: (id: string, status: EnquiryStatus) => void;
  assignEnquiry: (id: string, assignee: string) => void;
}

export const useEnquiryStore = create<EnquiryStoreState>((set, get) => ({
  enquiries: MOCK_ENQUIRIES,

  addEnquiry: (data) => {
    const nextNum = get().enquiries.length + 1;
    const newEnquiry: Enquiry = {
      ...data,
      id: `ENQ-2026-${nextNum.toString().padStart(3, "0")}`,
      enquiryNumber: `ENQ-2026-${nextNum.toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({ enquiries: [newEnquiry, ...state.enquiries] }));

    // Automatically record activity in CRM
    useCrmStore.getState().addActivity({
      type: "Note",
      title: `Enquiry ${newEnquiry.enquiryNumber} Created`,
      description: `New logistics inquiry received from ${newEnquiry.customerName} (${newEnquiry.origin} → ${newEnquiry.destination}).`,
      relatedEntity: "Customer",
      relatedEntityId: newEnquiry.customerId,
      relatedEntityName: newEnquiry.customerName,
      assignedTo: newEnquiry.assignedTo,
      status: "Completed",
    });

    return newEnquiry;
  },

  updateEnquiry: (id, data) => {
    set((state) => ({
      enquiries: state.enquiries.map((e) =>
        e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString().split("T")[0] } : e
      ),
    }));
  },

  updateEnquiryStatus: (id, status) => {
    const enq = get().enquiries.find((e) => e.id === id);
    if (!enq) return;

    set((state) => ({
      enquiries: state.enquiries.map((e) =>
        e.id === id ? { ...e, status, updatedAt: new Date().toISOString().split("T")[0] } : e
      ),
    }));

    // Record timeline activity
    useCrmStore.getState().addActivity({
      type: "Note",
      title: `Enquiry Status Changed to ${status}`,
      description: `Enquiry ${enq.enquiryNumber} for ${enq.customerName} moved to stage ${status}.`,
      relatedEntity: "Customer",
      relatedEntityId: enq.customerId,
      relatedEntityName: enq.customerName,
      assignedTo: enq.assignedTo,
      status: "Completed",
    });
  },

  assignEnquiry: (id, assignee) => {
    set((state) => ({
      enquiries: state.enquiries.map((e) =>
        e.id === id ? { ...e, assignedTo: assignee, updatedAt: new Date().toISOString().split("T")[0] } : e
      ),
    }));
  },
}));
