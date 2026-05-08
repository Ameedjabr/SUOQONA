"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button, Loader, EmptyState, Badge } from "@/components/ui";
import { orderApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import ChatWidget from "@/components/ChatWidget";

export default function MyOrders() {
  const { accessToken } = useAuth();
  useProtectedRoute("CUSTOMER");

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    loadOrders();
  }, [accessToken]);

  const loadOrders = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const result = await orderApi.getMyOrders(accessToken);
      setOrders(result || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Track and manage your orders</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader label="Loading orders..." />
            </div>
          ) : error ? (
            <Card className="bg-red-50">
              <div className="text-red-700">{error}</div>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <EmptyState
                title="No orders yet"
                description="Start shopping to create your first order"
                action={
                  <Link href="/products">
                    <Button>Shop Now</Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`}>
                  <Card className="hover:shadow-lg transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s)
                        </p>
                      </div>

                      <div className="text-right space-y-2">
                        <p className="text-lg font-bold text-indigo-600">
                          ₪{(order.totalCents / 100).toFixed(2)}
                        </p>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
