"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Escalation, Notification } from "@dko/shared";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowRight, Bell, CheckCircle2, Clock3, Leaf, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api";

const dashboardHero =
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400&q=80&auto=format&fit=crop";

type EscalationFilter = "all" | "pending" | "in_progress" | "resolved";

const filters: EscalationFilter[] = ["all", "pending", "in_progress", "resolved"];

export default function DashboardHomePage() {
  const router = useRouter();
  const { appUser, loading, logout } = useAuth();
  const [items, setItems] = useState<Escalation[]>([]);
  const [filter, setFilter] = useState<EscalationFilter>("all");
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!loading && !appUser) {
      router.replace("/dashboard/login");
      return;
    }

    if (!loading && appUser && appUser.role !== "officer" && appUser.role !== "admin") {
      void logout().then(() => {
        window.location.href = "/dashboard/login";
      });
    }
  }, [appUser, loading, logout, router]);

  useEffect(() => {
    async function loadEscalations() {
      if (!appUser || (appUser.role !== "officer" && appUser.role !== "admin")) {
        return;
      }

      setFetching(true);
      setError(null);

      try {
        const [escalationResult, notificationResult] = await Promise.all([
          apiClient.get<{ success: true; data: { items: Escalation[] } }>(`/escalations?status=${filter}`),
          apiClient.get<{ success: true; data: { items: Notification[]; unreadCount: number } }>("/notifications")
        ]);

        setItems(escalationResult.data.data.items);
        setUnreadNotifications(notificationResult.data.data.unreadCount);
      } catch (loadError) {
        console.error(loadError);
        setError("Failed to load dashboard data. Check officer access and backend connectivity.");
      } finally {
        setFetching(false);
      }
    }

    void loadEscalations();
  }, [appUser, filter]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      inProgress: items.filter((item) => item.status === "in_progress").length,
      resolved: items.filter((item) => item.status === "resolved").length
    };
  }, [items]);

  const summaryCards: Array<{ label: string; value: string; Icon: LucideIcon }> = [
    { label: "Total", value: String(stats.total), Icon: ShieldCheck },
    { label: "Pending", value: String(stats.pending), Icon: AlertCircle },
    { label: "In Progress", value: String(stats.inProgress), Icon: Clock3 },
    { label: "Resolved", value: String(stats.resolved), Icon: CheckCircle2 }
  ];

  async function claimEscalation(escalationId: string) {
    setActionId(escalationId);
    try {
      await apiClient.put(`/escalations/${escalationId}/assign`);
      const result = await apiClient.get<{ success: true; data: { items: Escalation[] } }>(`/escalations?status=${filter}`);
      setItems(result.data.data.items);
    } catch (claimError) {
      console.error(claimError);
      setError("Failed to assign escalation. It may already be claimed by another officer.");
    } finally {
      setActionId(null);
    }
  }

  if (loading || !appUser || (appUser.role !== "officer" && appUser.role !== "admin")) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#6B7280]">
        Loading officer dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-8 md:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#6B7280]">
              Officer dashboard
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
              <Leaf className="h-4 w-4" /> Welcome, {appUser.name}
            </div>
            <h1 className="mt-4 max-w-[720px] text-[42px] font-bold leading-[1.03] tracking-[-1.5px] md:text-[60px]" style={{ fontFamily: "var(--font-display)" }}>
              Review Escalations And Close The Advisory Loop.
            </h1>
            <p className="mt-5 max-w-[620px] text-base leading-8 text-[#6B7280]">
              Claim unresolved cases, review the AI answer and farmer context, then send a practical human response back into the same conversation thread.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0A] px-5 text-sm font-semibold text-white" href="/dashboard/analytics">
                Open Analytics <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <div className="inline-flex h-12 items-center rounded-full border border-[#E5E7EB] px-5 text-sm font-semibold text-[#0A0A0A]">
                <Bell className="mr-2 h-4 w-4" /> {unreadNotifications} unread farmer notifications
              </div>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[32px]">
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.12) 0%, rgba(10,10,10,0.62) 100%), url('${dashboardHero}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between p-6 text-white md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex w-fit rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/75">
                  Human in the loop
                </div>
                <button
                  className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  onClick={() => {
                    void logout().then(() => {
                      window.location.href = "/dashboard/login";
                    });
                  }}
                  type="button"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/60">Access</div>
                  <div className="mt-2 text-sm font-semibold text-white">{appUser.role}</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/60">Open cases</div>
                  <div className="mt-2 text-sm font-semibold text-white">{stats.pending + stats.inProgress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-4 md:grid-cols-4">
            {summaryCards.map(({ label, value, Icon }) => (
              <div key={label} className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_50px_rgba(10,10,10,0.05)]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1F8E9] text-[#2E7D32]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">{label}</div>
                <div className="mt-2 text-4xl font-bold tracking-[-1px] text-[#0A0A0A]" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {filters.map((value) => (
              <button
                key={value}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === value ? "bg-[#0A0A0A] text-white" : "border border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A]"}`}
                onClick={() => setFilter(value)}
                type="button"
              >
                {value.replace("_", " ")}
              </button>
            ))}
          </div>

          {error ? <div className="mt-6 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="mt-8 grid gap-4">
            {fetching ? (
              <div className="rounded-[28px] border border-[#E5E7EB] bg-white px-6 py-10 text-center text-[#6B7280]">Loading escalations...</div>
            ) : items.length === 0 ? (
              <div className="rounded-[28px] border border-[#E5E7EB] bg-white px-6 py-10 text-center text-[#6B7280]">No escalations found for this filter.</div>
            ) : (
              items.map((item, index) => (
                <motion.div
                  key={item.escalationId}
                  className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_50px_rgba(10,10,10,0.05)]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.25 }}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#6B7280]">{item.queryType} query</span>
                        <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${item.priority === "high" ? "bg-[#FFF3E0] text-[#C2410C]" : item.priority === "normal" ? "bg-[#F1F8E9] text-[#2E7D32]" : "bg-[#F9FAFB] text-[#6B7280]"}`}>{item.priority} priority</span>
                        <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#6B7280]">{item.status.replace("_", " ")}</span>
                      </div>
                      <h2 className="mt-4 text-[30px] font-bold leading-[1.08] tracking-[-1px]" style={{ fontFamily: "var(--font-display)" }}>
                        {item.farmerName ?? "Farmer"}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-[#6B7280]">{item.reason}</p>
                      <div className="mt-4 rounded-[22px] bg-[#F9FAFB] px-4 py-3 text-sm leading-7 text-[#0A0A0A]">{item.queryPreview ?? "No preview available."}</div>
                    </div>
                    <div className="flex min-w-[220px] flex-col gap-3">
                      <a className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0A] px-5 text-sm font-semibold text-white" href={`/dashboard/escalations/${item.escalationId}`}>
                        Open case <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                      {item.status !== "resolved" ? (
                        <button
                          className="inline-flex h-12 items-center justify-center rounded-full border border-[#E5E7EB] px-5 text-sm font-semibold text-[#0A0A0A]"
                          disabled={actionId === item.escalationId}
                          onClick={() => {
                            void claimEscalation(item.escalationId);
                          }}
                          type="button"
                        >
                          {actionId === item.escalationId ? "Claiming..." : item.assignedTo ? "Re-claim case" : "Claim case"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
