"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Timeline } from "@/components/ui/timeline";
import { RateStatus } from "@/types/rate";
import { useRateStore } from "@/store/use-rate-store";
import { useEnquiryStore } from "@/store/use-enquiry-store";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Ship,
  Plane,
  Truck,
  ArrowRight,
  Building2,
  Calendar,
  Layers,
  Copy,
  Edit,
  Archive,
  History,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rateId = (params.id as string) || "RATE-2026-001";

  const { rates, updateRate, duplicateRate, archiveRate } = useRateStore();
  const { enquiries } = useEnquiryStore();

  const rate = rates.find((r) => r.id.toLowerCase() === rateId.toLowerCase() || r.rateNumber.toLowerCase() === rateId.toLowerCase()) || rates[0];

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    rate: rate?.rate || 80000,
    validUntil: rate?.validUntil || "2026-08-31",
    terms: rate?.terms || "",
    reason: "Monthly tariff adjustment",
  });

  if (!rate) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Rate record not found.</p>
        <Link href="/sales/rates">
          <Button variant="outline" size="sm" className="mt-4">Back to Rates</Button>
        </Link>
      </div>
    );
  }

  // Linked Enquiries
  const linkedEnquiries = enquiries.filter(
    (e) => e.origin.includes(rate.origin.split(" ")[0]) && e.destination.includes(rate.destination.split(" ")[0])
  );

  // Rate History Events
  const historyEvents = (rate.history || []).map((h) => ({
    id: h.id,
    title: `Rate adjusted to ${formatCurrency(h.newRate)} (Previous: ${formatCurrency(h.previousRate)})`,
    description: `Reason: ${h.reason} • Adjusted by ${h.changedBy}`,
    timestamp: h.changedDate,
    completed: true,
  }));

  const handleDuplicate = () => {
    const dup = duplicateRate(rate.id);
    if (dup) {
      toast.success(`Duplicated rate as ${dup.rateNumber}`);
      router.push(`/sales/rates/${dup.id}`);
    }
  };

  const handleArchive = () => {
    archiveRate(rate.id);
    toast.success(`Archived rate tariff ${rate.rateNumber}`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRate(rate.id, { rate: editForm.rate, validUntil: editForm.validUntil, terms: editForm.terms }, editForm.reason);
    toast.success(`Updated rate ${rate.rateNumber}`);
    setIsEditDrawerOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <PageHeader
        title={`${rate.rateNumber}: ${rate.vendorName}`}
        subtitle={`${rate.rateType} Tariff (${rate.origin} → ${rate.destination})`}
        breadcrumbs={[
          { label: "Sales & CRM", href: "/sales/crm" },
          { label: "Rate Management", href: "/sales/rates" },
          { label: rate.rateNumber },
        ]}
        statusBadge={<StatusBadge status={rate.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => setIsEditDrawerOpen(true)}
            >
              Edit Rate Tariff
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={handleDuplicate}
            >
              Duplicate
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={Archive}
              onClick={handleArchive}
            >
              Archive Rate
            </Button>

            <Link href="/sales/rates/comparison">
              <Button variant="primary" size="sm" icon={ExternalLink}>
                Compare Alternatives
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tariff Rate</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-lg block">
              {formatCurrency(rate.rate)}
            </span>
            <span className="text-[11px] text-slate-400">{rate.unit} ({rate.currency})</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Provider</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">{rate.vendorName}</span>
            <span className="text-[11px] text-slate-400">{rate.carrierName || rate.serviceType}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Trade Route</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1">
              <span>{rate.origin.split(" ")[0]}</span>
              <ArrowRight className="w-3 h-3 text-sky-500" />
              <span>{rate.destination.split(" ")[0]}</span>
            </span>
            <span className="text-[11px] text-slate-400">{rate.transportMode}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Validity Period</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs block">
              Until {rate.validUntil}
            </span>
            <span className="text-[11px] text-slate-400">Valid From: {rate.validFrom}</span>
          </div>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
          <Tabs
            tabs={[
              { id: "overview", label: "Rate Terms & Specs" },
              { id: "history", label: "Price Revision History", count: (rate.history || []).length },
              { id: "enquiries", label: "Related Enquiries", count: linkedEnquiries.length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Tariff Terms & Operational Conditions
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Equipment Allocation</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{rate.containerType || "Standard Freight"}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Minimum Charge Threshold</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatCurrency(rate.minimumCharge || rate.rate)}</span>
                </div>
              </div>

              {rate.terms && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contract Surcharges & Demurrage Terms</span>
                  <p className="text-slate-700 dark:text-slate-300">{rate.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === "history" && (
            <div className="max-w-xl mx-auto py-2">
              <h4 className="text-sm font-bold text-slate-200 mb-4">
                Tariff Price Revision Timeline Log
              </h4>
              {historyEvents.length > 0 ? (
                <Timeline events={historyEvents} />
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No historical price adjustments logged yet for this tariff.</p>
              )}
            </div>
          )}

          {/* TAB 3: ENQUIRIES */}
          {activeTab === "enquiries" && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                Enquiries Matching Trade Lane ({linkedEnquiries.length})
              </h4>
              {linkedEnquiries.length > 0 ? (
                linkedEnquiries.map((e) => (
                  <Link
                    key={e.id}
                    href={`/sales/enquiries/${e.id}`}
                    className="block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-500 font-mono">{e.enquiryNumber}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="text-slate-200 font-medium mt-1">{e.customerName}</p>
                    <p className="text-slate-400 text-[11px]">{e.origin} → {e.destination}</p>
                  </Link>
                ))
              ) : (
                <p className="text-slate-400 italic">No enquiries currently matching this trade route.</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* EDIT RATE DRAWER */}
      <Drawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={`Edit Rate Tariff: ${rate.rateNumber}`}
        subtitle="Update tariff rate amount, validity dates, or contract terms."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Tariff Rate Amount (₹)"
            type="number"
            required
            value={editForm.rate}
            onChange={(e) => setEditForm({ ...editForm, rate: Number(e.target.value) })}
          />

          <Input
            label="Valid Until Date"
            type="date"
            required
            value={editForm.validUntil}
            onChange={(e) => setEditForm({ ...editForm, validUntil: e.target.value })}
          />

          <Input
            label="Reason for Price Revision"
            required
            placeholder="e.g. Monthly carrier GRI tariff update"
            value={editForm.reason}
            onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
          />

          <Input
            label="Contract Terms & Notes"
            value={editForm.terms}
            onChange={(e) => setEditForm({ ...editForm, terms: e.target.value })}
          />

          <Button variant="primary" type="submit" className="w-full mt-4">
            Save Rate Changes
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
