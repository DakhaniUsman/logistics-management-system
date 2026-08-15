"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function DocumentTemplatesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="DOCUMENT TEMPLATES & GENERATION"
        subtitle="Standardized logistics document templates for automated PDF generation and electronic shipping instructions."
        breadcrumbs={[
          { label: "Documents", href: "/documents/center" },
          { label: "Document Center", href: "/documents/center" },
          { label: "Templates" },
        ]}
      />

      <Card className="p-12 text-center max-w-2xl mx-auto space-y-4 border-dashed border-slate-700 bg-slate-900/40">
        <div className="w-16 h-16 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-extrabold text-lg text-slate-100">DOCUMENT GENERATION ENGINE (FUTURE PHASE)</h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Automated PDF template generation for Commercial Invoices, Packing Lists, Certificates of Origin, and Delivery Orders will be enabled in future releases.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/documents/center">
            <Button variant="primary" size="sm" icon={FileText}>
              Go to Document Center
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
