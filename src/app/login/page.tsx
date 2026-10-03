"use client";

import React, { useState, useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Boxes,
  Globe2,
  CheckCircle2,
} from "lucide-react";
import { loginAction, type LoginState } from "./actions";

/* Shared input styling so both fields always match */
const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 text-sm text-slate-900 " +
  "placeholder:text-slate-400 transition-colors " +
  "focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 " +
  "dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100";

const labelClass = "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

function LoginForm() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/";
  // Fallback to / if someone tried to access non-existent /dashboard
  const redirectUrl = rawRedirect === "/dashboard" ? "/" : rawRedirect;

  const [state, formAction, isPending] = useActionState<LoginState | null, FormData>(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md">
      {/* Card: overflow-hidden lets the accent bar follow the rounded corners */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        {/* Accent bar, full width across the top edge */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-500" />

        <div className="p-6 sm:p-10">
          {/* Brand header: one centered column */}
          <header className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-lg shadow-sky-500/25 ring-4 ring-sky-500/10">
              <Boxes className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              FLOQ
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Sign in to manage your logistics and supply chain operations
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600 dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Enterprise Gateway Protected</span>
            </div>
          </header>

          {/* Error alert */}
          {state?.error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-600 animate-in fade-in slide-in-from-top-1 duration-200 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Access denied</p>
                <p className="mt-0.5 text-xs text-rose-500 dark:text-rose-300">{state.error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="redirectTo" value={redirectUrl} />

            <div>
              <label htmlFor="email" className={labelClass}>
                Work email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  defaultValue="admin@floq.com"
                  placeholder="admin@floq.com"
                  className={`${inputClass} pr-4`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition-all hover:from-sky-500 hover:to-blue-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <footer className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 text-xs text-slate-400 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Encrypted session</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-sky-500" />
              <span>v0.1.0 Enterprise</span>
            </div>
          </footer>
        </div>
      </div>

      <p className="mt-5 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Protected by FLOQ security policies. All access is logged and audited.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 p-4 dark:bg-[#070b13]">
      {/* Background glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/15" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-3xl dark:bg-blue-600/15" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 flex w-full justify-center">
        <Suspense fallback={<div className="text-sm text-slate-400">Loading secure portal...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}