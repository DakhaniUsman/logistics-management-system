"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/timeline";
import { useCustomsStore } from "@/store/use-customs-store";
import { CustomsDeclaration } from "@/types/customs";
import { DocumentCompletenessWidget } from "@/components/documents/document-completeness-widget";
import { CustomsFormModal } from "@/components/customs/customs-form-modal";
import { CustomsFilingModal } from "@/components/customs/customs-filing-modal";
import { DutyPaymentModal } from "@/components/customs/duty-payment-modal";
import { ExaminationModal } from "@/components/customs/examination-modal";
import { CustomsQueryModal } from "@/components/customs/customs-query-modal";
import {
  FileText,
  Send,
  CreditCard,
  Search,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Building2,
  Briefcase,
  Ship,
  Boxes,
  ExternalLink,
  ArrowLeft,
  Edit,
  Clock,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CustomsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cusId = (params.id as string) || "CUS-2026-00125";

  const {
    declarations,
    getDeclarationById,
    clearDeclaration,
    releaseDeclaration,
    putOnHold,
    resumeProcessing,
    openFormModal,
    openFilingModal,
    openDutyModal,
    openExaminationModal,
    openQueryModal,
    isFormModalOpen,
    closeFormModal,
    isFilingModalOpen,
    closeFilingModal,
    isDutyModalOpen,
    closeDutyModal,
    isExaminationModalOpen,
    closeExaminationModal,
    isQueryModalOpen,
    closeQueryModal,
    selectedDeclaration,
  } = useCustomsStore();

  const [declaration, setDeclaration] = useState<CustomsDeclaration | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadDec() {
      const found = await getDeclarationById(cusId);
      if (found) setDeclaration(found);
      else if (declarations.length > 0) setDeclaration(declarations[0]);
    }
    loadDec();
  }, [cusId, declarations, getDeclarationById]);

  if (!declaration) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <p>Loading customs declaration details...</p>
      </div>
    );
  }

  const handleClearAction = async () => {
    if (confirm("Confirm Customs Out of Charge clearance?")) {
      await clearDeclaration(declaration.id);
    }
  };

  const handleReleaseAction = async () => {
    if (confirm("Confirm cargo release from port gate?")) {
      await releaseDeclaration(declaration.id);
    }
  };

  const handleHoldAction = async () => {
    const reason = prompt("Enter mandatory reason for placing declaration on hold:");
    if (reason && reason.trim()) {
      await putOnHold(declaration.id, reason);
    }
  };

  const handleResumeAction = async () => {
    await resumeProcessing(declaration.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="xs" icon={ArrowLeft} onClick={() => router.push("/operations/customs")}>
          Back to Customs Dashboard
        </Button>
      </div>

      {/* Page Header */}
      <PageHeader
        title={`${declaration.declarationNumber}: ${declaration.customsType} Declaration`}
        subtitle={`Customs Office: ${declaration.customsOffice} • Port: ${declaration.portOfEntry}`}
        breadcrumbs={[
          { label: "Operations", href: "/operations/jobs" },
          { label: "Customs Clearance", href: "/operations/customs" },
          { label: declaration.declarationNumber },
        ]}
        statusBadge={
          <div className="flex items-center gap-2">
            <StatusBadge status={declaration.status} />
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                declaration.customsType === "Import"
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {declaration.customsType} ({declaration.direction})
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon={Edit} onClick={() => openFormModal(declaration)}>
              Edit Specs
            </Button>

            {declaration.status === "Draft" || declaration.status === "Documents Pending" || declaration.status === "Ready to File" ? (
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                className="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={() => openFilingModal(declaration)}
              >
                File Declaration
              </Button>
            ) : null}

            {declaration.status === "Under Assessment" || declaration.status === "Filed" ? (
              <Button variant="outline" size="sm" icon={Search} onClick={() => openExaminationModal(declaration)}>
                Schedule Exam
              </Button>
            ) : null}

            {declaration.status === "Duty Pending" || (declaration.dutyPaymentStatus === "Pending" && declaration.totalPayable > 0) ? (
              <Button
                variant="primary"
                size="sm"
                icon={CreditCard}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => openDutyModal(declaration)}
              >
                Pay Duty & Tax
              </Button>
            ) : null}

            {declaration.status === "Query Raised" && (
              <Button
                variant="primary"
                size="sm"
                icon={AlertTriangle}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => openQueryModal(declaration)}
              >
                Respond to Query
              </Button>
            )}

            {(declaration.status === "Duty Paid" || declaration.dutyPaymentStatus === "Paid") && declaration.status !== "Cleared" && declaration.status !== "Released" && (
              <Button variant="primary" size="sm" icon={CheckCircle2} className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleClearAction}>
                Mark Cleared
              </Button>
            )}

            {declaration.status === "Cleared" && (
              <Button variant="primary" size="sm" icon={CheckCircle2} className="bg-sky-600 hover:bg-sky-700 text-white" onClick={handleReleaseAction}>
                Release Cargo
              </Button>
            )}

            {declaration.status !== "On Hold" ? (
              <Button variant="outline" size="sm" icon={Lock} className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={handleHoldAction}>
                Put On Hold
              </Button>
            ) : (
              <Button variant="outline" size="sm" icon={CheckCircle2} className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={handleResumeAction}>
                Resume Processing
              </Button>
            )}
          </div>
        }
      />

      {/* Linked Entity Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Importer / Customer</span>
            <span className="font-bold text-slate-100 text-xs block">{declaration.customerName}</span>
            <span className="text-[11px] text-slate-400">Broker: {declaration.brokerName}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Operational Job</span>
            <Link
              href={`/operations/jobs/${declaration.jobId || declaration.jobNumber}`}
              className="font-bold text-sky-400 hover:underline text-xs block"
            >
              {declaration.jobNumber}
            </Link>
            <span className="text-[11px] text-slate-400">Primary Logistics Job</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Shipment & Booking</span>
            <span className="font-mono text-xs font-bold text-slate-100 block">{declaration.shipmentNumber}</span>
            <span className="text-[11px] text-slate-400">Booking: {declaration.bookingNumber || "N/A"}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Container Numbers</span>
            <span className="font-mono font-bold text-cyan-400 text-xs block">
              {declaration.containerNumbers.join(", ") || "Air Cargo"}
            </span>
            <span className="text-[11px] text-slate-400">Physical Equipment</span>
          </div>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-slate-900/40 border-b border-slate-800">
          <Tabs
            tabs={[
              { id: "overview", label: "Declaration Summary & Valuation" },
              { id: "documents", label: "Customs Documents & Completeness" },
              { id: "examination", label: "Physical Examination" },
              { id: "queries", label: "Customs Queries & Objections", count: declaration.queries.length },
              { id: "timeline", label: "Clearance Milestone Timeline" },
              { id: "activities", label: "Activity Audit Log", count: declaration.activities.length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {/* TAB 1: OVERVIEW & VALUATION */}
          {activeTab === "overview" && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Declaration Metadata */}
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Customs Declaration Specs
                  </h4>
                  <p className="text-slate-300"><strong>Declaration ID:</strong> {declaration.declarationNumber}</p>
                  <p className="text-slate-300"><strong>Customs Type:</strong> {declaration.customsType}</p>
                  <p className="text-slate-300"><strong>Direction:</strong> {declaration.direction}</p>
                  <p className="text-slate-300"><strong>Customs Office:</strong> {declaration.customsOffice}</p>
                  <p className="text-slate-300"><strong>Port of Entry:</strong> {declaration.portOfEntry}</p>
                  <p className="text-slate-300"><strong>Port of Exit:</strong> {declaration.portOfExit}</p>
                  <p className="text-slate-300"><strong>Route:</strong> {declaration.countryOfOrigin} → {declaration.countryOfDestination}</p>
                </div>

                {/* Financial Valuation */}
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Financial Assessment & Duty
                  </h4>
                  <p className="text-slate-300"><strong>Filing Currency:</strong> {declaration.currency}</p>
                  <p className="text-slate-300"><strong>Invoice Value:</strong> {declaration.currency} {declaration.invoiceValue.toLocaleString()}</p>
                  <p className="text-slate-300"><strong>Freight:</strong> {declaration.currency} {declaration.freightValue.toLocaleString()}</p>
                  <p className="text-slate-300"><strong>Insurance:</strong> {declaration.currency} {declaration.insuranceValue.toLocaleString()}</p>
                  <p className="text-slate-200 font-bold border-t border-slate-800 pt-1">
                    Customs Value: {declaration.currency} {declaration.customsValue.toLocaleString()}
                  </p>
                  <p className="text-slate-300"><strong>Basic Customs Duty:</strong> {declaration.currency} {declaration.dutyAmount.toLocaleString()}</p>
                  <p className="text-slate-300"><strong>IGST / Tax:</strong> {declaration.currency} {declaration.taxAmount.toLocaleString()}</p>
                  <p className="text-emerald-400 font-extrabold text-sm border-t border-slate-800 pt-1">
                    Total Payable: {declaration.currency} {declaration.totalPayable.toLocaleString()}
                  </p>
                </div>

                {/* Filing Dates & Payment */}
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 text-xs">
                    Filing & Payment Details
                  </h4>
                  <p className="text-slate-300"><strong>Filing Date:</strong> {declaration.filingDate || "Pending Filing"}</p>
                  <p className="text-slate-300"><strong>Assessment Date:</strong> {declaration.assessmentDate || "N/A"}</p>
                  <p className="text-slate-300"><strong>Clearance Date:</strong> {declaration.clearanceDate || "Pending Clearance"}</p>
                  <p className="text-slate-300"><strong>Duty Status:</strong> {declaration.dutyPaymentStatus}</p>
                  {declaration.paymentReference && (
                    <p className="text-slate-300">
                      <strong>Payment Ref:</strong> {declaration.paymentReference} ({declaration.paymentDate})
                    </p>
                  )}
                  {declaration.holdReason && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                      <p className="font-bold">On Hold Reason:</p>
                      <p className="italic">{declaration.holdReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS AREA */}
          {activeTab === "documents" && (
            <div className="space-y-4 text-xs">
              <DocumentCompletenessWidget jobId={declaration.jobId} />
            </div>
          )}

          {/* TAB 3: PHYSICAL EXAMINATION */}
          {activeTab === "examination" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-slate-100">Customs Physical Examination Record</h4>
                <Button variant="outline" size="xs" icon={Search} onClick={() => openExaminationModal(declaration)}>
                  Update / Schedule Exam
                </Button>
              </div>

              {declaration.examination ? (
                <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                  <p className="text-slate-300"><strong>Inspection Location:</strong> {declaration.examination.examinationLocation}</p>
                  <p className="text-slate-300"><strong>Customs Inspector:</strong> {declaration.examination.examinerName}</p>
                  <p className="text-slate-300"><strong>Scheduled Date:</strong> {declaration.examination.examinationDate}</p>
                  <p className="text-slate-300">
                    <strong>Inspection Result:</strong>{" "}
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      declaration.examination.result === "Passed" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {declaration.examination.result}
                    </span>
                  </p>
                  {declaration.examination.remarks && (
                    <p className="text-slate-300"><strong>Inspector Remarks:</strong> {declaration.examination.remarks}</p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 py-4 italic">No physical container examination scheduled for this declaration.</p>
              )}
            </div>
          )}

          {/* TAB 4: QUERIES */}
          {activeTab === "queries" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm text-slate-100">Customs Queries & Regulatory Objections</h4>
                <Button variant="outline" size="xs" icon={AlertTriangle} onClick={() => openQueryModal(declaration)}>
                  Manage Queries
                </Button>
              </div>

              {declaration.queries.length > 0 ? (
                <div className="space-y-3">
                  {declaration.queries.map((q) => (
                    <div key={q.id} className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-300 text-xs">{q.queryNumber}: {q.title}</span>
                        <StatusBadge status={q.status === "Responded" ? "Verified" : "Pending"} />
                      </div>
                      <p className="text-slate-300 text-[11px]">{q.description}</p>
                      {q.response && (
                        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                          <p className="font-bold text-sky-400">Response Submitted by {q.respondedBy}:</p>
                          <p className="text-slate-200 italic">{q.response}</p>
                          <span className="text-[10px] text-slate-500 block">Date: {q.respondedDate}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 py-4 italic">No customs queries or objections filed.</p>
              )}
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
                Customs Clearance Milestone Lifecycle
              </h4>

              <Timeline
                events={declaration.milestones.map((m) => ({
                  id: m.id,
                  title: m.title,
                  description: m.completedBy ? `Completed by ${m.completedBy}` : "Awaiting operational step",
                  timestamp: m.timestamp || "Pending",
                  completed: m.status === "Completed",
                }))}
              />
            </div>
          )}

          {/* TAB 6: ACTIVITIES */}
          {activeTab === "activities" && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
                Audit Trail & History
              </h4>

              <div className="space-y-2">
                {declaration.activities.map((act) => (
                  <div key={act.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-400">{act.title}</span>
                      <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{act.description}</p>
                    <span className="text-[10px] text-slate-500 block">By: {act.performedBy}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Dialog Modals */}
      <CustomsFormModal isOpen={isFormModalOpen} onClose={closeFormModal} declaration={selectedDeclaration} />

      <CustomsFilingModal isOpen={isFilingModalOpen} onClose={closeFilingModal} declaration={selectedDeclaration} />

      <DutyPaymentModal isOpen={isDutyModalOpen} onClose={closeDutyModal} declaration={selectedDeclaration} />

      <ExaminationModal
        isOpen={isExaminationModalOpen}
        onClose={closeExaminationModal}
        declaration={selectedDeclaration}
      />

      <CustomsQueryModal isOpen={isQueryModalOpen} onClose={closeQueryModal} declaration={selectedDeclaration} />
    </div>
  );
}
