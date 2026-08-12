"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { useRateStore } from "@/store/use-rate-store";
import { useEnquiryStore } from "@/store/use-enquiry-store";
import { formatCurrency } from "@/lib/utils";
import {
  SlidersHorizontal,
  ArrowRight,
  Ship,
  Plane,
  Truck,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Sparkles,
  Award,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RateComparisonEnginePage() {
  const { rates, toggleComponentInBasket, getBasketForEnquiry, getEstimatedTotalCost } = useRateStore();
  const { enquiries } = useEnquiryStore();

  const [selectedEnquiryId, setSelectedEnquiryId] = useState(enquiries[0]?.id || "ENQ-2026-001");
  const [selectedOrigin, setSelectedOrigin] = useState("Mumbai Port (JNPT)");
  const [selectedDestination, setSelectedDestination] = useState("Jebel Ali Port");
  const [selectedCategory, setSelectedCategory] = useState("Ocean Freight");

  const currentEnquiry = enquiries.find((e) => e.id === selectedEnquiryId) || enquiries[0];

  // Filter ocean rates matching origin & destination
  const matchedRates = rates.filter((r) => {
    if (selectedCategory !== "ALL" && r.rateType !== selectedCategory) return false;
    return true;
  });

  // Identify lowest rate
  const activeMatchedRates = matchedRates.filter((r) => r.status === "Active");
  const lowestRate = activeMatchedRates.length > 0
    ? activeMatchedRates.reduce((min, r) => (r.rate < min.rate ? r : min), activeMatchedRates[0])
    : null;

  const currentBasket = getBasketForEnquiry(selectedEnquiryId);
  const totalEstimatedCost = getEstimatedTotalCost(selectedEnquiryId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Rate Comparison Engine & Cost Component Estimator"
        subtitle="Compare multi-vendor tariffs side-by-side, identify competitive carriers, and assemble estimated fulfillment cost components for customer enquiries."
        breadcrumbs={[
          { label: "Sales & CRM", href: "/sales/crm" },
          { label: "Rate Management", href: "/sales/rates" },
          { label: "Rate Comparison" },
        ]}
      />

      {/* Selector Toolbar */}
      <Card className="p-4 bg-slate-900/60 border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Target Customer Enquiry</label>
            <Select
              value={selectedEnquiryId}
              onChange={(e) => setSelectedEnquiryId(e.target.value)}
              options={enquiries.slice(0, 15).map((enq) => ({
                label: `${enq.enquiryNumber} (${enq.customerName}: ${enq.origin.split(" ")[0]} → ${enq.destination.split(" ")[0]})`,
                value: enq.id,
              }))}
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Origin Loading Port</label>
            <Input
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Destination Discharge Port</label>
            <Input
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Filter Service Category</label>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { label: "All Categories", value: "ALL" },
                { label: "Ocean Freight", value: "Ocean Freight" },
                { label: "Air Freight", value: "Air Freight" },
                { label: "Road Transport", value: "Road Transport" },
                { label: "Customs Clearance", value: "Customs Clearance" },
                { label: "Documentation", value: "Documentation" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Main Grid: Left Comparison Table & Right Selected Basket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Multi-Vendor Rate Comparison Table */}
        <div className="lg:col-span-2 space-y-4">
          {lowestRate && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Lowest Valid Tariff:</strong> {lowestRate.vendorName} ({lowestRate.rateNumber}) offers <strong>{formatCurrency(lowestRate.rate)}</strong> / {lowestRate.unit} for {lowestRate.origin.split(" ")[0]} → {lowestRate.destination.split(" ")[0]}.
                </span>
              </div>
            </div>
          )}

          <Card className="p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Available Vendor Rates ({matchedRates.length})</span>
              <span className="text-xs text-slate-400 font-normal">Click component to add/remove from enquiry cost basket</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2">Vendor / Carrier</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Route</th>
                    <th className="py-2">Rate Tariff</th>
                    <th className="py-2">Validity</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {matchedRates.slice(0, 10).map((r) => {
                    const isSelected = currentBasket.some((c) => c.rateId === r.id);
                    const isLowest = lowestRate?.id === r.id;

                    return (
                      <tr key={r.id} className={`hover:bg-slate-900/40 transition-colors ${isLowest ? "bg-emerald-950/20" : ""}`}>
                        <td className="py-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{r.vendorName}</span>
                            {isLowest && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded">Lowest</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{r.carrierName || r.rateNumber}</div>
                        </td>
                        <td className="py-3 text-slate-300 font-medium">{r.rateType}</td>
                        <td className="py-3 text-slate-400 font-mono text-[11px]">
                          {r.origin.split(" ")[0]} → {r.destination.split(" ")[0]}
                        </td>
                        <td className="py-3">
                          <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatCurrency(r.rate)}</div>
                          <div className="text-[10px] text-slate-400">{r.unit}</div>
                        </td>
                        <td className="py-3 font-mono text-slate-400 text-[11px]">{r.validUntil}</td>
                        <td className="py-3 text-right">
                          <Button
                            variant={isSelected ? "secondary" : "outline"}
                            size="xs"
                            onClick={() => {
                              toggleComponentInBasket(selectedEnquiryId, {
                                rateId: r.id,
                                rateNumber: r.rateNumber,
                                category: r.rateType,
                                vendorName: r.vendorName,
                                carrierName: r.carrierName,
                                amount: r.rate,
                                currency: r.currency,
                                unit: r.unit,
                              });
                              toast.success(isSelected ? "Removed cost component" : `Added ${r.rateType} component`);
                            }}
                          >
                            {isSelected ? "Remove Component" : "Select Rate"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Selected Cost Component Basket */}
        <div className="space-y-4">
          <Card className="p-5 space-y-5 sticky top-20">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] text-sky-500 font-bold font-mono block">{currentEnquiry?.enquiryNumber}</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Selected Cost Components
              </h3>
              <p className="text-xs text-slate-400">{currentEnquiry?.customerName}</p>
            </div>

            {/* Total Estimated Cost Box */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Internal Operational Cost</span>
              <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 block">
                {formatCurrency(totalEstimatedCost)}
              </span>
              <span className="text-[11px] text-slate-400 block">Sum of {currentBasket.length} cost elements</span>
            </div>

            {/* Component List */}
            <div className="space-y-2 text-xs">
              {currentBasket.length > 0 ? (
                currentBasket.map((comp) => (
                  <div key={comp.rateId} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{comp.category}</span>
                      <span className="text-slate-400 text-[11px]">{comp.vendorName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">{formatCurrency(comp.amount)}</span>
                      <button
                        onClick={() => toggleComponentInBasket(selectedEnquiryId, comp)}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 italic text-xs border border-dashed border-slate-800 rounded">
                  No rate components added to basket yet. Select rates from the left comparison table.
                </div>
              )}
            </div>

            {/* Phase 5 Quotation Notice */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ready for Phase 5 Quotation Module</p>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Internal estimated cost ({formatCurrency(totalEstimatedCost)}) will be passed to Quotation Management to apply commercial margins.
                </p>
              </div>
            </div>

            <Link href={`/sales/enquiries/${selectedEnquiryId}`} className="block">
              <Button variant="outline" size="sm" className="w-full" icon={ExternalLink}>
                View Back in Enquiry Details
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
