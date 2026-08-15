"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { WAREHOUSE_TYPES, Warehouse } from "@/types/warehouse";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { toast } from "sonner";

const warehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  code: z.string().min(1, "Warehouse code is required"),
  warehouseType: z.string().min(1, "Type is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().default("India"),
  capacitySqFt: z.number().min(1, "Capacity required"),
  managerName: z.string().min(1, "Manager name is required"),
  managerPhone: z.string().min(1, "Manager phone is required"),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse?: Warehouse | null;
}

export function WarehouseFormModal({ isOpen, onClose, warehouse }: WarehouseFormModalProps) {
  const { fetchWarehouses } = useWarehouseStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      warehouseType: "Distribution Center",
      country: "India",
      capacitySqFt: 80000,
      city: "Bhiwandi",
      state: "Maharashtra",
    },
  });

  useEffect(() => {
    if (warehouse) {
      setValue("name", warehouse.name);
      setValue("code", warehouse.code);
      setValue("warehouseType", warehouse.warehouseType);
      setValue("address", warehouse.address);
      setValue("city", warehouse.city);
      setValue("state", warehouse.state);
      setValue("country", warehouse.country);
      setValue("capacitySqFt", warehouse.capacitySqFt);
      setValue("managerName", warehouse.managerName);
      setValue("managerPhone", warehouse.managerPhone);
    }
  }, [warehouse, setValue]);

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      toast.success(`Warehouse ${data.code} configuration saved.`);
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to submit warehouse form:", err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={warehouse ? `Edit Warehouse: ${warehouse.code}` : "Create New Warehouse Facility"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Warehouse Code *
            </label>
            <Input {...register("code")} placeholder="e.g. WH-BHW-001" />
            {errors.code && <span className="text-rose-400 text-[10px]">{errors.code.message}</span>}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Facility Name *
            </label>
            <Input {...register("name")} placeholder="e.g. Bhiwandi Central Warehouse" />
            {errors.name && <span className="text-rose-400 text-[10px]">{errors.name.message}</span>}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Facility Type *
            </label>
            <Select
              value={watch("warehouseType")}
              onChange={(e) => setValue("warehouseType", e.target.value as any)}
              options={WAREHOUSE_TYPES.map((t) => ({ label: t, value: t }))}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Total Storage Capacity (SQ FT) *
            </label>
            <Input
              type="number"
              {...register("capacitySqFt", { valueAsNumber: true })}
              placeholder="80000"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Warehouse Manager *
            </label>
            <Input {...register("managerName")} placeholder="e.g. Aamir Khan" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Manager Phone *
            </label>
            <Input {...register("managerPhone")} placeholder="+91 98200 11223" />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Facility Address *
            </label>
            <Input {...register("address")} placeholder="Plot 14B, Bhiwandi Freight Complex" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">City *</label>
            <Input {...register("city")} placeholder="Bhiwandi" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">State *</label>
            <Input {...register("state")} placeholder="Maharashtra" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            {warehouse ? "Update Warehouse" : "Create Warehouse"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
