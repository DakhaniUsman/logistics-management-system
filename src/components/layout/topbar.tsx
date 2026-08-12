"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  User,
  ChevronDown,
  Building,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Moon,
  Sun,
  Shield,
  Check,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

export function Topbar() {
  const {
    setMobileSidebarOpen,
    setGlobalSearchOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    currentOrg,
    user,
    isDarkMode,
    toggleDarkMode,
  } = useAppStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left section: Mobile menu & Quick Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all w-48 sm:w-64 md:w-80 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search Jobs, Customers, Invoices...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400 shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: System Status, Dark Mode, Notifications & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Organization indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-xs font-semibold text-sky-700 dark:text-sky-300">
          <Building className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span className="truncate">{currentOrg.name} ({currentOrg.branch})</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 logistics-card p-4 shadow-xl z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Operational Alerts
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} Unread
                    </span>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-3 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={cn(
                        "flex items-start gap-2.5 p-2.5 rounded-lg text-xs transition-colors cursor-pointer border",
                        n.type === "warning" && "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30",
                        n.type === "success" && "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30",
                        n.type === "danger" && "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-800/30",
                        n.type === "info" && "bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/50 dark:border-sky-800/30",
                        n.read && "opacity-60"
                      )}
                    >
                      {n.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      {n.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      {n.type === "danger" && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                      {n.type === "info" && <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-6">No operational alerts.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-2 pr-2 sm:pr-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              SB
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                {user.name}
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                {user.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 logistics-card p-2 shadow-xl z-50 animate-in fade-in duration-150 text-xs space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="text-slate-400 text-[11px]">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] bg-sky-500/10 text-sky-400 font-semibold px-2 py-0.5 rounded">
                  {user.department}
                </span>
              </div>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Profile Settings
              </button>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Role Permissions
              </button>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
