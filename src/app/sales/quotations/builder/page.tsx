"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { QuotationLineItem } from "@/types/quotation";
import { useEnquiryStore } from "@/store/use-enquiry-store";
import { useRateStore } from "@/store/use-rate-store";
import { useQuotationStore } from "@/store/use-quotation-store";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Percent,
  DollarSign,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

function QuotationBuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultEnquiryId = searchParams.get("enquiryId") || "ENQ-2026-001";

  const { enquiries } = useEnquiryStore();
  const { getEstimatedTotalCost } = useRateStore();
  const { addQuotation } = useQuotationStore();

  const [selectedEnquiryId, setSelectedEnquiryId] = useState(defaultEnquiryId);

  const selectedEnquiry = enquiries.find((e) => e.id === selectedEnquiryId) || enquiries[0];

  // Auto-loaded estimated cost from Phase 4 Rate Management
  const initialInternalCost = getEstimatedTotalCost(selectedEnquiry?.id || "ENQ-2026-001") || 108000;

  // Commercial Pricing State
  const [internalCost, setInternalCost] = useState(initialInternalCost);
  const [marginType, setMarginType] = useState<"fixed" | "percentage">("fixed");
  const [marginValue, setMarginValue] = useState(22000); // Default ₹22,000 margin
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxName, setTaxName] = useState("GST");
  const [taxPercentage, setTaxPercentage] = useState(18);
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [transitTime, setTransitTime] = useState("5 - 7 Days");
  const [incoterm, setIncoterm] = useState(selectedEnquiry?.incoterm || "FOB");
  const [validUntil, setValidUntil] = useState("2026-08-31");
  const [termsAndConditions, setTermsAndConditions] = useState(
    "1. Rates subject to space & equipment availability.\n2. Demurrage free time: 7 days at POD.\n3. Tariff includes BAF and THC surcharges.\n4. Payment terms: Net 30 Days."
  );

  // Line items
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([
    {
      id: "ITEM-1",
      description: `Ocean Freight Container Shipment (${selectedEnquiry?.origin.split(" ")[0]} to ${selectedEnquiry?.destination.split(" ")[0]})`,
      quantity: 1,
      unit: "Container",
      unitPrice: 95000,
      totalPrice: 95000,
      internalCostReference: 80000,
    },
    {
      id: "ITEM-2",
      description: "First Mile Feeder Trailer Pickup & Transportation",
      quantity: 1,
      unit: "Trip",
      unitPrice: 18000,
      totalPrice: 18000,
      internalCostReference: 15000,
    },
    {
      id: "ITEM-3",
      description: "Customs EDI House Clearance & Port Examination",
      quantity: 1,
      unit: "Shipment",
      unitPrice: 10000,
      totalPrice: 10000,
      internalCostReference: 8000,
    },
    {
      id: "ITEM-4",
      description: "Master Bill of Lading Documentation Fee",
      quantity: 1,
      unit: "Document",
      unitPrice: 3500,
      totalPrice: 3500,
      internalCostReference: 2500,
    },
    {
      id: "ITEM-5",
      description: "Marine Freight Transit Cargo Insurance Policy",
      quantity: 1,
      unit: "Shipment",
      unitPrice: 3500,
      totalPrice: 3500,
      internalCostReference: 3000,
    },
  ]);

  // Sync when enquiry selection changes
  useEffect(() => {
    if (selectedEnquiry) {
      const cost = getEstimatedTotalCost(selectedEnquiry.id) || 108000;
      setInternalCost(cost);
      setIncoterm(selectedEnquiry.incoterm);
    }
  }, [selectedEnquiryId]);

  // Calculations Pipeline
  const lineItemsSubtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Margin calculation
  const marginAmount = marginType === "percentage" ? (internalCost * marginValue) / 100 : marginValue;
  const marginPercentage = internalCost > 0 ? (marginAmount / internalCost) * 100 : 0;
  const sellingPriceBeforeDiscount = internalCost + marginAmount;

  // Discount calculation
  const discountAmount = discountType === "percentage" ? (sellingPriceBeforeDiscount * discountValue) / 100 : discountValue;
  const taxableAmount = Math.max(0, sellingPriceBeforeDiscount - discountAmount);

  // Tax calculation
  const taxAmount = (taxableAmount * taxPercentage) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const handleAddLineItem = () => {
    const nextId = lineItems.length + 1;
    setLineItems([
      ...lineItems,
      {
        id: `ITEM-${nextId}`,
        description: "Additional Logistics Charge",
        quantity: 1,
        unit: "Shipment",
        unitPrice: 5000,
        totalPrice: 5000,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleUpdateLineItem = (id: string, key: keyof QuotationLineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [key]: value };
          if (key === "quantity" || key === "unitPrice") {
            updated.totalPrice = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSaveQuotation = (status: "Draft" | "Pending Approval" | "Sent") => {
    if (!selectedEnquiry) return;

    const newQuot = addQuotation({
      enquiryId: selectedEnquiry.id,
      enquiryNumber: selectedEnquiry.enquiryNumber,
      customerId: selectedEnquiry.customerId,
      customerName: selectedEnquiry.customerName,
      companyId: selectedEnquiry.companyId,
      contactName: selectedEnquiry.contactName,
      contactEmail: selectedEnquiry.contactEmail,
      contactPhone: selectedEnquiry.contactPhone,
      revisionNumber: 1,
      status,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil,
      currency: "INR",
      items: lineItems,
      internalCost,
      marginType,
      marginValue,
      marginAmount,
      marginPercentage,
      subtotal: lineItemsSubtotal,
      discountType,
      discountValue,
      discountAmount,
      taxableAmount,
      taxName,
      taxPercentage,
      taxAmount,
      grandTotal,
      paymentTerms,
      transitTime,
      incoterm,
      serviceType: selectedEnquiry.serviceType,
      origin: selectedEnquiry.origin,
      destination: selectedEnquiry.destination,
      transportMode: selectedEnquiry.transportMode,
      termsAndConditions,
      createdBy: "Dakhani Usman",
      sentAt: status === "Sent" ? new Date().toISOString().split("T")[0] : undefined,
    });

    toast.success(`Generated Commercial Quotation ${newQuot.quotationNumber}`);
    router.push(`/sales/quotations/${newQuot.id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Interactive Commercial Quotation Builder"
        subtitle="Load enquiry specs & Rate Management costs, apply commercial margins, and build customer-facing quotations."
        breadcrumbs={[
          { label: "Sales & CRM", href: "/sales/crm" },
          { label: "Quotations", href: "/sales/quotations" },
          { label: "Quotation Builder" },
        ]}
      />

      {/* Main Grid: Left Builder & Right Real-Time Financial Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Builder Controls & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: ENQUIRY & CUSTOMER SELECTION */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              1. Source Enquiry & Shipper Details
            </h3>

            <Select
              label="Select Customer Enquiry / RFQ"
              value={selectedEnquiryId}
              onChange={(e) => setSelectedEnquiryId(e.target.value)}
              options={enquiries.map((enq) => ({
                label: `${enq.enquiryNumber} - ${enq.customerName} (${enq.origin.split(" ")[0]} → ${enq.destination.split(" ")[0]})`,
                value: enq.id,
              }))}
            />

            {selectedEnquiry && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Shipper Customer</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedEnquiry.customerName}</span>
                  <span className="block text-slate-400 text-[11px]">{selectedEnquiry.contactName} ({selectedEnquiry.contactEmail})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Route & Equipment</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <span>{selectedEnquiry.origin.split(" ")[0]}</span>
                    <ArrowRight className="w-3 h-3 text-sky-500" />
                    <span>{selectedEnquiry.destination.split(" ")[0]}</span>
                  </span>
                  <span className="block text-slate-400 text-[11px]">{selectedEnquiry.transportMode} • {selectedEnquiry.containerType}</span>
                </div>
              </div>
            )}
          </Card>

          {/* STEP 2: MARGIN & INTERNAL COST CONFIGURATOR */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              2. Commercial Profit Margin Configurator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Estimated Internal Cost (Confidential)"
                type="number"
                value={internalCost}
                onChange={(e) => setInternalCost(Number(e.target.value))}
              />

              <Select
                label="Margin Type"
                value={marginType}
                onChange={(e) => setMarginType(e.target.value as any)}
                options={[
                  { label: "Fixed Currency Margin (₹)", value: "fixed" },
                  { label: "Percentage Margin (%)", value: "percentage" },
                ]}
              />

              <Input
                label={marginType === "fixed" ? "Margin Amount (₹)" : "Margin Percentage (%)"}
                type="number"
                value={marginValue}
                onChange={(e) => setMarginValue(Number(e.target.value))}
              />
            </div>
          </Card>

          {/* STEP 3: CUSTOMER LINE ITEMS EDITOR */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500">
                3. Customer-Facing Line Items
              </h3>
              <Button variant="outline" size="xs" icon={Plus} onClick={handleAddLineItem}>
                Add Line Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs items-center">
                  <div className="md:col-span-5">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Qty"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateLineItem(item.id, "quantity", Number(e.target.value))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Unit Price (₹)"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", Number(e.target.value))}
                    />
                  </div>

                  <div className="md:col-span-2 font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
                    <span className="text-[10px] text-slate-400 block font-normal">Line Total</span>
                    {formatCurrency(item.totalPrice)}
                  </div>

                  <div className="md:col-span-1 text-right">
                    <button
                      onClick={() => handleRemoveLineItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* STEP 4: TAX & COMMERCIAL TERMS */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500">
              4. Commercial Terms, Tax & Validity
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select
                label="Tax Type"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                options={[
                  { label: "GST (18%)", value: "GST" },
                  { label: "Zero Tax (0%)", value: "Exempt" },
                ]}
              />

              <Input
                label="Tax Rate (%)"
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(Number(e.target.value))}
              />

              <Select
                label="Payment Terms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                options={[
                  { label: "Net 15 Days", value: "Net 15 Days" },
                  { label: "Net 30 Days", value: "Net 30 Days" },
                  { label: "Net 45 Days", value: "Net 45 Days" },
                  { label: "Advance Payment", value: "Advance Payment" },
                ]}
              />

              <Input
                label="Valid Until Date"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Real-Time Financial Split Panel */}
        <div className="space-y-4">
          <Card className="p-5 space-y-5 sticky top-20">
            {/* CONFIDENTIAL INTERNAL PROFITABILITY PREVIEW */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Internal Profitability (Confidential)</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Internal Estimated Cost:</span>
                  <span className="font-mono text-slate-200">{formatCurrency(internalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Margin Amount:</span>
                  <span className="font-mono font-bold text-emerald-400">+{formatCurrency(marginAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1">
                  <span className="text-slate-400">Expected Profit Margin %:</span>
                  <span className="font-mono font-bold text-emerald-400">{marginPercentage.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* CUSTOMER SELLING PRICE SUMMARY */}
            <div className="p-4 rounded-lg bg-sky-950/30 border border-sky-500/30 space-y-3">
              <span className="text-[10px] text-sky-400 font-bold uppercase block">Customer Selling Price Summary</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Line Items Subtotal:</span>
                  <span className="font-mono text-slate-200">{formatCurrency(lineItemsSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxable Amount ({taxName}):</span>
                  <span className="font-mono text-slate-200">{formatCurrency(taxableAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{taxName} ({taxPercentage}%):</span>
                  <span className="font-mono text-slate-200">+{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-sky-500/30 pt-2">
                  <span className="font-bold text-slate-100 text-sm">Grand Total:</span>
                  <span className="font-mono font-bold text-sky-400 text-lg">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                icon={CheckCircle2}
                onClick={() => handleSaveQuotation("Draft")}
              >
                Save Quotation Draft
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                icon={Sparkles}
                onClick={() => handleSaveQuotation("Pending Approval")}
              >
                Submit for Approval
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function QuotationBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Commercial Quotation Builder...</div>}>
      <QuotationBuilderContent />
    </Suspense>
  );
}
