// export default function StoreOwnerNotificationsPage() {
//   return (
//     <main>
//       <h1>Notifications</h1>
//       <p>Your notifications page is ready to be implemented.</p>
//     </main>
//   );
// }

"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

type NotificationType =
  | "ORDER"
  | "PAYMENT"
  | "INVENTORY"
  | "SUBSCRIPTION"
  | "SYSTEM";

type NotificationItem = {
  notificationId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  isRead: boolean;
  createdAt: string;
  deduplicationKey?: string | null;
};

const CATEGORY_LABELS: Record<NotificationType, string> = {
  ORDER: "Orders",
  PAYMENT: "Payments",
  INVENTORY: "Inventory",
  SUBSCRIPTION: "Subscription",
  SYSTEM: "System",
};

const CATEGORY_ICONS: Record<NotificationType, string> = {
  ORDER: "O",
  PAYMENT: "₿",
  INVENTORY: "I",
  SUBSCRIPTION: "S",
  SYSTEM: "!",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 60) return "Just now";

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (absSeconds < 3600) {
    return formatter.format(Math.round(seconds / 60), "minute");
  }

  if (absSeconds < 86400) {
    return formatter.format(Math.round(seconds / 3600), "hour");
  }

  if (absSeconds < 604800) {
    return formatter.format(Math.round(seconds / 86400), "day");
  }

  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
  }).format(date);
}

function NotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("notificationId");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // Prevent duplicate mark-as-read requests for the same notification.
  const markingIds = useRef(new Set<string>());

  const loadNotifications = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Your session may have expired. Please sign in again.");
        } else {
          setError("We couldn't load your notifications. Please try again.");
        }
        return;
      }

      const data = await response.json();

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );

      setUnreadCount(
        typeof data.unreadCount === "number" ? data.unreadCount : 0
      );
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("A connection problem occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (markingIds.current.has(notificationId)) return;

      markingIds.current.add(notificationId);

      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId }),
        });

        if (!response.ok) {
          setActionError("Couldn't update this notification. Please try again.");
          return;
        }

        setNotifications((current) =>
          current.map((item) =>
            item.notificationId === notificationId
              ? { ...item, isRead: true }
              : item
          )
        );

        setUnreadCount((current) => Math.max(0, current - 1));
        setActionError("");
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        setActionError("A connection problem prevented the update.");
      } finally {
        markingIds.current.delete(notificationId);
      }
    },
    []
  );

  // Opening a notification directly from the bell also marks it as read.
  useEffect(() => {
    if (!selectedId || isLoading) return;

    const selected = notifications.find(
      (item) => item.notificationId === selectedId
    );

    if (selected && !selected.isRead) {
      void markNotificationAsRead(selected.notificationId);
    }
  }, [selectedId, notifications, isLoading, markNotificationAsRead]);

  async function markAllAsRead() {
    if (unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);
    setActionError("");

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!response.ok) {
        setActionError("Couldn't mark all notifications as read.");
        return;
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setActionError("A connection problem prevented the update.");
    } finally {
      setIsMarkingAll(false);
    }
  }

  function openNotification(notification: NotificationItem) {
    router.push(
      `/store-owner/notifications?notificationId=${encodeURIComponent(
        notification.notificationId
      )}`
    );
  }

  function returnToInbox() {
    router.push("/store-owner/notifications");
    setActionError("");
  }

  const selectedNotification = notifications.find(
    (item) => item.notificationId === selectedId
  );

  const showDetail = Boolean(selectedId);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button
            type="button"
            onClick={() => router.push("/store-owner")}
            className={styles.breadcrumbLink}
          >
            Dashboard
          </button>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Notifications</span>
        </nav>

        <header className={styles.pageHeader}>
          <div>
            <div className={styles.eyebrow}>YOUR STORE, AT A GLANCE</div>
            <h1>Notifications</h1>
            <p className={styles.subtitle}>
              Stay up to date with orders, payments, and important store activity.
            </p>
          </div>

          {!showDetail && unreadCount > 0 && (
            <button
              type="button"
              className={styles.markAllButton}
              onClick={markAllAsRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? "Updating…" : "Mark all as read"}
            </button>
          )}
        </header>

        <section className={styles.summary} aria-label="Notification summary">
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>N</div>
            <div>
              <span className={styles.summaryLabel}>Total loaded</span>
              <strong>{isLoading ? "—" : notifications.length}</strong>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.unreadSummaryIcon}`}>
              •
            </div>
            <div>
              <span className={styles.summaryLabel}>Unread</span>
              <strong>{isLoading ? "—" : unreadCount}</strong>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.readSummaryIcon}`}>
              ✓
            </div>
            <div>
              <span className={styles.summaryLabel}>Read</span>
              <strong>
                {isLoading
                  ? "—"
                  : Math.max(0, notifications.length - notifications.filter(
                      (item) => !item.isRead
                    ).length)}
              </strong>
            </div>
          </div>
        </section>

        {actionError && (
          <div className={styles.actionError} role="alert">
            <span>{actionError}</span>
            <button type="button" onClick={() => setActionError("")}>
              Dismiss
            </button>
          </div>
        )}

        <section className={styles.inbox}>
          <div className={styles.inboxHeader}>
            {showDetail ? (
              <button
                type="button"
                className={styles.backButton}
                onClick={returnToInbox}
              >
                <span aria-hidden="true">←</span> All notifications
              </button>
            ) : (
              <div>
                <h2>Your inbox</h2>
                <p>Recent updates from your store</p>
              </div>
            )}

            {!showDetail && !isLoading && (
              <span className={styles.inboxCount}>
                {notifications.length}{" "}
                {notifications.length === 1 ? "notification" : "notifications"}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className={styles.loadingState} role="status">
              <span className={styles.spinner} />
              <p>Loading your notifications…</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>!</div>
              <h3>We couldn’t load your inbox</h3>
              <p>{error}</p>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  setIsLoading(true);
                  void loadNotifications();
                }}
              >
                Try again
              </button>
            </div>
          ) : showDetail ? (
            selectedNotification ? (
              <article className={styles.detail}>
                <div className={styles.detailTop}>
                  <div
                    className={`${styles.categoryIcon} ${
                      styles[`category${selectedNotification.notificationType}`]
                    }`}
                    aria-hidden="true"
                  >
                    {CATEGORY_ICONS[selectedNotification.notificationType]}
                  </div>
                  <span
                    className={`${styles.categoryBadge} ${
                      styles[`badge${selectedNotification.notificationType}`]
                    }`}
                  >
                    {CATEGORY_LABELS[selectedNotification.notificationType]}
                  </span>
                  {!selectedNotification.isRead && (
                    <span className={styles.unreadBadge}>Unread</span>
                  )}
                </div>

                <h2 className={styles.detailTitle}>
                  {selectedNotification.title}
                </h2>

                <div className={styles.detailDate}>
                  <time dateTime={selectedNotification.createdAt}>
                    {formatDate(selectedNotification.createdAt)}
                  </time>
                </div>

                <div className={styles.detailMessage}>
                  {selectedNotification.message}
                </div>

                {selectedNotification.deduplicationKey?.startsWith("store-cancellation-request:") && (() => {
                  const [, orderId] = selectedNotification.deduplicationKey.split(":");
                  return orderId ? <button type="button" className={styles.primaryButton} onClick={() => router.push(`/store-owner/orders/${orderId}`)}>Review cancellation request</button> : null;
                })()}

                <div className={styles.detailFooter}>
                  <span>BeautyMart · Store notifications</span>
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={returnToInbox}
                  >
                    Back to inbox
                  </button>
                </div>
              </article>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>i</div>
                <h3>Notification not found</h3>
                <p>
                  It may no longer be available in your recent notifications.
                </p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={returnToInbox}
                >
                  Return to inbox
                </button>
              </div>
            )
          ) : notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>✓</div>
              <h3>You’re all caught up</h3>
              <p>
                There are no notifications yet. Updates about your store will
                appear here when something needs your attention.
              </p>
            </div>
          ) : (
            <div className={styles.list} aria-label="Notification list">
              {notifications.map((notification) => (
                <button
                  key={notification.notificationId}
                  type="button"
                  className={`${styles.notificationRow} ${
                    notification.isRead ? "" : styles.notificationUnread
                  }`}
                  onClick={() => openNotification(notification)}
                >
                  <span
                    className={`${styles.categoryIcon} ${
                      styles[`category${notification.notificationType}`]
                    }`}
                    aria-hidden="true"
                  >
                    {CATEGORY_ICONS[notification.notificationType]}
                  </span>

                  <span className={styles.notificationContent}>
                    <span className={styles.notificationHeading}>
                      <span className={styles.notificationTitle}>
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <span className={styles.unreadDot} aria-label="Unread" />
                      )}
                    </span>

                    <span className={styles.notificationMessage}>
                      {notification.message}
                    </span>

                    <span className={styles.notificationMeta}>
                      <span
                        className={`${styles.categoryBadge} ${
                          styles[`badge${notification.notificationType}`]
                        }`}
                      >
                        {CATEGORY_LABELS[notification.notificationType]}
                      </span>
                      <time dateTime={notification.createdAt}>
                        {formatRelativeDate(notification.createdAt)}
                      </time>
                    </span>
                  </span>

                  <span className={styles.rowArrow} aria-hidden="true">
                    →
                  </span>
                </button>
              ))}
            </div>
          )}

          {!isLoading && !error && !showDetail && notifications.length > 0 && (
            <footer className={styles.inboxFooter}>
              Showing your {notifications.length} most recent notifications.
            </footer>
          )}
        </section>

        <footer className={styles.pageFooter}>
          <span className={styles.footerMark}>B</span>
          <span>BeautyMart Store Centre</span>
          <span className={styles.footerDot}>·</span>
          <span>Your business, always in the loop.</span>
        </footer>
      </div>
    </main>
  );
}

export default function StoreOwnerNotificationsPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <div className={styles.loadingState} role="status">
            <span className={styles.spinner} />
            <p>Opening your notifications…</p>
          </div>
        </main>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}
