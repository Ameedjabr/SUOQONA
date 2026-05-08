"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button, Loader, Badge } from "@/components/ui";
import { orderApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import ChatWidget from "@/components/ChatWidget";

export default function OrderDetail() {
  const params = useParams();
  const orderId = params?.id as string;
  const router = useRouter();
  const { accessToken } = useAuth();
  useProtectedRoute("CUSTOMER");

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !accessToken) {
      setIsLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        const result = await orderApi.getMyOrder(accessToken as string, orderId);
        setOrder(result);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderId, accessToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader label="Loading order..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
              <Button onClick={() => router.push("/account/orders")}>Back to Orders</Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string): "success" | "warning" | "error" | "info" => {
    const statusMap: Record<string, "success" | "warning" | "error" | "info"> = {
      PENDING: "warning",
      CONFIRMED: "info",
      SHIPPED: "info",
      DELIVERED: "success",
      CANCELLED: "error",
    };
    return statusMap[status] || "info";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            ← Back
          </Button>

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-2">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <Badge variant={getStatusBadgeVariant(order.status)} className="mt-2">
                  {order.status}
                </Badge>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-gray-600 text-sm">Payment</p>
                <Badge
                  variant={order.paymentStatus === "COLLECTED" ? "success" : "warning"}
                  className="mt-2"
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  ₪{(order.totalCents / 100).toFixed(2)}
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card title="Shipping Address">
              <div className="text-sm space-y-1">
                <p className="font-semibold text-gray-900">{order.customerName}</p>
                <p className="text-gray-700">{order.addressLine1}</p>
                {order.addressLine2 && <p className="text-gray-700">{order.addressLine2}</p>}
                <p className="text-gray-700">
                  {order.city}, {order.area} {order.postalCode}
                </p>
                <p className="text-gray-700">{order.country}</p>
                <p className="text-gray-700 mt-2">📞 {order.phonePrimary}</p>
              </div>
            </Card>

            <Card title="Payment Method">
              <p className="text-lg font-semibold text-gray-900">{order.paymentMethod}</p>
              <p className="text-gray-600 text-sm mt-2">
                {order.paymentMethod === "COD" &&
                  "Payment will be collected upon delivery"}
              </p>
            </Card>
          </div>

          <Card title="Order Items">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-2 font-semibold text-gray-700 text-right">Qty</th>
                    <th className="px-4 py-2 font-semibold text-gray-700 text-right">Price</th>
                    <th className="px-4 py-2 font-semibold text-gray-700 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{item.productTitle}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        ₪{(item.unitPriceCents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ₪{(item.lineTotalCents / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-2 text-sm border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₪{(order.subtotalCents / 100).toFixed(2)}</span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₪{(order.discountCents / 100).toFixed(2)}</span>
                </div>
              )}
              {order.shippingCents > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>₪{(order.shippingCents / 100).toFixed(2)}</span>
                </div>
              )}
              {order.taxCents > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₪{(order.taxCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-indigo-600">₪{(order.totalCents / 100).toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
