import { MockBaseRepository } from "./base.repository";
import { Enquiry } from "@/types/enquiry";
import { MOCK_ENQUIRIES } from "@/data/mock/enquiry-data";

export class EnquiryRepository extends MockBaseRepository<Enquiry> {
  constructor() {
    super(MOCK_ENQUIRIES, 100);
  }

  async getByCustomerId(customerId: string): Promise<Enquiry[]> {
    await this.delay();
    return this.items.filter((e) => e.customerId === customerId);
  }

  async updateStatus(id: string, status: Enquiry["status"]): Promise<Enquiry | null> {
    await this.delay();
    const item = this.items.find((e) => e.id === id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString().split("T")[0];
    return item;
  }
}

export const enquiryRepository = new EnquiryRepository();
