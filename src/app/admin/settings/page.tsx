"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAppStore, ActiveRegion, REGION_CONFIGS } from "@/store/use-app-store";
import { useCrmStore } from "@/store/use-crm-store";
import { useJobStore } from "@/store/use-job-store";
import { useShipmentStore } from "@/store/use-shipment-store";
import { useWarehouseStore } from "@/store/use-warehouse-store";
import {
  Building2,
  MapPin,
  Ship,
  Plane,
  Truck,
  CheckCircle2,
  Globe2,
  RefreshCw,
  Sliders,
  Shield,
  Layers,
  ArrowRight,
  Database,
  Anchor,
  Compass,
  Cpu,
  Boxes,
  Users2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { activeRegion, setActiveRegion, currentOrg } = useAppStore();
  const { leads, companies } = useCrmStore();
  const { jobs } = useJobStore();
  const { shipments } = useShipmentStore();
  const { warehouses } = useWarehouseStore();

  const [activeTab, setActiveTab] = useState<"datasets" | "organization" | "customs">("datasets");

  const regions: {
    id: ActiveRegion;
    title: string;
    badge: string;
    tagline: string;
    primaryPort: string;
    secondaryPort: string;
    airport: string;
    corridor: string;
    ediCode: string;
    stats: { leads: string; jobs: string; shipments: string; warehouses: string };
    gradient: string;
  }[] = [
    {
      id: "chennai",
      title: "Chennai Operations Hub (HQ)",
      badge: "Headquarters & Primary Hub",
      tagline: "Coromandel Coast Gateway & South India Logistics Corridor",
      primaryPort: "Chennai Sea Port (Madras Port Trust)",
      secondaryPort: "Kattupalli Adani Port & Ennore Port",
      airport: "MAA - Chennai International Air Cargo",
      corridor: "Sriperumbudur Auto SEZ • Oragadam Industrial Park • Guindy • Ambattur",
      ediCode: "INMAA1 / INKAT1",
      stats: {
        leads: "15+ Chennai Leads",
        jobs: "5 Active Consignments",
        shipments: "2 Ocean & Air Legs",
        warehouses: "4 Mega Facilities",
      },
      gradient: "from-sky-500/10 via-blue-500/5 to-transparent border-sky-500/30",
    },
    {
      id: "mumbai",
      title: "Mumbai Regional Branch",
      badge: "Western Freight Corridor",
      tagline: "JNPT Western Freight Corridor & Gateway Hub",
      primaryPort: "Jawaharlal Nehru Port Trust (JNPT)",
      secondaryPort: "Mumbai Port Trust (MbPT)",
      airport: "BOM - Chhatrapati Shivaji Maharaj Cargo",
      corridor: "Bhiwandi Warehousing Hub • Panvel Logistics Corridor • Nhava Sheva",
      ediCode: "INNSA1 / INBOM4",
      stats: {
        leads: "25+ Mumbai Leads",
        jobs: "5 Active Consignments",
        shipments: "2 Master Shipments",
        warehouses: "2 Facilities",
      },
      gradient: "from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30",
    },
    {
      id: "all",
      title: "Consolidated Multi-Hub (All Regions)",
      badge: "National Pan-India View",
      tagline: "Unified Multi-Region Enterprise Overview",
      primaryPort: "Pan-India Gateways (Chennai Port, JNPT, Kattupalli)",
      secondaryPort: "Intermodal Container Network",
      airport: "Pan-India Air Cargo Hubs",
      corridor: "National Multi-Modal Freight Network & Corridors",
      ediCode: "ALL PORTS (Multi-EDI)",
      stats: {
        leads: "40+ Total Leads",
        jobs: "10 Combined Jobs",
        shipments: "All Active Shipments",
        warehouses: "6 Facilities Across India",
      },
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30",
    },
  ];

  const handleSelectRegion = (regionId: ActiveRegion) => {
    setActiveRegion(regionId, true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Administration Settings"
        subtitle="Configure active operational datasets, regional gateway branches, customs EDI routing, and multi-branch preferences."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Administration", href: "/admin/settings" },
          { label: "Settings" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                setActiveRegion(activeRegion, true);
                toast.success("Dataset refreshed successfully");
              }}
            >
              Refresh Active Data
            </Button>
            <Link href="/sales/leads">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                View Active Leads ({leads.length})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("datasets")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "datasets"
              ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Active Dataset & Region Selection</span>
        </button>

        <button
          onClick={() => setActiveTab("organization")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "organization"
              ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Branch Profile & Ports</span>
        </button>

        <button
          onClick={() => setActiveTab("customs")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "customs"
              ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Customs EDI & ICEGATE Settings</span>
        </button>
      </div>

      {activeTab === "datasets" && (
        <div className="space-y-6">
          {/* Active Status Hero Card */}
          <Card className="relative overflow-hidden bg-gradient-to-r from-sky-900/10 via-sky-600/5 to-transparent border-sky-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/20">
                    <Compass className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Active Operational Hub:{" "}
                      <span className="text-sky-600 dark:text-sky-400">
                        {REGION_CONFIGS[activeRegion].name}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {REGION_CONFIGS[activeRegion].tagline}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Branch Identifier
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    {REGION_CONFIGS[activeRegion].code}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Reactive Dataset</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Regional Hub Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Select Regional Operations Dataset
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any regional hub below to switch the application dataset immediately.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">3 Datasets Available</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {regions.map((region) => {
                const isSelected = activeRegion === region.id;
                return (
                  <div
                    key={region.id}
                    onClick={() => handleSelectRegion(region.id)}
                    className={`relative rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-white dark:bg-slate-900/90 border-sky-500 ring-2 ring-sky-500/20 shadow-lg dark:shadow-sky-500/5 scale-[1.01]"
                        : "bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900/70"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isSelected
                              ? "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {region.badge}
                        </span>

                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Currently Active</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Tagline */}
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        {region.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {region.tagline}
                      </p>

                      {/* Ports & Corridors Detail */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <Ship className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">Gateway Port: </span>
                            <span>{region.primaryPort}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <Plane className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">Air Cargo: </span>
                            <span>{region.airport}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">Corridors: </span>
                            <span className="text-slate-500 dark:text-slate-400">{region.corridor}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mini Statistics Grid */}
                      <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-center">
                        <div className="p-1">
                          <span className="text-[10px] text-slate-400 block font-semibold">CRM Leads</span>
                          <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {region.stats.leads}
                          </span>
                        </div>
                        <div className="p-1">
                          <span className="text-[10px] text-slate-400 block font-semibold">Active Jobs</span>
                          <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {region.stats.jobs}
                          </span>
                        </div>
                        <div className="p-1">
                          <span className="text-[10px] text-slate-400 block font-semibold">Shipments</span>
                          <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {region.stats.shipments}
                          </span>
                        </div>
                        <div className="p-1">
                          <span className="text-[10px] text-slate-400 block font-semibold">Warehouses</span>
                          <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {region.stats.warehouses}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <Button
                        variant={isSelected ? "primary" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRegion(region.id);
                        }}
                      >
                        {isSelected ? "Active Dataset Selected" : `Switch to ${region.id === "all" ? "All Regions" : region.id.toUpperCase()} Data`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Deep Link Shortcuts to Newly Loaded Data */}
          <Card className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Verify & Inspect Active Hub Data Across Modules</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/sales/leads"
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-sky-500/50 hover:bg-sky-50/20 dark:hover:bg-sky-500/10 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <Users2 className="w-4 h-4 text-sky-500" />
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {leads.length}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 block truncate">
                    Sales Leads
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {activeRegion === "chennai" ? "Sriperumbudur, Ranipet, Guindy" : "Mumbai, Bhiwandi"}
                  </span>
                </div>
              </Link>

              <Link
                href="/operations/jobs"
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-sky-500/50 hover:bg-sky-50/20 dark:hover:bg-sky-500/10 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <Boxes className="w-4 h-4 text-blue-500" />
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {jobs.length}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 block truncate">
                    Operational Jobs
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {activeRegion === "chennai" ? "Chennai Port → Singapore" : "JNPT → Jebel Ali"}
                  </span>
                </div>
              </Link>

              <Link
                href="/operations/customs"
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-sky-500/50 hover:bg-sky-50/20 dark:hover:bg-sky-500/10 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    Live
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 block truncate">
                    Customs Clearances
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {activeRegion === "chennai" ? "Chennai Custom House" : "Nhava Sheva Customs"}
                  </span>
                </div>
              </Link>

              <Link
                href="/warehouse/locations"
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-sky-500/50 hover:bg-sky-50/20 dark:hover:bg-sky-500/10 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {warehouses.length}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 block truncate">
                    Warehouses & CFS
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {activeRegion === "chennai" ? "Sriperumbudur & Chennai Port" : "Bhiwandi & JNPT"}
                  </span>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "organization" && (
        <Card className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Branch & Gateway Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Settings governing billing entity, tax identifiers, and port authority registrations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Primary Organization
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">
                Eclipse Logistics Ltd
              </span>
              <span className="text-slate-500 dark:text-slate-400 block">
                CIN: U63090TN2026PLC098821 • GSTIN: 33AAACE9912K1Z9
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Active Operational Headquarters
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">
                Chennai (HQ) • Southern Corridor
              </span>
              <span className="text-slate-500 dark:text-slate-400 block">
                Eclipse Towers, Rajaji Salai, Port Gate 3, Chennai - 600001
              </span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "customs" && (
        <Card className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Customs EDI & ICEGATE Port Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Electronic Data Interchange (EDI) ports active for statutory filings.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  Chennai Sea Port (INMAA1)
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                  Madras Custom House, Rajaji Salai • Ocean Export & Import Clearance
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                Online & Verified
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  Kattupalli Port (INKAT1)
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                  Adani Kattupalli Terminal • Container & Hazmat EDI
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                Online & Verified
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  Chennai Air Cargo Complex (INMAA4)
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                  Meenambakkam International Airport • Pharma & Air Express EDI
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                Online & Verified
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
