export type CartQuantityLine = { id: string; quantity: number };

// Remove only quantities that belong to a verified paid order. If a customer
// added more of the same product later, the extra quantity remains in the bag.
export function subtractPaidOrderItems<T extends CartQuantityLine>(
  cart: T[],
  paidItems: CartQuantityLine[],
): T[] {
  const paidQuantityByProduct = new Map<string, number>();

  for (const item of paidItems) {
    paidQuantityByProduct.set(
      item.id,
      (paidQuantityByProduct.get(item.id) ?? 0) + item.quantity,
    );
  }

  return cart.flatMap((item) => {
    const paidQuantity = paidQuantityByProduct.get(item.id) ?? 0;
    const remainingQuantity = item.quantity - paidQuantity;

    return remainingQuantity > 0
      ? [{ ...item, quantity: remainingQuantity }]
      : [];
  });
}
