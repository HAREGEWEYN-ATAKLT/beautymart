type SubscriptionState = {
  status: string;
  isActive: boolean;
  endDate: Date;
} | null | undefined;

type StoreManagementState = {
  status: string;
  subscription: SubscriptionState;
} | null | undefined;

/**
 * A single rule for private store-management actions.  Public shopping can
 * still show a store's historic information, but a suspended or expired
 * store must not change products, promotions, orders, or settings.
 */
export function getStoreManagementBlockReason(store: StoreManagementState) {
  if (!store) return "Store not found or access denied.";
  if (store.status !== "ACTIVE") {
    return "This store is suspended. Contact the administrator to restore management access.";
  }

  const subscription = store.subscription;
  if (!subscription) return "This store has no subscription. Contact the administrator.";
  if (subscription.status !== "ACTIVE" || !subscription.isActive || subscription.endDate <= new Date()) {
    return "This store subscription is inactive or expired. Renew it before managing the store.";
  }
  return null;
}
