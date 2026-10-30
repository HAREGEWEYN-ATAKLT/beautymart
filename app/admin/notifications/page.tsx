
// "use client";

// import { useCallback, useEffect, useState } from "react";
// import "./notifications.css";

// type NotificationItem = {
//   notificationId: string;
//   title: string;
//   message: string;
//   notificationType: "ORDER" | "PAYMENT" | "INVENTORY" | "SUBSCRIPTION" | "SYSTEM";
//   isRead: boolean;
//   createdAt: string;
// };

// type FilterType = "ALL" | "UNREAD" | "READ";

// const typeLabels: Record<NotificationItem["notificationType"], string> = {
//   ORDER: "Order",
//   PAYMENT: "Payment",
//   INVENTORY: "Inventory",
//   SUBSCRIPTION: "Subscription",
//   SYSTEM: "System",
// };

// const typeIcons: Record<NotificationItem["notificationType"], string> = {
//   ORDER: "📦",
//   PAYMENT: "💳",
//   INVENTORY: "🛍️",
//   SUBSCRIPTION: "🔄",
//   SYSTEM: "⚙️",
// };

// function formatDate(value: string) {
//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) return "Date unavailable";

//   return new Intl.DateTimeFormat("en", {
//     dateStyle: "medium",
//     timeStyle: "short",
//   }).format(date);
// }

// export default function AdminNotificationsPage() {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [filter, setFilter] = useState<FilterType>("ALL");
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);
//   const [error, setError] = useState("");

//   const loadNotifications = useCallback(async () => {
//     try {
//       setError("");

//       const response = await fetch("/api/notifications", {
//         cache: "no-store",
//       });

//       if (!response.ok) {
//         throw new Error(
//           response.status === 401
//             ? "Your session has expired. Please sign in again."
//             : "Unable to load notifications."
//         );
//       }

//       const data = await response.json();

//       setNotifications(
//         Array.isArray(data.notifications) ? data.notifications : []
//       );
//       setUnreadCount(
//         typeof data.unreadCount === "number" ? data.unreadCount : 0
//       );
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Unable to load notifications."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     void loadNotifications();
//   }, [loadNotifications]);

//   const markAsRead = async (notificationId: string) => {
//     const target = notifications.find(
//       (item) => item.notificationId === notificationId
//     );

//     if (!target || target.isRead) return;

//     setUpdating(true);
//     setError("");

//     try {
//       const response = await fetch("/api/notifications", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ notificationId }),
//       });

//       if (!response.ok) {
//         throw new Error("Could not mark this notification as read.");
//       }

//       setNotifications((current) =>
//         current.map((item) =>
//           item.notificationId === notificationId
//             ? { ...item, isRead: true }
//             : item
//         )
//       );

//       setUnreadCount((count) => Math.max(0, count - 1));
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Something went wrong."
//       );
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const markAllAsRead = async () => {
//     if (unreadCount === 0) return;

//     setUpdating(true);
//     setError("");

//     try {
//       const response = await fetch("/api/notifications", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ markAllRead: true }),
//       });

//       if (!response.ok) {
//         throw new Error("Could not mark notifications as read.");
//       }

//       setNotifications((current) =>
//         current.map((item) => ({ ...item, isRead: true }))
//       );
//       setUnreadCount(0);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Something went wrong."
//       );
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const filteredNotifications = notifications.filter((item) => {
//     if (filter === "UNREAD") return !item.isRead;
//     if (filter === "READ") return item.isRead;
//     return true;
//   });

//   return (
//     <section className="admin-dashboard-content notifications-page">
//       <div className="notifications-intro">
//         <div>
//           <p className="notifications-eyebrow">YOUR ACTIVITY CENTER</p>
//           <h2>Notifications</h2>
//           <p className="notifications-description">
//             Keep track of important updates and activity across BeautyMart.
//           </p>
//         </div>

//         <button
//           type="button"
//           className="notifications-mark-all"
//           onClick={markAllAsRead}
//           disabled={updating || unreadCount === 0}
//         >
//           Mark all as read
//         </button>
//       </div>

//       <div className="notifications-summary">
//         <div className="notifications-summary-card">
//           <span className="notifications-summary-icon">🔔</span>
//           <div>
//             <span className="notifications-summary-label">Unread</span>
//             <strong>{unreadCount}</strong>
//           </div>
//         </div>

//         <div className="notifications-summary-card">
//           <span className="notifications-summary-icon">📋</span>
//           <div>
//             <span className="notifications-summary-label">Loaded notifications</span>
//             <strong>{notifications.length}</strong>
//           </div>
//         </div>
//       </div>

//       <div className="notifications-list-panel">
//         <div className="notifications-list-header">
//           <div>
//             <h3>Recent activity</h3>
//             <p>Your latest notifications from the database</p>
//           </div>

//           <button
//             type="button"
//             className="notifications-refresh"
//             onClick={() => {
//               setLoading(true);
//               void loadNotifications();
//             }}
//             disabled={loading}
//           >
//             ↻ Refresh
//           </button>
//         </div>

//         <div className="notifications-filters" aria-label="Filter notifications">
//           {(["ALL", "UNREAD", "READ"] as const).map((item) => (
//             <button
//               type="button"
//               key={item}
//               className={`notifications-filter ${filter === item ? "active" : ""}`}
//               onClick={() => setFilter(item)}
//               aria-pressed={filter === item}
//             >
//               {item === "ALL" ? "All" : item === "UNREAD" ? "Unread" : "Read"}
//               {item === "UNREAD" && unreadCount > 0 && (
//                 <span className="notifications-filter-count">{unreadCount}</span>
//               )}
//             </button>
//           ))}
//         </div>

//         {error && (
//           <div className="notifications-error" role="alert">
//             {error}
//             <button type="button" onClick={() => void loadNotifications()}>
//               Try again
//             </button>
//           </div>
//         )}

//         {loading ? (
//           <div className="notifications-state">
//             <span className="notifications-spinner" />
//             <p>Loading your notifications...</p>
//           </div>
//         ) : filteredNotifications.length === 0 ? (
//           <div className="notifications-state notifications-empty">
//             <span className="notifications-empty-icon">
//               {filter === "UNREAD" ? "✓" : "🔔"}
//             </span>
//             <h4>
//               {filter === "UNREAD"
//                 ? "You're all caught up"
//                 : filter === "READ"
//                   ? "No read notifications yet"
//                   : "No notifications yet"}
//             </h4>
//             <p>
//               {filter === "UNREAD"
//                 ? "New unread updates will appear here when BeautyMart creates them."
//                 : "Notifications will appear here when real platform events are connected."}
//             </p>
//           </div>
//         ) : (
//           <div className="notifications-items">
//             {filteredNotifications.map((item) => (
//               <article
//                 key={item.notificationId}
//                 className={`notification-item ${item.isRead ? "is-read" : "is-unread"}`}
//               >
//                 <div className={`notification-type-icon type-${item.notificationType.toLowerCase()}`}>
//                   {typeIcons[item.notificationType]}
//                 </div>

//                 <div className="notification-item-content">
//                   <div className="notification-item-heading">
//                     <h4>{item.title}</h4>
//                     {!item.isRead && (
//                       <span className="notification-unread-dot" aria-label="Unread" />
//                     )}
//                   </div>

//                   <p className="notification-message">{item.message}</p>

//                   <div className="notification-item-meta">
//                     <span className="notification-type-label">
//                       {typeLabels[item.notificationType] ?? "Notification"}
//                     </span>
//                     <span>{formatDate(item.createdAt)}</span>
//                   </div>
//                 </div>

//                 {!item.isRead && (
//                   <button
//                     type="button"
//                     className="notification-read-button"
//                     onClick={() => void markAsRead(item.notificationId)}
//                     disabled={updating}
//                     aria-label={`Mark ${item.title} as read`}
//                     title="Mark as read"
//                   >
//                     ✓
//                   </button>
//                 )}
//               </article>
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }


"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./notifications.css";

type NotificationItem = {
  notificationId: string;
  title: string;
  message: string;
  notificationType:
    | "ORDER"
    | "PAYMENT"
    | "INVENTORY"
    | "SUBSCRIPTION"
    | "SYSTEM";
  isRead: boolean;
  createdAt: string;
};

type FilterType = "ALL" | "UNREAD" | "READ";

const typeLabels: Record<NotificationItem["notificationType"], string> = {
  ORDER: "Order",
  PAYMENT: "Payment",
  INVENTORY: "Inventory",
  SUBSCRIPTION: "Subscription",
  SYSTEM: "System",
};

const typeIcons: Record<NotificationItem["notificationType"], string> = {
  ORDER: "📦",
  PAYMENT: "💳",
  INVENTORY: "🛍️",
  SUBSCRIPTION: "🔄",
  SYSTEM: "⚙️",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function AdminNotificationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("notificationId");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : response.status === 403
              ? "You do not have permission to view these notifications."
              : "Unable to load notifications."
        );
      }

      const data = await response.json();

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );

      setUnreadCount(
        typeof data.unreadCount === "number" ? data.unreadCount : 0
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadNotifications(), 0);
    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  const selectedNotification =
    notifications.find((item) => item.notificationId === selectedId) ?? null;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const target = notifications.find(
        (item) => item.notificationId === notificationId
      );

      if (!target || target.isRead) return true;

      setUpdating(true);
      setError("");

      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId }),
        });

        if (!response.ok) {
          throw new Error("Could not mark this notification as read.");
        }

        setNotifications((current) =>
          current.map((item) =>
            item.notificationId === notificationId
              ? { ...item, isRead: true }
              : item
          )
        );

        setUnreadCount((count) => Math.max(0, count - 1));

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );

        return false;
      } finally {
        setUpdating(false);
      }
    },
    [notifications]
  );

  // Opening a notification from the dropdown or list marks it as read.
  useEffect(() => {
    if (!selectedId || loading || !selectedNotification) return;

    if (!selectedNotification.isRead) {
      const timer = window.setTimeout(() => void markAsRead(selectedId), 0);
      return () => window.clearTimeout(timer);
    }
  }, [selectedId, loading, selectedNotification, markAsRead]);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    setUpdating(true);
    setError("");

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!response.ok) {
        throw new Error("Could not mark notifications as read.");
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setUpdating(false);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "UNREAD") return !item.isRead;
    if (filter === "READ") return item.isRead;
    return true;
  });

  function openNotification(notificationId: string) {
    router.push(
      `/admin/notifications?notificationId=${encodeURIComponent(notificationId)}`
    );
  }

  function closeNotification() {
    router.push("/admin/notifications");
  }

  if (selectedId && !loading && !selectedNotification) {
    return (
      <section className="admin-dashboard-content notifications-page">
        <div className="notifications-list-panel">
          <div className="notifications-state">
            <h4>Notification not found</h4>
            <p>
              It may have been removed or may not belong to your account.
            </p>
            {error && <p role="alert">{error}</p>}
            <button
              type="button"
              className="notifications-refresh"
              onClick={closeNotification}
            >
              Back to notifications
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (selectedNotification) {
    return (
      <section className="admin-dashboard-content notifications-page">
        <div className="notifications-intro">
          <div>
            <p className="notifications-eyebrow">YOUR ACTIVITY CENTER</p>
            <h2>Notification details</h2>
            <p className="notifications-description">
              Review the full message and its timestamp.
            </p>
          </div>

          <button
            type="button"
            className="notifications-mark-all"
            onClick={closeNotification}
          >
            ← Back to notifications
          </button>
        </div>

        {error && (
          <div className="notifications-error" role="alert">
            {error}
            <button
              type="button"
              onClick={() => void markAsRead(selectedNotification.notificationId)}
            >
              Try again
            </button>
          </div>
        )}

        <article className="notification-item is-read">
          <div
            className={`notification-type-icon type-${selectedNotification.notificationType.toLowerCase()}`}
          >
            {typeIcons[selectedNotification.notificationType]}
          </div>

          <div className="notification-item-content">
            <div className="notification-item-heading">
              <h4>{selectedNotification.title}</h4>
            </div>

            <div className="notification-item-meta">
              <span className="notification-type-label">
                {typeLabels[selectedNotification.notificationType]}
              </span>
              <span>{formatDate(selectedNotification.createdAt)}</span>
            </div>

            <p className="notification-message">
              {selectedNotification.message}
            </p>

            <p className="notifications-description">
              {selectedNotification.isRead || updating
                ? selectedNotification.isRead
                  ? "You have read this notification."
                  : "Updating notification status…"
                : "Marking notification as read…"}
            </p>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="admin-dashboard-content notifications-page">
      <div className="notifications-intro">
        <div>
          <p className="notifications-eyebrow">YOUR ACTIVITY CENTER</p>
          <h2>Notifications</h2>
          <p className="notifications-description">
            Keep track of important updates and activity across BeautyMart.
          </p>
        </div>

        <button
          type="button"
          className="notifications-mark-all"
          onClick={() => void markAllAsRead()}
          disabled={updating || unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      <div className="notifications-summary">
        <div className="notifications-summary-card">
          <span className="notifications-summary-icon">🔔</span>
          <div>
            <span className="notifications-summary-label">Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="notifications-summary-card">
          <span className="notifications-summary-icon">📋</span>
          <div>
            <span className="notifications-summary-label">
              Loaded notifications
            </span>
            <strong>{notifications.length}</strong>
          </div>
        </div>
      </div>

      <div className="notifications-list-panel">
        <div className="notifications-list-header">
          <div>
            <h3>Recent activity</h3>
            <p>Your latest notifications from the database</p>
          </div>

          <button
            type="button"
            className="notifications-refresh"
            onClick={() => {
              setLoading(true);
              void loadNotifications();
            }}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="notifications-filters" aria-label="Filter notifications">
          {(["ALL", "UNREAD", "READ"] as const).map((item) => (
            <button
              type="button"
              key={item}
              className={`notifications-filter ${
                filter === item ? "active" : ""
              }`}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
            >
              {item === "ALL" ? "All" : item === "UNREAD" ? "Unread" : "Read"}
              {item === "UNREAD" && unreadCount > 0 && (
                <span className="notifications-filter-count">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="notifications-error" role="alert">
            {error}
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadNotifications();
              }}
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="notifications-state">
            <span className="notifications-spinner" />
            <p>Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-state notifications-empty">
            <span className="notifications-empty-icon">
              {filter === "UNREAD" ? "✓" : "🔔"}
            </span>
            <h4>
              {filter === "UNREAD"
                ? "You're all caught up"
                : filter === "READ"
                  ? "No read notifications yet"
                  : "No notifications yet"}
            </h4>
            <p>
              {filter === "UNREAD"
                ? "New unread updates will appear here when BeautyMart creates them."
                : "Notifications will appear here when real platform events are connected."}
            </p>
          </div>
        ) : (
          <div className="notifications-items">
            {filteredNotifications.map((item) => (
              <article
                key={item.notificationId}
                className={`notification-item ${
                  item.isRead ? "is-read" : "is-unread"
                }`}
              >
                <button
                  type="button"
                  className="notification-item-content"
                  onClick={() => openNotification(item.notificationId)}
                  aria-label={`Open notification: ${item.title}`}
                >
                  <div className="notification-item-heading">
                    <h4>{item.title}</h4>
                    {!item.isRead && (
                      <span
                        className="notification-unread-dot"
                        aria-label="Unread"
                      />
                    )}
                  </div>

                  <p className="notification-message">{item.message}</p>

                  <div className="notification-item-meta">
                    <span className="notification-type-label">
                      {typeLabels[item.notificationType]}
                    </span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </button>

                <div
                  className={`notification-type-icon type-${item.notificationType.toLowerCase()}`}
                  aria-hidden="true"
                >
                  {typeIcons[item.notificationType]}
                </div>

                {!item.isRead && (
                  <button
                    type="button"
                    className="notification-read-button"
                    onClick={() => void markAsRead(item.notificationId)}
                    disabled={updating}
                    aria-label={`Mark ${item.title} as read`}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function AdminNotificationsPage() {
  return (
    <Suspense
      fallback={
        <section className="admin-dashboard-content notifications-page">
          <div className="notifications-state">
            <span className="notifications-spinner" />
            <p>Loading notifications...</p>
          </div>
        </section>
      }
    >
      <AdminNotificationsContent />
    </Suspense>
  );
}
