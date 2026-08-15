import { create } from "zustand";
import { Lead, Company, Contact, Customer, Activity, Task, LeadStatus } from "@/types/crm";
import {
  MOCK_LEADS,
  MOCK_COMPANIES,
  MOCK_CONTACTS,
  MOCK_CUSTOMERS,
  MOCK_ACTIVITIES,
  MOCK_TASKS,
} from "@/data/mock/crm-data";

interface CrmStoreState {
  leads: Lead[];
  companies: Company[];
  contacts: Contact[];
  customers: Customer[];
  activities: Activity[];
  tasks: Task[];

  // Lead actions
  addLead: (lead: Omit<Lead, "id" | "leadNumber" | "createdAt" | "updatedAt">) => Lead;
  updateLead: (id: string, data: Partial<Lead>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  convertLeadToCustomer: (leadId: string) => Customer;

  // Company actions
  addCompany: (company: Omit<Company, "id" | "createdAt">) => Company;
  updateCompany: (id: string, data: Partial<Company>) => void;

  // Contact actions
  addContact: (contact: Omit<Contact, "id" | "createdAt">) => Contact;
  updateContact: (id: string, data: Partial<Contact>) => void;

  // Customer actions
  addCustomer: (customer: Omit<Customer, "id" | "customerNumber" | "createdAt" | "updatedAt">) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;

  // Activity actions
  addActivity: (activity: Omit<Activity, "id" | "createdAt">) => Activity;
  updateActivityStatus: (id: string, status: Activity["status"]) => void;

  // Task actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => Task;
  toggleTaskStatus: (id: string) => void;
}

export const useCrmStore = create<CrmStoreState>((set, get) => ({
  leads: MOCK_LEADS,
  companies: MOCK_COMPANIES,
  contacts: MOCK_CONTACTS,
  customers: MOCK_CUSTOMERS,
  activities: MOCK_ACTIVITIES,
  tasks: MOCK_TASKS,

  addLead: (data) => {
    const nextNum = get().leads.length + 1;
    const newLead: Lead = {
      ...data,
      id: `LEAD-2026-${nextNum.toString().padStart(3, "0")}`,
      leadNumber: `LEAD-2026-${nextNum.toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({ leads: [newLead, ...state.leads] }));

    // Add activity log
    get().addActivity({
      type: "Note",
      title: `Lead ${newLead.leadNumber} Created`,
      description: `New lead registered for ${newLead.companyName} by ${newLead.owner}.`,
      relatedEntity: "Lead",
      relatedEntityId: newLead.id,
      relatedEntityName: newLead.companyName,
      assignedTo: newLead.owner,
      status: "Completed",
    });

    return newLead;
  },

  updateLead: (id, data) => {
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString().split("T")[0] } : l
      ),
    }));
  },

  updateLeadStatus: (id, status) => {
    const lead = get().leads.find((l) => l.id === id);
    if (!lead) return;

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === id ? { ...l, status, updatedAt: new Date().toISOString().split("T")[0] } : l
      ),
    }));

    get().addActivity({
      type: "Note",
      title: `Lead Status Changed to ${status}`,
      description: `Status for ${lead.companyName} updated to ${status}.`,
      relatedEntity: "Lead",
      relatedEntityId: lead.id,
      relatedEntityName: lead.companyName,
      assignedTo: lead.owner,
      status: "Completed",
    });
  },

  convertLeadToCustomer: (leadId) => {
    const lead = get().leads.find((l) => l.id === leadId);
    const cusNum = get().customers.length + 1;
    const customerId = `CUS-2026-${cusNum.toString().padStart(3, "0")}`;

    const newCustomer: Customer = {
      id: customerId,
      customerNumber: customerId,
      companyId: `COMP-${Math.floor(100 + Math.random() * 900)}`,
      companyName: lead?.companyName || "Converted Lead Corp",
      industry: lead?.industry || "Commercial Freight",
      status: "Active",
      category: "Standard",
      accountOwner: lead?.owner || "Dakhani Usman",
      primaryContactName: lead?.contactName || "Contact Lead",
      primaryContactEmail: lead?.email || "contact@converted.com",
      primaryContactPhone: lead?.phone || "+91 98000 00000",
      country: "India",
      city: lead?.location?.split(",")[0] || "Mumbai",
      creditLimit: 5000000,
      paymentTerms: "Net 30 Days",
      convertedFromLeadId: leadId,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({
      customers: [newCustomer, ...state.customers],
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, status: "Won", convertedCustomerId: customerId } : l
      ),
    }));

    get().addActivity({
      type: "Note",
      title: `Lead Converted to Customer ${customerId}`,
      description: `${newCustomer.companyName} successfully converted from Lead ${leadId} to Active Customer.`,
      relatedEntity: "Customer",
      relatedEntityId: customerId,
      relatedEntityName: newCustomer.companyName,
      assignedTo: newCustomer.accountOwner,
      status: "Completed",
    });

    return newCustomer;
  },

  addCompany: (data) => {
    const compNum = get().companies.length + 1;
    const newCompany: Company = {
      ...data,
      id: `COMP-${compNum.toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({ companies: [newCompany, ...state.companies] }));
    return newCompany;
  },

  updateCompany: (id, data) => {
    set((state) => ({
      companies: state.companies.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  addContact: (data) => {
    const contNum = get().contacts.length + 1;
    const newContact: Contact = {
      ...data,
      id: `CONT-${contNum.toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({ contacts: [newContact, ...state.contacts] }));
    return newContact;
  },

  updateContact: (id, data) => {
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  addCustomer: (data) => {
    const cusNum = get().customers.length + 1;
    const newCustomer: Customer = {
      ...data,
      id: `CUS-2026-${cusNum.toString().padStart(3, "0")}`,
      customerNumber: `CUS-2026-${cusNum.toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({ customers: [newCustomer, ...state.customers] }));
    return newCustomer;
  },

  updateCustomer: (id, data) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString().split("T")[0] } : c
      ),
    }));
  },

  addActivity: (data) => {
    const actNum = get().activities.length + 1;
    const newActivity: Activity = {
      ...data,
      id: `ACT-${actNum.toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({ activities: [newActivity, ...state.activities] }));
    return newActivity;
  },

  updateActivityStatus: (id, status) => {
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id
          ? {
            ...a,
            status,
            completedAt: status === "Completed" ? new Date().toISOString() : a.completedAt,
          }
          : a
      ),
    }));
  },

  addTask: (data) => {
    const taskNum = get().tasks.length + 1;
    const newTask: Task = {
      ...data,
      id: `TASK-${taskNum.toString().padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    return newTask;
  },

  toggleTaskStatus: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Completed" ? "Pending" : "Completed" }
          : t
      ),
    }));
  },
}));
