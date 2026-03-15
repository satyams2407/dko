"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Escalation, Query, Response as QueryResponse } from "@dko/shared";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock3,
  Leaf,
  MessageSquareText,
  Mic,
  Sparkles,
  ThumbsDown,
  ThumbsUp
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api";

const responseImage =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop";

const queryTypeMeta = {
  text: {
    label: "Text advisory",
    askHref: "/farmer/query/text",
    askLabel: "Ask Another Text Question",
    icon: MessageSquareText
  },
  voice: {
    label: "Voice advisory",
    askHref: "/farmer/query/voice",
    askLabel: "Send Another Voice Note",
    icon: Mic
  },
  image: {
    label: "Image advisory",
    askHref: "/farmer/query/image",
    askLabel: "Analyze Another Image",
    icon: Camera
  }
} as const;

export default function FarmerResponsePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { appUser, loading } = useAuth();
  const [query, setQuery] = useState<Query | null>(null);
  const [responses, setResponses] = useState<QueryResponse[]>([]);
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<"idle" | "helpful" | "not_helpful">("idle");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (!loading && !appUser) {
      router.replace("/farmer/login");
    }
  }, [appUser, loading, router]);

  async function loadQuery() {
    if (!params.id || !appUser) {
      return;
    }

    setFetching(true);
    setError(null);

    try {
      const result = await apiClient.get<{
        success: true;
        data: {
          query: Query;
          responses: QueryResponse[];
          escalation: Escalation | null;
        };
      }>(`/queries/${params.id}`);

      setQuery(result.data.data.query);
      setResponses(result.data.data.responses);
      setEscalation(result.data.data.escalation);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load the response.");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    void loadQuery();
  }, [appUser, params.id]);

  const latestResponse = responses[responses.length - 1];
  const meta = useMemo(() => {
    if (!query) {
      return queryTypeMeta.text;
    }

    return queryTypeMeta[query.type];
  }, [query]);
  const QueryIcon = meta.icon;

  async function sendFeedback(rating: "helpful" | "not_helpful") {
    if (!query || !latestResponse) {
      return;
    }

    setFeedbackLoading(true);
    setError(null);

    try {
      const result = await apiClient.post<{
        success: true;
        data: {
          escalation: Escalation | null;
        };
      }>(`/queries/${query.queryId}/feedback`, {
        rating,
        responseId: latestResponse.responseId
      });

      setFeedbackState(rating);
      if (result.data.data.escalation) {
        setEscalation(result.data.data.escalation);
      }
      await loadQuery();
    } catch (feedbackError) {
      console.error(feedbackError);
      setError("Failed to submit feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  if (loading || !appUser || fetching) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#6B7280]">
        Loading response...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] px-5 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <a className="inline-flex items-center text-sm font-semibold text-[#0A0A0A]" href={meta.askHref}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {meta.label.toLowerCase()}
          </a>
          <div className="inline-flex items-center rounded-full border border-[#C8E6C9] bg-[#F1F8E9] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#2E7D32]">
            <Sparkles className="mr-2 h-4 w-4" /> {escalation ? "Escalated advisory" : "AI response ready"}
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(10,10,10,0.06)]">
            <div
              className="h-[220px] w-full"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.52) 100%), url('${query?.imageUrl ?? responseImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
            <div className="p-6 md:p-8">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                <Leaf className="h-4 w-4" /> Query summary
              </div>
              <h1 className="mt-4 text-[36px] font-bold leading-[1.06] tracking-[-1.2px] md:text-[48px]" style={{ fontFamily: "var(--font-display)" }}>
                Your Advisory Has Been Generated.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#6B7280]">
                Review the input, the interpreted context, and the recommended actions before taking the next step in the field.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <div className="inline-flex items-center rounded-full border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#6B7280]">
                  <QueryIcon className="mr-2 h-4 w-4" /> {meta.label}
                </div>
                {query?.confidence ? (
                  <div className="rounded-full border border-[#C8E6C9] bg-[#F1F8E9] px-4 py-2 text-xs font-semibold text-[#2E7D32]">
                    Confidence {query.confidence}%
                  </div>
                ) : null}
                {escalation ? (
                  <div className="inline-flex items-center rounded-full border border-[#FFE0B2] bg-[#FFF3E0] px-4 py-2 text-xs font-semibold text-[#C2410C]">
                    <Clock3 className="mr-2 h-4 w-4" /> Officer review {escalation.status.replace("_", " ")}
                  </div>
                ) : null}
              </div>

              {query?.type === "text" ? (
                <div className="mt-8 rounded-[24px] bg-[#F9FAFB] p-5">
                  <div className="text-[12px] uppercase tracking-[0.22em] text-[#6B7280]">Original question</div>
                  <p className="mt-3 text-sm leading-7 text-[#0A0A0A]">{query.content}</p>
                </div>
              ) : null}

              {query?.type === "voice" ? (
                <div className="mt-8 space-y-4">
                  {query.audioUrl ? <audio className="w-full" controls src={query.audioUrl} /> : null}
                  <div className="rounded-[24px] bg-[#F9FAFB] p-5">
                    <div className="text-[12px] uppercase tracking-[0.22em] text-[#6B7280]">Transcript</div>
                    <p className="mt-3 text-sm leading-7 text-[#0A0A0A]">{query.transcribedText ?? query.description ?? "Transcript unavailable."}</p>
                  </div>
                </div>
              ) : null}

              {query?.type === "image" ? (
                <div className="mt-8 space-y-4">
                  {query.imageUrl ? <img alt="Uploaded crop" className="h-[220px] w-full rounded-[24px] object-cover" src={query.imageUrl} /> : null}
                  <div className="rounded-[24px] bg-[#F9FAFB] p-5">
                    <div className="text-[12px] uppercase tracking-[0.22em] text-[#6B7280]">Detected issue</div>
                    <p className="mt-3 text-sm leading-7 text-[#0A0A0A]">{query.detectedDisease ?? "Visible crop stress"}</p>
                    {query.description ? <p className="mt-3 text-sm leading-7 text-[#6B7280]">Farmer note: {query.description}</p> : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <motion.div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_30px_70px_rgba(10,10,10,0.08)] md:p-8" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Advice</div>
                <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]" style={{ fontFamily: "var(--font-display)" }}>
                  Field-ready recommendations.
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {latestResponse?.confidence ? (
                  <div className="rounded-full border border-[#C8E6C9] bg-[#F1F8E9] px-4 py-2 text-xs font-semibold text-[#2E7D32]">
                    Confidence {latestResponse.confidence}%
                  </div>
                ) : null}
                <div className="rounded-full border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#6B7280]">
                  Source {latestResponse?.type === "officer" ? latestResponse.officerName ?? "officer" : latestResponse?.generatedBy ?? "unknown"}
                </div>
              </div>
            </div>

            {error ? <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="mt-6 rounded-[28px] border border-[#E5E7EB] bg-[#FCFCFB] p-5 md:p-6">
              <p className="whitespace-pre-line text-[15px] leading-8 text-[#0A0A0A]">{latestResponse?.content ?? "No response yet."}</p>
            </div>

            {latestResponse?.type !== "officer" ? (
              <div className="mt-6 rounded-[24px] border border-[#E5E7EB] bg-white p-5">
                <div className="text-sm font-semibold text-[#0A0A0A]">Was this helpful?</div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button className="inline-flex h-12 items-center justify-center rounded-full border border-[#E5E7EB] px-5 text-sm font-semibold text-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-60" disabled={feedbackLoading} onClick={() => { void sendFeedback("helpful"); }} type="button">
                    <ThumbsUp className="mr-2 h-4 w-4" /> {feedbackState === "helpful" ? "Marked helpful" : "Helpful"}
                  </button>
                  <button className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0A] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9CA3AF]" disabled={feedbackLoading || Boolean(escalation)} onClick={() => { void sendFeedback("not_helpful"); }} type="button">
                    <ThumbsDown className="mr-2 h-4 w-4" /> {escalation ? "Officer review requested" : "Need officer review"}
                  </button>
                </div>
              </div>
            ) : null}

            {escalation ? (
              <div className="mt-6 rounded-[24px] border border-[#FFE0B2] bg-[#FFF8F1] p-5">
                <div className="text-[12px] uppercase tracking-[0.22em] text-[#C2410C]">Escalation status</div>
                <p className="mt-3 text-sm leading-7 text-[#7C2D12]">
                  Your query has been sent to an agricultural officer for human review. Status: <span className="font-semibold">{escalation.status.replace("_", " ")}</span>.
                </p>
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 text-sm text-[#6B7280]">
              {[
                latestResponse?.type === "officer"
                  ? "This answer was provided by a human officer after reviewing your case."
                  : "Use this response as initial guidance, not a pesticide prescription.",
                "For rapidly spreading disease or crop loss, escalate to a human agricultural officer.",
                query?.type === "voice"
                  ? "Replay the audio and verify the transcript if the symptom wording looks off."
                  : query?.type === "image"
                    ? "Upload one close-up and one full-plant image if you need a stronger follow-up diagnosis."
                    : "Ask a follow-up with more detail if symptoms change after treatment."
              ].map((line) => (
                <div key={line} className="inline-flex items-start gap-3 rounded-2xl bg-[#F9FAFB] px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2E7D32]" />
                  <span>{line}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-base font-semibold text-white" href={meta.askHref}>
                {meta.askLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a className="inline-flex h-12 items-center justify-center rounded-full border border-[#E5E7EB] px-6 text-base font-semibold text-[#0A0A0A]" href="/farmer/query">
                Back to Workspace
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
