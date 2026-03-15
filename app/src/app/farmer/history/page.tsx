"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Query } from "@dko/shared";
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, Clock3, Leaf, MessageSquareText, Mic } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api";

const historyHero =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80&auto=format&fit=crop";

const queryMeta = {
  text: { label: "Text", icon: MessageSquareText },
  voice: { label: "Voice", icon: Mic },
  image: { label: "Image", icon: Camera }
} as const;

function formatDate(value?: string) {
  if (!value) {
    return "Recent";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getPreview(query: Query) {
  if (query.type === "text") {
    return query.content || "Text advisory request";
  }

  if (query.type === "voice") {
    return query.transcribedText || query.description || "Voice advisory request";
  }

  return query.detectedDisease || query.description || "Image advisory request";
}

export default function FarmerHistoryPage() {
  const router = useRouter();
  const { appUser, loading } = useAuth();
  const [items, setItems] = useState<Query[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !appUser) {
      router.replace("/farmer/login");
    }
  }, [appUser, loading, router]);

  useEffect(() => {
    async function loadHistory() {
      if (!appUser) {
        return;
      }

      setFetching(true);
      setError(null);

      try {
        const result = await apiClient.get<{ success: true; data: { items: Query[] } }>(`/queries/user/${appUser.userId}`);
        setItems(result.data.data.items);
      } catch (loadError) {
        console.error(loadError);
        setError("Failed to load farmer history.");
      } finally {
        setFetching(false);
      }
    }

    void loadHistory();
  }, [appUser]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      resolved: items.filter((item) => item.status === "resolved").length,
      escalated: items.filter((item) => item.status === "escalated").length
    };
  }, [items]);

  if (loading || !appUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#6B7280]">
        Loading history...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] px-5 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <a className="inline-flex items-center text-sm font-semibold text-[#0A0A0A]" href="/farmer/query">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to workspace
          </a>
          <div className="inline-flex items-center rounded-full border border-[#C8E6C9] bg-[#F1F8E9] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#2E7D32]">
            <Clock3 className="mr-2 h-4 w-4" /> Farmer history
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(10,10,10,0.06)]">
            <div
              className="h-[240px] w-full"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.04) 0%, rgba(10,10,10,0.42) 100%), url('${historyHero}')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
            <div className="p-6 md:p-8">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                <Leaf className="h-4 w-4" /> Advisory archive
              </div>
              <h1 className="mt-4 text-[40px] font-bold leading-[1.04] tracking-[-1.4px] md:text-[54px]" style={{ fontFamily: "var(--font-display)" }}>
                Review Every Query And Officer Resolution.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-[#6B7280]">
                This screen shows your full advisory timeline, including AI answers, escalated cases, and issues that were resolved by a human agricultural officer.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] bg-[#F9FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#6B7280]">Total queries</div>
                  <div className="mt-2 text-3xl font-bold tracking-[-1px] text-[#0A0A0A]" style={{ fontFamily: "var(--font-display)" }}>{stats.total}</div>
                </div>
                <div className="rounded-[24px] bg-[#F9FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#6B7280]">Officer resolved</div>
                  <div className="mt-2 text-3xl font-bold tracking-[-1px] text-[#0A0A0A]" style={{ fontFamily: "var(--font-display)" }}>{stats.resolved}</div>
                </div>
                <div className="rounded-[24px] bg-[#F9FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#6B7280]">Under review</div>
                  <div className="mt-2 text-3xl font-bold tracking-[-1px] text-[#0A0A0A]" style={{ fontFamily: "var(--font-display)" }}>{stats.escalated}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_30px_70px_rgba(10,10,10,0.08)] md:p-8">
            <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">History list</div>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]" style={{ fontFamily: "var(--font-display)" }}>
              Past queries and outcomes.
            </h2>

            {error ? <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="mt-6 grid gap-4">
              {fetching ? (
                <div className="rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] px-5 py-10 text-center text-[#6B7280]">Loading your advisory history...</div>
              ) : items.length === 0 ? (
                <div className="rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] px-5 py-10 text-center text-[#6B7280]">No queries yet. Start from the farmer workspace.</div>
              ) : (
                items.map((item, index) => {
                  const meta = queryMeta[item.type];
                  const Icon = meta.icon;
                  const statusStyle = item.status === "resolved"
                    ? "bg-[#F1F8E9] text-[#2E7D32]"
                    : item.status === "escalated"
                      ? "bg-[#FFF3E0] text-[#C2410C]"
                      : "bg-[#F9FAFB] text-[#6B7280]";

                  return (
                    <motion.a
                      key={item.queryId}
                      className="block rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] p-5 transition hover:bg-white"
                      href={`/farmer/response/${item.queryId}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#6B7280]">
                            <Icon className="mr-2 h-3.5 w-3.5" /> {meta.label}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${statusStyle}`}>
                            {item.status.replace("_", " ")}
                          </span>
                          {item.status === "resolved" ? (
                            <span className="inline-flex items-center rounded-full border border-[#C8E6C9] bg-[#F1F8E9] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#2E7D32]">
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Officer closed
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs font-medium text-[#6B7280]">{formatDate(item.createdAt)}</div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[#0A0A0A]">{getPreview(item)}</p>
                      {item.latestResponse ? <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#6B7280]">{item.latestResponse}</p> : null}
                      <div className="mt-5 inline-flex items-center text-sm font-semibold text-[#0A0A0A]">
                        Open conversation <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </motion.a>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
