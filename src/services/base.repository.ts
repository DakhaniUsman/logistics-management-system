import { Job, DashboardMetrics, CustomerSummary } from "@/types/job";

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, any>;
}

export interface IBaseRepository<T extends { id: string }> {
  getAll(params?: QueryParams): Promise<PaginationResult<T>>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IJobRepository {
  getJobs(): Promise<Job[]>;
  getJobById(id: string): Promise<Job | null>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
}

export interface ICustomerRepository {
  getCustomers(): Promise<CustomerSummary[]>;
  getCustomerById(id: string): Promise<CustomerSummary | null>;
}

/**
 * Generic mock repository service implementation with simulated async latency.
 */
export class MockBaseRepository<T extends { id: string }> implements IBaseRepository<T> {
  protected items: T[];
  protected simulatedLatencyMs: number;

  constructor(initialData: T[] = [], simulatedLatencyMs = 150) {
    this.items = [...initialData];
    this.simulatedLatencyMs = simulatedLatencyMs;
  }

  protected async delay(): Promise<void> {
    if (this.simulatedLatencyMs <= 0) return;
    return new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
  }

  async getAll(params: QueryParams = {}): Promise<PaginationResult<T>> {
    await this.delay();
    const { page = 1, pageSize = 10, search = "", sortBy, sortOrder = "asc" } = params;

    let filtered = [...this.items];

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(term)
      );
    }

    if (sortBy) {
      filtered.sort((a, b) => {
        const valA = (a as any)[sortBy];
        const valB = (b as any)[sortBy];
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getById(id: string): Promise<T | null> {
    await this.delay();
    return this.items.find((item) => item.id === id) || null;
  }

  async create(data: Omit<T, "id">): Promise<T> {
    await this.delay();
    const newItem = {
      ...data,
      id: `id_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    } as unknown as T;
    this.items.unshift(newItem);
    return newItem;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.delay();
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updatedItem = { ...this.items[index], ...data };
    this.items[index] = updatedItem;
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    await this.delay();
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}
