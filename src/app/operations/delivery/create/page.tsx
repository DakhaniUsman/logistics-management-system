"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CreateDeliveryModal } from "@/components/delivery/create-delivery-modal";
import { ArrowLeft } from "lucide-react";

export default function CreateDeliveryPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="xs" icon={ArrowLeft} onClick={() => router.push("/operations/delivery")}>
          Back to Delivery Dashboard
        </Button>
      </div>

      <PageHeader
        title="SCHEDULE DELIVERY ORDER"
        subtitle="Initialize final-mile customer delivery order from warehouse outbound dispatch or transport execution."
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Delivery Execution", href: "/operations/delivery" },
          { label: "Schedule Delivery" },
        ]}
      />

      <CreateDeliveryModal
        isOpen={true}
        onClose={() => router.push("/operations/delivery")}
        delivery={null}
      />
    </div>
  );
}
