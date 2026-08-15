"use client";

import React, { useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { FileCheck, ShieldCheck, RefreshCw, Eye, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { ProofOfDelivery } from "@/types/delivery";
import { PodVerifyModal } from "@/components/delivery/pod-verify-modal";

export default function PodVerificationQueuePage() {
  const {
    pods,
    isLoading,
    fetchPODs,
    openPodVerifyModal,
    isPodVerifyModalOpen,
    closePodVerifyModal,
    selectedPOD,
  } = useDeliveryStore();

  useEffect(() => {
    fetchPODs();
  }, [fetchPODs]);

  const verifiedCount = pods.filter((p) => p.status === "Verified").length;
  const underVerificationCount = pods.filter((p) => p.status === "Under Verification" || p.status === "Pending").length;

  const columns = [
    {
      key: "podNumber",
      header: "POD Number",
      accessor: (pod: ProofOfDelivery) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-extrabold text-slate-100 block text-xs">{pod.podNumber}</span>
            <span className="text-[10px] text-slate-400 block font-mono">Del: {pod.deliveryNumber}</span>
          </div>
        </div>
      ),
    },
    {
      key: "recipientName",
      header: "Recipient Sign-Off",
      accessor: (pod: ProofOfDelivery) => (
        <div className="text-[11px] min-w-[150px]">
          <span className="font-bold text-slate-200 block truncate">{pod.recipientName}</span>
          <span className="text-slate-400 text-[10px] block truncate">{pod.recipientDesignation}</span>
        </div>
      ),
    },
    {
      key: "condition",
      header: "Condition & Delivered Qty",
      accessor: (pod: ProofOfDelivery) => (
        <div className="text-xs font-mono">
          <span className="font-bold text-emerald-400 block">{pod.condition}</span>
          <span className="text-slate-400 text-[10px]">
            Delivered: {pod.deliveredQuantity.toLocaleString()} / {pod.expectedQuantity.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "receivedDate",
      header: "Received Date",
      accessor: (pod: ProofOfDelivery) => (
        <span className="font-mono text-slate-200 text-xs font-bold block">{pod.receivedDate} ({pod.receivedTime})</span>
      ),
    },
    {
      key: "documentNumber",
      header: "Document Reference",
      accessor: (pod: ProofOfDelivery) => (
        <span className="font-mono text-amber-300 text-xs block">{pod.documentNumber || `${pod.podNumber}.pdf`}</span>
      ),
    },
    {
      key: "status",
      header: "POD Status",
      accessor: (pod: ProofOfDelivery) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            pod.status === "Verified"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          }`}
        >
          {pod.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (pod: ProofOfDelivery) => (
        <div className="flex items-center gap-1.5 min-w-[140px]">
          <Link href={`/operations/delivery/${pod.deliveryId}`}>
            <Button variant="outline" size="xs" icon={Eye}>
              Delivery
            </Button>
          </Link>

          {pod.status !== "Verified" && (
            <Button
              variant="primary"
              size="xs"
              icon={ShieldCheck}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => openPodVerifyModal(pod)}
            >
              Verify POD
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="PROOF OF DELIVERY (POD) VERIFICATION QUEUE"
        subtitle="Operational audit and verification queue for digital recipient Proof of Delivery documents."
        breadcrumbs={[{ label: "Operations", href: "/operations/jobs" }, { label: "Delivery", href: "/operations/delivery" }, { label: "POD Queue" }]}
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchPODs()}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard title="TOTAL POD DOCUMENTS" value={pods.length.toString()} icon={FileCheck} />
        <StatsCard title="VERIFIED COMPLETED" value={verifiedCount.toString()} icon={ShieldCheck} />
        <StatsCard title="AWAITING VERIFICATION" value={underVerificationCount.toString()} icon={FileCheck} />
        <StatsCard title="EXCEPTIONS / REJECTED" value="0" icon={AlertTriangle} />
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable data={pods} columns={columns} isLoading={isLoading} />
      </Card>

      <PodVerifyModal isOpen={isPodVerifyModalOpen} onClose={closePodVerifyModal} pod={selectedPOD} />
    </div>
  );
}
