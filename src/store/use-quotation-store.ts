import { create } from "zustand";
import { Quotation, QuotationStatus } from "@/types/quotation";
import { MOCK_QUOTATIONS } from "@/data/mock/quotation-data";
import { useCrmStore } from "./use-crm-store";
import { useEnquiryStore } from "./use-enquiry-store";

interface QuotationStoreState {
  quotations: Quotation[];

  addQuotation: (data: Omit<Quotation, "id" | "quotationNumber" | "createdAt" | "updatedAt" | "revisions">) => Quotation;
  updateQuotation: (id: string, data: Partial<Quotation>) => void;
  createRevision: (id: string, reason: string, updatedData?: Partial<Quotation>) => Quotation | undefined;
  approveQuotation: (id: string, approverName: string) => void;
  sendQuotation: (id: string) => void;
  acceptQuotation: (id: string) => void;
  rejectQuotation: (id: string, reason: string) => void;
}

export const useQuotationStore = create<QuotationStoreState>((set, get) => ({
  quotations: MOCK_QUOTATIONS,

  addQuotation: (data) => {
    const nextNum = get().quotations.length + 1;
    const newQuotation: Quotation = {
      ...data,
      id: `QT-2026-${nextNum.toString().padStart(3, "0")}`,
      quotationNumber: `QT-2026-${nextNum.toString().padStart(3, "0")}`,
      revisionNumber: 1,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      revisions: [
        {
          revisionNumber: 1,
          createdAt: new Date().toISOString().split("T")[0],
          createdBy: data.createdBy,
          reason: "Initial commercial quotation creation.",
          subtotal: data.subtotal,
          discountAmount: data.discountAmount,
          taxAmount: data.taxAmount,
          grandTotal: data.grandTotal,
          marginAmount: data.marginAmount,
        },
      ],
    };

    set((state) => ({ quotations: [newQuotation, ...state.quotations] }));

    // Record activity in CRM & Enquiry
    useCrmStore.getState().addActivity({
      type: "Note",
      title: `Quotation ${newQuotation.quotationNumber} Created`,
      description: `Commercial quotation generated for ${newQuotation.customerName} (${newQuotation.origin} → ${newQuotation.destination}). Total Value: ₹${newQuotation.grandTotal.toLocaleString()}`,
      relatedEntity: "Customer",
      relatedEntityId: newQuotation.customerId,
      relatedEntityName: newQuotation.customerName,
      assignedTo: newQuotation.createdBy,
      status: "Completed",
    });

    return newQuotation;
  },

  updateQuotation: (id, data) => {
    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id ? { ...q, ...data, updatedAt: new Date().toISOString().split("T")[0] } : q
      ),
    }));
  },

  createRevision: (id, reason, updatedData) => {
    const target = get().quotations.find((q) => q.id === id);
    if (!target) return undefined;

    const nextRevNum = target.revisionNumber + 1;
    const revEntry = {
      revisionNumber: nextRevNum,
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "Shahbaj Borkar",
      reason: reason || "Negotiation price revision",
      subtotal: updatedData?.subtotal || target.subtotal,
      discountAmount: updatedData?.discountAmount || target.discountAmount,
      taxAmount: updatedData?.taxAmount || target.taxAmount,
      grandTotal: updatedData?.grandTotal || target.grandTotal,
      marginAmount: updatedData?.marginAmount || target.marginAmount,
    };

    const updatedQuotation: Quotation = {
      ...target,
      ...updatedData,
      revisionNumber: nextRevNum,
      status: "Negotiation",
      revisions: [revEntry, ...(target.revisions || [])],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({
      quotations: state.quotations.map((q) => (q.id === id ? updatedQuotation : q)),
    }));

    return updatedQuotation;
  },

  approveQuotation: (id, approverName) => {
    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "Draft",
              approvedBy: approverName,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : q
      ),
    }));
  },

  sendQuotation: (id) => {
    const target = get().quotations.find((q) => q.id === id);
    if (!target) return;

    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "Sent",
              sentAt: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().slice(0, 5),
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : q
      ),
    }));

    // Update enquiry status to "Ready for Quotation"
    useEnquiryStore.getState().updateEnquiryStatus(target.enquiryId, "Ready for Quotation");
  },

  acceptQuotation: (id) => {
    const target = get().quotations.find((q) => q.id === id);
    if (!target) return;

    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "Accepted",
              acceptedAt: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().slice(0, 5),
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : q
      ),
    }));

    // Update enquiry status to "Won"
    useEnquiryStore.getState().updateEnquiryStatus(target.enquiryId, "Won");
  },

  rejectQuotation: (id, reason) => {
    const target = get().quotations.find((q) => q.id === id);
    if (!target) return;

    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "Rejected",
              rejectedAt: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().slice(0, 5),
              notes: `Rejected by customer. Reason: ${reason}`,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : q
      ),
    }));

    // Update enquiry status to "Lost"
    useEnquiryStore.getState().updateEnquiryStatus(target.enquiryId, "Lost");
  },
}));
