"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TableColumn } from "@/types/common";
import { Company } from "@/types/crm";
import { useCrmStore } from "@/store/use-crm-store";
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Lock,
  UserCheck,
  Ship,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

export default function CompaniesPage() {
  const { companies, contacts, addCompany, updateCompany } = useCrmStore();

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(companies[0] || null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("overview");

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "Consumer Electronics",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    taxId: "27AAACB1234K1Z0",
    status: "Active Prospect" as const,
    owner: "Dakhani Usman",
  });

  const columns: TableColumn<Company>[] = [
    {
      key: "companyName",
      header: "Company Name / Tax ID",
      accessor: (comp) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{comp.companyName}</div>
          <div className="text-xs text-slate-400 font-mono">{comp.taxId || "N/A"}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "industry",
      header: "Industry",
      accessor: (comp) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{comp.industry}</span>
      ),
      sortable: true,
    },
    {
      key: "location",
      header: "Location",
      accessor: (comp) => <span className="text-xs text-slate-400">{comp.city}, {comp.country}</span>,
    },
    {
      key: "primaryContact",
      header: "Primary Contact",
      accessor: (comp) => (
        <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
          {comp.primaryContactName || "Unassigned"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: (comp) => (
        <Badge variant={comp.status === "Customer" ? "success" : "info"}>
          {comp.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "owner",
      header: "Account Owner",
      accessor: (comp) => <span className="text-xs text-slate-400">{comp.owner}</span>,
    },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newComp = addCompany(formData);
    toast.success(`Registered company ${newComp.companyName}`);
    setIsCreateOpen(false);
    setSelectedCompany(newComp);
  };

  const companyContacts = contacts.filter((c) => c.companyId === selectedCompany?.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Organizations & Companies"
        subtitle="Manage commercial organizations, shippers, suppliers, and enterprise trade accounts."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "Companies" }]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Register Company
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Companies Table */}
        <div className="lg:col-span-2 space-y-3">
          <DataTable
            data={companies}
            columns={columns}
            searchPlaceholder="Search companies by name, industry, or location..."
            searchKey={(c) => `${c.companyName} ${c.industry} ${c.city} ${c.country}`}
            onRowClick={(comp) => setSelectedCompany(comp)}
          />
        </div>

        {/* Right 1 Column: Company Detail */}
        <div className="space-y-4">
          {selectedCompany ? (
            <Card className="p-5 space-y-5 sticky top-20">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{selectedCompany.id}</span>
                    <Badge variant={selectedCompany.status === "Customer" ? "success" : "info"}>
                      {selectedCompany.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedCompany.companyName}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedCompany.industry}</p>
                </div>
              </div>

              {/* Detail Navigation Tabs */}
              <Tabs
                tabs={[
                  { id: "overview", label: "Overview" },
                  { id: "contacts", label: "Contacts", count: companyContacts.length },
                  { id: "relationships", label: "Future Modules" },
                ]}
                activeTab={activeDetailTab}
                onChange={setActiveDetailTab}
              />

              {activeDetailTab === "overview" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedCompany.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedCompany.phone}</span>
                    </div>
                    {selectedCompany.website && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">
                          {selectedCompany.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{selectedCompany.address}, {selectedCompany.city}, {selectedCompany.country}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">GST / Tax Identification</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{selectedCompany.taxId || "Not Registered"}</span>
                  </div>

                  <div className="pt-2 text-slate-400 text-[11px]">
                    Account Owner: <strong className="text-slate-700 dark:text-slate-200">{selectedCompany.owner}</strong>
                  </div>
                </div>
              )}

              {activeDetailTab === "contacts" && (
                <div className="space-y-3 text-xs">
                  {companyContacts.length > 0 ? (
                    companyContacts.map((cont) => (
                      <div key={cont.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{cont.firstName} {cont.lastName}</span>
                          {cont.isPrimary && (
                            <span className="text-[9px] bg-sky-500/10 text-sky-400 font-bold px-1.5 py-0.5 rounded">Primary</span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px]">{cont.designation}</p>
                        <p className="text-slate-500 dark:text-slate-400">{cont.email} • {cont.phone}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No contacts registered for this company yet.</p>
                  )}
                </div>
              )}

              {activeDetailTab === "relationships" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-start gap-2">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Future Business Modules Lock</p>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        Enquiries, Quotations, Operational Jobs, Shipments, and Financial Invoices will link automatically when Phase 3+ modules are implemented.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 opacity-60">
                    <div className="p-2.5 rounded border border-slate-800 bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Enquiries</span>
                      <span className="text-slate-300 font-semibold">0 Linked</span>
                    </div>
                    <div className="p-2.5 rounded border border-slate-800 bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Quotations</span>
                      <span className="text-slate-300 font-semibold">0 Linked</span>
                    </div>
                    <div className="p-2.5 rounded border border-slate-800 bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Active Jobs</span>
                      <span className="text-slate-300 font-semibold">0 Linked</span>
                    </div>
                    <div className="p-2.5 rounded border border-slate-800 bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Invoices</span>
                      <span className="text-slate-300 font-semibold">0 Linked</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Select a company from the list to view specifications.
            </Card>
          )}
        </div>
      </div>

      {/* CREATE COMPANY DRAWER */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Company"
        subtitle="Add a commercial shipper or corporate prospect to the CRM."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Company Name"
            required
            placeholder="e.g. ABC Electronics Pvt Ltd"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <Select
            label="Industry Sector"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            options={[
              { label: "Consumer Electronics", value: "Consumer Electronics" },
              { label: "Pharmaceuticals", value: "Pharmaceuticals" },
              { label: "Industrial Machinery", value: "Industrial Machinery" },
              { label: "Automotive Parts", value: "Automotive Parts" },
              { label: "Renewable Energy", value: "Renewable Energy" },
              { label: "Specialty Chemicals", value: "Specialty Chemicals" },
            ]}
          />

          <Input
            label="Corporate Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Phone Number"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Street Address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Country"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <Input
            label="GST / Tax Identification Number"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
          />

          <Button variant="primary" type="submit" className="w-full mt-4">
            Register Company
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
