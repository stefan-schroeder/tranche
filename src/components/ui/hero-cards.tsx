"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

function MiniBars() {
  return (
    <div className="mt-6 flex h-36 items-end gap-4 rounded-xl bg-gradient-to-b from-emerald-50 to-white p-4">
      {[18, 48, 72, 96].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0.6 }}
          animate={{ height: h }}
          transition={{ delay: 0.5 + i * 0.15, type: "spring" }}
          className="w-10 rounded-xl bg-gradient-to-t from-emerald-200 to-emerald-400 shadow-inner"
        />
      ))}
    </div>
  );
}

function Planet() {
  return (
    <motion.svg
      initial={{ rotate: -8 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 2, type: "spring" }}
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="56" fill="url(#grad)" opacity="0.95" />
      <circle cx="94" cy="98" r="10" fill="white" opacity="0.45" />
      <circle cx="132" cy="126" r="8" fill="white" opacity="0.35" />
      <motion.ellipse
        cx="110"
        cy="110"
        rx="100"
        ry="34"
        stroke="white"
        strokeOpacity="0.6"
        fill="none"
        animate={{ strokeDashoffset: [200, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        strokeDasharray="200 200"
      />
      <motion.circle
        cx="210"
        cy="110"
        r="4"
        fill="white"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
    </motion.svg>
  );
}

export default function HeroCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative col-span-1 overflow-hidden rounded-xl bg-gradient-to-b from-emerald-900 to-emerald-800 p-6 text-emerald-50 shadow-lg"
      >
        <div className="absolute inset-0">
          <svg
            className="absolute inset-0 h-full w-full opacity-30"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="rg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3aa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="400" height="400" fill="url(#rg)" />
            {[...Array(12)].map((_, i) => (
              <circle
                key={i}
                cx="200"
                cy="200"
                r={20 + i * 14}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.12"
              />
            ))}
          </svg>
        </div>

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-700/60 p-2 ring-1 ring-white/10">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xs uppercase tracking-wider text-emerald-200">
              Extra Secure
            </span>
          </div>
          <div className="mt-6 text-xl leading-snug text-emerald-50/95">
            Your accounts and positions
            <br /> stay private to you
          </div>
          <motion.div
            className="absolute right-6 top-6 h-12 w-12 rounded-full bg-emerald-600/40"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(16,185,129,0.35)",
                "0 0 0 16px rgba(16,185,129,0)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative col-span-1 overflow-hidden rounded-xl bg-gradient-to-b from-teal-400 to-emerald-500 p-6 text-white shadow-lg"
      >
        <div className="pointer-events-none absolute -right-8 -top-10 opacity-70">
          <Planet />
        </div>
        <div className="relative mt-24 text-sm text-white/90">
          Prediction Markets
        </div>
        <div className="text-xl font-medium leading-snug">
          Kalshi and Polymarket
          <br /> positions, one view
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="col-span-1 rounded-xl bg-white p-6 text-slate-800 shadow-lg ring-1 ring-slate-200"
      >
        <div className="text-sm text-slate-500">Tranche Progress</div>
        <div className="mt-2 text-3xl font-semibold tracking-tight">
          On Track{" "}
          <span className="text-sm font-medium text-slate-400 align-middle">
            toward goal
          </span>
        </div>
        <div className="mt-1 text-xs text-emerald-600">
          ↑ contribution pace healthy
        </div>
        <MiniBars />
      </motion.div>

      <div className="hidden md:block" />
    </div>
  );
}
