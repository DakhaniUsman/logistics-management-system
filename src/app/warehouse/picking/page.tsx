"use client";

import React, { useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Boxes, CheckCircle2, Clock, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { PickList } from "@/types/warehouse";
import { PickingModal } from "@/components/warehouse/picking-modal";

export default function PickingOperationsPage() {
  const {
    pickLists,
    isLoading,
    fetchPickLists,
    openPickingModal,
    isPickingModalOpen,
    closePickingModal,
    selectedPickList,
  } = useWarehouseStore();

  useEffect(() => {
    fetchPickLists();
  }, [fetchPickLists]);

  const pickedCount = pickLists.filter((p) => p.status === "Picked").length;

  const columns = [
    {
      key: "pickNumber",
      header: "Pick List #",
      accessor: (pick: PickList) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-extrabold text-slate-100 block text-xs">{pick.pickNumber}</span>
            <span className="text-[10px] text-slate-400 block">{pick.warehouseName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "jobId",
      header: "Logistics Hierarchy",
      accessor: (pick: PickList) => (
        <div className="text-[11px] space-y-0.5 min-w-[140px]">
          <Link href={`/operations/jobs/${pick.jobId}`} className="font-mono font-bold text-sky-400 hover:underline block">
            {pick.jobNumber}
          </Link>
          <span className="text-slate-300 block font-mono text-[10px]">SHP: {pick.shipmentNumber}</span>
        </div>
      ),
    },
    {
      key: "customerId",
      header: "Customer & Operator",
      accessor: (pick: PickList) => (
        <div className="text-[11px] min-w-[150px]">
          <span className="font-bold text-slate-200 block truncate">{pick.customerName}</span>
          <span className="text-slate-400 text-[10px] block">
            Picker: {pick.assignedOperatorName || "Imran Shaikh"}
          </span>
        </div>
      ),
    },
    {
      key: "totalRequestedQty",
      header: "Picked / Requested",
      accessor: (pick: PickList) => (
        <span className="font-mono font-bold text-purple-300 text-xs">
          {pick.totalPickedQty} / {pick.totalRequestedQty} Units
        </span>
      ),
    },
    {
      key: "status",
      header: "Pick Status",
      accessor: (pick: PickList) => <StatusBadge status={pick.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (pick: PickList) => (
        <Button
          variant="outline"
          size="xs"
          icon={CheckCircle2}
          className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
          onClick={() => openPickingModal(pick)}
        >
          {pick.status === "Picked" ? "View Specs" : "Execute Pick"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="PICKING OPERATIONS & PICK LIST QUEUE"
        subtitle="Warehouse stock retrieval, location picking execution, and picker operator dispatch."
        breadcrumbs={[{ label: "Warehouse", href: "/warehouse/inventory" }, { label: "Picking Operations" }]}
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchPickLists()}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard title="TOTAL PICK LISTS" value={pickLists.length.toString()} icon={Boxes} />
        <StatsCard title="COMPLETED PICKED" value={pickedCount.toString()} icon={CheckCircle2} />
        <StatsCard title="IN PROGRESS" value={(pickLists.length - pickedCount).toString()} icon={Clock} />
        <StatsCard title="PRIORITY ORDERS" value="12" icon={Boxes} />
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable data={pickLists} columns={columns} isLoading={isLoading} />
      </Card>

      <PickingModal isOpen={isPickingModalOpen} onClose={closePickingModal} pickList={selectedPickList} />
    </div>
  );
}
