// Chapa v1 may return the combined value "failed/cancelled". Treat only
// documented final, unsuccessful provider states as retryable failures.
// Unknown values remain pending/unknown so we never release a payment attempt
// merely because the browser closed or a provider response was ambiguous.
const FINAL_UNSUCCESSFUL_CHAPA_STATUSES = new Set([
  "failed",
  "failed/cancelled",
  "cancelled",
  "canceled",
  "incomplete",
  "blocked",
]);

export function isFinalUnsuccessfulChapaStatus(status: unknown) {
  return (
    typeof status === "string" &&
    FINAL_UNSUCCESSFUL_CHAPA_STATUSES.has(status.trim().toLowerCase())
  );
}
