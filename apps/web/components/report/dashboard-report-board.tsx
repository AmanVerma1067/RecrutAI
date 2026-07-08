"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface DashboardItem {
  interviewId: string;
  candidateName: string;
  role: string;
  status: "in_progress" | "processing" | "ready";
  createdAt: string;
  reportReadyAt?: string;
  overallScore?: number;
  verdict?: string;
}

const statusConfig = {
  in_progress: { label: "In Progress", dot: "status-dot-warning", bg: "bg-amber-500/10 text-amber-300 border-amber-400/20" },
  processing: { label: "Processing", dot: "status-dot-live", bg: "bg-indigo-500/10 text-indigo-300 border-indigo-400/20" },
  ready: { label: "Complete", dot: "status-dot-live", bg: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20" }
};

export function DashboardReportBoard() {
  const router = useRouter();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    const response = await fetch("/api/dashboard/reports", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as { items: DashboardItem[] };
    setItems(payload.items);
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      const response = await fetch("/api/dashboard/reports", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as { items: DashboardItem[] };
      if (!cancelled) setItems(payload.items);
    };

    void loadData();
    const intervalId = window.setInterval(() => { void loadData(); }, 5000);
    return () => { cancelled = true; window.clearInterval(intervalId); };
  }, []);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/dashboard/seed-demo", { method: "POST" });
      if (res.ok) {
        await load();
      }
    } catch (err) {
      console.error("Failed to seed mock session", err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Interview Sessions</h1>
          <p className="mt-0.5 text-xs text-zinc-500">{items.length} total sessions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSeedDemo} 
            variant="secondary" 
            size="sm" 
            disabled={seeding}
            className="border border-white/[0.08] hover:bg-white/[0.04]"
          >
            {seeding ? "Seeding..." : "Seed Mock Session"}
          </Button>
          <Link href="/upload">
            <Button size="sm">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.1] py-16 text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-zinc-400">No interview sessions yet</p>
          <p className="mt-1 text-xs text-zinc-500">Upload a resume to start your first AI interview</p>
          <div className="flex gap-3 mt-4">
            <Button size="sm" variant="secondary" onClick={handleSeedDemo} disabled={seeding}>
              {seeding ? "Seeding..." : "Try Demo Report"}
            </Button>
            <Link href="/upload">
              <Button size="sm">Start First Interview</Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Session cards */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, i) => {
            const cfg = statusConfig[item.status];
            return (
              <motion.div
                key={item.interviewId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  onClick={() => {
                    router.push(item.status === "in_progress" ? `/interview/${item.interviewId}` : `/report/${item.interviewId}`);
                  }}
                  className="cursor-pointer group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-sm font-semibold text-indigo-300">
                    {item.candidateName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-zinc-100">{item.candidateName}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.bg}`}>
                        <span className={`${cfg.dot} !h-[5px] !w-[5px] !animate-none`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{item.role}</p>
                  </div>

                  {/* Audit Logs button for complete sessions */}
                  {item.status === "ready" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/reports/${item.interviewId}`);
                      }}
                      className="hidden sm:inline-flex rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-xs text-zinc-400 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200"
                    >
                      Audit Logs
                    </button>
                  )}

                  {/* Score (if ready) */}
                  {item.status === "ready" && item.overallScore != null && (
                    <div className="hidden shrink-0 text-right sm:block min-w-[40px]">
                      <p className={`text-sm font-bold ${
                        item.overallScore >= 80 ? "text-emerald-400" : item.overallScore >= 60 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {item.overallScore}
                      </p>
                      <p className="text-[10px] text-zinc-500">{item.verdict}</p>
                    </div>
                  )}

                  {/* Date */}
                  <div className="hidden shrink-0 text-right text-[11px] text-zinc-500 md:block">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>

                  {/* Arrow */}
                  <svg className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
