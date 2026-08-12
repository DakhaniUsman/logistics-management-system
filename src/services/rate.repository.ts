import { MockBaseRepository } from "./base.repository";
import { Rate } from "@/types/rate";
import { MOCK_RATES } from "@/data/mock/rate-data";

export class RateRepository extends MockBaseRepository<Rate> {
  constructor() {
    super(MOCK_RATES, 100);
  }

  async getRatesByRoute(origin: string, destination: string): Promise<Rate[]> {
    await this.delay();
    return this.items.filter(
      (r) =>
        r.origin.toLowerCase().includes(origin.toLowerCase()) &&
        r.destination.toLowerCase().includes(destination.toLowerCase()) &&
        r.status === "Active"
    );
  }

  async duplicateRate(id: string): Promise<Rate | null> {
    await this.delay();
    const target = this.items.find((r) => r.id === id);
    if (!target) return null;

    const nextId = this.items.length + 1;
    const duplicated: Rate = {
      ...target,
      id: `RATE-2026-${nextId.toString().padStart(3, "0")}`,
      rateNumber: `RATE-2026-${nextId.toString().padStart(3, "0")}`,
      status: "Draft",
      notes: `Duplicated from ${target.rateNumber}`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    this.items.unshift(duplicated);
    return duplicated;
  }
}

export const rateRepository = new RateRepository();
