"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TableColumn } from "@/types/common";
import { Enquiry, EnquiryStatus, EnquiryPriority, EnquirySource, CargoType, ServiceType } from "@/types/enquiry";
import { TransportMode } from "@/types/common";
import { useEnquiryStore } from "@/store/use-enquiry-store";
import { useCrmStore } from "@/store/use-crm-store";
import {
  FileText,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Ship,
  Plane,
  Truck,
  Train,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import Link from "next/link";
import { toast } from "sonner";

export default function EnquiriesDashboardAndListPage() {
  const { enquiries, addEnquiry, updateEnquiryStatus } = useEnquiryStore();
  const { customers, contacts } = useCrmStore();

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modeFilter, setModeFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Multi-section form state
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || "CUS-2026-001",
    customerName: customers[0]?.companyName || "ABC Electronics Pvt Ltd",
    companyId: customers[0]?.companyId || "COMP-001",
    contactName: customers[0]?.primaryContactName || "Rahul Sharma",
    contactEmail: customers[0]?.primaryContactEmail || "rahul@abcelectronics.com",
    contactPhone: customers[0]?.primaryContactPhone || "+91 98200 11223",
    source: "Email" as EnquirySource,
    status: "New" as EnquiryStatus,
    priority: "High" as EnquiryPriority,
    assignedTo: "Dakhani Usman",
    origin: "Mumbai Port (JNPT)",
    originCountry: "India",
    destination: "Jebel Ali Port",
    destinationCountry: "UAE",
    transportMode: "Ocean Freight" as TransportMode,
    serviceType: "Port-to-Port" as ServiceType,
    cargoType: "Consumer Electronics" as CargoType,
    cargoDescription: "Commercial Cargo Shipment of LED Smart Displays & Circuits",
    quantity: 450,
    quantityUnit: "Cartons",
    weightKg: 14500,
    volumeCbm: 52,
    containerType: "40ft High Cube",
    containerQuantity: 1,
    pickupDate: "2026-08-22",
    requiredDeliveryDate: "2026-09-02",
    incoterm: "FOB",
    specialRequirements: "Clean customs clearance & temperature moisture protection.",
    notes: "",
  });

  // Calculate Enquiry KPIs
  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter((e) => e.status === "New").length;
  const underReview = enquiries.filter((e) => e.status === "Under Review").length;
  const ratePending = enquiries.filter((e) => e.status === "Rate Pending").length;
  const readyQuotation = enquiries.filter((e) => e.status === "Ready for Quotation").length;
  const wonEnquiries = enquiries.filter((e) => e.status === "Won").length;
  const urgentCount = enquiries.filter((e) => e.priority === "Urgent").length;

  // Filtered List
  const filteredEnquiries = enquiries.filter((e) => {
    if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
    if (modeFilter !== "ALL" && e.transportMode !== modeFilter) return false;
    if (priorityFilter !== "ALL" && e.priority !== priorityFilter) return false;
    return true;
  });

  // Chart 1: Status Distribution Data
  const statusChartData = [
    { name: "New", count: newEnquiries, color: "#3b82f6" },
    { name: "Under Review", count: underReview, color: "#0284c7" },
    { name: "Rate Pending", count: ratePending, color: "#f59e0b" },
    { name: "Ready Quote", count: readyQuotation, color: "#10b981" },
    { name: "Won", count: wonEnquiries, color: "#059669" },
  ];

  // Chart 2: Transport Mode Breakdown
  const modeChartData = [
    { name: "Ocean", count: enquiries.filter((e) => e.transportMode === "Ocean Freight").length },
    { name: "Air", count: enquiries.filter((e) => e.transportMode === "Air Freight").length },
    { name: "Road", count: enquiries.filter((e) => e.transportMode === "Road Freight").length },
    { name: "Rail", count: enquiries.filter((e) => e.transportMode === "Rail Freight").length },
  ];

  const columns: TableColumn<Enquiry>[] = [
    {
      key: "enquiryNumber",
      header: "Enquiry ID / Customer",
      accessor: (enq) => (
        <div>
          <div className="font-bold text-sky-600 dark:text-sky-400 font-mono text-xs">{enq.enquiryNumber}</div>
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{enq.customerName}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "route",
      header: "Shipment Route",
      accessor: (enq) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <span>{enq.origin.split(" ")[0]}</span>
          <ArrowRight className="w-3 h-3 text-sky-500 shrink-0" />
          <span>{enq.destination.split(" ")[0]}</span>
        </div>
      ),
    },
    {
      key: "transportMode",
      header: "Mode & Service",
      accessor: (enq) => (
        <div className="flex items-center gap-1.5 text-xs">
          {enq.transportMode === "Ocean Freight" && <Ship className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
          {enq.transportMode === "Air Freight" && <Plane className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
          {enq.transportMode === "Road Freight" && <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
          {enq.transportMode === "Rail Freight" && <Train className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          <span className="font-medium text-slate-700 dark:text-slate-300">{enq.transportMode}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "priority",
      header: "Priority",
      accessor: (enq) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${enq.priority === "Urgent"
              ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400"
              : enq.priority === "High"
                ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400"
                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
        >
          {enq.priority}
        </span>
      ),
      sortable: true,
    },
    {
      key: "requiredDeliveryDate",
      header: "Required Date",
      accessor: (enq) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {enq.requiredDeliveryDate}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (enq) => <StatusBadge status={enq.status} />,
      sortable: true,
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      accessor: (enq) => <span className="text-xs text-slate-400 font-medium">{enq.assignedTo}</span>,
    },
    {
      key: "action",
      header: "Action",
      accessor: (enq) => (
        <Link href={`/sales/enquiries/${enq.id}`}>
          <Button variant="ghost" size="xs" icon={ExternalLink}>
            Inspect
          </Button>
        </Link>
      ),
    },
  ];

  const handleCustomerSelect = (cusId: string) => {
    const targetCus = customers.find((c) => c.id === cusId);
    if (!targetCus) return;

    setFormData({
      ...formData,
      customerId: targetCus.id,
      customerName: targetCus.companyName,
      companyId: targetCus.companyId || "COMP-001",
      contactName: targetCus.primaryContactName,
      contactEmail: targetCus.primaryContactEmail,
      contactPhone: targetCus.primaryContactPhone,
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEnq = addEnquiry(formData);
    toast.success(`Created Enquiry ${newEnq.enquiryNumber} for ${newEnq.customerName}`);
    setIsCreateDrawerOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="Enquiry & RFQ Management Command Center"
        subtitle="Capture shipper logistics requirements, evaluate transport routes & cargo specifications, and prepare inquiries for rate calculation."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "Enquiries & RFQs" }]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateDrawerOpen(true)}>
            Create New Enquiry / RFQ
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatsCard
          title="Total RFQs"
          value={totalEnquiries}
          change={14.0}
          changePeriod="active inquiries"
          icon={FileText}
          iconBgColor="bg-sky-500/10 text-sky-500"
          subtitle="All trade lanes"
        />
        <StatsCard
          title="New Inquiries"
          value={newEnquiries}
          change={20.0}
          changePeriod="awaiting review"
          icon={Sparkles}
          iconBgColor="bg-blue-500/10 text-blue-500"
          subtitle="Unassigned / New"
        />
        <StatsCard
          title="Under Review"
          value={underReview}
          change={0}
          changePeriod="ops evaluating"
          icon={Clock}
          iconBgColor="bg-teal-500/10 text-teal-500"
          subtitle="Specs verification"
        />
        <StatsCard
          title="Rate Pending"
          value={ratePending}
          change={12.0}
          changePeriod="pricing team"
          icon={SlidersHorizontal}
          iconBgColor="bg-amber-500/10 text-amber-500"
          subtitle="Rate calc queue"
        />
        <StatsCard
          title="Ready for Quote"
          value={readyQuotation}
          change={15.0}
          changePeriod="approved rates"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10 text-emerald-500"
          subtitle="Quote generation"
        />
        <StatsCard
          title="Won Contracts"
          value={wonEnquiries}
          change={8.5}
          changePeriod="converted"
          icon={TrendingUp}
          iconBgColor="bg-green-500/10 text-green-500"
          subtitle="Booked shippers"
        />
        <StatsCard
          title="Urgent Priority"
          value={urgentCount}
          change={-2.0}
          changePeriod="high priority"
          icon={AlertCircle}
          iconBgColor="bg-rose-500/10 text-rose-500"
          subtitle="Expedited SLAs"
        />
      </div>

      {/* Recharts Operational Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown Bar Chart */}
        <Card className="p-5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-500" />
              Enquiry Lifecycle Pipeline Breakdown
            </CardTitle>
            <CardDescription>
              Volume distribution of customer RFQs across operational lifecycle stages.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} RFQs`, "Count"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transport Mode Breakdown Bar Chart */}
        <Card className="p-5 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Ship className="w-4 h-4 text-blue-500" />
              Transport Mode Distribution
            </CardTitle>
            <CardDescription>
              Enquiries split across Ocean, Air, Road, and Rail freight modes.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeChartData} layout="vertical" margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={60} />
                <Tooltip
                  formatter={(val: any) => [`${val} Enquiries`, "Count"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Enterprise Enquiry DataTable */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            All Logistics Enquiries ({filteredEnquiries.length})
          </h3>
        </div>

        <DataTable
          data={filteredEnquiries}
          columns={columns}
          searchPlaceholder="Search enquiries by ID, customer, origin, or destination..."
          searchKey={(e) => `${e.enquiryNumber} ${e.customerName} ${e.origin} ${e.destination} ${e.cargoType}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "All Statuses", value: "ALL" },
                  { label: "New", value: "New" },
                  { label: "Under Review", value: "Under Review" },
                  { label: "Rate Pending", value: "Rate Pending" },
                  { label: "Ready for Quotation", value: "Ready for Quotation" },
                  { label: "Won", value: "Won" },
                ]}
              />

              <Select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                options={[
                  { label: "All Modes", value: "ALL" },
                  { label: "Ocean Freight", value: "Ocean Freight" },
                  { label: "Air Freight", value: "Air Freight" },
                  { label: "Road Freight", value: "Road Freight" },
                  { label: "Rail Freight", value: "Rail Freight" },
                ]}
              />

              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={[
                  { label: "All Priorities", value: "ALL" },
                  { label: "Urgent", value: "Urgent" },
                  { label: "High", value: "High" },
                  { label: "Medium", value: "Medium" },
                  { label: "Low", value: "Low" },
                ]}
              />
            </div>
          }
        />
      </div>

      {/* CREATE ENQUIRY MULTI-SECTION DRAWER */}
      <Drawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        title="Create New Logistics Enquiry / RFQ"
        subtitle="Capture shipper logistics requirements across Route, Cargo, Transport Mode, and Schedule."
        width="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          {/* SECTION 1: CUSTOMER & CONTACT */}
          <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-500">1. Customer & Commercial Contact</h4>
            <Select
              label="Select Shipper Customer (CRM)"
              value={formData.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              options={customers.map((c) => ({ label: `${c.companyName} (${c.customerNumber})`, value: c.id }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Person"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
              <Input
                label="Contact Email"
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>

          {/* SECTION 2: SHIPMENT ROUTE */}
          <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-500">2. Shipment Route</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Origin Location / Port"
                required
                placeholder="e.g. Mumbai Port (JNPT)"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
              <Input
                label="Origin Country"
                required
                value={formData.originCountry}
                onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Destination Location / Port"
                required
                placeholder="e.g. Jebel Ali Port"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
              <Input
                label="Destination Country"
                required
                value={formData.destinationCountry}
                onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
              />
            </div>
          </div>

          {/* SECTION 3: CARGO & TRANSPORTATION */}
          <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-500">3. Cargo & Transport Specifications</h4>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Transport Mode"
                value={formData.transportMode}
                onChange={(e) => setFormData({ ...formData, transportMode: e.target.value as TransportMode })}
                options={[
                  { label: "Ocean Freight (FCL / LCL)", value: "Ocean Freight" },
                  { label: "Air Freight Express", value: "Air Freight" },
                  { label: "Road Freight Trucking", value: "Road Freight" },
                  { label: "Rail Freight Network", value: "Rail Freight" },
                  { label: "Multimodal Transport", value: "Multimodal" },
                ]}
              />

              <Select
                label="Service Scope"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                options={[
                  { label: "Port-to-Port", value: "Port-to-Port" },
                  { label: "Door-to-Door", value: "Door-to-Door" },
                  { label: "Door-to-Port", value: "Door-to-Port" },
                  { label: "Port-to-Door", value: "Port-to-Door" },
                  { label: "Customs Clearance Only", value: "Customs Clearance" },
                ]}
              />
            </div>

            <Select
              label="Cargo Classification"
              value={formData.cargoType}
              onChange={(e) => setFormData({ ...formData, cargoType: e.target.value as CargoType })}
              options={[
                { label: "Consumer Electronics", value: "Consumer Electronics" },
                { label: "Pharmaceuticals & Cold Chain", value: "Pharmaceuticals" },
                { label: "Hazardous / Specialty Chemicals", value: "Hazardous / Chemicals" },
                { label: "Perishable / Food Cargo", value: "Perishable / Cold Chain" },
                { label: "Machinery & Heavy Equipment", value: "Machinery & Equipment" },
                { label: "Auto Components", value: "Auto Parts" },
              ]}
            />

            <Input
              label="Cargo Description"
              required
              value={formData.cargoDescription}
              onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Total Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
              <Input
                label="Gross Weight (KG)"
                type="number"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
              />
              <Input
                label="Volume (CBM)"
                type="number"
                value={formData.volumeCbm}
                onChange={(e) => setFormData({ ...formData, volumeCbm: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Container Equipment Type"
                value={formData.containerType}
                onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                options={[
                  { label: "40ft High Cube Container", value: "40ft High Cube" },
                  { label: "20ft Standard Dry Container", value: "20ft Standard" },
                  { label: "40ft Refrigerated (Reefer)", value: "40ft Refrigerated" },
                  { label: "LCL Consolidated Cargo", value: "LCL Container" },
                ]}
              />

              <Input
                label="Container Quantity"
                type="number"
                value={formData.containerQuantity}
                onChange={(e) => setFormData({ ...formData, containerQuantity: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* SECTION 4: SCHEDULE & COMMERCIAL */}
          <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-500">4. Schedule & Commercial Terms</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Pickup Date"
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
              />
              <Input
                label="Required Delivery Date"
                type="date"
                required
                value={formData.requiredDeliveryDate}
                onChange={(e) => setFormData({ ...formData, requiredDeliveryDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Select
                label="Incoterm"
                value={formData.incoterm}
                onChange={(e) => setFormData({ ...formData, incoterm: e.target.value })}
                options={[
                  { label: "FOB (Free On Board)", value: "FOB" },
                  { label: "CIF (Cost Insurance Freight)", value: "CIF" },
                  { label: "DDP (Delivered Duty Paid)", value: "DDP" },
                  { label: "EXW (Ex Works)", value: "EXW" },
                  { label: "CFR (Cost & Freight)", value: "CFR" },
                ]}
              />

              <Select
                label="Priority Level"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as EnquiryPriority })}
                options={[
                  { label: "Urgent", value: "Urgent" },
                  { label: "High Priority", value: "High" },
                  { label: "Medium Priority", value: "Medium" },
                  { label: "Low Priority", value: "Low" },
                ]}
              />

              <Input
                label="Assigned User"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </div>
          </div>

          <Button variant="primary" type="submit" className="w-full">
            Submit Logistics Enquiry / RFQ
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
