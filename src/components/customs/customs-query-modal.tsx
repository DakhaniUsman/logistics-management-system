"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CustomsDeclaration, CustomsQuery } from "@/types/customs";
import { useCustomsStore } from "@/store/use-customs-store";
import { useDocumentStore } from "@/store/use-document-store";
import { AlertTriangle, Send, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CustomsQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  declaration: CustomsDeclaration | null;
}

export function CustomsQueryModal({ isOpen, onClose, declaration: dec }: CustomsQueryModalProps) {
  const { raiseQuery, respondToQuery } = useCustomsStore();
  const { documents } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<"respond" | "raise">("respond");

  // Raise Query Form State
  const [queryTitle, setQueryTitle] = useState("");
  const [queryDesc, setQueryDesc] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("High");

  // Respond Form State
  const [responseText, setResponseText] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");

  if (!dec) return null;

  const openQuery = dec.queries.find((q) => q.status === "Open" || q.status === "In Progress") || dec.queries[0];

  const handleRaiseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryTitle.trim()) {
      toast.error("Query title is required.");
      return;
    }
    await raiseQuery(dec.id, {
      title: queryTitle,
      description: queryDesc,
      priority,
    });
    setQueryTitle("");
    setQueryDesc("");
    onClose();
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) {
      toast.error("Response text is required.");
      return;
    }
    if (!openQuery) {
      toast.error("No active query found to respond to.");
      return;
    }
    await respondToQuery(dec.id, openQuery.id, responseText, selectedDocId || undefined);
    setResponseText("");
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Customs Query Management: ${dec.declarationNumber}`} maxWidth="lg">
      <div className="space-y-4 text-xs pt-1">
        {/* Toggle Mode */}
        <div className="flex border-b border-slate-800 gap-4 text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveTab("respond")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "respond" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-slate-200"
            }`}
          >
            Respond to Query ({dec.queries.length})
          </button>
          <button
            onClick={() => setActiveTab("raise")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "raise" ? "border-sky-400 text-sky-400" : "border-transparent hover:text-slate-200"
            }`}
          >
            Raise New Customs Query
          </button>
        </div>

        {activeTab === "respond" ? (
          <div>
            {openQuery ? (
              <form onSubmit={handleResponseSubmit} className="space-y-3">
                {/* Active Query Display Box */}
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1.5 text-amber-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      {openQuery.queryNumber}: {openQuery.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                      Priority: {openQuery.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-100/90 leading-relaxed">
                    {openQuery.description}
                  </p>
                  <span className="text-[10px] opacity-75 block">Raised on: {openQuery.raisedDate}</span>
                </div>

                {/* Response Text */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Customs Response & Explanation *
                  </label>
                  <Input
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Provide official response, clarification, or compliance justification..."
                  />
                </div>

                {/* Attach Document from Document Center */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Attach Supporting Document from Document Center (Optional)
                  </label>
                  <Select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    options={[
                      { label: "None / No Document Attached", value: "" },
                      ...documents.map((d) => ({
                        label: `${d.documentNumber} - ${d.title} (${d.documentType})`,
                        value: d.id,
                      })),
                    ]}
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button variant="outline" size="sm" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" icon={Send}>
                    Submit Query Response
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-slate-400 text-xs py-4 text-center italic">
                No active open customs queries for this declaration.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleRaiseSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Query Title / Objection Topic *
              </label>
              <Input
                value={queryTitle}
                onChange={(e) => setQueryTitle(e.target.value)}
                placeholder="e.g. HS Code Classification Discrepancy"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Query Priority
              </label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                options={[
                  { label: "Low Priority", value: "Low" },
                  { label: "Medium Priority", value: "Medium" },
                  { label: "High Priority", value: "High" },
                  { label: "Critical Priority", value: "Critical" },
                ]}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Customs Authority Remarks / Description *
              </label>
              <Input
                value={queryDesc}
                onChange={(e) => setQueryDesc(e.target.value)}
                placeholder="Enter exact details of customs authority query or document requirement..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={AlertTriangle} className="bg-amber-600 hover:bg-amber-700 text-white">
                Raise Query
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
}
