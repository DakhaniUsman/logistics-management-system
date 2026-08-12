import { MockBaseRepository } from "./base.repository";
import { Quotation } from "@/types/quotation";
import { MOCK_QUOTATIONS } from "@/data/mock/quotation-data";

export class QuotationRepository extends MockBaseRepository<Quotation> {
  constructor() {
    super(MOCK_QUOTATIONS, 100);
  }

  async getByCustomerId(customerId: string): Promise<Quotation[]> {
    await this.delay();
    return this.items.filter((q) => q.customerId === customerId);
  }

  async getByEnquiryId(enquiryId: string): Promise<Quotation[]> {
    await this.delay();
    return this.items.filter((q) => q.enquiryId === enquiryId);
  }
}

export const quotationRepository = new QuotationRepository();
