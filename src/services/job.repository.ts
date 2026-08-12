import { MockBaseRepository } from "./base.repository";
import { Job } from "@/types/job";
import { MOCK_JOBS } from "@/data/mock/job-data";

export class JobRepository extends MockBaseRepository<Job> {
  constructor() {
    super(MOCK_JOBS, 100);
  }

  async getByCustomerId(customerId: string): Promise<Job[]> {
    await this.delay();
    return this.items.filter((j) => j.customerId === customerId);
  }

  async getByQuotationId(quotationId: string): Promise<Job[]> {
    await this.delay();
    return this.items.filter((j) => j.quotationId === quotationId);
  }
}

export const jobRepository = new JobRepository();
