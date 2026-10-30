"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  notificationId: string;
  title: string;
  message: string;
  notificationType: "ORDER" | "PAYMENT" | "INVENTORY" | "SUBSCRIPTION" | "SYSTEM";
  isRead: boolean;
  createdAt: string;
};

export default function CustomerNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) {
        setError(response.status === 401 ? "Please sign in again to view notifications." : "Unable to load notifications.");
        return;
      }
      const data = await response.json();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      setError("");
    } catch {
      setError("A connection problem prevented loading notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const intervalId = window.setInterval(() => void loadNotifications(), 30000);
    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  function openNotification(notificationId?: string) {
    setIsOpen(false);
    router.push(notificationId ? `/notifications?notificationId=${encodeURIComponent(notificationId)}` : "/notifications");
  }

  function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-ET", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  return (
    <div className="customer-notifications">
      <button type="button" className="customer-notification-button" onClick={() => { const opening = !isOpen; setIsOpen(opening); if (opening) void loadNotifications(); }} aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"} aria-expanded={isOpen} aria-haspopup="dialog">
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && <span className="customer-notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {isOpen && (
        <section className="customer-notification-panel" role="dialog" aria-label="Your notifications">
          <div className="customer-notification-header"><div><h2>Notifications</h2><p>{unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You’re all caught up"}</p></div><button type="button" onClick={() => setIsOpen(false)} aria-label="Close notifications">×</button></div>
          <div className="customer-notification-actions"><button type="button" onClick={() => openNotification()}>See all notifications →</button></div>
          <div className="customer-notification-list" aria-live="polite">
            {isLoading ? <p>Loading notifications…</p> : error ? <p>{error}</p> : notifications.length === 0 ? <p>No notifications yet. Order and payment updates will appear here.</p> : notifications.slice(0, 5).map((notification) => (
              <button type="button" key={notification.notificationId} className={`customer-notification-item${notification.isRead ? "" : " unread"}`} onClick={() => openNotification(notification.notificationId)}>
                <span><strong>{notification.title}</strong>{!notification.isRead && <i aria-label="Unread" />}<small>{notification.message}</small><time dateTime={notification.createdAt}>{formatDate(notification.createdAt)}</time></span><b aria-hidden="true">→</b>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
