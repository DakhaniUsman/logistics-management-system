"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TableColumn } from "@/types/common";
import { Task, TaskPriority, TaskStatus } from "@/types/crm";
import { useCrmStore } from "@/store/use-crm-store";
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function TasksPage() {
  const { tasks, addTask, toggleTaskStatus } = useCrmStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("pending");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "Dakhani Usman",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "High" as TaskPriority,
    status: "Pending" as TaskStatus,
    relatedEntity: "Lead" as const,
    relatedEntityId: "LEAD-2026-001",
    relatedEntityName: "SunRise Solar Energy Corp",
  });

  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    if (activeTab === "pending" && t.status === "Completed") return false;
    if (activeTab === "completed" && t.status !== "Completed") return false;
    return true;
  });

  const columns: TableColumn<Task>[] = [
    {
      key: "statusCheck",
      header: "Done",
      accessor: (task) => (
        <button
          onClick={() => {
            toggleTaskStatus(task.id);
            toast.success(`Updated task status`);
          }}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.status === "Completed"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-400 hover:border-sky-500"
            }`}
        >
          {task.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
        </button>
      ),
    },
    {
      key: "title",
      header: "Task Title / Description",
      accessor: (task) => (
        <div>
          <div className={`font-bold text-xs sm:text-sm ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
            {task.title}
          </div>
          <div className="text-xs text-slate-400">{task.description}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "priority",
      header: "Priority",
      accessor: (task) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${task.priority === "Urgent"
              ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400"
              : task.priority === "High"
                ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400"
                : task.priority === "Medium"
                  ? "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/60 dark:text-sky-400"
                  : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
        >
          {task.priority}
        </span>
      ),
      sortable: true,
    },
    {
      key: "relatedEntityName",
      header: "Related Account",
      accessor: (task) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{task.relatedEntityName}</div>
          <div className="text-[10px] text-slate-400">{task.relatedEntity} ({task.relatedEntityId})</div>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      accessor: (task) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {task.dueDate}
        </span>
      ),
      sortable: true,
    },
    {
      key: "assignee",
      header: "Assignee",
      accessor: (task) => <span className="text-xs text-slate-400 font-medium">{task.assignee}</span>,
    },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask = addTask(formData);
    toast.success(`Created follow-up task "${newTask.title}"`);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Follow-ups & Tasks Manager"
        subtitle="Track operational commercial tasks, rate follow-ups, customer calls, and deadlines."
        breadcrumbs={[{ label: "Sales & CRM", href: "/sales/crm" }, { label: "Tasks" }]}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Create Follow-up Task
          </Button>
        }
      />

      <div className="space-y-3">
        <Tabs
          tabs={[
            { id: "pending", label: "Pending Tasks", count: tasks.filter((t) => t.status !== "Completed").length },
            { id: "completed", label: "Completed Tasks", count: tasks.filter((t) => t.status === "Completed").length },
            { id: "all", label: "All Tasks", count: tasks.length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <DataTable
          data={filteredTasks}
          columns={columns}
          searchPlaceholder="Search tasks by title, account, or assignee..."
          searchKey={(t) => `${t.title} ${t.description} ${t.relatedEntityName} ${t.assignee}`}
          actions={
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { label: "All Priorities", value: "ALL" },
                { label: "Urgent Priority", value: "Urgent" },
                { label: "High Priority", value: "High" },
                { label: "Medium Priority", value: "Medium" },
                { label: "Low Priority", value: "Low" },
              ]}
            />
          }
        />
      </div>

      {/* CREATE TASK MODAL */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Commercial Follow-up Task"
        description="Assign a sales or logistics task with due date and priority."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Call Rahul Sharma tomorrow regarding rate quotation"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Input
            label="Task Description / Details"
            required
            placeholder="Specify context, container requirements, or rates..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority Level"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              options={[
                { label: "Urgent", value: "Urgent" },
                { label: "High Priority", value: "High" },
                { label: "Medium Priority", value: "Medium" },
                { label: "Low Priority", value: "Low" },
              ]}
            />

            <Input
              label="Due Date"
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <Input
            label="Related Account Name"
            required
            placeholder="e.g. ABC Electronics Pvt Ltd"
            value={formData.relatedEntityName}
            onChange={(e) => setFormData({ ...formData, relatedEntityName: e.target.value })}
          />

          <Input
            label="Assignee"
            required
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
