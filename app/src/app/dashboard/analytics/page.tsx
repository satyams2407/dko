"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { AnalyticsOverview } from "@dko/shared";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, BarChart3, Bell, CheckCircle2, Clock3, Leaf, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api";

const analyticsHero =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&auto=format&fit=crop";

function formatDate(value?: string) {
  if (!value) return "Recent";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function DashboardAnalyticsPage() {
  const router = useRouter();
  const { appUser, loading, logout } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    async function loadOverview() {
      if (!appUser || (appUser.role !== "officer" && appUser.role !== "admin")) {
        return;
      }

      setFetching(true);
      setError(null);

      try {
        const result = await apiClient.get<{ success: true; data: AnalyticsOverview }>("/analytics/overview");
        setOverview(result.data.data);
      } catch (loadError) {
        console.error(loadError);
        setError("Failed to load analytics overview.");
      } finally {
        setFetching(false);
      }
    }

    void loadOverview();
  }, [appUser]);

  const summaryCards: Array<{ label: string; value: string; Icon: LucideIcon }> = [
    { label: "Queries", value: String(overview?.totalQueries ?? 0), Icon: ShieldCheck },
    { label: "Resolved", value: String(overview?.resolvedQueries ?? 0), Icon: CheckCircle2 },
    { label: "Open Escalations", value: String(overview?.openEscalations ?? 0), Icon: Clock3 },
    { label: "Unread Notifications", value: String(overview?.unreadNotifications ?? 0), Icon: Bell }
  ];

  if (loading || !appUser || (appUser.role !== "officer" && appUser.role !== "admin") || fetching) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#6B7280]">
        Loading analytics...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] px-5 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <a className="inline-flex items-center text-sm font-semibold text-[#0A0A0A]" href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
          </a>
          <div className="inline-flex items-center rounded-full border border-[#C8E6C9] bg-[#F1F8E9] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#2E7D32]">
            <BarChart3 className="mr-2 h-4 w-4" /> Analytics overview
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(10,10,10,0.06)]">
            <div className="h-[240px] w-full" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.04) 0%, rgba(10,10,10,0.42) 100%), url('${analyticsHero}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="p-6 md:p-8">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                <Leaf className="h-4 w-4" /> Platform metrics
              </div>
              <h1 className="mt-4 text-[40px] font-bold leading-[1.04] tracking-[-1.4px] md:text-[54px]" style={{ fontFamily: "var(--font-display)" }}>
                Track Query Volume, Escalations, And Notification Load.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-[#6B7280]">
                This view gives officers and evaluators a fast read on how the prototype is performing across farmer requests, human handoffs, and follow-up activity.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {summaryCards.map(({ label, value, Icon }, index) => (
              <motion.div key={label} className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-[0_20px_50px_rgba(10,10,10,0.05)]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.05 }}>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1F8E9] text-[#2E7D32]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">{label}</div>
                <div className="mt-2 text-4xl font-bold tracking-[-1px] text-[#0A0A0A]" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 md:px-8 md:pb-14">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_60px_rgba(10,10,10,0.06)] md:p-8">
            <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Query breakdown</div>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]" style={{ fontFamily: "var(--font-display)" }}>
              Inputs by type.
            </h2>
            <div className="mt-6 space-y-4">
              {overview?.queryTypeBreakdown.map((item) => {
                const percentage = overview.totalQueries > 0 ? Math.round((item.count / overview.totalQueries) * 100) : 0;
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between text-sm font-semibold text-[#0A0A0A]">
                      <span className="capitalize">{item.type}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-[#F3F4F6]">
                      <div className="h-3 rounded-full bg-[#2E7D32]" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_60px_rgba(10,10,10,0.06)] md:p-8">
            <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Recent activity</div>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]" style={{ fontFamily: "var(--font-display)" }}>
              Latest platform events.
            </h2>

            {error ? <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="mt-6 grid gap-4">
              {overview?.recentActivity.map((item, index) => (
                <motion.div key={`${item.label}-${item.timestamp}-${index}`} className="rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.04 }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#0A0A0A]">{item.label}</div>
                    <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#6B7280]">{item.category}</div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-[#6B7280]">{formatDate(item.timestamp)}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
