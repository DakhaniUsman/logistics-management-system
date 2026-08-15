"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Delivery } from "@/types/delivery";
import { useDeliveryStore } from "@/store/use-delivery-store";
import { AlertOctagon, Calendar, RefreshCw } from "lucide-react";

interface DeliveryFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: Delivery | null;
}

export function DeliveryFailureModal({ isOpen, onClose, delivery: del }: DeliveryFailureModalProps) {
  const { markFailed, rescheduleDelivery } = useDeliveryStore();

  const [mode, setMode] = useState<"fail" | "reschedule">("fail");
  const [reasonCategory, setReasonCategory] = useState("Recipient Unavailable");
  const [remarks, setRemarks] = useState("");
  const [newDate, setNewDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [newWindow, setNewWindow] = useState("Morning (10:00 AM - 12:00 PM)");

  if (!del) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullReason = remarks ? `${reasonCategory} — ${remarks}` : reasonCategory;

    if (mode === "fail") {
      await markFailed(del.id, fullReason);
    } else {
      await rescheduleDelivery(del.id, newDate, newWindow, fullReason);
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "fail" ? `Record Delivery Failure: ${del.deliveryNumber}` : `Reschedule Delivery: ${del.deliveryNumber}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1">
        <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 space-y-1 text-rose-300">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Delivery Attempt #{del.attemptNumber} Exception</span>
          </div>
          <p className="text-[11px] opacity-90">
            Customer: <strong>{del.customerName}</strong> • Recipient: <strong>{del.deliveryContactPerson}</strong>
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <Button
            type="button"
            variant={mode === "fail" ? "primary" : "outline"}
            size="xs"
            className="flex-1"
            onClick={() => setMode("fail")}
          >
            Record Failed Attempt
          </Button>

          <Button
            type="button"
            variant={mode === "reschedule" ? "primary" : "outline"}
            size="xs"
            className="flex-1"
            onClick={() => setMode("reschedule")}
          >
            Reschedule Next Attempt
          </Button>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Failure / Exception Reason *
          </label>
          <Select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            options={[
              { label: "Recipient Unavailable / Unresponsive", value: "Recipient Unavailable" },
              { label: "Customer Warehouse Facility Closed", value: "Customer Warehouse Closed" },
              { label: "Customer Rejected Delivery", value: "Customer Rejected Delivery" },
              { label: "Incorrect Delivery Address", value: "Incorrect Address" },
              { label: "Documentation Discrepancy", value: "Documentation Issue" },
            ]}
          />
        </div>

        {mode === "reschedule" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                New Delivery Date *
              </label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Time Window *
              </label>
              <Select
                value={newWindow}
                onChange={(e) => setNewWindow(e.target.value)}
                options={[
                  { label: "Morning (10:00 AM - 12:00 PM)", value: "Morning (10:00 AM - 12:00 PM)" },
                  { label: "Afternoon (01:00 PM - 04:00 PM)", value: "Afternoon (01:00 PM - 04:00 PM)" },
                  { label: "Evening (05:00 PM - 08:00 PM)", value: "Evening (05:00 PM - 08:00 PM)" },
                ]}
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Driver & Dispatcher Remarks
          </label>
          <Input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Security guard reported warehouse closed for local holiday."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            icon={mode === "fail" ? AlertOctagon : Calendar}
            className={mode === "fail" ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-sky-600 hover:bg-sky-700 text-white"}
          >
            {mode === "fail" ? "Mark Attempt Failed" : "Confirm Rescheduled Date"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
