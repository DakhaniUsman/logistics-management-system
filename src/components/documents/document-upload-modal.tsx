"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DOCUMENT_TYPES, DOCUMENT_CATEGORIES, DocumentType, DocumentCategory } from "@/types/document";
import { useDocumentStore } from "@/store/use-document-store";
import { useJobStore } from "@/store/use-job-store";
import { useBookingStore } from "@/store/use-booking-store";
import { MOCK_SHIPMENTS } from "@/data/mock/shipment-data";
import { MOCK_CONTAINERS } from "@/data/mock/container-data";
import { MOCK_CUSTOMERS } from "@/data/mock/crm-data";
import { Upload, FileText, X, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";

const uploadSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  category: z.string().min(1, "Category is required"),
  title: z.string().optional(),
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().default("PDF"),
  fileSize: z.number().default(2450000),
  isRequired: z.boolean().default(true),
  isConfidential: z.boolean().default(false),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
  customerId: z.string().optional(),
  jobId: z.string().optional(),
  shipmentId: z.string().optional(),
  bookingId: z.string().optional(),
  containerId: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultJobId?: string;
  defaultShipmentId?: string;
  defaultBookingId?: string;
  defaultContainerId?: string;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  defaultJobId,
  defaultShipmentId,
  defaultBookingId,
  defaultContainerId,
}: DocumentUploadModalProps) {
  const { uploadDocument } = useDocumentStore();
  const { jobs } = useJobStore();
  const { bookings } = useBookingStore();

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mockFileName, setMockFileName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      documentType: "Bill of Lading",
      category: "Shipping",
      fileType: "PDF",
      fileSize: 2450000,
      isRequired: true,
      isConfidential: false,
      jobId: defaultJobId || "",
      shipmentId: defaultShipmentId || "",
      bookingId: defaultBookingId || "",
      containerId: defaultContainerId || "",
    },
  });

  const selectedJobId = watch("jobId");
  const selectedShipmentId = watch("shipmentId");
  const selectedBookingId = watch("bookingId");
  const selectedDocType = watch("documentType");

  // Filter cascading options
  const availableShipments = selectedJobId
    ? MOCK_SHIPMENTS.filter((s) => s.jobId.toLowerCase() === selectedJobId.toLowerCase())
    : MOCK_SHIPMENTS;

  const availableBookings = selectedShipmentId
    ? bookings.filter((b) => b.shipmentId?.toLowerCase() === selectedShipmentId.toLowerCase())
    : selectedJobId
    ? bookings.filter((b) => b.jobId?.toLowerCase() === selectedJobId.toLowerCase())
    : bookings;

  const availableContainers = selectedBookingId
    ? MOCK_CONTAINERS.filter((c) => c.bookingId?.toLowerCase() === selectedBookingId.toLowerCase())
    : selectedShipmentId
    ? MOCK_CONTAINERS.filter((c) => c.shipmentId?.toLowerCase() === selectedShipmentId.toLowerCase())
    : MOCK_CONTAINERS;

  // Handle Document Type change -> auto set Category
  const handleDocTypeChange = (typeVal: string) => {
    setValue("documentType", typeVal);
    const match = DOCUMENT_TYPES.find((dt) => dt.type === typeVal);
    if (match) {
      setValue("category", match.category);
    }
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMockFileName(file.name);
      setValue("fileName", file.name);

      const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
      setValue("fileType", ext);
      setValue("fileSize", file.size);
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    try {
      // Simulate progress
      setUploadProgress(20);
      await new Promise((r) => setTimeout(r, 150));
      setUploadProgress(60);
      await new Promise((r) => setTimeout(r, 200));
      setUploadProgress(100);

      // Find Customer name and numbers
      const matchedJob = jobs.find((j) => j.id.toLowerCase() === data.jobId?.toLowerCase());
      const matchedShipment = MOCK_SHIPMENTS.find((s) => s.id.toLowerCase() === data.shipmentId?.toLowerCase());
      const matchedBooking = bookings.find((b) => b.id.toLowerCase() === data.bookingId?.toLowerCase());
      const matchedContainer = MOCK_CONTAINERS.find(
        (c) => c.id.toLowerCase() === data.containerId?.toLowerCase() || c.containerNumber === data.containerId
      );

      const customerName =
        matchedJob?.customerName ||
        matchedShipment?.customerName ||
        matchedBooking?.customerName ||
        "ABC Electronics Pvt Ltd";

      await uploadDocument({
        documentType: data.documentType as DocumentType,
        category: data.category as DocumentCategory,
        title: data.title || `${data.documentType} - ${data.fileName}`,
        fileName: data.fileName || mockFileName || `${data.documentType.replace(/\s+/g, "_")}.pdf`,
        fileType: data.fileType || "PDF",
        fileSize: data.fileSize || 2450000,
        isRequired: data.isRequired,
        isConfidential: data.isConfidential,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        description: data.description,
        customerName: customerName,
        jobId: data.jobId,
        jobNumber: matchedJob?.jobNumber || data.jobId,
        shipmentId: data.shipmentId,
        shipmentNumber: matchedShipment?.shipmentNumber || data.shipmentId,
        bookingId: data.bookingId,
        bookingNumber: matchedBooking?.bookingNumber || data.bookingId,
        containerId: data.containerId,
        containerNumber: matchedContainer?.containerNumber || data.containerId,
      });

      setUploadProgress(null);
      reset();
      onClose();
    } catch (err) {
      setUploadProgress(null);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Upload Operational Document" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs pt-1">
        {/* Upload Zone */}
        <div className="p-4 border-2 border-dashed border-sky-500/40 rounded-xl bg-slate-900/40 hover:border-sky-400 transition-colors text-center relative group cursor-pointer">
          <input
            type="file"
            onChange={handleFileDrop}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>

            <div>
              <p className="font-bold text-slate-200">
                {selectedFile ? selectedFile.name : "Drag & drop file here or click to browse"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports PDF, PNG, JPG, XLSX, DOCX (Max 25MB)
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar if uploading */}
        {uploadProgress !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-sky-400">
              <span>Simulating Secure Upload...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Document Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Document Type *
            </label>
            <Select
              value={selectedDocType}
              onChange={(e) => handleDocTypeChange(e.target.value)}
              options={DOCUMENT_TYPES.map((dt) => ({ label: `${dt.type} (${dt.category})`, value: dt.type }))}
            />
            {errors.documentType && (
              <span className="text-rose-400 text-[10px] mt-0.5">{errors.documentType.message}</span>
            )}
          </div>

          {/* Document Title */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Document Title / Label
            </label>
            <Input
              {...register("title")}
              placeholder="e.g. Master Ocean Bill of Lading v1"
            />
          </div>

          {/* Cascading Selectors: Job */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Related Operational Job
            </label>
            <Select
              value={watch("jobId") || ""}
              onChange={(e) => {
                setValue("jobId", e.target.value);
                setValue("shipmentId", "");
                setValue("bookingId", "");
                setValue("containerId", "");
              }}
              options={[
                { label: "None / General Document", value: "" },
                ...jobs.map((j) => ({ label: `${j.jobNumber || j.id} - ${j.customerName}`, value: j.id })),
              ]}
            />
          </div>

          {/* Cascading Selectors: Shipment */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Related Shipment
            </label>
            <Select
              value={watch("shipmentId") || ""}
              onChange={(e) => setValue("shipmentId", e.target.value)}
              options={[
                { label: "None", value: "" },
                ...availableShipments.map((s) => ({
                  label: `${s.shipmentNumber} (${s.origin} → ${s.destination})`,
                  value: s.id,
                })),
              ]}
            />
          </div>

          {/* Cascading Selectors: Booking */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Related Carrier Booking
            </label>
            <Select
              value={watch("bookingId") || ""}
              onChange={(e) => setValue("bookingId", e.target.value)}
              options={[
                { label: "None", value: "" },
                ...availableBookings.map((b) => ({
                  label: `${b.bookingNumber} (${b.carrierName})`,
                  value: b.id,
                })),
              ]}
            />
          </div>

          {/* Cascading Selectors: Container */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Related Container
            </label>
            <Select
              value={watch("containerId") || ""}
              onChange={(e) => setValue("containerId", e.target.value)}
              options={[
                { label: "None", value: "" },
                ...availableContainers.map((c) => ({
                  label: `${c.containerNumber} (${c.containerType})`,
                  value: c.id,
                })),
              ]}
            />
          </div>

          {/* Issue Date */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Issue Date
            </label>
            <Input type="date" {...register("issueDate")} />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Expiry Date (If applicable)
            </label>
            <Input type="date" {...register("expiryDate")} />
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Notes / Description
          </label>
          <Input
            {...register("description")}
            placeholder="Add operational notes or compliance details..."
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={watch("isRequired")}
                onCheckedChange={(v) => setValue("isRequired", v)}
              />
              <span className="text-slate-300 font-bold text-xs">Mandatory Requirement</span>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={watch("isConfidential")}
                onCheckedChange={(v) => setValue("isConfidential", v)}
              />
              <span className="text-slate-300 font-bold text-xs">Confidential Document</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            Upload Document
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
