// // "use client";

// // import { usePathname } from "next/navigation";

// // const pageNames: Record<string, string> = {
// //   "/admin": "Dashboard",
// //   "/admin/stores": "Stores",
// //   "/admin/store-owners": "Store Owners",
// //   "/admin/customers": "Customers",
// //   "/admin/products": "Products",
// //   "/admin/categories": "Categories",
// //   "/admin/orders": "Orders",
// //   "/admin/payments": "Payments",
// //   "/admin/subscriptions": "Subscriptions",
// //   "/admin/analytics": "Analytics",
// //   "/admin/notifications": "Notifications",
// //   "/admin/settings": "Settings",
// // };

// // export default function AdminHeader() {
// //   const pathname = usePathname();

// //   const currentPage =
// //     pageNames[pathname] ||
// //     Object.entries(pageNames).find(
// //       ([path]) => path !== "/admin" && pathname.startsWith(path)
// //     )?.[1] ||
// //     "Dashboard";

// //   return (
// //     <header className="admin-header">
// //       <div>
// //         <div className="admin-breadcrumb">
// //           BeautyMart Admin <span>/</span> {currentPage}
// //         </div>

// //         <h1>{currentPage}</h1>
// //       </div>

// //       <div className="admin-header-actions">
// //         <button className="admin-notification-button" aria-label="Notifications">
// //           ♢
// //           <span className="admin-notification-dot" />
// //         </button>

// //         <div className="admin-header-user">
// //           <div className="admin-header-avatar">A</div>

// //           <div>
// //             <strong>BeautyMart Admin</strong>
// //             <span>Super Admin</span>
// //           </div>
// //         </div>
// //       </div>
// //     </header>
// //   );
// // }


// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";

// const pageNames: Record<string, string> = {
//   "/admin": "Dashboard",
//   "/admin/stores": "Stores",
//   "/admin/store-owners": "Store Owners",
//   "/admin/customers": "Customers",
//   "/admin/products": "Products",
//   "/admin/categories": "Categories",
//   "/admin/orders": "Orders",
//   "/admin/payments": "Payments",
//   "/admin/subscriptions": "Subscriptions",
//   "/admin/analytics": "Analytics",
//   "/admin/notifications": "Notifications",
//   "/admin/settings": "Settings",
// };

// export default function AdminHeader() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [unreadCount, setUnreadCount] = useState(0);

//   const currentPage =
//     pageNames[pathname] ||
//     Object.entries(pageNames).find(
//       ([path]) => path !== "/admin" && pathname.startsWith(path)
//     )?.[1] ||
//     "Dashboard";

//   const refreshUnreadCount = useCallback(async () => {
//     try {
//       const response = await fetch("/api/notifications", {
//         cache: "no-store",
//       });

//       if (!response.ok) return;

//       const data = await response.json();

//       if (typeof data.unreadCount === "number") {
//         setUnreadCount(data.unreadCount);
//       }
//     } catch (error) {
//       console.error("Unable to refresh notification count:", error);
//     }
//   }, []);

//   useEffect(() => {
//     void refreshUnreadCount();

//     const interval = window.setInterval(() => {
//       void refreshUnreadCount();
//     }, 30000);

//     return () => window.clearInterval(interval);
//   }, [refreshUnreadCount]);

//   useEffect(() => {
//     void refreshUnreadCount();
//   }, [pathname, refreshUnreadCount]);

//   return (
//     <header className="admin-header">
//       <div>
//         <div className="admin-breadcrumb">
//           BeautyMart Admin <span>/</span> {currentPage}
//         </div>
//         <h1>{currentPage}</h1>
//       </div>

//       <div className="admin-header-actions">
//    <button
//   type="button"
//   className="admin-notification-button"
//   onClick={() => router.push("/admin/notifications")}
//   aria-label="View notifications"
//   title="View notifications"
// >
//   🔔
//   {unreadCount > 0 && (
//     <span className="admin-notification-count">
//       {unreadCount > 99 ? "99+" : unreadCount}
//     </span>
//   )}
// </button>

//         <div className="admin-header-user">
//           <div className="admin-header-avatar">A</div>
//           <div>
//             <strong>BeautyMart Admin</strong>
//             <span>Super Admin</span>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }


"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AdminHeader.module.css";

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
};

const pageNames: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/stores": "Stores",
  "/admin/store-owners": "Store Owners",
  "/admin/customers": "Customers",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/payments": "Payments",
  "/admin/subscriptions": "Subscriptions",
  "/admin/analytics": "Analytics",
  "/admin/notifications": "Notifications",
};

const notificationIcons: Record<NotificationType, string> = {
  ORDER: "▣",
  PAYMENT: "¤",
  INVENTORY: "▤",
  SUBSCRIPTION: "↻",
  SYSTEM: "⚙",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const currentPage =
    pageNames[pathname] ||
    Object.entries(pageNames).find(
      ([path]) => path !== "/admin" && pathname.startsWith(path)
    )?.[1] ||
    "Dashboard";

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
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
      console.error("Unable to refresh admin notifications:", err);
      setError("Connection problem. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(
      () => void refreshNotifications(),
      0
    );

    const intervalId = window.setInterval(() => {
      void refreshNotifications();
    }, 30000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
    };
  }, [refreshNotifications]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshNotifications(), 0);
    return () => window.clearTimeout(timer);
  }, [pathname, refreshNotifications]);

  function openNotificationsPage(notificationId?: string) {
    setIsOpen(false);

    const destination = notificationId
      ? `/admin/notifications?notificationId=${encodeURIComponent(
          notificationId
        )}`
      : "/admin/notifications";

    router.push(destination);
  }

  return (
    <header className="admin-header">
      <div>
        <div className="admin-breadcrumb">
          BeautyMart Admin <span>/</span> {currentPage}
        </div>

        <h1>{currentPage}</h1>
      </div>

      <div className="admin-header-actions">
        <div className={styles.notificationWrapper}>
          <button
            type="button"
            className="admin-notification-button"
            onClick={() => {
              const nextOpen = !isOpen;
              setIsOpen(nextOpen);

              if (nextOpen) {
                void refreshNotifications();
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
              <span className="admin-notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <>
              <button
                type="button"
                className={styles.dismissLayer}
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications panel"
                tabIndex={-1}
              />

              <section
                className={styles.dropdown}
                role="dialog"
                aria-label="Admin notifications"
              >
                <div className={styles.dropdownHeader}>
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
                    className={styles.closeButton}
                    onClick={() => setIsOpen(false)}
                    aria-label="Close notifications"
                  >
                    ×
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.seeAllButton}
                  onClick={() => openNotificationsPage()}
                >
                  See all notifications <span aria-hidden="true">→</span>
                </button>

                <div className={styles.notificationList} aria-live="polite">
                  {isLoading ? (
                    <p className={styles.state}>Loading notifications…</p>
                  ) : error ? (
                    <div className={styles.state}>
                      <p>{error}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoading(true);
                          void refreshNotifications();
                        }}
                      >
                        Try again
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className={styles.state}>
                     <span className={styles.emptyIcon} aria-hidden="true">
  🔔
</span>
                      <strong>No notifications yet</strong>
                      <p>Important platform updates will appear here.</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <button
                        type="button"
                        key={notification.notificationId}
                        className={`${styles.notificationItem} ${
                          notification.isRead ? "" : styles.unread
                        }`}
                        onClick={() =>
                          openNotificationsPage(notification.notificationId)
                        }
                      >
                        <span
                          className={`${styles.typeIcon} ${
                            styles[
                              `type${notification.notificationType}`
                            ]
                          }`}
                          aria-hidden="true"
                        >
                          {notificationIcons[notification.notificationType]}
                        </span>

                        <span className={styles.itemContent}>
                          <span className={styles.itemHeading}>
                            <strong>{notification.title}</strong>
                            {!notification.isRead && (
                              <span
                                className={styles.unreadDot}
                                aria-label="Unread"
                              />
                            )}
                          </span>

                          <span className={styles.itemMessage}>
                            {notification.message}
                          </span>

                          <span className={styles.itemDate}>
                            {formatDate(notification.createdAt)}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  className={styles.footerButton}
                  onClick={() => openNotificationsPage()}
                >
                  Open notification center →
                </button>
              </section>
            </>
          )}
        </div>

        <div className="admin-header-user">
          <div className="admin-header-avatar">A</div>

          <div>
            <strong>BeautyMart Admin</strong>
            <span>Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
