"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Document } from "@/types/document";
import { useDocumentStore } from "@/store/use-document-store";
import { Upload, History, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DocumentReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function DocumentReplaceModal({ isOpen, onClose, document: doc }: DocumentReplaceModalProps) {
  const { replaceDocument } = useDocumentStore();
  const [newFileName, setNewFileName] = useState("");
  const [reason, setReason] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!doc) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setNewFileName(file.name);
    }
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newFileName.trim() || `${doc.documentType.replace(/\s+/g, "_")}_v${doc.version + 1}.pdf`;

    await replaceDocument(
      doc.id,
      {
        fileName: finalName,
        fileType: finalName.split(".").pop()?.toUpperCase() || "PDF",
        fileSize: selectedFile ? selectedFile.size : 2500000,
        reason: reason.trim() || "Corrected cargo details & consignee address.",
      },
      "Dakhani Usman"
    );

    setNewFileName("");
    setReason("");
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Replace Document: ${doc.documentNumber}`} maxWidth="md">
      <form onSubmit={handleReplaceSubmit} className="space-y-4 text-xs pt-1">
        {/* Current Document Summary */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Active Version</span>
          <span className="font-bold text-slate-200 block text-xs">
            {doc.fileName} (v{doc.version})
          </span>
          <span className="text-[11px] text-slate-400">
            Uploaded by {doc.uploadedBy} on {doc.uploadedAt}
          </span>
        </div>

        {/* Drop / Select File */}
        <div className="p-4 border-2 border-dashed border-sky-500/40 rounded-xl bg-slate-900/40 hover:border-sky-400 transition-colors text-center relative cursor-pointer">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <p className="font-bold text-slate-200">
              {selectedFile ? selectedFile.name : "Select Replacement File"}
            </p>
            <p className="text-[10px] text-slate-400">Target version will increment to v{doc.version + 1}</p>
          </div>
        </div>

        {/* Replacement File Name */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Replacement File Name
          </label>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder={`${doc.documentType.replace(/\s+/g, "_")}_v${doc.version + 1}.pdf`}
          />
        </div>

        {/* Reason for Replacement */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Replacement Reason / Change Note
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Corrected consignee address and weight figures..."
          />
        </div>

        {/* Info Note */}
        <p className="text-[10px] text-slate-400 italic">
          * Note: Version v{doc.version} will be preserved in document history. Document will return to Pending Verification status.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" icon={History}>
            Upload Version v{doc.version + 1}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
