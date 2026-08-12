import { IJobRepository } from "../base.repository";
import { Job, DashboardMetrics } from "@/types/job";
import { MOCK_JOBS, GOLDEN_DASHBOARD_METRICS } from "@/data/mock/golden-data";

export class MockJobRepository implements IJobRepository {
  async getJobs(): Promise<Job[]> {
    // Simulate slight network latency for realistic feel
    await new Promise((res) => setTimeout(res, 120));
    return MOCK_JOBS;
  }

  async getJobById(id: string): Promise<Job | null> {
    await new Promise((res) => setTimeout(res, 100));
    const job = MOCK_JOBS.find(
      (j) =>
        j.id.toLowerCase() === id.toLowerCase() ||
        (j.jobNumber || "").toLowerCase() === id.toLowerCase() ||
        (j.jobNo || "").toLowerCase() === id.toLowerCase()
    );
    return job || null;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await new Promise((res) => setTimeout(res, 80));
    return GOLDEN_DASHBOARD_METRICS;
  }
}

export const jobRepository = new MockJobRepository();
