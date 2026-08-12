"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/ui/timeline";
import { TableColumn } from "@/types/common";
import { Customer } from "@/types/crm";
import { useCrmStore } from "@/store/use-crm-store";
import { useEnquiryStore } from "@/store/use-enquiry-store";
import { useQuotationStore } from "@/store/use-quotation-store";
import { useJobStore } from "@/store/use-job-store";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  Building2,
  Plus,
  Mail,
  Phone,
  Lock,
  UserCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export default function CustomersPage() {
  const { customers, contacts, activities, addCustomer } = useCrmStore();
  const { enquiries } = useEnquiryStore();
  const { quotations } = useQuotationStore();
  const { jobs } = useJobStore();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "Consumer Electronics",
    status: "Active" as const,
    category: "Standard" as const,
    accountOwner: "Shahbaj Borkar",
    primaryContactName: "Rahul Sharma",
    primaryContactEmail: "rahul@company.com",
    primaryContactPhone: "+91 98200 11223",
    country: "India",
    city: "Mumbai",
    creditLimit: 5000000,
    paymentTerms: "Net 30 Days",
    companyId: "COMP-001",
  });

  const columns: TableColumn<Customer>[] = [
    {
      key: "customerNumber",
      header: "Customer ID / Shipper",
      accessor: (cus) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{cus.customerNumber}</div>
          <div className="text-xs text-slate-400">{cus.companyName}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "category",
      header: "Account Category",
      accessor: (cus) => (
        <Badge
          variant={
            cus.category === "VIP Enterprise"
              ? "success"
              : cus.category === "Key Account"
              ? "info"
              : "default"
          }
        >
          {cus.category}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "primaryContactName",
      header: "Primary Contact",
      accessor: (cus) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">{cus.primaryContactName}</div>
          <div className="text-[11px] text-slate-400">{cus.primaryContactEmail}</div>
        </div>
      ),
    },
    {
      key: "creditLimit",
      header: "Credit Limit",
      accessor: (cus) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(cus.creditLimit)}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (cus) => <StatusBadge status={cus.status} />,
      sortable: true,
    },
    {
      key: "accountOwner",
      header: "Account Manager",
      accessor: (cus) => <span className="text-xs text-slate-400 font-medium">{cus.accountOwner}</span>,
    },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCus = addCustomer(formData);
    toast.success(`Created customer account ${newCus.customerNumber}`);
    setIsCreateOpen(false);
    setSelectedCustomer(newCus);
  };

  const customerContacts = contacts.filter((c) => c.companyId === selectedCustomer?.companyId);
  const customerActivities = activities
    .filter((a) => a.relatedEntity === "Customer" && a.relatedEntityId === selectedCustomer?.id)
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
        title="Active Shippers & Customers"
        subtitle="Manage active customer accounts, commercial terms, credit limits, and account history."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "Customers" }]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Add Customer Account
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Table */}
        <div className="lg:col-span-2 space-y-3">
          <DataTable
            data={customers}
            columns={columns}
            searchPlaceholder="Search customers by ID, company name, or contact..."
            searchKey={(c) => `${c.customerNumber} ${c.companyName} ${c.primaryContactName} ${c.city}`}
            onRowClick={(cus) => setSelectedCustomer(cus)}
          />
        </div>

        {/* Right 1 Column: Customer Detail */}
        <div className="space-y-4">
          {selectedCustomer ? (
            <Card className="p-5 space-y-5 sticky top-20">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-sky-500 font-bold">{selectedCustomer.customerNumber}</span>
                    <StatusBadge status={selectedCustomer.status} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedCustomer.companyName}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.industry} • {selectedCustomer.city}, {selectedCustomer.country}</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <Tabs
                tabs={[
                  { id: "overview", label: "Account Overview" },
                  { id: "contacts", label: "Contacts", count: customerContacts.length },
                  { id: "timeline", label: "Timeline", count: customerActivities.length },
                  { id: "modules", label: "Linked Modules" },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />

              {activeTab === "overview" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Approved Credit Limit</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {formatCurrency(selectedCustomer.creditLimit)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Payment Terms</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.paymentTerms}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Account Category</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Account Manager</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.accountOwner}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Primary Contact</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{selectedCustomer.primaryContactName}</p>
                    <p className="text-slate-400 text-[11px]">{selectedCustomer.primaryContactEmail} • {selectedCustomer.primaryContactPhone}</p>
                  </div>
                </div>
              )}

              {activeTab === "contacts" && (
                <div className="space-y-2 text-xs">
                  {customerContacts.length > 0 ? (
                    customerContacts.map((cont) => (
                      <div key={cont.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{cont.firstName} {cont.lastName}</span>
                        <span className="text-slate-400 text-[11px]">{cont.designation}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No additional contacts linked.</p>
                  )}
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="space-y-3">
                  {customerActivities.length > 0 ? (
                    <Timeline events={customerActivities} />
                  ) : (
                    <p className="text-xs text-slate-400 italic">No timeline events logged yet.</p>
                  )}
                </div>
              )}

              {activeTab === "modules" && (
                <div className="space-y-3 text-xs">
                  {(() => {
                    const linkedEnquiries = enquiries.filter(
                      (e) => e.customerId === selectedCustomer.id || e.customerName === selectedCustomer.companyName
                    );

                    return (
                      <>
                        <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                          <p className="font-bold text-xs">Linked Customer Enquiries ({linkedEnquiries.length})</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Customer ID {selectedCustomer.id} is connected to Enquiry & RFQ Management.
                          </p>
                        </div>

                        {linkedEnquiries.length > 0 ? (
                          <div className="space-y-2">
                            {linkedEnquiries.slice(0, 4).map((enq) => (
                              <Link
                                key={enq.id}
                                href={`/sales/enquiries/${enq.id}`}
                                className="block p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sky-500">{enq.enquiryNumber}</span>
                                  <StatusBadge status={enq.status} />
                                </div>
                                <div className="text-slate-700 dark:text-slate-300 font-medium text-[11px] mt-1">
                                  {enq.origin} → {enq.destination} ({enq.transportMode})
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded border border-slate-800 text-slate-400 italic text-center">
                            No active enquiries linked to this shipper yet.
                          </div>
                        )}

                        {/* Linked Quotations Section */}
                        {(() => {
                          const linkedQuots = quotations.filter(
                            (q) => q.customerId === selectedCustomer.id || q.customerName === selectedCustomer.companyName
                          );

                          return (
                            <div className="pt-2 border-t border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-emerald-400">Linked Commercial Quotations ({linkedQuots.length})</span>
                              </div>

                              {linkedQuots.length > 0 ? (
                                <div className="space-y-1.5">
                                  {linkedQuots.slice(0, 3).map((q) => (
                                    <Link
                                      key={q.id}
                                      href={`/sales/quotations/${q.id}`}
                                      className="block p-2 rounded border border-slate-800 hover:border-emerald-500 transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-emerald-400">{q.quotationNumber} (Rev {q.revisionNumber})</span>
                                        <StatusBadge status={q.status} />
                                      </div>
                                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                                        <span>{q.origin.split(" ")[0]} → {q.destination.split(" ")[0]}</span>
                                        <span className="font-mono font-bold text-slate-200">{formatCurrency(q.grandTotal)}</span>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No quotations issued for this shipper yet.</p>
                              )}
                            </div>
                          );
                        })()}

                        {/* Linked Operational Jobs Section */}
                        {(() => {
                          const linkedJobs = jobs.filter(
                            (j) => j.customerId === selectedCustomer.id || j.customerName === selectedCustomer.companyName
                          );

                          return (
                            <div className="pt-2 border-t border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-sky-400">Linked Operational Jobs ({linkedJobs.length})</span>
                              </div>

                              {linkedJobs.length > 0 ? (
                                <div className="space-y-1.5">
                                  {linkedJobs.slice(0, 3).map((j) => (
                                    <Link
                                      key={j.id}
                                      href={`/operations/jobs/${j.id}`}
                                      className="block p-2 rounded border border-slate-800 hover:border-sky-500 transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-sky-400 font-mono">{j.jobNumber || j.jobNo}</span>
                                        <StatusBadge status={j.status} />
                                      </div>
                                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                                        <span>{(j.origin || "Mumbai").split(" ")[0]} → {(j.destination || "Dubai").split(" ")[0]}</span>
                                        <span className="font-mono font-bold text-slate-200">{formatCurrency(j.estimatedRevenue || 0)}</span>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No operational jobs created for this shipper yet.</p>
                              )}
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Select a customer to view shipper profile.
            </Card>
          )}
        </div>
      </div>

      {/* CREATE CUSTOMER DRAWER */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Customer Account"
        subtitle="Establish a new active commercial account in Logistics OS."
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
            label="Account Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            options={[
              { label: "VIP Enterprise (Top Tier Shippers)", value: "VIP Enterprise" },
              { label: "Key Account", value: "Key Account" },
              { label: "Standard Account", value: "Standard" },
            ]}
          />

          <Input
            label="Primary Contact Person"
            required
            value={formData.primaryContactName}
            onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
          />

          <Input
            label="Contact Email"
            type="email"
            required
            value={formData.primaryContactEmail}
            onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
          />

          <Input
            label="Contact Phone"
            required
            value={formData.primaryContactPhone}
            onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
          />

          <Input
            label="Approved Credit Limit (₹)"
            type="number"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
          />

          <Select
            label="Payment Terms"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            options={[
              { label: "Net 15 Days", value: "Net 15 Days" },
              { label: "Net 30 Days", value: "Net 30 Days" },
              { label: "Net 45 Days", value: "Net 45 Days" },
              { label: "Net 60 Days", value: "Net 60 Days" },
            ]}
          />

          <Button variant="primary" type="submit" className="w-full mt-4">
            Save Customer Account
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
