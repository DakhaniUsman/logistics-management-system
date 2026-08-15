"use client";

import React, { useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Package, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { PackingOperation } from "@/types/warehouse";
import { PackingModal } from "@/components/warehouse/packing-modal";

export default function PackingOperationsPage() {
  const {
    packingOps,
    isLoading,
    fetchPackingOps,
    openPackingModal,
    isPackingModalOpen,
    closePackingModal,
    selectedPacking,
  } = useWarehouseStore();

  useEffect(() => {
    fetchPackingOps();
  }, [fetchPackingOps]);

  const readyCount = packingOps.filter((p) => p.status === "Ready for Dispatch").length;

  const columns = [
    {
      key: "packingNumber",
      header: "Packing #",
      accessor: (pack: PackingOperation) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-extrabold text-slate-100 block text-xs">{pack.packingNumber}</span>
            <span className="text-[10px] text-slate-400 block font-mono">Pick: {pack.pickNumber}</span>
          </div>
        </div>
      ),
    },
    {
      key: "jobId",
      header: "Logistics Hierarchy",
      accessor: (pack: PackingOperation) => (
        <div className="text-[11px] space-y-0.5 min-w-[140px]">
          <Link href={`/operations/jobs/${pack.jobId}`} className="font-mono font-bold text-sky-400 hover:underline block">
            {pack.jobNumber}
          </Link>
          <span className="text-slate-300 block font-mono text-[10px]">SHP: {pack.shipmentNumber}</span>
        </div>
      ),
    },
    {
      key: "customerId",
      header: "Customer & Type",
      accessor: (pack: PackingOperation) => (
        <div className="text-[11px] min-w-[150px]">
          <span className="font-bold text-slate-200 block truncate">{pack.customerName}</span>
          <span className="text-slate-400 text-[10px] block">{pack.packingType}</span>
        </div>
      ),
    },
    {
      key: "packageCount",
      header: "Packages & Weight",
      accessor: (pack: PackingOperation) => (
        <span className="font-mono font-bold text-amber-300 text-xs">
          {pack.packageCount} Packages ({pack.totalWeightKg.toLocaleString()} KG)
        </span>
      ),
    },
    {
      key: "status",
      header: "Packing Status",
      accessor: (pack: PackingOperation) => <StatusBadge status={pack.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (pack: PackingOperation) => (
        <Button
          variant="outline"
          size="xs"
          icon={CheckCircle2}
          className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
          onClick={() => openPackingModal(pack)}
        >
          {pack.status === "Ready for Dispatch" ? "View Details" : "Pack & Stage"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="PACKING OPERATIONS & PACKAGE STAGING"
        subtitle="Cargo containerizing, palletizing, shrink wrapping, gross weight recording, and dispatch staging."
        breadcrumbs={[{ label: "Warehouse", href: "/warehouse/inventory" }, { label: "Packing Operations" }]}
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchPackingOps()}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard title="TOTAL PACKING OPS" value={packingOps.length.toString()} icon={Package} />
        <StatsCard title="READY FOR DISPATCH" value={readyCount.toString()} icon={CheckCircle2} />
        <StatsCard title="IN PROGRESS" value={(packingOps.length - readyCount).toString()} icon={Clock} />
        <StatsCard title="TOTAL PACKAGES" value={(packingOps.length * 24).toString()} icon={Package} />
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable data={packingOps} columns={columns} isLoading={isLoading} />
      </Card>

      <PackingModal isOpen={isPackingModalOpen} onClose={closePackingModal} packing={selectedPacking} />
    </div>
  );
}
