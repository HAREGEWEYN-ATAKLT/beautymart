// "use client";

// import { useEffect, useState } from "react";

// type Subscription = {
//   subscriptionId: string;
//   storeId: string;
//   planType: "TRIAL" | "STARTER" | "STANDARD";
//   startDate: string;
//   endDate: string;
//   isActive: boolean;
//   isExpired: boolean;
//   createdAt: string;

//   store: {
//     storeId: string;
//     storeName: string;
//     status: string;
//   };

//   owner: {
//     userId: string;
//     fullName: string;
//     email: string;
//     phoneNumber: string | null;
//   };
// };

// type Statistics = {
//   totalSubscriptions: number;
//   activeSubscriptions: number;
//   expiredSubscriptions: number;
//   trialSubscriptions: number;
//   starterSubscriptions: number;
//   standardSubscriptions: number;
// };

// function formatDate(date: string) {
//   return new Date(date).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// function getPlanLabel(planType: string) {
//   switch (planType) {
//     case "TRIAL":
//       return "Free Trial";
//     case "STARTER":
//       return "Starter";
//     case "STANDARD":
//       return "Standard";
//     default:
//       return planType;
//   }
// }

// function getPlanClass(planType: string) {
//   switch (planType) {
//     case "TRIAL":
//       return "admin-subscription-plan trial";
//     case "STARTER":
//       return "admin-subscription-plan starter";
//     case "STANDARD":
//       return "admin-subscription-plan standard";
//     default:
//       return "admin-subscription-plan";
//   }
// }

// function getStatusClass(subscription: Subscription) {
//   if (subscription.isExpired) {
//     return "admin-subscription-status expired";
//   }

//   if (subscription.isActive) {
//     return "admin-subscription-status active";
//   }

//   return "admin-subscription-status inactive";
// }

// function getStatusLabel(subscription: Subscription) {
//   if (subscription.isExpired) {
//     return "Expired";
//   }

//   if (subscription.isActive) {
//     return "Active";
//   }

//   return "Inactive";
// }

// export default function AdminSubscriptionsPage() {
//   const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
//   const [statistics, setStatistics] = useState<Statistics>({
//     totalSubscriptions: 0,
//     activeSubscriptions: 0,
//     expiredSubscriptions: 0,
//     trialSubscriptions: 0,
//     starterSubscriptions: 0,
//     standardSubscriptions: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   async function loadSubscriptions() {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await fetch("/api/admin/subscriptions", {
//         cache: "no-store",
//       });

//       const data = await response.json();

//       if (!response.ok || !data.success) {
//         throw new Error(
//           data.message || "Failed to load subscriptions."
//         );
//       }

//       setSubscriptions(data.subscriptions || []);
//       setStatistics(
//         data.statistics || {
//           totalSubscriptions: 0,
//           activeSubscriptions: 0,
//           expiredSubscriptions: 0,
//           trialSubscriptions: 0,
//           starterSubscriptions: 0,
//           standardSubscriptions: 0,
//         }
//       );
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Something went wrong while loading subscriptions."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadSubscriptions();
//   }, []);

//   return (
//     <div className="admin-subscriptions-page">
//       {/* Header */}
//       <div className="admin-subscriptions-header">
//         <div>
//           <p className="admin-subscriptions-eyebrow">
//             FINANCIAL MANAGEMENT
//           </p>

//           <h1>Subscriptions</h1>

//           <p className="admin-subscriptions-subtitle">
//             Monitor BeautyMart platform subscriptions for store owners.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={loadSubscriptions}
//           className="admin-subscriptions-refresh"
//           disabled={loading}
//         >
//           {loading ? "Refreshing..." : "↻ Refresh"}
//         </button>
//       </div>

//       {/* Business rule notice */}
//       <div className="admin-subscriptions-notice">
//         <div className="admin-subscriptions-notice-icon">✓</div>

//         <div>
//           <strong>Store owner subscriptions</strong>

//           <p>
//             Only store owners pay for the BeautyMart platform.
//             Customers do not pay a BeautyMart subscription fee.
//             The current plans are a 1-month free trial, 6-month
//             Starter plan for 3,000 ETB, and 1-year Standard plan
//             for 5,000 ETB.
//           </p>
//         </div>
//       </div>

//       {/* Statistics */}
//       <div className="admin-subscriptions-stats">
//         <div className="admin-subscription-stat-card">
//           <span className="admin-subscription-stat-label">
//             Total subscriptions
//           </span>

//           <strong>{statistics.totalSubscriptions}</strong>
//         </div>

//         <div className="admin-subscription-stat-card">
//           <span className="admin-subscription-stat-label">
//             Active
//           </span>

//           <strong>{statistics.activeSubscriptions}</strong>
//         </div>

//         <div className="admin-subscription-stat-card">
//           <span className="admin-subscription-stat-label">
//             Expired
//           </span>

//           <strong>{statistics.expiredSubscriptions}</strong>
//         </div>

//         <div className="admin-subscription-stat-card">
//           <span className="admin-subscription-stat-label">
//             Free trials
//           </span>

//           <strong>{statistics.trialSubscriptions}</strong>
//         </div>

//         <div className="admin-subscription-stat-card">
//           <span className="admin-subscription-stat-label">
//             Starter
//           </span>

//           <strong>{statistics.starterSubscriptions}</strong>
//         </div>

//         <div className="admin-subscription-stat-card">
//           <span className="admin-subscription-stat-label">
//             Standard
//           </span>

//           <strong>{statistics.standardSubscriptions}</strong>
//         </div>
//       </div>

//       {/* Main table */}
//       <section className="admin-subscriptions-card">
//         <div className="admin-subscriptions-card-header">
//           <div>
//             <h2>Store subscriptions</h2>

//             <p>
//               Subscription records currently registered in BeautyMart.
//             </p>
//           </div>

//           <span className="admin-subscriptions-readonly">
//             ● Read-only
//           </span>
//         </div>

//         {loading ? (
//           <div className="admin-subscriptions-state">
//             <div className="admin-subscriptions-spinner" />
//             <p>Loading subscriptions...</p>
//           </div>
//         ) : error ? (
//           <div className="admin-subscriptions-state error">
//             <h3>Unable to load subscriptions</h3>

//             <p>{error}</p>

//             <button
//               type="button"
//               onClick={loadSubscriptions}
//               className="admin-subscriptions-retry"
//             >
//               Try again
//             </button>
//           </div>
//         ) : subscriptions.length === 0 ? (
//           <div className="admin-subscriptions-empty">
//             <div className="admin-subscriptions-empty-icon">
//               ◇
//             </div>

//             <h3>No subscriptions yet</h3>

//             <p>
//               No store owner subscriptions have been created yet.
//               Once a store owner starts the free trial or purchases
//               a plan, the subscription will appear here.
//             </p>
//           </div>
//         ) : (
//           <div className="admin-table-wrapper">
//             <table className="admin-subscriptions-table">
//               <thead>
//                 <tr>
//                   <th>Store</th>
//                   <th>Store Owner</th>
//                   <th>Plan</th>
//                   <th>Start Date</th>
//                   <th>End Date</th>
//                   <th>Store Status</th>
//                   <th>Subscription</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {subscriptions.map((subscription) => (
//                   <tr key={subscription.subscriptionId}>
//                     <td>
//                       <div className="admin-subscription-store">
//                         <strong>{subscription.store.storeName}</strong>

//                         <span>
//                           {subscription.storeId}
//                         </span>
//                       </div>
//                     </td>

//                     <td>
//                       <div className="admin-subscription-owner">
//                         <strong>{subscription.owner.fullName}</strong>

//                         <span>{subscription.owner.email}</span>

//                         {subscription.owner.phoneNumber && (
//                           <span>
//                             {subscription.owner.phoneNumber}
//                           </span>
//                         )}
//                       </div>
//                     </td>

//                     <td>
//                       <span
//                         className={getPlanClass(
//                           subscription.planType
//                         )}
//                       >
//                         {getPlanLabel(subscription.planType)}
//                       </span>
//                     </td>

//                     <td>{formatDate(subscription.startDate)}</td>

//                     <td>{formatDate(subscription.endDate)}</td>

//                     <td>
//                       <span
//                         className={`admin-subscription-store-status ${
//                           subscription.store.status.toLowerCase()
//                         }`}
//                       >
//                         {subscription.store.status}
//                       </span>
//                     </td>

//                     <td>
//                       <span
//                         className={getStatusClass(subscription)}
//                       >
//                         <span>●</span>
//                         {getStatusLabel(subscription)}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>

//       {/* Plan information */}
//       <section className="admin-subscription-plans">
//         <div className="admin-subscription-plans-heading">
//           <div>
//             <p className="admin-subscriptions-eyebrow">
//               BEAUTYMART PLANS
//             </p>

//             <h2>Subscription pricing</h2>
//           </div>
//         </div>

//         <div className="admin-subscription-plan-grid">
//           <div className="admin-subscription-plan-card">
//             <span className="admin-subscription-plan-tag">
//               TRIAL
//             </span>

//             <h3>Free Trial</h3>

//             <strong>0 ETB</strong>

//             <p>1 month</p>
//           </div>

//           <div className="admin-subscription-plan-card">
//             <span className="admin-subscription-plan-tag">
//               STARTER
//             </span>

//             <h3>Starter</h3>

//             <strong>3,000 ETB</strong>

//             <p>6 months</p>
//           </div>

//           <div className="admin-subscription-plan-card">
//             <span className="admin-subscription-plan-tag">
//               STANDARD
//             </span>

//             <h3>Standard</h3>

//             <strong>5,000 ETB</strong>

//             <p>1 year</p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";

type SubscriptionStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED";

type Subscription = {
  subscriptionId: string;
  storeId: string;
  planType: "TRIAL" | "STARTER" | "STANDARD";
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isExpired: boolean;
  createdAt: string;

  store: {
    storeId: string;
    storeName: string;
    status: string;
  };

  owner: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  };
};

type Statistics = {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  suspendedSubscriptions: number;
  cancelledSubscriptions: number;
  trialSubscriptions: number;
  starterSubscriptions: number;
  standardSubscriptions: number;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPlanLabel(planType: string) {
  switch (planType) {
    case "TRIAL":
      return "Free Trial";
    case "STARTER":
      return "Starter";
    case "STANDARD":
      return "Standard";
    default:
      return planType;
  }
}

function getPlanClass(planType: string) {
  switch (planType) {
    case "TRIAL":
      return "admin-subscription-plan trial";
    case "STARTER":
      return "admin-subscription-plan starter";
    case "STANDARD":
      return "admin-subscription-plan standard";
    default:
      return "admin-subscription-plan";
  }
}

function getStatusClass(status: SubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
      return "admin-subscription-status active";

    case "EXPIRED":
      return "admin-subscription-status expired";

    case "SUSPENDED":
      return "admin-subscription-status suspended";

    case "CANCELLED":
      return "admin-subscription-status cancelled";

    default:
      return "admin-subscription-status inactive";
  }
}

function getStatusLabel(status: SubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "EXPIRED":
      return "Expired";

    case "SUSPENDED":
      return "Suspended";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

function getActionLabel(status: SubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
      return "Manage";

    case "SUSPENDED":
      return "Activate";

    case "EXPIRED":
      return "Renew";

    case "CANCELLED":
      return "Reactivate";

    default:
      return "Manage";
  }
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [statistics, setStatistics] = useState<Statistics>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    suspendedSubscriptions: 0,
    cancelledSubscriptions: 0,
    trialSubscriptions: 0,
    starterSubscriptions: 0,
    standardSubscriptions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [updatingSubscriptionId, setUpdatingSubscriptionId] =
  useState<string | null>(null);
  async function loadSubscriptions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/subscriptions", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load subscriptions."
        );
      }

      setSubscriptions(data.subscriptions || []);

      setStatistics(
        data.statistics || {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          expiredSubscriptions: 0,
          suspendedSubscriptions: 0,
          cancelledSubscriptions: 0,
          trialSubscriptions: 0,
          starterSubscriptions: 0,
          standardSubscriptions: 0,
        }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading subscriptions."
      );
    } finally {
      setLoading(false);
    }
  }

async function updateSubscription(
  subscriptionId: string,
  action: "suspend" | "activate"
) {
  const actionLabel = action === "suspend" ? "suspend" : "activate";

  if (
    !window.confirm(
      `Are you sure you want to ${actionLabel} this subscription?`
    )
  ) {
    return;
  }

  try {
    setUpdatingSubscriptionId(subscriptionId);
    setError("");

    const response = await fetch(
      `/api/admin/subscriptions/${subscriptionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to update subscription."
      );
    }

    alert(data.message || "Subscription updated successfully.");

    await loadSubscriptions();
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : "Something went wrong while updating the subscription."
    );
  } finally {
    setUpdatingSubscriptionId(null);
  }
}
  useEffect(() => {
    loadSubscriptions();
  }, []);

  return (
    <div className="admin-subscriptions-page">
      {/* Header */}
      <div className="admin-subscriptions-header">
        <div>
          <p className="admin-subscriptions-eyebrow">
            FINANCIAL MANAGEMENT
          </p>

        

          <p className="admin-subscriptions-subtitle">
            Manage BeautyMart platform subscriptions for store
            owners.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSubscriptions}
          className="admin-subscriptions-refresh"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* Business rule notice */}
      <div className="admin-subscriptions-notice">
        <div className="admin-subscriptions-notice-icon">✓</div>

        <div>
          <strong>Store owner subscriptions</strong>

          <p>
            Only store owners pay for the BeautyMart platform.
            Customers do not pay a BeautyMart subscription fee.
            The current plans are a 1-month free trial, 6-month
            Starter plan for 3,000 ETB, and 1-year Standard plan
            for 5,000 ETB.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="admin-subscriptions-stats">
        <div className="admin-subscription-stat-card">
          <span className="admin-subscription-stat-label">
            Total subscriptions
          </span>

          <strong>{statistics.totalSubscriptions}</strong>
        </div>

        <div className="admin-subscription-stat-card">
          <span className="admin-subscription-stat-label">
            Active
          </span>

          <strong>{statistics.activeSubscriptions}</strong>
        </div>

        <div className="admin-subscription-stat-card">
          <span className="admin-subscription-stat-label">
            Expired
          </span>

          <strong>{statistics.expiredSubscriptions}</strong>
        </div>

        <div className="admin-subscription-stat-card">
          <span className="admin-subscription-stat-label">
            Suspended
          </span>

          <strong>{statistics.suspendedSubscriptions}</strong>
        </div>

        <div className="admin-subscription-stat-card">
          <span className="admin-subscription-stat-label">
            Cancelled
          </span>

          <strong>{statistics.cancelledSubscriptions}</strong>
        </div>

        <div className="admin-subscription-stat-card">
          <span className="admin-subscription-stat-label">
            Free trials
          </span>

          <strong>{statistics.trialSubscriptions}</strong>
        </div>

        <div className="admin-subscription-stat-card">
          <span className="admin-subscription-stat-label">
            Starter
          </span>

          <strong>{statistics.starterSubscriptions}</strong>
        </div>

        <div className="admin-subscription-stat-card">
          <span className="admin-subscription-stat-label">
            Standard
          </span>

          <strong>{statistics.standardSubscriptions}</strong>
        </div>
      </div>

      {/* Main table */}
      <section className="admin-subscriptions-card">
        <div className="admin-subscriptions-card-header">
          <div>
            <h2>Store subscriptions</h2>

            <p>
              Manage subscription status, plans, and subscription
              periods for BeautyMart store owners.
            </p>
          </div>

          <span className="admin-subscriptions-management">
            ● Subscription Management
          </span>
        </div>

        {loading ? (
          <div className="admin-subscriptions-state">
            <div className="admin-subscriptions-spinner" />

            <p>Loading subscriptions...</p>
          </div>
        ) : error ? (
          <div className="admin-subscriptions-state error">
            <h3>Unable to load subscriptions</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadSubscriptions}
              className="admin-subscriptions-retry"
            >
              Try again
            </button>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="admin-subscriptions-empty">
            <div className="admin-subscriptions-empty-icon">
              ◇
            </div>

            <h3>No subscriptions yet</h3>

            <p>
              No store owner subscriptions have been created yet.
              Once a store owner starts the free trial or purchases
              a plan, the subscription will appear here.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-subscriptions-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Store Owner</th>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Store Status</th>
                  <th>Subscription</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.subscriptionId}>
                    {/* Store */}
                    <td>
                      <div className="admin-subscription-store">
                        <strong>
                          {subscription.store.storeName}
                        </strong>

                        <span>{subscription.storeId}</span>
                      </div>
                    </td>

                    {/* Owner */}
                    <td>
                      <div className="admin-subscription-owner">
                        <strong>
                          {subscription.owner.fullName}
                        </strong>

                        <span>{subscription.owner.email}</span>

                        {subscription.owner.phoneNumber && (
                          <span>
                            {subscription.owner.phoneNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Plan */}
                    <td>
                      <span
                        className={getPlanClass(
                          subscription.planType
                        )}
                      >
                        {getPlanLabel(subscription.planType)}
                      </span>
                    </td>

                    {/* Start */}
                    <td>{formatDate(subscription.startDate)}</td>

                    {/* End */}
                    <td>{formatDate(subscription.endDate)}</td>

                    {/* Store status */}
                    <td>
                      <span
                        className={`admin-subscription-store-status ${
                          subscription.store.status.toLowerCase()
                        }`}
                      >
                        {subscription.store.status}
                      </span>
                    </td>

                    {/* Subscription status */}
                    <td>
                      <span
                        className={getStatusClass(
                          subscription.status
                        )}
                      >
                        <span>●</span>

                        {getStatusLabel(
                          subscription.status
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    
<td>
  <div className="admin-subscription-actions">
    {subscription.status === "ACTIVE" && (
      <button
        type="button"
        className="admin-subscription-action danger"
        disabled={
          updatingSubscriptionId === subscription.subscriptionId
        }
        onClick={() =>
          updateSubscription(
            subscription.subscriptionId,
            "suspend"
          )
        }
      >
        {updatingSubscriptionId === subscription.subscriptionId
          ? "Updating..."
          : "Suspend"}
      </button>
    )}

    {subscription.status === "SUSPENDED" && (
      <button
        type="button"
        className="admin-subscription-action success"
        disabled={
          updatingSubscriptionId === subscription.subscriptionId
        }
        onClick={() =>
          updateSubscription(
            subscription.subscriptionId,
            "activate"
          )
        }
      >
        {updatingSubscriptionId === subscription.subscriptionId
          ? "Updating..."
          : "Activate"}
      </button>
    )}

    {subscription.status === "EXPIRED" && (
      <span>Renewal required</span>
    )}

    {subscription.status === "CANCELLED" && (
      <span>Cancelled</span>
    )}
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Management rules */}
      <section className="admin-subscription-management-card">
        <div className="admin-subscription-plans-heading">
          <div>
            <p className="admin-subscriptions-eyebrow">
              ADMIN CONTROLS
            </p>

            <h2>Subscription management</h2>
          </div>
        </div>

        <div className="admin-subscription-management-grid">
          <div className="admin-subscription-management-item">
            <span>✓</span>

            <div>
              <strong>Activate</strong>

              <p>
                Activate a suspended subscription when the store
                owner is allowed to continue using BeautyMart.
              </p>
            </div>
          </div>

          <div className="admin-subscription-management-item">
            <span>Ⅱ</span>

            <div>
              <strong>Suspend</strong>

              <p>
                Temporarily disable a subscription without
                deleting its history.
              </p>
            </div>
          </div>

          <div className="admin-subscription-management-item">
            <span>↗</span>

            <div>
              <strong>Extend</strong>

              <p>
                Extend the subscription period when a valid
                renewal or approved administrative adjustment
                is required.
              </p>
            </div>
          </div>

          <div className="admin-subscription-management-item">
            <span>↻</span>

            <div>
              <strong>Change Plan</strong>

              <p>
                Move a store owner between Trial, Starter, and
                Standard plans when permitted by the platform
                rules.
              </p>
            </div>
          </div>
        </div>

        <div className="admin-subscription-warning">
          <strong>Payment security rule</strong>

          <p>
            Super Admin can manage the subscription record, but
            cannot manually mark a Chapa payment as paid, fake a
            successful payment, or manually transfer/refund
            customer money. Payment confirmation must come from
            the payment provider.
          </p>
        </div>
      </section>

      {/* Plan information */}
      <section className="admin-subscription-plans">
        <div className="admin-subscription-plans-heading">
          <div>
            <p className="admin-subscriptions-eyebrow">
              BEAUTYMART PLANS
            </p>

            <h2>Subscription pricing</h2>
          </div>
        </div>

        <div className="admin-subscription-plan-grid">
          <div className="admin-subscription-plan-card">
            <span className="admin-subscription-plan-tag">
              TRIAL
            </span>

            <h3>Free Trial</h3>

            <strong>0 ETB</strong>

            <p>1 month</p>
          </div>

          <div className="admin-subscription-plan-card">
            <span className="admin-subscription-plan-tag">
              STARTER
            </span>

            <h3>Starter</h3>

            <strong>3,000 ETB</strong>

            <p>6 months</p>
          </div>

          <div className="admin-subscription-plan-card">
            <span className="admin-subscription-plan-tag">
              STANDARD
            </span>

            <h3>Standard</h3>

            <strong>5,000 ETB</strong>

            <p>1 year</p>
          </div>
        </div>
      </section>
    </div>
  );
}
