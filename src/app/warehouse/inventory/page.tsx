"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Boxes,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  FileCheck,
  Package,
  Truck,
  Building2,
  Kanban,
} from "lucide-react";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { GrnFormModal } from "@/components/warehouse/grn-form-modal";
import { PutAwayModal } from "@/components/warehouse/putaway-modal";
import { PickingModal } from "@/components/warehouse/picking-modal";
import { PackingModal } from "@/components/warehouse/packing-modal";
import { DispatchModal } from "@/components/warehouse/dispatch-modal";

/* ------------------------------------------------------------------ */
/* Small reusable pieces                                               */
/* ------------------------------------------------------------------ */

type BoardCard = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
};

type BoardColumn = {
  key: string;
  title: string;
  href?: string;
  total: number;
  cards: BoardCard[];
  /* Tailwind classes must be written in full so they are not purged */
  accentText: string;
  accentBg: string;
  metaText: string;
};

/**
 * Forces any StatusBadge to render small and on a single line,
 * so "In Progress" / "Ready for Dispatch" no longer wrap or blow up the card.
 */
function CompactStatus({ status }: { status: string }) {
  return (
    <div className="shrink-0 [&>*]:whitespace-nowrap [&>*]:!px-2 [&>*]:!py-0.5 [&>*]:!text-[10px] [&_svg]:!h-3 [&_svg]:!w-3">
      <StatusBadge status={status} />
    </div>
  );
}

function BoardItem({ card, metaText }: { card: BoardCard; metaText: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-bold text-slate-100">{card.title}</span>
        <CompactStatus status={card.status} />
      </div>
      <p className="truncate text-[11px] text-slate-400">{card.subtitle}</p>
      <p className={`truncate font-mono text-[11px] font-semibold ${metaText}`}>{card.meta}</p>
    </div>
  );
}

function BoardColumnView({ column }: { column: BoardColumn }) {
  return (
    <div className="flex min-w-[240px] flex-1 flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
        <span className={`text-xs font-bold ${column.accentText}`}>{column.title}</span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${column.accentBg} ${column.accentText}`}>
          {column.total}
        </span>
      </div>

      <div className="flex-1 space-y-2">
        {column.cards.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-slate-500">Nothing here yet</p>
        ) : (
          column.cards.map((card) => <BoardItem key={card.id} card={card} metaText={column.metaText} />)
        )}
      </div>

      {column.href && column.total > column.cards.length && (
        <Link
          href={column.href}
          className="mt-3 block border-t border-slate-800 pt-2 text-center text-[11px] text-slate-400 hover:text-sky-400"
        >
          View all {column.total}
        </Link>
      )}
    </div>
  );
}

type AlertTone = "amber" | "sky" | "emerald";

const ALERT_TONES: Record<AlertTone, { box: string; icon: string; title: string; sub: string; btn: string }> = {
  amber: {
    box: "bg-amber-500/10 border-amber-500/30",
    icon: "text-amber-400",
    title: "text-amber-300",
    sub: "text-amber-200/80",
    btn: "border-amber-500/40 text-amber-300 hover:bg-amber-500/20",
  },
  sky: {
    box: "bg-sky-500/10 border-sky-500/30",
    icon: "text-sky-400",
    title: "text-sky-300",
    sub: "text-sky-200/80",
    btn: "border-sky-500/40 text-sky-300 hover:bg-sky-500/20",
  },
  emerald: {
    box: "bg-emerald-500/10 border-emerald-500/30",
    icon: "text-emerald-400",
    title: "text-emerald-300",
    sub: "text-emerald-200/80",
    btn: "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20",
  },
};

function AlertTile({
  tone,
  icon: Icon,
  title,
  description,
  action,
}: {
  tone: AlertTone;
  icon: React.ElementType;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  const t = ALERT_TONES[tone];
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 ${t.box}`}>
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon className={`h-5 w-5 shrink-0 ${t.icon}`} />
        <div className="min-w-0">
          <span className={`block text-xs font-bold ${t.title}`}>{title}</span>
          <span className={`block text-[11px] ${t.sub}`}>{description}</span>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function WarehouseInventoryPage() {
  const {
    warehouses,
    grns,
    putAways,
    pickLists,
    packingOps,
    dispatches,
    fetchWarehouses,
    getDashboardKPIs,
    openGrnModal,
    isGrnModalOpen,
    closeGrnModal,
    openPutAwayModal,
    isPutAwayModalOpen,
    closePutAwayModal,
    isPickingModalOpen,
    closePickingModal,
    isPackingModalOpen,
    closePackingModal,
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

  const PREVIEW = 3;

  const columns: BoardColumn[] = [
    {
      key: "grn",
      title: "1. Receiving (GRNs)",
      href: "/warehouse/grn",
      total: grns.length,
      accentText: "text-sky-400",
      accentBg: "bg-sky-500/20",
      metaText: "text-emerald-400",
      cards: grns.slice(0, PREVIEW).map((g) => ({
        id: g.id,
        title: g.grnNumber,
        subtitle: g.customerName,
        meta: `Qty: ${g.netAcceptedQuantity}`,
        status: g.status,
      })),
    },
    {
      key: "putaway",
      title: "2. Put away",
      total: putAways.length,
      accentText: "text-blue-400",
      accentBg: "bg-blue-500/20",
      metaText: "text-emerald-400",
      cards: putAways.slice(0, PREVIEW).map((p) => ({
        id: p.id,
        title: p.putAwayNumber,
        subtitle: `Operator: ${p.assignedOperatorName || "Unassigned"}`,
        meta: `Loc: ${p.locationCode}`,
        status: p.status,
      })),
    },
    {
      key: "picking",
      title: "3. Picking",
      href: "/warehouse/picking",
      total: pickLists.length,
      accentText: "text-purple-400",
      accentBg: "bg-purple-500/20",
      metaText: "text-purple-300",
      cards: pickLists.slice(0, PREVIEW).map((p) => ({
        id: p.id,
        title: p.pickNumber,
        subtitle: p.customerName,
        meta: `Qty: ${p.totalPickedQty}/${p.totalRequestedQty}`,
        status: p.status,
      })),
    },
    {
      key: "packing",
      title: "4. Packing",
      href: "/warehouse/packing",
      total: packingOps.length,
      accentText: "text-amber-400",
      accentBg: "bg-amber-500/20",
      metaText: "text-amber-300",
      cards: packingOps.slice(0, PREVIEW).map((p) => ({
        id: p.id,
        title: p.packingNumber,
        subtitle: p.packingType,
        meta: `${p.packageCount} PKGs (${p.totalWeightKg} KG)`,
        status: p.status,
      })),
    },
    {
      key: "dispatch",
      title: "5. Outbound dispatch",
      href: "/warehouse/dispatch",
      total: dispatches.length,
      accentText: "text-emerald-400",
      accentBg: "bg-emerald-500/20",
      metaText: "text-sky-400",
      cards: dispatches.slice(0, PREVIEW).map((d) => ({
        id: d.id,
        title: d.dispatchNumber,
        subtitle: d.customerName,
        meta: `Truck: ${d.vehicleNumber || "Not assigned"}`,
        status: d.status,
      })),
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page header */}
      <PageHeader
        title="WAREHOUSE MANAGEMENT & CONTROL CENTER"
        subtitle="Goods receipts, put-away, picking, packing and outbound dispatch in one place."
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

      {/* KPI grid: 2 cols on phones, 4 on tablet and up (8 cards = 2 clean rows) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard title="WAREHOUSES" value={kpis.warehouses.toString()} icon={Building2} />
        <StatsCard title="RECEIVING TODAY" value={kpis.receivingToday.toString()} icon={Clock} />
        <StatsCard title="GRNs PENDING" value={kpis.pendingGRNs.toString()} icon={FileCheck} />
        <StatsCard title="PUT AWAY" value={kpis.putAwayPending.toString()} icon={Boxes} />
        <StatsCard title="PICKING PENDING" value={kpis.pickingPending.toString()} icon={Boxes} />
        <StatsCard title="PACKING PENDING" value={kpis.packingPending.toString()} icon={Package} />
        <StatsCard title="READY DISPATCH" value={kpis.readyForDispatch.toString()} icon={Truck} />
        <StatsCard title="DELAYED TASKS" value={kpis.delayedTasks.toString()} icon={AlertTriangle} />
      </div>

      {/* Attention tiles */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AlertTile
          tone="amber"
          icon={AlertTriangle}
          title={`${kpis.pendingGRNs} GRNs pending verification`}
          description="Discrepancy and shortage checks required"
          action={
            <Link href="/warehouse/grn">
              <Button variant="outline" size="xs" className={ALERT_TONES.amber.btn}>
                Verify GRNs
              </Button>
            </Link>
          }
        />
        <AlertTile
          tone="sky"
          icon={Boxes}
          title={`${kpis.putAwayPending} items awaiting put-away`}
          description="Allocate rack storage locations"
          action={
            <Button variant="outline" size="xs" className={ALERT_TONES.sky.btn} onClick={openPutAwayModal}>
              Allocate storage
            </Button>
          }
        />
        <AlertTile
          tone="emerald"
          icon={Truck}
          title={`${kpis.readyForDispatch} orders ready for dispatch`}
          description="Outbound carrier trucks assigned"
          action={
            <Link href="/warehouse/dispatch">
              <Button variant="outline" size="xs" className={ALERT_TONES.emerald.btn}>
                View dispatch
              </Button>
            </Link>
          }
        />
      </div>

      {/* Warehouse facilities */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="block truncate text-sm font-extrabold text-slate-100">{wh.name}</span>
                <span className="block truncate text-[11px] text-slate-400">
                  {wh.code} • Manager: {wh.managerName}
                </span>
              </div>
              <div className="shrink-0">
                <StatusBadge status={wh.status} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap justify-between gap-x-3 font-mono text-[11px] text-slate-300">
                <span>Occupied: {wh.occupiedSqFt.toLocaleString()} sq ft</span>
                <span className="font-bold">{wh.utilizationPercentage}% utilized</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900">
                <div
                  className={`h-full transition-all ${wh.utilizationPercentage >= 85 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${wh.utilizationPercentage}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Workload board */}
      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Kanban className="h-4 w-4 text-sky-400" />
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
              Warehouse workload board
            </h4>
          </div>

          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <Link href="/warehouse/grn" className="hover:text-sky-400">GRNs ({grns.length})</Link>
            <Link href="/warehouse/picking" className="hover:text-sky-400">Picking ({pickLists.length})</Link>
            <Link href="/warehouse/packing" className="hover:text-sky-400">Packing ({packingOps.length})</Link>
            <Link href="/warehouse/dispatch" className="hover:text-sky-400">Dispatch ({dispatches.length})</Link>
          </nav>
        </div>

        {/* Columns share equal width and scroll sideways on small screens instead of squashing */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((col) => (
            <BoardColumnView key={col.key} column={col} />
          ))}
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