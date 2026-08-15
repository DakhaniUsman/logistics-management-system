"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomsFormModal } from "@/components/customs/customs-form-modal";
import { ArrowLeft } from "lucide-react";

export default function CreateCustomsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="xs" icon={ArrowLeft} onClick={() => router.push("/operations/customs")}>
          Back to Customs Dashboard
        </Button>
      </div>

      <PageHeader
        title="CREATE CUSTOMS DECLARATION"
        subtitle="Initialize import/export shipping bill or bill of entry declaration for port customs clearance."
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Customs Clearance", href: "/operations/customs" },
          { label: "Create Declaration" },
        ]}
      />

      <CustomsFormModal
        isOpen={true}
        onClose={() => router.push("/operations/customs")}
        declaration={null}
      />
    </div>
  );
}
