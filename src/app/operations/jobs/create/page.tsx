"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { JobType, JobPriority } from "@/types/job";
import { useQuotationStore } from "@/store/use-quotation-store";
import { useJobStore } from "@/store/use-job-store";
import { formatCurrency } from "@/lib/utils";
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  FileText,
  DollarSign,
  UserCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function CreateJobContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultQuotationId = searchParams.get("quotationId") || "QT-2026-002";

  const { quotations } = useQuotationStore();
  const { createJobFromQuotation, addJob } = useJobStore();

  const [selectedQuotationId, setSelectedQuotationId] = useState(defaultQuotationId);

  // Filter accepted quotations
  const acceptedQuotations = quotations.filter((q) => q.status === "Accepted" || q.id === selectedQuotationId);
  const selectedQuotation = quotations.find((q) => q.id === selectedQuotationId) || acceptedQuotations[0];

  // Job Form State
  const [formData, setFormData] = useState({
    jobType: "Freight Forwarding" as JobType,
    priority: "High" as JobPriority,
    assignedTo: "Vikram Mehta (Air Freight Ops)",
    assignedDepartment: "Freight Operations",
    pickupDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    requiredDeliveryDate: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0],
    specialRequirements: "Verify temperature loggers & export customs NOC documentation.",
    notes: "Initialized from accepted commercial quotation.",
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedQuotation) {
      const newJob = createJobFromQuotation(selectedQuotation);
      toast.success(`Created Operational Job ${newJob.jobNumber}`);
      router.push(`/operations/jobs/${newJob.id}`);
    } else {
      const newJob = addJob({
        customerId: "CUS-2026-001",
        customerName: "ABC Electronics Pvt Ltd",
        companyId: "COMP-001",
        contactName: "Rahul Sharma",
        contactEmail: "rahul.sharma@abcelectronics.com",
        contactPhone: "+91 98200 11223",
        jobType: formData.jobType,
        status: "Active",
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        assignedDepartment: formData.assignedDepartment,
        origin: "Mumbai Port (JNPT)",
        destination: "Jebel Ali Port",
        originCountry: "India",
        destinationCountry: "UAE",
        transportMode: "Ocean Freight",
        serviceType: "Port-to-Port",
        cargoDescription: "Direct Operational Shipment Entry",
        quantity: 1,
        quantityUnit: "Container",
        pickupDate: formData.pickupDate,
        requiredDeliveryDate: formData.requiredDeliveryDate,
        estimatedRevenue: 150000,
        estimatedCost: 110000,
        expectedProfit: 40000,
        expectedMarginPercentage: 26.6,
        currency: "INR",
        paymentTerms: "Net 30 Days",
        incoterm: "FOB",
        specialRequirements: formData.specialRequirements,
        notes: formData.notes,
        createdBy: "Dakhani Usman",
      });

      toast.success(`Created Direct Job ${newJob.jobNumber}`);
      router.push(`/operations/jobs/${newJob.id}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Initialize New Operational Job Record"
        subtitle="Convert accepted commercial quotations into active operational jobs and assign fulfillment team leads."
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Jobs", href: "/operations/jobs" },
          { label: "Create Job" },
        ]}
      />

      <form onSubmit={handleCreateJob} className="space-y-6 max-w-4xl mx-auto">
        {/* STEP 1: SOURCE QUOTATION SELECTOR */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            1. Source Accepted Quotation
          </h3>

          <Select
            label="Select Accepted Commercial Quotation"
            value={selectedQuotationId}
            onChange={(e) => setSelectedQuotationId(e.target.value)}
            options={acceptedQuotations.map((q) => ({
              label: `${q.quotationNumber} (Rev ${q.revisionNumber}) - ${q.customerName} [${formatCurrency(q.grandTotal)}]`,
              value: q.id,
            }))}
          />

          {selectedQuotation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Shipper Customer</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedQuotation.customerName}</span>
                <span className="block text-slate-400 text-[11px]">{selectedQuotation.contactName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Route & Service</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <span>{selectedQuotation.origin.split(" ")[0]}</span>
                  <ArrowRight className="w-3 h-3 text-sky-500" />
                  <span>{selectedQuotation.destination.split(" ")[0]}</span>
                </span>
                <span className="block text-slate-400 text-[11px]">{selectedQuotation.transportMode} • {selectedQuotation.incoterm}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Financial Revenue</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block text-sm">
                  {formatCurrency(selectedQuotation.grandTotal)}
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">Est Cost: {formatCurrency(selectedQuotation.internalCost)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* STEP 2: OPERATIONS ASSIGNMENT & PRIORITY */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            2. Operations Lead & Execution Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              label="Operational Job Type"
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
              options={[
                { label: "Freight Forwarding", value: "Freight Forwarding" },
                { label: "Transportation", value: "Transportation" },
                { label: "Customs Clearance", value: "Customs Clearance" },
                { label: "Warehousing", value: "Warehousing" },
                { label: "Door-to-Door", value: "Door-to-Door" },
                { label: "Port-to-Port", value: "Port-to-Port" },
              ]}
            />

            <Select
              label="Assigned Operations Lead"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              options={[
                { label: "Vikram Mehta (Air Freight Ops)", value: "Vikram Mehta (Air Freight Ops)" },
                { label: "Siddharth Rao (Ocean Export Lead)", value: "Siddharth Rao (Ocean Export Lead)" },
                { label: "Neha Kapoor (Customs Clearance)", value: "Neha Kapoor (Customs Clearance)" },
                { label: "Amit Patel (Road Feeder Ops)", value: "Amit Patel (Road Feeder Ops)" },
              ]}
            />

            <Select
              label="Operational Priority Level"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as JobPriority })}
              options={[
                { label: "Urgent Priority", value: "Urgent" },
                { label: "High Priority", value: "High" },
                { label: "Medium Priority", value: "Medium" },
                { label: "Low Priority", value: "Low" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Estimated Cargo Pickup Date"
              type="date"
              required
              value={formData.pickupDate}
              onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
            />

            <Input
              label="Required Destination Delivery Date"
              type="date"
              required
              value={formData.requiredDeliveryDate}
              onChange={(e) => setFormData({ ...formData, requiredDeliveryDate: e.target.value })}
            />
          </div>

          <Input
            label="Special Operational Requirements & Instructions"
            value={formData.specialRequirements}
            onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
            placeholder="e.g. GDP temperature loggers, container sealing, cargo inspection..."
          />
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/operations/jobs">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" size="sm" type="submit" icon={CheckCircle2}>
            Initialize Operational Job
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Job Creation Page...</div>}>
      <CreateJobContent />
    </Suspense>
  );
}
