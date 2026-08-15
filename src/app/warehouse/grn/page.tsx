"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import {
  FileCheck,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Clock,
  Eye,
  Building2,
  Briefcase,
  Ship,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { GoodsReceipt } from "@/types/warehouse";
import { GrnFormModal } from "@/components/warehouse/grn-form-modal";
import { PutAwayModal } from "@/components/warehouse/putaway-modal";

export default function GrnManagementPage() {
  const {
    grns,
    filters,
    isLoading,
    fetchGRNs,
    setFilters,
    clearFilters,
    verifyGRN,
    openGrnModal,
    isGrnModalOpen,
    closeGrnModal,
    openPutAwayModal,
    isPutAwayModalOpen,
    closePutAwayModal,
    selectedGRN,
  } = useWarehouseStore();

  useEffect(() => {
    fetchGRNs();
  }, [fetchGRNs]);

  const verifiedCount = grns.filter((g) => g.status === "Verified" || g.status === "Completed").length;
  const discrepancyCount = grns.filter((g) => g.status === "Discrepancy").length;
  const pendingCount = grns.filter((g) => g.status === "Pending Verification").length;

  const handleVerify = async (grnId: string) => {
    await verifyGRN(grnId);
  };

  const columns = [
    {
      key: "grnNumber",
      header: "GRN Number",
      accessor: (grn: GoodsReceipt) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-extrabold text-slate-100 block truncate text-xs">
              {grn.grnNumber}
            </span>
            <span className="text-[11px] text-slate-400 block truncate">{grn.warehouseName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "jobId",
      header: "Logistics Hierarchy",
      accessor: (grn: GoodsReceipt) => (
        <div className="text-[11px] space-y-0.5 min-w-[140px]">
          <Link
            href={`/operations/jobs/${grn.jobId || grn.jobNumber}`}
            className="font-mono font-bold text-sky-400 hover:underline block"
          >
            {grn.jobNumber}
          </Link>
          <span className="text-slate-300 block font-mono text-[10px]">SHP: {grn.shipmentNumber}</span>
          {grn.containerNumbers.length > 0 && (
            <span className="text-cyan-400 block font-mono text-[10px]">CON: {grn.containerNumbers[0]}</span>
          )}
        </div>
      ),
    },
    {
      key: "customerId",
      header: "Customer & Vehicle",
      accessor: (grn: GoodsReceipt) => (
        <div className="text-[11px] min-w-[150px]">
          <span className="font-bold text-slate-200 block truncate">{grn.customerName}</span>
          <span className="text-slate-400 text-[10px] block">
            {grn.vehicleNumber ? `Vehicle: ${grn.vehicleNumber}` : "Direct Receipt"}
          </span>
        </div>
      ),
    },
    {
      key: "expectedQuantity",
      header: "Expected vs Received",
      accessor: (grn: GoodsReceipt) => (
        <div className="text-xs font-mono">
          <span className="font-bold text-slate-100 block">Rec: {grn.receivedQuantity.toLocaleString()}</span>
          <span className="text-slate-400 text-[10px]">Exp: {grn.expectedQuantity.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "damagedQuantity",
      header: "Discrepancies",
      accessor: (grn: GoodsReceipt) => (
        <div className="text-xs font-mono">
          {grn.damagedQuantity > 0 || grn.shortQuantity > 0 || grn.excessQuantity > 0 ? (
            <div className="space-y-0.5">
              {grn.shortQuantity > 0 && <span className="text-rose-400 block text-[10px]">Short: {grn.shortQuantity}</span>}
              {grn.damagedQuantity > 0 && <span className="text-amber-400 block text-[10px]">Damaged: {grn.damagedQuantity}</span>}
            </div>
          ) : (
            <span className="text-emerald-400 font-bold text-[11px]">Clean Receipt</span>
          )}
        </div>
      ),
    },
    {
      key: "netAcceptedQuantity",
      header: "Net Accepted",
      accessor: (grn: GoodsReceipt) => (
        <span className="font-mono font-extrabold text-emerald-400 text-xs">
          {grn.netAcceptedQuantity.toLocaleString()} Units
        </span>
      ),
    },
    {
      key: "status",
      header: "GRN Status",
      accessor: (grn: GoodsReceipt) => <StatusBadge status={grn.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (grn: GoodsReceipt) => (
        <div className="flex items-center gap-1.5 min-w-[140px]">
          {grn.status === "Pending Verification" || grn.status === "Discrepancy" ? (
            <Button
              variant="outline"
              size="xs"
              icon={CheckCircle2}
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => handleVerify(grn.id)}
            >
              Verify
            </Button>
          ) : grn.status === "Verified" || grn.status === "Put Away Pending" ? (
            <Button
              variant="outline"
              size="xs"
              icon={Boxes}
              className="text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
              onClick={openPutAwayModal}
            >
              Put Away
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="GOODS RECEIPT NOTES (GRN) & CARGO RECEIVING"
        subtitle="Inbound cargo receiving, physical count verification, shortage/damage discrepancy logging, and put-away initiation."
        breadcrumbs={[{ label: "Warehouse", href: "/warehouse/inventory" }, { label: "Goods Receipts (GRNs)" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchGRNs()}>
              Refresh
            </Button>

            <Button variant="primary" size="sm" icon={Plus} onClick={() => openGrnModal(null)}>
              Generate New GRN
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard title="TOTAL GRNs" value={grns.length.toString()} icon={FileCheck} />
        <StatsCard title="VERIFIED GRNs" value={verifiedCount.toString()} icon={CheckCircle2} />
        <StatsCard title="DISCREPANCIES" value={discrepancyCount.toString()} icon={AlertTriangle} />
        <StatsCard title="PENDING VERIFICATION" value={pendingCount.toString()} icon={Clock} />
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Search by GRN #, Job #, Shipment #, Container #, Customer, Vehicle #..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-44">
            <Select
              value={filters.status || "ALL"}
              onChange={(e) => setFilters({ status: e.target.value })}
              options={[
                { label: "All GRN Statuses", value: "ALL" },
                { label: "Verified", value: "Verified" },
                { label: "Discrepancy", value: "Discrepancy" },
                { label: "Pending Verification", value: "Pending Verification" },
                { label: "Completed", value: "Completed" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <DataTable data={grns} columns={columns} isLoading={isLoading} />
      </Card>

      <GrnFormModal isOpen={isGrnModalOpen} onClose={closeGrnModal} grn={selectedGRN} />

      <PutAwayModal isOpen={isPutAwayModalOpen} onClose={closePutAwayModal} />
    </div>
  );
}
