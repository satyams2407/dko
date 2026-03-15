"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Escalation, Query, Response as QueryResponse, User } from "@dko/shared";
import { ArrowLeft, ArrowRight, Camera, Leaf, MessageSquareText, Mic, Send, UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api";

const queryTypeMeta = {
  text: { label: "Text query", icon: MessageSquareText },
  voice: { label: "Voice query", icon: Mic },
  image: { label: "Image query", icon: Camera }
} as const;

export default function DashboardEscalationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { appUser, loading, logout } = useAuth();
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [query, setQuery] = useState<Query | null>(null);
  const [responses, setResponses] = useState<QueryResponse[]>([]);
  const [farmer, setFarmer] = useState<User | null>(null);
  const [reply, setReply] = useState("");
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
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

  async function loadCase() {
    if (!params.id || !appUser || (appUser.role !== "officer" && appUser.role !== "admin")) {
      return;
    }

    setFetching(true);
    setError(null);

    try {
      const result = await apiClient.get<{
        success: true;
        data: {
          escalation: Escalation;
          query: Query;
          responses: QueryResponse[];
          farmer: User | null;
        };
      }>(`/escalations/${params.id}`);

      setEscalation(result.data.data.escalation);
      setQuery(result.data.data.query);
      setResponses(result.data.data.responses);
      setFarmer(result.data.data.farmer);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load the escalation.");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    void loadCase();
  }, [appUser, params.id]);

  const meta = useMemo(() => {
    if (!query) return queryTypeMeta.text;
    return queryTypeMeta[query.type];
  }, [query]);
  const QueryIcon = meta.icon;

  async function handleAssign() {
    if (!escalation) {
      return;
    }

    setAssigning(true);
    setError(null);
    try {
      await apiClient.put(`/escalations/${escalation.escalationId}/assign`);
      await loadCase();
    } catch (assignError) {
      console.error(assignError);
      setError("Failed to claim this escalation.");
    } finally {
      setAssigning(false);
    }
  }

  async function handleRespond() {
    if (!escalation || !reply.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post(`/escalations/${escalation.escalationId}/respond`, { content: reply.trim() });
      setReply("");
      await loadCase();
    } catch (submitError) {
      console.error(submitError);
      setError("Failed to send the officer response.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !appUser || (appUser.role !== "officer" && appUser.role !== "admin") || fetching) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#6B7280]">
        Loading case details...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] px-5 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <a className="inline-flex items-center text-sm font-semibold text-[#0A0A0A]" href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to queue
          </a>
          <div className="inline-flex items-center rounded-full border border-[#C8E6C9] bg-[#F1F8E9] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#2E7D32]">
            <Leaf className="mr-2 h-4 w-4" /> Officer case view
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_60px_rgba(10,10,10,0.06)] md:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#6B7280]">{meta.label}</span>
                <span className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#6B7280]">{escalation?.status.replace("_", " ")}</span>
              </div>
              <h1 className="mt-4 text-[38px] font-bold leading-[1.05] tracking-[-1.2px] md:text-[48px]" style={{ fontFamily: "var(--font-display)" }}>
                {farmer?.name ?? escalation?.farmerName ?? "Farmer case"}
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#6B7280]">{escalation?.reason}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-[#F9FAFB] p-5">
                  <div className="text-[12px] uppercase tracking-[0.22em] text-[#6B7280]">Farmer</div>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0A]">
                    <UserRound className="h-4 w-4 text-[#2E7D32]" /> {farmer?.email ?? farmer?.phone ?? farmer?.userId ?? escalation?.userId}
                  </div>
                </div>
                <div className="rounded-[24px] bg-[#F9FAFB] p-5">
                  <div className="text-[12px] uppercase tracking-[0.22em] text-[#6B7280]">Current assignee</div>
                  <div className="mt-3 text-sm font-semibold text-[#0A0A0A]">{escalation?.officerName ?? escalation?.assignedTo ?? "Unassigned"}</div>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] p-5">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                  <QueryIcon className="h-4 w-4" /> Query context
                </div>
                {query?.type === "text" ? <p className="mt-3 text-sm leading-7 text-[#0A0A0A]">{query.content}</p> : null}
                {query?.type === "voice" ? (
                  <div className="mt-3 space-y-3">
                    {query.audioUrl ? <audio className="w-full" controls src={query.audioUrl} /> : null}
                    <p className="text-sm leading-7 text-[#0A0A0A]">{query.transcribedText ?? query.description ?? "Transcript unavailable."}</p>
                  </div>
                ) : null}
                {query?.type === "image" ? (
                  <div className="mt-3 space-y-3">
                    {query.imageUrl ? <img alt="Escalated crop" className="h-[240px] w-full rounded-[20px] object-cover" src={query.imageUrl} /> : null}
                    <p className="text-sm leading-7 text-[#0A0A0A]">{query.detectedDisease ?? query.description ?? "Image advisory request."}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_60px_rgba(10,10,10,0.06)] md:p-8">
              <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Conversation history</div>
              <div className="mt-6 space-y-4">
                {responses.map((item) => (
                  <div key={item.responseId} className={`rounded-[24px] p-5 ${item.type === "officer" ? "border border-[#C8E6C9] bg-[#F1F8E9]" : "border border-[#E5E7EB] bg-[#FCFCFB]"}`}>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[#6B7280]">{item.type === "officer" ? `Officer ${item.officerName ?? "response"}` : `AI ${item.generatedBy ?? "response"}`}</div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#0A0A0A]">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_30px_70px_rgba(10,10,10,0.08)] md:p-8" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Officer action</div>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]" style={{ fontFamily: "var(--font-display)" }}>
              Respond with practical field advice.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6B7280]">
              Claim the case if needed, then send a concise response that tells the farmer exactly what to inspect or do next.
            </p>

            {error ? <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex h-12 items-center justify-center rounded-full border border-[#E5E7EB] px-5 text-sm font-semibold text-[#0A0A0A]" disabled={assigning || escalation?.status === "resolved"} onClick={handleAssign} type="button">
                {assigning ? "Claiming..." : escalation?.assignedTo ? "Claim / Reassign to me" : "Claim case"}
              </button>
              <a className="inline-flex h-12 items-center justify-center rounded-full border border-[#E5E7EB] px-5 text-sm font-semibold text-[#0A0A0A]" href="/dashboard">
                Return to queue
              </a>
            </div>

            <label className="mt-6 block text-sm font-medium text-[#0A0A0A]">
              Officer response
              <textarea className="mt-2 min-h-[260px] w-full rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] px-5 py-4 text-base leading-7 outline-none transition focus:border-[#2E7D32]" maxLength={1200} onChange={(event) => setReply(event.target.value)} placeholder="Example: Inspect 10-15 plants across the affected patch. Remove the worst leaves. If the underside shows mites or webbing, treat only after confirming infestation. Avoid extra irrigation for the next 24 hours and share a close-up image if spread continues." value={reply} />
            </label>

            <button className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9CA3AF]" disabled={submitting || !reply.trim() || escalation?.status === "resolved"} onClick={handleRespond} type="button">
              {submitting ? "Sending response..." : "Send Officer Response"}
              <Send className="ml-2 h-4 w-4" />
            </button>

            {escalation?.status === "resolved" ? (
              <div className="mt-5 rounded-[20px] border border-[#C8E6C9] bg-[#F1F8E9] px-4 py-3 text-sm text-[#2E7D32]">
                This escalation has already been resolved. The farmer can now see the officer response in their advisory thread.
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
