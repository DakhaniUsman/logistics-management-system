import { MockBaseRepository } from "./base.repository";
import { Lead, Company, Contact, Customer, Activity, Task } from "@/types/crm";
import {
  MOCK_LEADS,
  MOCK_COMPANIES,
  MOCK_CONTACTS,
  MOCK_CUSTOMERS,
  MOCK_ACTIVITIES,
  MOCK_TASKS,
} from "@/data/mock/crm-data";

export class LeadRepository extends MockBaseRepository<Lead> {
  constructor() {
    super(MOCK_LEADS, 100);
  }

  async convertLeadToCustomer(leadId: string): Promise<Customer | null> {
    await this.delay();
    const lead = this.items.find((l) => l.id === leadId);
    if (!lead) return null;

    lead.status = "Won";
    lead.updatedAt = new Date().toISOString().split("T")[0];

    const customerId = `CUS-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newCustomer: Customer = {
      id: customerId,
      customerNumber: customerId,
      companyId: `COMP-${Math.floor(100 + Math.random() * 900)}`,
      companyName: lead.companyName,
      industry: lead.industry,
      status: "Active",
      category: "Standard",
      accountOwner: lead.owner,
      primaryContactName: lead.contactName,
      primaryContactEmail: lead.email,
      primaryContactPhone: lead.phone,
      country: "India",
      city: lead.location.split(",")[0] || "Mumbai",
      creditLimit: 5000000,
      paymentTerms: "Net 30 Days",
      convertedFromLeadId: lead.id,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    lead.convertedCustomerId = customerId;
    return newCustomer;
  }
}

export class CompanyRepository extends MockBaseRepository<Company> {
  constructor() {
    super(MOCK_COMPANIES, 100);
  }
}

export class ContactRepository extends MockBaseRepository<Contact> {
  constructor() {
    super(MOCK_CONTACTS, 100);
  }

  async getByCompanyId(companyId: string): Promise<Contact[]> {
    await this.delay();
    return this.items.filter((c) => c.companyId === companyId);
  }
}

export class CustomerRepository extends MockBaseRepository<Customer> {
  constructor() {
    super(MOCK_CUSTOMERS, 100);
  }
}

export class ActivityRepository extends MockBaseRepository<Activity> {
  constructor() {
    super(MOCK_ACTIVITIES, 100);
  }

  async getByEntity(entityType: string, entityId: string): Promise<Activity[]> {
    await this.delay();
    return this.items.filter(
      (a) => a.relatedEntity === entityType && a.relatedEntityId === entityId
    );
  }
}

export class TaskRepository extends MockBaseRepository<Task> {
  constructor() {
    super(MOCK_TASKS, 100);
  }

  async toggleTaskComplete(taskId: string): Promise<Task | null> {
    await this.delay();
    const task = this.items.find((t) => t.id === taskId);
    if (!task) return null;
    task.status = task.status === "Completed" ? "Pending" : "Completed";
    return task;
  }
}

export const leadRepository = new LeadRepository();
export const companyRepository = new CompanyRepository();
export const contactRepository = new ContactRepository();
export const customerRepository = new CustomerRepository();
export const activityRepository = new ActivityRepository();
export const taskRepository = new TaskRepository();
