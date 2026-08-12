"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableColumn } from "@/types/common";
import { Activity, ActivityType } from "@/types/crm";
import { useCrmStore } from "@/store/use-crm-store";
import {
  CalendarCheck,
  Plus,
  Phone,
  Mail,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function ActivitiesPage() {
  const { activities, addActivity, updateActivityStatus } = useCrmStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    type: "Call" as ActivityType,
    title: "",
    description: "",
    relatedEntity: "Lead" as const,
    relatedEntityId: "LEAD-2026-001",
    relatedEntityName: "SunRise Solar Energy Corp",
    assignedTo: "Shahbaj Borkar",
    dueDate: "2026-08-15",
    status: "Upcoming" as const,
  });

  const filteredActivities = activities.filter((a) => {
    if (typeFilter !== "ALL" && a.type !== typeFilter) return false;
    if (activeTab === "pending" && a.status === "Completed") return false;
    if (activeTab === "completed" && a.status !== "Completed") return false;
    return true;
  });

  const columns: TableColumn<Activity>[] = [
    {
      key: "type",
      header: "Type",
      accessor: (act) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {act.type === "Call" && <Phone className="w-3 h-3 text-blue-500" />}
          {act.type === "Email" && <Mail className="w-3 h-3 text-sky-500" />}
          {act.type === "Meeting" && <Users className="w-3 h-3 text-emerald-500" />}
          {act.type === "Follow-up" && <Clock className="w-3 h-3 text-amber-500" />}
          {act.type === "Note" && <FileText className="w-3 h-3 text-purple-500" />}
          <span>{act.type}</span>
        </span>
      ),
      sortable: true,
    },
    {
      key: "title",
      header: "Activity Title / Description",
      accessor: (act) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{act.title}</div>
          <div className="text-xs text-slate-400 line-clamp-1">{act.description}</div>
        </div>
      ),
    },
    {
      key: "relatedEntityName",
      header: "Related Entity",
      accessor: (act) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">{act.relatedEntityName}</div>
          <div className="text-[10px] text-slate-400">{act.relatedEntity} ({act.relatedEntityId})</div>
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      accessor: (act) => <span className="text-xs text-slate-400">{act.assignedTo}</span>,
    },
    {
      key: "status",
      header: "Status",
      accessor: (act) => <StatusBadge status={act.status} />,
      sortable: true,
    },
    {
      key: "actions",
      header: "Action",
      accessor: (act) => (
        <Button
          variant={act.status === "Completed" ? "ghost" : "outline"}
          size="xs"
          disabled={act.status === "Completed"}
          onClick={() => {
            updateActivityStatus(act.id, "Completed");
            toast.success("Activity marked as completed");
          }}
        >
          {act.status === "Completed" ? "Completed" : "Mark Complete"}
        </Button>
      ),
    },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAct = addActivity(formData);
    toast.success(`Logged ${newAct.type} activity for ${newAct.relatedEntityName}`);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Activities & Interactions Log"
        subtitle="Full operational record of sales calls, meetings, emails, and follow-ups across all accounts."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "Activities" }]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Log New Activity
          </Button>
        }
      />

      <div className="space-y-3">
        <Tabs
          tabs={[
            { id: "all", label: "All Activities", count: activities.length },
            { id: "pending", label: "Open & Upcoming", count: activities.filter((a) => a.status !== "Completed").length },
            { id: "completed", label: "Completed Log", count: activities.filter((a) => a.status === "Completed").length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <DataTable
          data={filteredActivities}
          columns={columns}
          searchPlaceholder="Search activities by title, description, or entity..."
          searchKey={(a) => `${a.title} ${a.description} ${a.relatedEntityName} ${a.assignedTo}`}
          actions={
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { label: "All Activity Types", value: "ALL" },
                { label: "Call", value: "Call" },
                { label: "Email", value: "Email" },
                { label: "Meeting", value: "Meeting" },
                { label: "Follow-up", value: "Follow-up" },
                { label: "Note", value: "Note" },
              ]}
            />
          }
        />
      </div>

      {/* CREATE ACTIVITY MODAL */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log CRM Activity"
        description="Record a call, meeting, or email interaction."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
          <Select
            label="Activity Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
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
            placeholder="e.g. Q3 Rate Negotiation Meeting"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Input
            label="Description / Minutes of Meeting"
            required
            placeholder="Enter details of conversation..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Input
            label="Related Entity Name"
            required
            placeholder="e.g. SunRise Solar Energy Corp"
            value={formData.relatedEntityName}
            onChange={(e) => setFormData({ ...formData, relatedEntityName: e.target.value })}
          />

          <Input
            label="Assigned To"
            required
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
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
