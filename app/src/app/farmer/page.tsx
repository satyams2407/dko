"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function FarmerHomePage() {
  const router = useRouter();
  const { appUser, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (appUser) {
      router.replace("/farmer/query");
      return;
    }

    router.replace("/farmer/login");
  }, [appUser, loading, router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-5 py-8 text-center text-slate-700">
      Redirecting...
    </main>
  );
}
