"use client";

import React, { useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Building2, Boxes, RefreshCw, Plus, Edit, Layers, MapPin } from "lucide-react";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import { WarehouseFormModal } from "@/components/warehouse/warehouse-form-modal";

export default function WarehouseLocationsPage() {
  const {
    warehouses,
    zones,
    locations,
    fetchWarehouses,
    openWarehouseModal,
    isWarehouseModalOpen,
    closeWarehouseModal,
    selectedWarehouse,
  } = useWarehouseStore();

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <PageHeader
        title="WAREHOUSE LOCATIONS & STORAGE CAPACITY DIRECTORY"
        subtitle="Facility directory, zone slotting, rack location hierarchy (Aisle-Rack-Shelf-Bin), and storage utilization tracking."
        breadcrumbs={[{ label: "Warehouse", href: "/warehouse/inventory" }, { label: "Warehouses & Locations" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchWarehouses()}>
              Refresh
            </Button>

            <Button variant="primary" size="sm" icon={Plus} onClick={() => openWarehouseModal(null)}>
              Add New Warehouse
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard title="TOTAL FACILITIES" value={warehouses.length.toString()} icon={Building2} />
        <StatsCard title="STORAGE ZONES" value={zones.length.toString()} icon={Layers} />
        <StatsCard title="RACK LOCATIONS" value={locations.length.toString()} icon={Boxes} />
        <StatsCard title="AVG UTILIZATION" value="78%" icon={Boxes} />
      </div>

      {/* Facilities & Location Cards */}
      <div className="space-y-6">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm">{wh.name} ({wh.code})</h3>
                  <span className="text-slate-400 text-xs">
                    {wh.address}, {wh.city}, {wh.state} • Manager: {wh.managerName} ({wh.managerPhone})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={wh.status} />
                <Button variant="outline" size="xs" icon={Edit} onClick={() => openWarehouseModal(wh)}>
                  Edit Specs
                </Button>
              </div>
            </div>

            {/* Zones Grid */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                Warehouse Zones & Storage Slotting
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {zones.filter((z) => z.warehouseId === wh.id).map((zone) => (
                  <div key={zone.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-400">{zone.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{zone.code}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Type: {zone.zoneType}</span>
                        <span className="font-bold text-emerald-400">
                          {Math.round((zone.occupiedUnits / zone.capacityUnits) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${Math.round((zone.occupiedUnits / zone.capacityUnits) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <WarehouseFormModal
        isOpen={isWarehouseModalOpen}
        onClose={closeWarehouseModal}
        warehouse={selectedWarehouse}
      />
    </div>
  );
}
