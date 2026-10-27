
// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// type NotificationItem = {
//   notificationId: string;
//   title: string;
//   message: string;
//   notificationType: "ORDER" | "PAYMENT" | "INVENTORY" | "SUBSCRIPTION" | "SYSTEM";
//   isRead: boolean;
//   createdAt: string;
// };

// export default function StoreOwnerNotifications() {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
// //   const [selectedNotification, setSelectedNotification] =
// //     useState<NotificationItem | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [error, setError] = useState("");
//   const router = useRouter();
//   const loadNotifications = useCallback(async () => {
//     try {
//       const response = await fetch("/api/notifications", {
//         cache: "no-store",
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           setError("Please sign in again to view notifications.");
//         } else {
//           setError("Unable to load notifications.");
//         }
//         return;
//       }

//       const data = await response.json();

//       setNotifications(
//         Array.isArray(data.notifications) ? data.notifications : []
//       );
//       setUnreadCount(
//         typeof data.unreadCount === "number" ? data.unreadCount : 0
//       );
//       setError("");
//     } catch (err) {
//       console.error("Unable to load store-owner notifications:", err);
//       setError("Unable to load notifications. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     void loadNotifications();

//     const intervalId = window.setInterval(() => {
//       void loadNotifications();
//     }, 30000);

//     return () => window.clearInterval(intervalId);
//   }, [loadNotifications]);

// // async function openNotification(notification: NotificationItem) {
// //   setSelectedNotification(notification);

// //   if (notification.isRead) return;

// //   // Update the UI immediately so the unread badge responds instantly.
// //   setNotifications((current) =>
// //     current.map((item) =>
// //       item.notificationId === notification.notificationId
// //         ? { ...item, isRead: true }
// //         : item
// //     )
// //   );
// //   setUnreadCount((count) => Math.max(0, count - 1));

// //   try {
// //     const response = await fetch("/api/notifications", {
// //       method: "PATCH",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         notificationId: notification.notificationId,
// //       }),
// //     });

// //     if (!response.ok) {
// //       // Restore the unread state if the server update failed.
// //       setNotifications((current) =>
// //         current.map((item) =>
// //           item.notificationId === notification.notificationId
// //             ? { ...item, isRead: false }
// //             : item
// //         )
// //       );
// //       setUnreadCount((count) => count + 1);
// //       setError("Couldn't mark this notification as read. Please try again.");
// //       return;
// //     }

// //     setError("");
// //   } catch (err) {
// //     console.error("Unable to mark notification as read:", err);

// //     setNotifications((current) =>
// //       current.map((item) =>
// //         item.notificationId === notification.notificationId
// //           ? { ...item, isRead: false }
// //           : item
// //       )
// //     );
// //     setUnreadCount((count) => count + 1);
// //     setError("Couldn't mark this notification as read. Please try again.");
// //   }
// // }

// //   async function markAsRead(notificationId: string) {
// //     const notification = notifications.find(
// //       (item) => item.notificationId === notificationId
// //     );

// //     if (!notification || notification.isRead || isUpdating) return;

// //     setIsUpdating(true);

// //     try {
// //       const response = await fetch("/api/notifications", {
// //         method: "PATCH",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ notificationId }),
// //       });

// //       if (!response.ok) {
// //         setError("Couldn't mark this notification as read.");
// //         return;
// //       }

// //       setNotifications((current) =>
// //         current.map((item) =>
// //           item.notificationId === notificationId
// //             ? { ...item, isRead: true }
// //             : item
// //         )
// //       );
// //       setUnreadCount((count) => Math.max(0, count - 1));
// //       setError("");
// //     } catch (err) {
// //       console.error("Unable to mark notification as read:", err);
// //       setError("Couldn't mark this notification as read.");
// //     } finally {
// //       setIsUpdating(false);
// //     }
// //   }

//   async function markAllAsRead() {
//     if (unreadCount === 0 || isUpdating) return;

//     setIsUpdating(true);

//     try {
//       const response = await fetch("/api/notifications", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ markAllRead: true }),
//       });

//       if (!response.ok) {
//         setError("Couldn't mark notifications as read.");
//         return;
//       }

//       setNotifications((current) =>
//         current.map((item) => ({ ...item, isRead: true }))
//       );
//       setUnreadCount(0);
//       setError("");
//     } catch (err) {
//       console.error("Unable to mark all notifications as read:", err);
//       setError("Couldn't mark notifications as read.");
//     } finally {
//       setIsUpdating(false);
//     }
//   }

//   function formatDate(dateString: string) {
//     const date = new Date(dateString);

//     if (Number.isNaN(date.getTime())) return "";

//     return new Intl.DateTimeFormat("en-ET", {
//       dateStyle: "medium",
//       timeStyle: "short",
//     }).format(date);
//   }

//   return (
//     <div className="store-notifications">
//       <button
//         type="button"
//         className="notification-button"
//         onClick={() => {
//           setIsOpen((open) => !open);
//           if (!isOpen) void loadNotifications();
//         }}
//         aria-label={
//           unreadCount > 0
//             ? `Notifications, ${unreadCount} unread`
//             : "Notifications"
//         }
//         aria-expanded={isOpen}
//         aria-haspopup="dialog"
//         title="Notifications"
//       >
//         <span aria-hidden="true">🔔</span>

//         {unreadCount > 0 && (
//           <span className="notification-count">
//             {unreadCount > 99 ? "99+" : unreadCount}
//           </span>
//         )}
//       </button>

//       {isOpen && (
//         <section
//           className="notification-panel"
//           role="dialog"
//           aria-label="Your notifications"
//         >
//           <div className="notification-panel-header">
//             <div className="notification-panel-actions">
//   <button
//     type="button"
//     onClick={() => {
//       setIsOpen(false);
//       router.push("/store-owner/notifications");
//     }}
//   >
//     See all notifications →
//   </button>
// </div>
//             <div>
//               <h2>Notifications</h2>
//               <p>
//                 {unreadCount === 0
//                   ? "You're all caught up"
//                   : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
//               </p>
//             </div>

//             <button
//               type="button"
//               className="notification-close"
//               onClick={() => setIsOpen(false)}
//               aria-label="Close notifications"
//             >
//               ×
//             </button>
//           </div>


// {selectedNotification ? (
//   <div className="notification-detail">
//     <button
//       type="button"
//       className="notification-back"
//       onClick={() => setSelectedNotification(null)}
//     >
//       ← Back to notifications
//     </button>

//     <span className="notification-type">
//       {selectedNotification.notificationType}
//     </span>

//     <h3>{selectedNotification.title}</h3>

//     <time dateTime={selectedNotification.createdAt}>
//       {formatDate(selectedNotification.createdAt)}
//     </time>

//     <p className="notification-detail-message">
//       {selectedNotification.message}
//     </p>
//   </div>
// ) : (
//   <>
//     {unreadCount > 0 && (
//       <div className="notification-panel-actions">
//         <button
//           type="button"
//           onClick={() => void markAllAsRead()}
//           disabled={isUpdating}
//         >
//           Mark all as read
//         </button>
//       </div>
//     )}

//     <div className="notification-list" aria-live="polite">
//       {isLoading ? (
//         <p className="notification-state">Loading notifications…</p>
//       ) : error ? (
//         <div className="notification-state">
//           <p>{error}</p>
//           <button
//             type="button"
//             onClick={() => {
//               setIsLoading(true);
//               void loadNotifications();
//             }}
//           >
//             Try again
//           </button>
//         </div>
//       ) : notifications.length === 0 ? (
//         <p className="notification-state">
//           No notifications yet. Updates about your store will appear here.
//         </p>
//       ) : (
//         notifications.map((notification) => (
//           <article
//             key={notification.notificationId}
//             className={`notification-item${notification.isRead ? "" : " unread"}`}
//             role="button"
//             tabIndex={0}
// onClick={() =>
//   router.push(
//     `/store-owner/notifications?notificationId=${encodeURIComponent(
//       notification.notificationId
//     )}`
//   )
// }
//           onKeyDown={(event) => {
//   if (event.key === "Enter" || event.key === " ") {
//     event.preventDefault();
//     router.push(
//       `/store-owner/notifications?notificationId=${encodeURIComponent(
//         notification.notificationId
//       )}`
//     );
//   }
// }}
//           >
//             <div className="notification-item-heading">
//               <h3>{notification.title}</h3>

//               {!notification.isRead && (
//                 <span
//                   className="notification-unread-indicator"
//                   aria-label="Unread"
//                 />
//               )}
//             </div>

//             <p className="notification-message">
//               {notification.message}
//             </p>

//             <div className="notification-item-footer">
//               <span className="notification-type">
//                 {notification.notificationType}
//               </span>

//               <time dateTime={notification.createdAt}>
//                 {formatDate(notification.createdAt)}
//               </time>
//             </div>
//           </article>
//         ))
//       )}
//     </div>
//   </>
// )}

//         </section>
//       )}
//     </div>
//   );
// }


"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function StoreOwnerNotifications() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in again to view notifications.");
        } else {
          setError("Unable to load notifications.");
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

      setError("");
    } catch (err) {
      console.error("Unable to load store-owner notifications:", err);
      setError("Unable to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  function openNotificationsPage(notificationId?: string) {
    setIsOpen(false);

    const destination = notificationId
      ? `/store-owner/notifications?notificationId=${encodeURIComponent(
          notificationId
        )}`
      : "/store-owner/notifications";

    router.push(destination);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-ET", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  return (
    <div className="store-notifications">
      <button
        type="button"
        className="notification-button"
        onClick={() => {
          const shouldOpen = !isOpen;
          setIsOpen(shouldOpen);

          if (shouldOpen) {
            void loadNotifications();
          }
        }}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Notifications"
      >
        <span aria-hidden="true">🔔</span>

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          className="notification-panel"
          role="dialog"
          aria-label="Your notifications"
        >
          <div className="notification-panel-header">
            <div>
              <h2>Notifications</h2>
              <p>
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            <button
              type="button"
              className="notification-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              ×
            </button>
          </div>

          <div className="notification-panel-actions">
            <button
              type="button"
              onClick={() => openNotificationsPage()}
            >
              See all notifications →
            </button>
          </div>

          <div className="notification-list" aria-live="polite">
            {isLoading ? (
              <p className="notification-state">
                Loading notifications…
              </p>
            ) : error ? (
              <div className="notification-state">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    void loadNotifications();
                  }}
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <p className="notification-state">
                No notifications yet. Updates about your store will appear
                here.
              </p>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <article
                  key={notification.notificationId}
                  className={`notification-item${
                    notification.isRead ? "" : " unread"
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    openNotificationsPage(notification.notificationId)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openNotificationsPage(notification.notificationId);
                    }
                  }}
                >
                  <div className="notification-item-heading">
                    <h3>{notification.title}</h3>

                    {!notification.isRead && (
                      <span
                        className="notification-unread-indicator"
                        aria-label="Unread"
                      />
                    )}
                  </div>

                  <p className="notification-message">
                    {notification.message}
                  </p>

                  <div className="notification-item-footer">
                    <span className="notification-type">
                      {notification.notificationType}
                    </span>

                    <time dateTime={notification.createdAt}>
                      {formatDate(notification.createdAt)}
                    </time>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}