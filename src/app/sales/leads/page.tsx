"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Timeline } from "@/components/ui/timeline";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { TableColumn, LogisticsStatus } from "@/types/common";
import { Lead, LeadStatus, LeadSource } from "@/types/crm";
import { useCrmStore } from "@/store/use-crm-store";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  Edit,
  FileText,
  Clock,
  Send,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function LeadsPage() {
  const { leads, addLead, updateLead, updateLeadStatus, convertLeadToCustomer, activities, addActivity } = useCrmStore();

  // Selection & Modal States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0] || null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    source: "Website" as LeadSource,
    status: "New" as LeadStatus,
    owner: "Shahbaj Borkar",
    industry: "Consumer Electronics",
    location: "Mumbai, Maharashtra",
    estimatedValue: 2500000,
    expectedCloseDate: "2026-09-30",
    notes: "",
  });

  const [activityFormData, setActivityFormData] = useState({
    type: "Call" as const,
    title: "",
    description: "",
  });

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
    if (sourceFilter !== "ALL" && l.source !== sourceFilter) return false;
    return true;
  });

  const columns: TableColumn<Lead>[] = [
    {
      key: "leadNumber",
      header: "Lead ID / Company",
      accessor: (lead) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{lead.leadNumber}</div>
          <div className="text-xs text-slate-400">{lead.companyName}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "contactName",
      header: "Primary Contact",
      accessor: (lead) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">{lead.contactName}</div>
          <div className="text-[11px] text-slate-400">{lead.email}</div>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      accessor: (lead) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {lead.source}
        </span>
      ),
    },
    {
      key: "estimatedValue",
      header: "Est. Opportunity",
      accessor: (lead) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(lead.estimatedValue)}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (lead) => <StatusBadge status={lead.status} />,
      sortable: true,
    },
    {
      key: "owner",
      header: "Sales Rep",
      accessor: (lead) => <span className="text-xs text-slate-400 font-medium">{lead.owner}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (lead) => (
        <DropdownMenu
          trigger={
            <Button variant="ghost" size="xs" icon={MoreVertical}>
              Options
            </Button>
          }
          items={[
            {
              label: "View Lead Details",
              icon: FileText,
              onClick: () => setSelectedLead(lead),
            },
            {
              label: "Edit Lead Info",
              icon: Edit,
              onClick: () => {
                setSelectedLead(lead);
                setFormData({
                  companyName: lead.companyName,
                  contactName: lead.contactName,
                  email: lead.email,
                  phone: lead.phone,
                  source: lead.source,
                  status: lead.status,
                  owner: lead.owner,
                  industry: lead.industry,
                  location: lead.location,
                  estimatedValue: lead.estimatedValue,
                  expectedCloseDate: lead.expectedCloseDate,
                  notes: lead.notes || "",
                });
                setIsEditDrawerOpen(true);
              },
            },
            {
              label: "Convert to Customer",
              icon: UserCheck,
              disabled: lead.status === "Won" || lead.status === "Lost",
              onClick: () => {
                setSelectedLead(lead);
                setIsConvertModalOpen(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead = addLead(formData);
    toast.success(`Created Lead ${newLead.leadNumber} for ${newLead.companyName}`);
    setIsCreateDrawerOpen(false);
    setSelectedLead(newLead);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    updateLead(selectedLead.id, formData);
    toast.success(`Updated Lead ${selectedLead.leadNumber}`);
    setIsEditDrawerOpen(false);
  };

  const handleConvertLead = () => {
    if (!selectedLead) return;
    const newCus = convertLeadToCustomer(selectedLead.id);
    toast.success(`Converted ${selectedLead.companyName} to Active Customer (${newCus.customerNumber})`);
    setIsConvertModalOpen(false);
    setSelectedLead({ ...selectedLead, status: "Won", convertedCustomerId: newCus.id });
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    addActivity({
      type: activityFormData.type,
      title: activityFormData.title,
      description: activityFormData.description,
      relatedEntity: "Lead",
      relatedEntityId: selectedLead.id,
      relatedEntityName: selectedLead.companyName,
      assignedTo: selectedLead.owner,
      status: "Completed",
    });
    toast.success(`Logged ${activityFormData.type} activity for ${selectedLead.companyName}`);
    setIsAddActivityOpen(false);
    setActivityFormData({ type: "Call", title: "", description: "" });
  };

  // Lead Specific Activities
  const leadActivities = activities
    .filter((a) => a.relatedEntity === "Lead" && a.relatedEntityId === selectedLead?.id)
    .map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      timestamp: a.createdAt,
      completed: a.status === "Completed",
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Leads & Opportunity Pipeline"
        subtitle="Manage prospective commercial relationships, track opportunity stages, and convert leads into active customer accounts."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "Leads" }]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateDrawerOpen(true)}>
            Create Lead Opportunity
          </Button>
        }
      />

      {/* Main Grid: Left Table & Right Detail Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Table */}
        <div className="lg:col-span-2 space-y-3">
          <DataTable
            data={filteredLeads}
            columns={columns}
            searchPlaceholder="Search leads by company, contact, or ID..."
            searchKey={(l) => `${l.leadNumber} ${l.companyName} ${l.contactName} ${l.email}`}
            onRowClick={(lead) => setSelectedLead(lead)}
            actions={
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { label: "All Statuses", value: "ALL" },
                    { label: "New", value: "New" },
                    { label: "Contacted", value: "Contacted" },
                    { label: "Qualified", value: "Qualified" },
                    { label: "Proposal", value: "Proposal" },
                    { label: "Won", value: "Won" },
                    { label: "Lost", value: "Lost" },
                  ]}
                />
                <Select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  options={[
                    { label: "All Sources", value: "ALL" },
                    { label: "Website", value: "Website" },
                    { label: "Referral", value: "Referral" },
                    { label: "LinkedIn", value: "LinkedIn" },
                    { label: "Trade Show", value: "Trade Show" },
                  ]}
                />
              </div>
            }
          />
        </div>

        {/* Right 1 Column: Lead Detail Card */}
        <div className="space-y-4">
          {selectedLead ? (
            <Card className="p-5 space-y-5 sticky top-20">
              {/* Header Identity */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-sky-500">{selectedLead.leadNumber}</span>
                    <StatusBadge status={selectedLead.status} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedLead.companyName}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedLead.industry} • {selectedLead.location}</p>
                </div>
              </div>

              {/* Status Action Toolbar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase w-full">Quick Change Status:</span>
                {(["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"] as LeadStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateLeadStatus(selectedLead.id, st)}
                    className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                      selectedLead.status === st
                        ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-500"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Opportunity Financial & Contact Metrics */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Est. Contract Value</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {formatCurrency(selectedLead.estimatedValue)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Expected Close</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {selectedLead.expectedCloseDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Lead Source</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedLead.source}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Assigned Owner</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedLead.owner}</span>
                </div>
              </div>

              {/* Primary Contact Box */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>{selectedLead.contactName}</span>
                  <span className="text-[10px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-semibold">Primary</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedLead.email}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedLead.phone}</span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  icon={UserCheck}
                  disabled={selectedLead.status === "Won" || selectedLead.status === "Lost"}
                  onClick={() => setIsConvertModalOpen(true)}
                >
                  {selectedLead.status === "Won" ? "Converted Customer" : "Convert to Customer"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsAddActivityOpen(true)}
                >
                  Log Activity
                </Button>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Lead Activity History ({leadActivities.length})
                </h4>
                {leadActivities.length > 0 ? (
                  <Timeline events={leadActivities} />
                ) : (
                  <p className="text-xs text-slate-400 italic">No activity logs recorded yet.</p>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Select a lead from the table to view details and convert to customer.
            </Card>
          )}
        </div>
      </div>

      {/* CREATE LEAD DRAWER */}
      <Drawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        title="Create New Lead Opportunity"
        subtitle="Register a prospective commercial inquiry into Logistics OS CRM."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Company Name"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="e.g. SunRise Solar Energy Corp"
          />

          <Input
            label="Primary Contact Person"
            required
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            placeholder="e.g. Meera Patel"
          />

          <Input
            label="Contact Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="meera@sunrisesolar.com"
          />

          <Input
            label="Contact Phone Number"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98200 11223"
          />

          <Select
            label="Lead Source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
            options={[
              { label: "Website Inbound", value: "Website" },
              { label: "Referral / Existing Customer", value: "Referral" },
              { label: "Email Direct Inquiry", value: "Email" },
              { label: "LinkedIn Outreach", value: "LinkedIn" },
              { label: "Trade Show / Exhibition", value: "Trade Show" },
            ]}
          />

          <Select
            label="Industry Category"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            options={[
              { label: "Consumer Electronics", value: "Consumer Electronics" },
              { label: "Pharmaceuticals & Healthcare", value: "Pharmaceuticals" },
              { label: "Renewable Energy & Solar", value: "Renewable Energy" },
              { label: "Automotive & Heavy Parts", value: "Automotive Parts" },
              { label: "Industrial Machinery", value: "Industrial Machinery" },
              { label: "Cold Chain & Food", value: "Cold Chain & Food" },
            ]}
          />

          <Input
            label="Estimated Contract Value (₹)"
            type="number"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
          />

          <Input
            label="Expected Close Date"
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
          />

          <Input
            label="Opportunity Notes / Requirements"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Specify container types, routes, or trade lane details..."
          />

          <Button variant="primary" type="submit" className="w-full mt-4">
            Create Lead Opportunity
          </Button>
        </form>
      </Drawer>

      {/* EDIT LEAD DRAWER */}
      <Drawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title={`Edit Lead: ${selectedLead?.leadNumber}`}
        subtitle="Update lead opportunity information and commercial details."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Company Name"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <Input
            label="Primary Contact Person"
            required
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          />

          <Input
            label="Contact Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Contact Phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Estimated Value (₹)"
            type="number"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
          />

          <Button variant="primary" type="submit" className="w-full mt-4">
            Save Lead Changes
          </Button>
        </form>
      </Drawer>

      {/* CONVERT LEAD TO CUSTOMER MODAL */}
      <Dialog
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        title="Convert Lead to Active Customer"
        description="Transition this commercial opportunity into an active shipper account in Logistics OS."
      >
        {selectedLead && (
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
              Converting <strong>{selectedLead.companyName}</strong> will mark Lead {selectedLead.leadNumber} as <strong>Won</strong> and generate a new Customer ID for future Enquiries, Quotations, and Jobs.
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p><strong>Company:</strong> {selectedLead.companyName}</p>
              <p><strong>Primary Contact:</strong> {selectedLead.contactName} ({selectedLead.email})</p>
              <p><strong>Account Manager:</strong> {selectedLead.owner}</p>
              <p><strong>Default Credit Limit:</strong> ₹5,000,000 (Net 30 Days)</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsConvertModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" icon={CheckCircle2} onClick={handleConvertLead}>
                Confirm Conversion
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ADD ACTIVITY MODAL */}
      <Dialog
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        title={`Log Activity for ${selectedLead?.companyName}`}
        description="Record a meeting, call, or email interaction in the lead timeline."
      >
        <form onSubmit={handleAddActivity} className="space-y-4 py-2">
          <Select
            label="Activity Type"
            value={activityFormData.type}
            onChange={(e) => setActivityFormData({ ...activityFormData, type: e.target.value as any })}
            options={[
              { label: "Call", value: "Call" },
              { label: "Meeting", value: "Meeting" },
              { label: "Email", value: "Email" },
              { label: "Follow-up", value: "Follow-up" },
              { label: "Note", value: "Note" },
            ]}
          />

          <Input
            label="Activity Title"
            required
            placeholder="e.g. Discussed ocean freight container specs"
            value={activityFormData.title}
            onChange={(e) => setActivityFormData({ ...activityFormData, title: e.target.value })}
          />

          <Input
            label="Activity Description / Notes"
            required
            placeholder="Enter key discussion points or next steps..."
            value={activityFormData.description}
            onChange={(e) => setActivityFormData({ ...activityFormData, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddActivityOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Activity
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
