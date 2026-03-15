"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, LogIn, Sprout, UserPlus } from "lucide-react";
import { registerFarmer, signInFarmer } from "@/lib/auth";
import { useAuth } from "@/components/providers/auth-provider";

type FarmerAuthMode = "signin" | "signup";

const panelImage =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&auto=format&fit=crop";

export default function FarmerLoginPage() {
  const router = useRouter();
  const { appUser, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<FarmerAuthMode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && appUser) {
      router.replace("/farmer/query");
    }
  }, [appUser, authLoading, router]);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        await registerFarmer(email, password, {
          name: name.trim() || undefined,
          language: "en"
        });
      } else {
        await signInFarmer(email, password);
      }

      window.location.href = "/farmer/query";
    } catch (authError) {
      console.error(authError);
      setError(
        authError instanceof Error
          ? authError.message
          : "Failed to authenticate farmer account."
      );
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#1A2E1A] lg:block">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.55) 100%), url('${panelImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/80 backdrop-blur">
              <Leaf className="h-4 w-4 text-[#A5D6A7]" /> Farmer Workspace
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/70">Digital Krishi Officer</p>
              <h1
                className="mt-5 max-w-xl text-6xl font-bold leading-[1.02] tracking-[-2px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Access Expert Advisory In Minutes, Not Days.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-white/80">
                Sign in to ask crop questions, receive AI guidance, and build your advisory history in one voice-first farmer experience.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Text guidance", value: "Instant" },
                { label: "Farmer workflow", value: "Live" },
                { label: "Query archive", value: "Saved" },
                { label: "AI advisory", value: "Premium" }
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/15 bg-black/20 p-4 backdrop-blur-sm">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/55">{item.label}</div>
                  <div className="mt-2 text-2xl font-bold">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[560px]">
            <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#6B7280]">
              Premium farmer access
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
              <Leaf className="h-4 w-4" /> DKO Farmer
            </div>
            <h1
              className="mt-4 text-[44px] font-bold leading-[1.05] tracking-[-1.5px] text-[#0A0A0A] md:text-[56px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isSignup ? "Create your advisory account." : "Welcome back to your field desk."}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#6B7280]">
              Farmers use email and password for a faster demo flow. Once authenticated, your Firebase session is verified by the backend and routed directly into the advisory workspace.
            </p>

            <div className="mt-8 inline-flex rounded-full border border-[#E5E7EB] bg-[#F9FAFB] p-1 text-sm font-medium">
              <button
                className={`inline-flex items-center rounded-full px-4 py-2 transition ${isSignup ? "bg-[#0A0A0A] text-white" : "text-[#6B7280]"}`}
                onClick={() => setMode("signup")}
                type="button"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Create account
              </button>
              <button
                className={`inline-flex items-center rounded-full px-4 py-2 transition ${!isSignup ? "bg-[#0A0A0A] text-white" : "text-[#6B7280]"}`}
                onClick={() => setMode("signin")}
                type="button"
              >
                <LogIn className="mr-2 h-4 w-4" /> Sign in
              </button>
            </div>

            <motion.div
              className="mt-8 rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_24px_60px_rgba(10,10,10,0.08)] md:p-8"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="grid gap-5">
                {isSignup ? (
                  <label className="block text-sm font-medium text-[#0A0A0A]">
                    Name
                    <input
                      className="mt-2 h-14 w-full rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFB] px-4 text-base outline-none transition focus:border-[#2E7D32]"
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Karthik Suresh"
                      value={name}
                    />
                  </label>
                ) : null}

                <label className="block text-sm font-medium text-[#0A0A0A]">
                  Email
                  <input
                    className="mt-2 h-14 w-full rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFB] px-4 text-base outline-none transition focus:border-[#2E7D32]"
                    onChange={(event) => setEmail(event.target.value.trim())}
                    placeholder="farmer@example.com"
                    type="email"
                    value={email}
                  />
                </label>

                <label className="block text-sm font-medium text-[#0A0A0A]">
                  Password
                  <input
                    className="mt-2 h-14 w-full rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFB] px-4 text-base outline-none transition focus:border-[#2E7D32]"
                    minLength={6}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
                    type="password"
                    value={password}
                  />
                </label>
              </div>

              <motion.button
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#0A0A0A] px-6 text-base font-semibold text-white"
                disabled={loading || authLoading || !email || password.length < 6 || (isSignup && !name.trim())}
                onClick={handleSubmit}
                type="button"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading
                  ? isSignup
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignup
                    ? "Enter Farmer Workspace"
                    : "Continue to Workspace"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>

              {error ? (
                <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-between gap-4 text-sm text-[#6B7280]">
                <div className="inline-flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-[#2E7D32]" />
                  Authenticated by Firebase, verified by backend.
                </div>
                <a className="font-semibold text-[#0A0A0A]" href="/dashboard/login">
                  Officer login
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
