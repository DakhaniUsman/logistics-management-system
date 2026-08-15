"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CustomsDeclaration } from "@/types/customs";
import { useCustomsStore } from "@/store/use-customs-store";
import { Search, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ExaminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  declaration: CustomsDeclaration | null;
}

export function ExaminationModal({ isOpen, onClose, declaration: dec }: ExaminationModalProps) {
  const { scheduleExamination, completeExamination } = useCustomsStore();

  const [mode, setMode] = useState<"schedule" | "result">("schedule");
  const [examDate, setExamDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [examLocation, setExamLocation] = useState("JNPT Container Examination Shed #4");
  const [examinerName, setExaminerName] = useState("Inspector V. K. Singh");

  const [result, setResult] = useState<"Passed" | "Issues Found">("Passed");
  const [remarks, setRemarks] = useState("Physical seal integrity verified. Goods match invoice packing list.");

  if (!dec) return null;

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await scheduleExamination(
      dec.id,
      {
        date: examDate,
        location: examLocation,
        examiner: examinerName,
        remarks,
      }
    );
    onClose();
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeExamination(dec.id, result, remarks);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Customs Examination: ${dec.declarationNumber}`} maxWidth="md">
      <div className="space-y-4 text-xs pt-1">
        {/* Toggle Mode */}
        <div className="flex border-b border-slate-800 gap-4 text-xs font-bold text-slate-400">
          <button
            onClick={() => setMode("schedule")}
            className={`pb-2 border-b-2 transition-colors ${
              mode === "schedule" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-slate-200"
            }`}
          >
            Schedule Examination
          </button>
          <button
            onClick={() => setMode("result")}
            className={`pb-2 border-b-2 transition-colors ${
              mode === "result" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-slate-200"
            }`}
          >
            Record Inspection Result
          </button>
        </div>

        {mode === "schedule" ? (
          <form onSubmit={handleScheduleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Examination Date *
              </label>
              <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Examination Shed / Location *
              </label>
              <Input
                value={examLocation}
                onChange={(e) => setExamLocation(e.target.value)}
                placeholder="e.g. JNPT Examination Yard Shed #4"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Customs Inspector Name *
              </label>
              <Input
                value={examinerName}
                onChange={(e) => setExaminerName(e.target.value)}
                placeholder="e.g. Inspector V. K. Singh"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Examination Instructions / Notes
              </label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Check seal number, packaging labels, and cargo weight..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Calendar}>
                Schedule Examination
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResultSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Inspection Result *
              </label>
              <Select
                value={result}
                onChange={(e) => setResult(e.target.value as any)}
                options={[
                  { label: "Passed — Goods match declaration", value: "Passed" },
                  { label: "Issues Found — Discrepancy observed", value: "Issues Found" },
                ]}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Inspection Remarks / Auditor Notes *
              </label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter detailed inspection findings..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className={result === "Passed" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
              >
                Save Inspection Result
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
}
