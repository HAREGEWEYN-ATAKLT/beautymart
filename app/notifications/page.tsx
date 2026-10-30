"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type NotificationItem = { notificationId: string; title: string; message: string; notificationType: string; deduplicationKey?: string | null; isRead: boolean; createdAt: string };

function notificationOrderId(key?: string | null) {
  if (!key) return null;
  const parts = key.split(":");
  if (parts[0] === "order-status") return parts[1] || null;
  if (parts[0] === "customer-order-payment") return parts[2] || null;
  return null;
}

function NotificationsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("notificationId");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const updating = useRef(new Set<string>());

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) { setError(response.status === 401 ? "Please sign in to view your notifications." : "We could not load notifications. Please try again."); return; }
      const data = await response.json();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      setError("");
    } catch { setError("A connection problem prevented loading notifications."); } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const markRead = useCallback(async (id: string) => {
    if (updating.current.has(id)) return;
    updating.current.add(id);
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: id }) });
      if (response.ok) { setNotifications((items) => items.map((item) => item.notificationId === id ? { ...item, isRead: true } : item)); setUnreadCount((count) => Math.max(0, count - 1)); }
    } finally { updating.current.delete(id); }
  }, []);
  const selected = notifications.find((item) => item.notificationId === selectedId);
  useEffect(() => { if (selected && !selected.isRead) void markRead(selected.notificationId); }, [selected, markRead]);
  const formatDate = (value: string) => new Intl.DateTimeFormat("en-ET", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

  return <main className="customer-notifications-page"><div className="customer-notifications-container">
    <Link href="/account" className="customer-notifications-back">← My account</Link>
    <header><p>BEAUTYMART UPDATES</p><h1>Notifications</h1><span>{unreadCount ? `${unreadCount} unread` : "You’re all caught up"}</span></header>
    {loading ? <section className="customer-inbox-state">Loading your notifications…</section> : error ? <section className="customer-inbox-state"><p>{error}</p><button type="button" onClick={() => { setLoading(true); void load(); }}>Try again</button></section> : selectedId ? selected ? <section className="customer-notification-detail"><button type="button" onClick={() => router.push("/notifications")}>← All notifications</button><p>{selected.notificationType}</p><h2>{selected.title}</h2><time dateTime={selected.createdAt}>{formatDate(selected.createdAt)}</time><div>{selected.message}</div>{notificationOrderId(selected.deduplicationKey) && <Link className="customer-notification-order-link" href={`/orders/${notificationOrderId(selected.deduplicationKey)}`}>View order</Link>}</section> : <section className="customer-inbox-state">This notification is unavailable. <button type="button" onClick={() => router.push("/notifications")}>Back to all notifications</button></section> : notifications.length === 0 ? <section className="customer-inbox-state">No notifications yet. We will tell you when your payment or order changes.</section> : <section className="customer-inbox-list">{notifications.map((item) => <button type="button" key={item.notificationId} className={item.isRead ? "" : "unread"} onClick={() => router.push(`/notifications?notificationId=${encodeURIComponent(item.notificationId)}`)}><span><b>{item.title}</b>{!item.isRead && <i aria-label="Unread" />}<small>{item.message}</small><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></span><strong aria-hidden="true">→</strong></button>)}</section>}
  </div></main>;
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<main className="customer-notifications-page"><div className="customer-notifications-container"><section className="customer-inbox-state">Loading notifications…</section></div></main>}>
      <NotificationsContent />
    </Suspense>
  );
}
