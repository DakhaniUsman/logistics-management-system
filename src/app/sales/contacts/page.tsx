"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TableColumn } from "@/types/common";
import { Contact } from "@/types/crm";
import { useCrmStore } from "@/store/use-crm-store";
import {
  Users2,
  Plus,
  Mail,
  Phone,
  Building2,
  Briefcase,
  FileText,
  User,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactsPage() {
  const { contacts, companies, addContact } = useCrmStore();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] || null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "Logistics Manager",
    email: "",
    phone: "",
    companyId: companies[0]?.id || "COMP-001",
    department: "Logistics",
    isPrimary: false,
    notes: "",
  });

  const filteredContacts = contacts.filter((c) => {
    if (companyFilter !== "ALL" && c.companyId !== companyFilter) return false;
    return true;
  });

  const columns: TableColumn<Contact>[] = [
    {
      key: "name",
      header: "Contact Name",
      accessor: (cont) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>{cont.firstName} {cont.lastName}</span>
            {cont.isPrimary && (
              <span className="text-[9px] bg-sky-500/10 text-sky-400 font-bold px-1.5 py-0.2 rounded">Primary</span>
            )}
          </div>
          <div className="text-xs text-slate-400">{cont.designation}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "companyName",
      header: "Company",
      accessor: (cont) => (
        <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{cont.companyName}</span>
      ),
      sortable: true,
    },
    {
      key: "email",
      header: "Email Address",
      accessor: (cont) => <span className="text-xs text-slate-400 font-mono">{cont.email}</span>,
    },
    {
      key: "phone",
      header: "Phone Number",
      accessor: (cont) => <span className="text-xs text-slate-400 font-mono">{cont.phone}</span>,
    },
    {
      key: "department",
      header: "Department",
      accessor: (cont) => (
        <Badge variant="secondary" size="sm">
          {cont.department}
        </Badge>
      ),
    },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetComp = companies.find((c) => c.id === formData.companyId);
    const newCont = addContact({
      ...formData,
      companyName: targetComp?.companyName || "Associated Company",
    });
    toast.success(`Registered contact ${newCont.firstName} ${newCont.lastName}`);
    setIsCreateOpen(false);
    setSelectedContact(newCont);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Contacts Directory"
        subtitle="Commercial contact persons, procurement executives, and shipping decision makers."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "Contacts" }]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Add New Contact
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Contacts Table */}
        <div className="lg:col-span-2 space-y-3">
          <DataTable
            data={filteredContacts}
            columns={columns}
            searchPlaceholder="Search contacts by name, email, or company..."
            searchKey={(c) => `${c.firstName} ${c.lastName} ${c.email} ${c.companyName} ${c.designation}`}
            onRowClick={(cont) => setSelectedContact(cont)}
            actions={
              <Select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                options={[
                  { label: "All Companies", value: "ALL" },
                  ...companies.slice(0, 10).map((comp) => ({
                    label: comp.companyName,
                    value: comp.id,
                  })),
                ]}
              />
            }
          />
        </div>

        {/* Right 1 Column: Contact Detail */}
        <div className="space-y-4">
          {selectedContact ? (
            <Card className="p-5 space-y-5 sticky top-20">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{selectedContact.id}</span>
                    {selectedContact.isPrimary && (
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 font-bold px-2 py-0.5 rounded">
                        Primary Key Contact
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedContact.designation}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Associated Organization</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedContact.companyName}</span>
                  <span className="block text-slate-400 text-[11px]">Department: {selectedContact.department}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedContact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedContact.phone}</span>
                  </div>
                </div>

                {selectedContact.notes && (
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 italic text-[11px]">
                    "{selectedContact.notes}"
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Select a contact to view detail profile.
            </Card>
          )}
        </div>
      </div>

      {/* CREATE CONTACT DRAWER */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Contact"
        subtitle="Register an executive contact linked to a company profile."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Select
            label="Associated Company"
            value={formData.companyId}
            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            options={companies.map((c) => ({ label: c.companyName, value: c.id }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <Input
            label="Designation / Role"
            required
            placeholder="e.g. VP Logistics & Customs"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />

          <Input
            label="Email Address"
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
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />

          <Checkbox
            checked={formData.isPrimary}
            onChange={(e: any) => setFormData({ ...formData, isPrimary: e.target.checked })}
            label="Set as Primary Key Contact"
          />

          <Button variant="primary" type="submit" className="w-full mt-4">
            Save Contact Profile
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
