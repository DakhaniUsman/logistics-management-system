"use client";

import React, { useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Truck, CheckCircle2, Clock, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { Dispatch } from "@/types/warehouse";
import { DispatchModal } from "@/components/warehouse/dispatch-modal";

export default function DispatchQueuePage() {
  const {
    dispatches,
    isLoading,
    fetchDispatches,
    openDispatchModal,
    isDispatchModalOpen,
    closeDispatchModal,
    selectedDispatch,
  } = useWarehouseStore();

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  const dispatchedCount = dispatches.filter((d) => d.status === "Dispatched").length;

  const columns = [
    {
      key: "dispatchNumber",
      header: "Dispatch #",
      accessor: (dsp: Dispatch) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-extrabold text-slate-100 block text-xs">{dsp.dispatchNumber}</span>
            <span className="text-[10px] text-slate-400 block font-mono">Pack: {dsp.packingNumber}</span>
          </div>
        </div>
      ),
    },
    {
      key: "jobId",
      header: "Logistics Hierarchy",
      accessor: (dsp: Dispatch) => (
        <div className="text-[11px] space-y-0.5 min-w-[140px]">
          <Link href={`/operations/jobs/${dsp.jobId}`} className="font-mono font-bold text-sky-400 hover:underline block">
            {dsp.jobNumber}
          </Link>
          <span className="text-slate-300 block font-mono text-[10px]">SHP: {dsp.shipmentNumber}</span>
        </div>
      ),
    },
    {
      key: "customerId",
      header: "Customer & Carrier Truck",
      accessor: (dsp: Dispatch) => (
        <div className="text-[11px] min-w-[170px]">
          <span className="font-bold text-slate-200 block truncate">{dsp.customerName}</span>
          <Link
            href={`/operations/transport/${dsp.transportRequestId || "TR-2026-00125"}`}
            className="text-sky-400 font-mono text-[10px] hover:underline flex items-center gap-1 font-bold"
          >
            Vehicle: {dsp.vehicleNumber || "MH 04 AB 1234"} <ExternalLink className="w-3 h-3 inline" />
          </Link>
        </div>
      ),
    },
    {
      key: "dispatchDate",
      header: "Dispatch Schedule",
      accessor: (dsp: Dispatch) => (
        <span className="font-mono text-slate-200 text-xs font-bold block">{dsp.dispatchDate}</span>
      ),
    },
    {
      key: "status",
      header: "Dispatch Status",
      accessor: (dsp: Dispatch) => <StatusBadge status={dsp.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (dsp: Dispatch) => (
        <div className="flex items-center gap-1.5 min-w-[170px]">
          {dsp.status === "Dispatched" ? (
            <Link href="/operations/delivery/create">
              <Button variant="outline" size="xs" icon={Truck} className="text-sky-400 border-sky-500/30 hover:bg-sky-500/10">
                Schedule Delivery
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="xs"
              icon={CheckCircle2}
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => openDispatchModal(dsp)}
            >
              Confirm Loading
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="OUTBOUND DISPATCH & TRANSPORT HANDOFF"
        subtitle="Warehouse gate outbound dispatch confirmation, transport carrier truck loading, and handoff to road transport execution."
        breadcrumbs={[{ label: "Warehouse", href: "/warehouse/inventory" }, { label: "Outbound Dispatch" }]}
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchDispatches()}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard title="TOTAL DISPATCHES" value={dispatches.length.toString()} icon={Truck} />
        <StatsCard title="CONFIRMED DISPATCHED" value={dispatchedCount.toString()} icon={CheckCircle2} />
        <StatsCard title="LOADING IN PROGRESS" value={(dispatches.length - dispatchedCount).toString()} icon={Clock} />
        <StatsCard title="LINKED TRUCKS" value={dispatches.length.toString()} icon={Truck} />
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable data={dispatches} columns={columns} isLoading={isLoading} />
      </Card>

      <DispatchModal isOpen={isDispatchModalOpen} onClose={closeDispatchModal} dispatch={selectedDispatch} />
    </div>
  );
}
