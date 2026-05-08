"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button, Loader } from "@/components/ui";
import { orderApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import ChatWidget from "@/components/ChatWidget";

export default function OrderConfirmation() {
  const params = useParams();
  const orderId = params?.id as string;
  const router = useRouter();
  const { accessToken } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !accessToken) {
      setIsLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        const myOrder = await orderApi.getMyOrder(accessToken as string, orderId);
        setOrder(myOrder);
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
              <Button onClick={() => router.push("/products")}>Back to Shop</Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase</p>
          </div>

          {/* Order Details */}
          <Card title="Order Details" className="mb-6">
            <div className="grid grid-cols-2 gap-6 text-sm mb-6">
              <div>
                <p className="text-gray-600">Order Number</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="text-lg font-semibold text-blue-600 mt-1">{order.status}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{order.paymentMethod}</p>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card title="Shipping Address" className="mb-6">
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

          {/* Order Items */}
          <Card title="Order Items" className="mb-6">
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
          </Card>

          {/* Total */}
          <Card className="mb-6">
            <div className="space-y-2 text-sm">
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
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ₪{(order.totalCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card title="What's Next?" className="mb-6 bg-blue-50 border border-blue-200">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-xl">📧</span>
                <span>A confirmation email has been sent to <strong>{order.customerEmail}</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">🚚</span>
                <span>Your order will be shipped soon. We'll send you tracking information.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">💬</span>
                <span>Have questions? Use the chat widget for instant support.</span>
              </li>
            </ul>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products">
              <Button variant="secondary">Continue Shopping</Button>
            </Link>
            <Link href="/account/orders">
              <Button>View My Orders</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
