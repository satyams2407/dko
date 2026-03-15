"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Leaf, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api";

const fieldImage =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80&auto=format&fit=crop";

export default function FarmerTextQueryPage() {
  const router = useRouter();
  const { appUser, loading } = useAuth();
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !appUser) {
      router.replace("/farmer/login");
    }
  }, [appUser, loading, router]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const result = await apiClient.post<{
        success: true;
        data: {
          query: { queryId: string };
        };
      }>("/queries", {
        type: "text",
        content: question.trim()
      });

      const queryId = result.data.data.query.queryId;
      router.push(`/farmer/response/${queryId}`);
    } catch (submitError) {
      console.error(submitError);
      setError("Failed to submit question. Check that the backend is running and the Gemini key is configured.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !appUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#6B7280]">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] px-5 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4">
          <a className="inline-flex items-center text-sm font-semibold text-[#0A0A0A]" href="/farmer/query">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to query workspace
          </a>
          <div className="inline-flex items-center rounded-full border border-[#C8E6C9] bg-[#F1F8E9] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#2E7D32]">
            <Sparkles className="mr-2 h-4 w-4" /> Gemini text advisory
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(10,10,10,0.06)]">
            <div
              className="h-[240px] w-full"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.04) 0%, rgba(10,10,10,0.42) 100%), url('${fieldImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
            <div className="p-6 md:p-8">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                <Leaf className="h-4 w-4" /> Live advisory engine
              </div>
              <h1
                className="mt-4 text-[40px] font-bold leading-[1.04] tracking-[-1.4px] md:text-[54px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ask About Your Crop With Context.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-[#6B7280]">
                Be specific about crop type, visible symptoms, weather, spread speed, and recent treatments. Better context gives better AI guidance.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-[#6B7280]">
                {[
                  "Mention the crop and stage of growth.",
                  "Describe symptoms like spots, yellowing, wilting, or pests.",
                  "Include how long the issue has been happening."
                ].map((tip) => (
                  <div key={tip} className="rounded-2xl bg-[#F9FAFB] px-4 py-3">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_30px_70px_rgba(10,10,10,0.08)] md:p-8"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Text query</div>
                <h2
                  className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Describe the issue clearly.
                </h2>
              </div>
              <div className="rounded-full border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#6B7280]">
                {question.length}/500
              </div>
            </div>

            <label className="mt-6 block text-sm font-medium text-[#0A0A0A]">
              Your question
              <textarea
                className="mt-2 min-h-[260px] w-full rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] px-5 py-4 text-base leading-7 outline-none transition focus:border-[#2E7D32]"
                maxLength={500}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Example: My tomato leaves have brown spots after three days of rain. The lower leaves are affected first and the issue is spreading quickly. What should I do now?"
                value={question}
              />
            </label>

            {error ? (
              <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm leading-7 text-[#6B7280]">
                The response will be saved to your farmer history and opened in the premium response view.
              </div>
              <motion.button
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
                disabled={submitting || question.trim().length < 12}
                onClick={handleSubmit}
                type="button"
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
              >
                {submitting ? "Generating answer..." : "Get AI Advice"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
