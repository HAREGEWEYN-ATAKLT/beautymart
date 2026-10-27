// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../../auth";
// import { prisma } from "../../../../lib/prisma";

// export async function GET(
//   request: Request,
//   { params }: { params: Promise<{ orderId: string }> }
// ) {
//   try {
//     // Check admin session
//     const session = await getServerSession(authOptions);

//     if (!session?.user || session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Get order ID from URL
//     const { orderId } = await params;

//     if (!orderId) {
//       return NextResponse.json(
//         { message: "Order ID is required" },
//         { status: 400 }
//       );
//     }

//     // Find the order
//     const order = await prisma.order.findUnique({
//       where: {
//         orderId,
//       },
//       include: {
//         customer: {
//           select: {
//             customerId: true,
//             fullName: true,
//             email: true,
//             phoneNumber: true,
//           },
//         },

//         store: {
//           select: {
//             storeId: true,
//             storeName: true,
//             description: true,
//             email: true,
//             phone: true,
//             address: true,
//             status: true,
//           },
//         },

//         items: {
//           orderBy: {
//             orderItemId: "asc",
//           },
//           select: {
//             orderItemId: true,
//             quantity: true,
//             unitPrice: true,
//             discountAmount: true,
//             totalPrice: true,

//             product: {
//               select: {
//                 productId: true,
//                 productName: true,
//                 description: true,
//                 price: true,
//                 isActive: true,

//                 category: {
//                   select: {
//                     categoryId: true,
//                     categoryName: true,
//                   },
//                 },

//                 images: {
//                   select: {
//                     imageId: true,
//                     imageUrl: true,
//                   },
//                   orderBy: {
//                     imageId: "asc",
//                   },
//                 },
//               },
//             },
//           },
//         },

//         payments: {
//           orderBy: {
//             createdAt: "desc",
//           },
//           select: {
//             paymentId: true,
//             provider: true,
//             transactionReference: true,
//             amount: true,
//             status: true,
//             paidAt: true,
//             createdAt: true,
//           },
//         },
//       },
//     });

//     // Order not found
//     if (!order) {
//       return NextResponse.json(
//         { message: "Order not found" },
//         { status: 404 }
//       );
//     }

//     // Convert Prisma Decimal values to numbers
//     const totalAmount = Number(order.totalAmount);
//     const discountAmount = Number(order.discountAmount);
//     const finalAmount = Number(order.finalAmount);

//     const items = order.items.map((item) => ({
//       orderItemId: item.orderItemId,
//       quantity: item.quantity,
//       unitPrice: Number(item.unitPrice),
//       discountAmount: Number(item.discountAmount),
//       totalPrice: Number(item.totalPrice),

//       product: {
//         productId: item.product.productId,
//         productName: item.product.productName,
//         description: item.product.description,
//         price: Number(item.product.price),
//         isActive: item.product.isActive,

//         category: item.product.category
//           ? {
//               categoryId: item.product.category.categoryId,
//               categoryName: item.product.category.categoryName,
//             }
//           : null,

//         images: item.product.images.map((image) => ({
//           imageId: image.imageId,
//           imageUrl: image.imageUrl,
//         })),
//       },
//     }));

//     const payments = order.payments.map((payment) => ({
//       paymentId: payment.paymentId,
//       provider: payment.provider,
//       transactionReference: payment.transactionReference,
//       amount: Number(payment.amount),
//       status: payment.status,
//       paidAt: payment.paidAt,
//       createdAt: payment.createdAt,
//     }));

//     // Check for potentially inconsistent order/payment states.
//     const hasPaymentStatusMismatch =
//       order.orderStatus === "DELIVERED" &&
//       order.paymentStatus !== "PAID";

//     return NextResponse.json({
//       order: {
//         orderId: order.orderId,
//         orderNumber: order.orderNumber,

//         customer: {
//           customerId: order.customer.customerId,
//           fullName: order.customer.fullName,
//           email: order.customer.email,
//           phoneNumber: order.customer.phoneNumber,
//         },

//         store: {
//           storeId: order.store.storeId,
//           storeName: order.store.storeName,
//           description: order.store.description,
//           email: order.store.email,
//           phone: order.store.phone,
//           address: order.store.address,
//           status: order.store.status,
//         },

//         totalAmount,
//         discountAmount,
//         finalAmount,

//         paymentStatus: order.paymentStatus,
//         orderStatus: order.orderStatus,

//         createdAt: order.createdAt,
//         updatedAt: order.updatedAt,

//         itemCount: items.length,

//         items,

//         payments,

//         hasPaymentStatusMismatch,
//       },
//     });
//   } catch (error) {
//     console.error("Admin order details error:", error);

//     return NextResponse.json(
//       { message: "Failed to load order details" },
//       { status: 500 }
//     );
//   }
// }

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type OrderDetails = {
orderId: string;
orderNumber: string;
customer: {
fullName: string;
email: string;
phoneNumber: string;
};
store: {
storeName: string;
email: string | null;
phone: string | null;
address: string | null;
status: string;
};
totalAmount: number;
discountAmount: number;
finalAmount: number;
paymentStatus: string;
orderStatus: string;
createdAt: string;
updatedAt: string;
itemCount: number;
hasPaymentStatusMismatch: boolean;
items: {
orderItemId: string;
quantity: number;
unitPrice: number;
discountAmount: number;
totalPrice: number;
product: {
productId: string;
productName: string;
description: string | null;
price: number;
isActive: boolean;
category: { categoryName: string } | null;
images: { imageId: string; imageUrl: string }[];
};
}[];
payments: {
paymentId: string;
provider: string;
transactionReference: string | null;
amount: number;
status: string;
paidAt: string | null;
createdAt: string;
}[];
};

function money(amount: number) {
return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
}

function dateTime(value: string | null) {
if (!value) return "Not available";
return new Date(value).toLocaleString();
}

function StatusBadge({ value }: { value: string }) {
const normalized = value.toLowerCase();

return (
<span className={`order-status-badge status-${normalized}`}>
{value.replaceAll("_", " ")} </span>
);
}

export default function AdminOrderDetailsPage() {
const params = useParams<{ orderId: string }>();
const router = useRouter();
const orderId = params.orderId;

const [order, setOrder] = useState<OrderDetails | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
let cancelled = false;

async function loadOrder() {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      `/api/admin/orders/${encodeURIComponent(orderId)}`,
      { cache: "no-store" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load order details.");
    }

    if (!cancelled) {
      setOrder(data.order);
    }
  } catch (err) {
    if (!cancelled) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading this order."
      );
    }
  } finally {
    if (!cancelled) setLoading(false);
  }
}

if (orderId) loadOrder();

return () => {
  cancelled = true;
};


}, [orderId]);

if (loading) {
return ( <div className="admin-order-details-page"> <div className="admin-order-state-card"> <div className="admin-order-spinner" /> <h2>Loading order details</h2> <p>Please wait while we retrieve the order information.</p> </div> </div>
);
}

if (error || !order) {
return ( <div className="admin-order-details-page">
<button
className="admin-order-back"
onClick={() => router.push("/admin/orders")}
>
← Back to Orders </button>


    <div className="admin-order-state-card">
      <h2>Unable to load order</h2>
      <p>{error || "The requested order could not be found."}</p>
      <button
        className="admin-order-primary-button"
        onClick={() => router.refresh()}
      >
        Try Again
      </button>
    </div>
  </div>
);


}

return ( <div className="admin-order-details-page">
<button
className="admin-order-back"
onClick={() => router.push("/admin/orders")}
>
← Back to Orders </button>


  <header className="admin-order-detail-header">
    <div>
      <p className="admin-order-eyebrow">ORDER MANAGEMENT</p>
      <h1>{order.orderNumber}</h1>
      <p className="admin-order-subtitle">
        Created {dateTime(order.createdAt)}
      </p>
    </div>

    <div className="admin-order-badges">
      <StatusBadge value={order.orderStatus} />
      <StatusBadge value={order.paymentStatus} />
    </div>
  </header>

  {order.hasPaymentStatusMismatch && (
    <div className="admin-order-warning">
      <strong>Payment status needs attention</strong>
      <p>
        This order is marked as delivered, but its payment status is not
        marked as paid. Review the payment records.
      </p>
    </div>
  )}

  <div className="admin-order-detail-grid">
    <section className="admin-order-detail-card">
      <h2>Customer Information</h2>
      <div className="admin-order-info-row">
        <span>Full name</span>
        <strong>{order.customer.fullName}</strong>
      </div>
      <div className="admin-order-info-row">
        <span>Email</span>
        <strong>{order.customer.email}</strong>
      </div>
      <div className="admin-order-info-row">
        <span>Phone</span>
        <strong>{order.customer.phoneNumber}</strong>
      </div>
    </section>

    <section className="admin-order-detail-card">
      <h2>Store Information</h2>
      <div className="admin-order-info-row">
        <span>Store name</span>
        <strong>{order.store.storeName}</strong>
      </div>
      <div className="admin-order-info-row">
        <span>Store status</span>
        <StatusBadge value={order.store.status} />
      </div>
      <div className="admin-order-info-row">
        <span>Email</span>
        <strong>{order.store.email || "Not provided"}</strong>
      </div>
      <div className="admin-order-info-row">
        <span>Phone</span>
        <strong>{order.store.phone || "Not provided"}</strong>
      </div>
      <div className="admin-order-info-row">
        <span>Address</span>
        <strong>{order.store.address || "Not provided"}</strong>
      </div>
    </section>
  </div>

  <section className="admin-order-detail-card admin-order-products-card">
    <div className="admin-order-section-heading">
      <div>
        <h2>Products Ordered</h2>
        <p>{order.itemCount} product line(s) in this order</p>
      </div>
    </div>

    {order.items.length === 0 ? (
      <p className="admin-order-empty">No items were found for this order.</p>
    ) : (
      <div className="admin-order-items">
        {order.items.map((item) => {
          const image = item.product.images[0]?.imageUrl;

          return (
            <div className="admin-order-item" key={item.orderItemId}>
              {image ? (
                <img
                  src={image}
                  alt={item.product.productName}
                  className="admin-order-product-image"
                />
              ) : (
                <div className="admin-order-product-placeholder">
                  No image
                </div>
              )}

              <div className="admin-order-product-info">
                <h3>{item.product.productName}</h3>
                <p>
                  {item.product.category?.categoryName || "Uncategorized"}
                </p>
                <span>
                  {item.product.isActive ? "Active product" : "Inactive product"}
                </span>
                {item.product.description && (
                  <p>{item.product.description}</p>
                )}
              </div>

              <div className="admin-order-item-pricing">
                <span>{money(item.unitPrice)} × {item.quantity}</span>
                {item.discountAmount > 0 && (
                  <small>Item discount: {money(item.discountAmount)}</small>
                )}
                <strong>{money(item.totalPrice)}</strong>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </section>

  <div className="admin-order-detail-grid">
    <section className="admin-order-detail-card">
      <h2>Order Summary</h2>
      <div className="admin-order-info-row">
        <span>Subtotal</span>
        <strong>{money(order.totalAmount)}</strong>
      </div>
      <div className="admin-order-info-row">
        <span>Discount</span>
        <strong className="admin-order-discount">
          −{money(order.discountAmount)}
        </strong>
      </div>
      <div className="admin-order-total-row">
        <span>Final amount</span>
        <strong>{money(order.finalAmount)}</strong>
      </div>
      <p className="admin-order-readonly-note">
        Order information is read-only in Super Admin.
      </p>
    </section>

    <section className="admin-order-detail-card">
      <h2>Payment Records</h2>
      {order.payments.length === 0 ? (
        <p className="admin-order-empty">
          No payment records are available.
        </p>
      ) : (
        order.payments.map((payment) => (
          <div className="admin-order-payment" key={payment.paymentId}>
            <div className="admin-order-payment-heading">
              <strong>{payment.provider}</strong>
              <StatusBadge value={payment.status} />
            </div>
            <div className="admin-order-info-row">
              <span>Amount</span>
              <strong>{money(payment.amount)}</strong>
            </div>
            <div className="admin-order-info-row">
              <span>Transaction reference</span>
              <strong>{payment.transactionReference || "Not available"}</strong>
            </div>
            <div className="admin-order-info-row">
              <span>Payment created</span>
              <strong>{dateTime(payment.createdAt)}</strong>
            </div>
            <div className="admin-order-info-row">
              <span>Paid at</span>
              <strong>{dateTime(payment.paidAt)}</strong>
            </div>
          </div>
        ))
      )}
    </section>
  </div>

  <section className="admin-order-detail-card admin-order-metadata">
    <h2>Order Metadata</h2>
    <div className="admin-order-meta-grid">
      <div>
        <span>Order ID</span>
        <code>{order.orderId}</code>
      </div>
      <div>
        <span>Last updated</span>
        <strong>{dateTime(order.updatedAt)}</strong>
      </div>
    </div>
  </section>
</div>

);
}
