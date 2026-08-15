"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Boxes,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  FileCheck,
  Package,
  Truck,
  Building2,
  Kanban,
  FileText,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { GrnFormModal } from "@/components/warehouse/grn-form-modal";
import { PutAwayModal } from "@/components/warehouse/putaway-modal";
import { PickingModal } from "@/components/warehouse/picking-modal";
import { PackingModal } from "@/components/warehouse/packing-modal";
import { DispatchModal } from "@/components/warehouse/dispatch-modal";

export default function WarehouseInventoryPage() {
  const {
    warehouses,
    grns,
    putAways,
    pickLists,
    packingOps,
    dispatches,
    tasks,
    fetchWarehouses,
    getDashboardKPIs,
    openGrnModal,
    isGrnModalOpen,
    closeGrnModal,
    openPutAwayModal,
    isPutAwayModalOpen,
    closePutAwayModal,
    openPickingModal,
    isPickingModalOpen,
    closePickingModal,
    openPackingModal,
    isPackingModalOpen,
    closePackingModal,
    openDispatchModal,
    isDispatchModalOpen,
    closeDispatchModal,
    selectedGRN,
    selectedPickList,
    selectedPacking,
    selectedDispatch,
  } = useWarehouseStore();

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const kpis = getDashboardKPIs();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <PageHeader
        title="WAREHOUSE MANAGEMENT & CONTROL CENTER"
        subtitle="Physical warehouse lifecycle management: Goods Receipts (GRNs), Put-Away storage allocation, Picking, Packing, and Outbound Dispatch."
        breadcrumbs={[{ label: "Operations", href: "/operations/jobs" }, { label: "Warehouse Command Center" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchWarehouses()}>
              Refresh
            </Button>

            <Button variant="primary" size="sm" icon={Plus} onClick={() => openGrnModal(null)}>
              Create GRN
            </Button>
          </div>
        }
      />

      {/* Top Operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatsCard title="WAREHOUSES" value={kpis.warehouses.toString()} icon={Building2} />
        <StatsCard title="RECEIVING TODAY" value={kpis.receivingToday.toString()} icon={Clock} />
        <StatsCard title="GRNs PENDING" value={kpis.pendingGRNs.toString()} icon={FileCheck} />
        <StatsCard title="PUT AWAY" value={kpis.putAwayPending.toString()} icon={Boxes} />
        <StatsCard title="PICKING PENDING" value={kpis.pickingPending.toString()} icon={Boxes} />
        <StatsCard title="PACKING PENDING" value={kpis.packingPending.toString()} icon={Package} />
        <StatsCard title="READY DISPATCH" value={kpis.readyForDispatch.toString()} icon={Truck} />
        <StatsCard title="DELAYED TASKS" value={kpis.delayedTasks.toString()} icon={AlertTriangle} />
      </div>

      {/* Operational Attention Alerts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">{kpis.pendingGRNs} GRNs Pending Verification</span>
              <span className="text-[11px] text-amber-200/80 block">Discrepancies & shortage checks required</span>
            </div>
          </div>

          <Link href="/warehouse/grn">
            <Button variant="outline" size="xs" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20">
              Verify GRNs
            </Button>
          </Link>
        </div>

        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <span className="font-bold text-sky-300 block">{kpis.putAwayPending} Items Awaiting Put-Away</span>
              <span className="text-[11px] text-sky-200/80 block">Allocate rack storage locations</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="xs"
            className="border-sky-500/40 text-sky-300 hover:bg-sky-500/20"
            onClick={openPutAwayModal}
          >
            Allocate Storage
          </Button>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300 block">{kpis.readyForDispatch} Orders Ready for Dispatch</span>
              <span className="text-[11px] text-emerald-200/80 block">Outbound carrier trucks assigned</span>
            </div>
          </div>

          <Link href="/warehouse/dispatch">
            <Button variant="outline" size="xs" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20">
              View Dispatch
            </Button>
          </Link>
        </div>
      </div>

      {/* Warehouse Facilities & Utilization Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-100 text-sm block">{wh.name}</span>
                <span className="text-[11px] text-slate-400">{wh.code} • Manager: {wh.managerName}</span>
              </div>
              <StatusBadge status={wh.status} />
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                <span>Occupied: {wh.occupiedSqFt.toLocaleString()} SQ FT</span>
                <span className="font-bold">{wh.utilizationPercentage}% Capacity Utilized</span>
              </div>

              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all ${
                    wh.utilizationPercentage >= 85
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${wh.utilizationPercentage}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Unified Operational Task Kanban / Workload Board */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Kanban className="w-4 h-4 text-sky-400" />
            <h4 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
              Unified Warehouse Operational Workload Board
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/warehouse/grn" className="hover:text-sky-400">GRNs ({grns.length})</Link> •
            <Link href="/warehouse/picking" className="hover:text-sky-400">Picking ({pickLists.length})</Link> •
            <Link href="/warehouse/packing" className="hover:text-sky-400">Packing ({packingOps.length})</Link> •
            <Link href="/warehouse/dispatch" className="hover:text-sky-400">Dispatch ({dispatches.length})</Link>
          </div>
        </div>

        {/* Kanban Task Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Column 1: Receiving (GRNs) */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-sky-400 border-b border-slate-800 pb-1">
              <span>1. RECEIVING (GRNs)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20">{grns.length}</span>
            </div>

            <div className="space-y-2">
              {grns.slice(0, 3).map((g) => (
                <div key={g.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-slate-200 block">{g.grnNumber}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{g.customerName}</span>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-emerald-400 font-mono font-bold">Qty: {g.netAcceptedQuantity}</span>
                    <StatusBadge status={g.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Put Away */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-blue-400 border-b border-slate-800 pb-1">
              <span>2. PUT AWAY</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20">{putAways.length}</span>
            </div>

            <div className="space-y-2">
              {putAways.slice(0, 3).map((p) => (
                <div key={p.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-slate-200 block">{p.putAwayNumber}</span>
                  <span className="text-[10px] text-emerald-400 font-mono block">Loc: {p.locationCode}</span>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Operator: {p.assignedOperatorName || "Unassigned"}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Picking */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-purple-400 border-b border-slate-800 pb-1">
              <span>3. PICKING</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20">{pickLists.length}</span>
            </div>

            <div className="space-y-2">
              {pickLists.slice(0, 3).map((p) => (
                <div key={p.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-slate-200 block">{p.pickNumber}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{p.customerName}</span>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-purple-300 font-mono">Qty: {p.totalPickedQty}/{p.totalRequestedQty}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Packing */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-amber-400 border-b border-slate-800 pb-1">
              <span>4. PACKING</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">{packingOps.length}</span>
            </div>

            <div className="space-y-2">
              {packingOps.slice(0, 3).map((p) => (
                <div key={p.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-slate-200 block">{p.packingNumber}</span>
                  <span className="text-[10px] text-amber-300 font-mono block">{p.packageCount} PKGs ({p.totalWeightKg} KG)</span>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">{p.packingType}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 5: Dispatch */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-400 border-b border-slate-800 pb-1">
              <span>5. OUTBOUND DISPATCH</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">{dispatches.length}</span>
            </div>

            <div className="space-y-2">
              {dispatches.slice(0, 3).map((d) => (
                <div key={d.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-slate-200 block">{d.dispatchNumber}</span>
                  <span className="text-[10px] text-sky-400 font-mono block">Truck: {d.vehicleNumber || "MH 04 AB 1234"}</span>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 truncate max-w-[80px]">{d.customerName}</span>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <GrnFormModal isOpen={isGrnModalOpen} onClose={closeGrnModal} grn={selectedGRN} />

      <PutAwayModal isOpen={isPutAwayModalOpen} onClose={closePutAwayModal} />

      <PickingModal isOpen={isPickingModalOpen} onClose={closePickingModal} pickList={selectedPickList} />

      <PackingModal isOpen={isPackingModalOpen} onClose={closePackingModal} packing={selectedPacking} />

      <DispatchModal isOpen={isDispatchModalOpen} onClose={closeDispatchModal} dispatch={selectedDispatch} />
    </div>
  );
}
