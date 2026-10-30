// Chapa rejects transaction references longer than 50 characters during
// initialization. Older BeautyMart checkout code saved a longer reference
// before Chapa rejected it, leaving an order that could never be retried.
export const MAX_CHAPA_TRANSACTION_REFERENCE_LENGTH = 50;

export function isRejectedLegacyChapaReference(
  transactionReference: string,
  providerHttpStatus: number
) {
  return (
    providerHttpStatus === 400 &&
    transactionReference.length > MAX_CHAPA_TRANSACTION_REFERENCE_LENGTH
  );
}
