"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { signInOfficer, signOutSession } from "@/lib/auth";

const heroImage =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    try {
      const user = await signInOfficer(email, password);
      if (user.role !== "officer" && user.role !== "admin") {
        await signOutSession();
        throw new Error("This account is not allowed to access the officer dashboard.");
      }

      router.push("/dashboard");
    } catch (loginError) {
      console.error(loginError);
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Failed to sign in with email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <section className="mx-auto grid min-h-screen max-w-[1440px] gap-8 px-5 py-8 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(10,10,10,0.06)]">
          <div className="h-[260px] w-full" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.52) 100%), url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="p-6 md:p-8">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
              <ShieldCheck className="h-4 w-4" /> Officer-only access
            </div>
            <h1 className="mt-4 text-[40px] font-bold leading-[1.04] tracking-[-1.4px] md:text-[54px]" style={{ fontFamily: "var(--font-display)" }}>
              Review Farmer Escalations With Human Judgment.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#6B7280]">
              Sign in with an officer-approved Firebase account to claim unresolved AI cases and respond directly into the farmer advisory thread.
            </p>
          </div>
        </div>

        <motion.div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_30px_70px_rgba(10,10,10,0.08)] md:p-8" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Officer login</div>
          <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]" style={{ fontFamily: "var(--font-display)" }}>
            Sign in with email.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#6B7280]">
            This route is restricted to users whose Firestore role is set to <span className="font-semibold text-[#0A0A0A]">officer</span> or <span className="font-semibold text-[#0A0A0A]">admin</span>.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-[#0A0A0A]">
              Email
              <input className="mt-2 w-full rounded-[22px] border border-[#E5E7EB] bg-[#FCFCFB] px-4 py-3 outline-none transition focus:border-[#2E7D32]" onChange={(event) => setEmail(event.target.value)} placeholder="officer@dko.com" type="email" value={email} />
            </label>

            <label className="block text-sm font-medium text-[#0A0A0A]">
              Password
              <input className="mt-2 w-full rounded-[22px] border border-[#E5E7EB] bg-[#FCFCFB] px-4 py-3 outline-none transition focus:border-[#2E7D32]" onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" type="password" value={password} />
            </label>

            <button className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#0A0A0A] px-5 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9CA3AF]" disabled={loading || !email || !password} onClick={handleLogin} type="button">
              {loading ? "Signing in..." : "Sign in to Dashboard"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          {error ? <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="mt-6 text-sm text-[#6B7280]">
            Farmer? <a className="font-semibold text-[#0A0A0A]" href="/farmer/login">Use farmer sign in</a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
