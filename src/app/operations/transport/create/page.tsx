"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { TransportRequestModal } from "@/components/transport/transport-request-modal";
import { ArrowLeft } from "lucide-react";

export default function CreateTransportPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="xs" icon={ArrowLeft} onClick={() => router.push("/operations/transport")}>
          Back to Transport Dashboard
        </Button>
      </div>

      <PageHeader
        title="CREATE TRANSPORT REQUEST"
        subtitle="Initialize road haulage, port drayage, or inland feeder transport request for operational cargo."
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Transport Execution", href: "/operations/transport" },
          { label: "Create Request" },
        ]}
      />

      <TransportRequestModal
        isOpen={true}
        onClose={() => router.push("/operations/transport")}
        request={null}
      />
    </div>
  );
}
