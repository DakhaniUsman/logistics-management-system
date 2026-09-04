"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Construction,
  Home,
  Briefcase,
  ArrowLeft,
  Ship,
  Boxes,
  ShieldCheck,
  Truck,
  PackageCheck,
  Clock,
  Sparkles,
} from "lucide-react";

export default function NotFound() {
  const quickLinks = [
    { title: "Jobs Command Center", href: "/operations/jobs", icon: Briefcase },
    { title: "Vessel Bookings", href: "/operations/bookings", icon: Ship },
    { title: "Container Equipment", href: "/operations/containers", icon: Boxes },
    { title: "Customs Clearance", href: "/operations/customs", icon: ShieldCheck },
    { title: "Road Haulage Transport", href: "/operations/transport", icon: Truck },
    { title: "Customer POD Queue", href: "/operations/delivery/pod", icon: PackageCheck },
  ];

  return (
    <div className="min-h-[78vh] flex flex-col items-center justify-center py-10 px-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md p-8 sm:p-10 text-center space-y-6">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Module Under Active Development</span>
        </div>

        {/* Construction Visual Badge */}
        <div className="flex items-center justify-center">
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-sky-500/10 border border-amber-400/20 dark:border-amber-500/20 shadow-inner">
            <Construction className="w-12 h-12 text-amber-500 dark:text-amber-400 animate-pulse" />
            <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-sky-500 text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            This part is under development
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Our engineering team is actively building and connecting this workflow as part of the next FLOQ Operating System release.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          <Button
            variant="outline"
            size="md"
            icon={ArrowLeft}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>

          <Link href="/">
            <Button variant="primary" size="md" icon={Home}>
              Executive Dashboard
            </Button>
          </Link>

          <Link href="/operations/jobs">
            <Button variant="secondary" size="md" icon={Briefcase}>
              View Live Jobs
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="relative pt-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold tracking-widest text-[10px]">
              Or jump to live operational modules
            </span>
          </div>
        </div>

        {/* Quick jump live modules */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-left">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-sky-500/50 hover:bg-sky-50/30 dark:hover:bg-sky-500/10 transition-all flex items-center gap-2.5 group"
              >
                <div className="p-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-sky-500/20 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                  {link.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
