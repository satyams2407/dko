"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Notification } from "@dko/shared";
import { ArrowLeft, Bell, CheckCheck, Clock3, Leaf } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiClient } from "@/lib/api";

const heroImage =
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400&q=80&auto=format&fit=crop";

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

export default function FarmerNotificationsPage() {
  const router = useRouter();
  const { appUser, loading } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !appUser) {
      router.replace("/farmer/login");
    }
  }, [appUser, loading, router]);

  async function loadNotifications() {
    if (!appUser) {
      return;
    }

    setFetching(true);
    setError(null);

    try {
      const result = await apiClient.get<{ success: true; data: { items: Notification[]; unreadCount: number } }>("/notifications");
      setItems(result.data.data.items);
      setUnreadCount(result.data.data.unreadCount);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load notifications.");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, [appUser]);

  const grouped = useMemo(() => {
    return {
      unread: items.filter((item) => !item.isRead),
      read: items.filter((item) => item.isRead)
    };
  }, [items]);

  async function markAllRead() {
    setMarking(true);
    setError(null);

    try {
      await apiClient.post("/notifications/read-all");
      await loadNotifications();
    } catch (markError) {
      console.error(markError);
      setError("Failed to mark notifications as read.");
    } finally {
      setMarking(false);
    }
  }

  async function markOneRead(notificationId: string) {
    try {
      await apiClient.post(`/notifications/${notificationId}/read`);
      await loadNotifications();
    } catch (markError) {
      console.error(markError);
      setError("Failed to mark notification as read.");
    }
  }

  if (loading || !appUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-center text-[#6B7280]">
        Loading notifications...
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
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(10,10,10,0.06)]">
            <div className="h-[240px] w-full" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.04) 0%, rgba(10,10,10,0.42) 100%), url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="p-6 md:p-8">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                <Leaf className="h-4 w-4" /> Farmer inbox
              </div>
              <h1 className="mt-4 text-[40px] font-bold leading-[1.04] tracking-[-1.4px] md:text-[54px]" style={{ fontFamily: "var(--font-display)" }}>
                Stay Updated On Human Review And Resolutions.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-[#6B7280]">
                When a case is escalated or an officer responds, it appears here immediately. This is the fastest reliable notification surface for the prototype.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-[#F9FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#6B7280]">Unread</div>
                  <div className="mt-2 text-3xl font-bold tracking-[-1px] text-[#0A0A0A]" style={{ fontFamily: "var(--font-display)" }}>{unreadCount}</div>
                </div>
                <div className="rounded-[24px] bg-[#F9FAFB] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#6B7280]">Total</div>
                  <div className="mt-2 text-3xl font-bold tracking-[-1px] text-[#0A0A0A]" style={{ fontFamily: "var(--font-display)" }}>{items.length}</div>
                </div>
              </div>

              <button className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0A] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9CA3AF]" disabled={marking || unreadCount === 0} onClick={() => { void markAllRead(); }} type="button">
                <CheckCheck className="mr-2 h-4 w-4" /> {marking ? "Updating..." : "Mark all as read"}
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_30px_70px_rgba(10,10,10,0.08)] md:p-8">
            <div className="text-[12px] uppercase tracking-[0.24em] text-[#6B7280]">Inbox</div>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-1px]" style={{ fontFamily: "var(--font-display)" }}>
              Recent updates.
            </h2>

            {error ? <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="mt-6 grid gap-4">
              {fetching ? (
                <div className="rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] px-5 py-10 text-center text-[#6B7280]">Loading notifications...</div>
              ) : items.length === 0 ? (
                <div className="rounded-[24px] border border-[#E5E7EB] bg-[#FCFCFB] px-5 py-10 text-center text-[#6B7280]">No notifications yet.</div>
              ) : (
                items.map((item, index) => (
                  <motion.div key={item.notificationId} className={`rounded-[24px] border p-5 ${item.isRead ? "border-[#E5E7EB] bg-[#FCFCFB]" : "border-[#C8E6C9] bg-[#F1F8E9]"}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.04 }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0A]">
                        <Bell className="h-4 w-4 text-[#2E7D32]" /> {item.title}
                      </div>
                      <div className="inline-flex items-center text-xs font-medium text-[#6B7280]">
                        <Clock3 className="mr-2 h-3.5 w-3.5" /> {formatDate(item.createdAt)}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#6B7280]">{item.message}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {item.queryId ? <a className="inline-flex h-11 items-center justify-center rounded-full bg-[#0A0A0A] px-4 text-sm font-semibold text-white" href={`/farmer/response/${item.queryId}`}>Open query</a> : null}
                      {!item.isRead ? <button className="inline-flex h-11 items-center justify-center rounded-full border border-[#E5E7EB] px-4 text-sm font-semibold text-[#0A0A0A]" onClick={() => { void markOneRead(item.notificationId); }} type="button">Mark as read</button> : null}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
