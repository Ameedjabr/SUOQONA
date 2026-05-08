"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button, Loader, EmptyState, Toast } from "@/components/ui";
import { cartApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import ChatWidget from "@/components/ChatWidget";

export default function CartPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadCart();
  }, [isAuthenticated, accessToken]);

  const loadCart = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const cart = await cartApi.getCart(accessToken);
      setCartItems(cart.items || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!accessToken) return;
    setIsUpdating(true);
    try {
      await cartApi.removeItem(accessToken, itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setSuccess("Item removed from cart");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!accessToken || quantity < 1) return;
    setIsUpdating(true);
    try {
      await cartApi.updateItem(accessToken, itemId, quantity);
      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.variant.priceCents * item.quantity, 0);
  const shipping = 0; // TODO: Calculate based on address
  const tax = Math.round(subtotal * 0.17); // 17% VAT for Israel
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader label="Loading cart..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

          {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
          {success && (
            <Toast type="success" message={success} onClose={() => setSuccess(null)} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2">
              {cartItems.length === 0 ? (
                <Card>
                  <EmptyState
                    title="Your cart is empty"
                    description="Add some products to get started"
                    action={
                      <Link href="/products">
                        <Button>Continue Shopping</Button>
                      </Link>
                    }
                  />
                </Card>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <Card key={item.id} className="flex gap-6">
                      {/* Image */}
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">📦</span>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.variant.product.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          SKU: {item.variant.sku}
                        </p>
                        <p className="text-lg font-bold text-indigo-600 mt-2">
                          ₪{(item.variant.priceCents / 100).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Control */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                          disabled={isUpdating}
                        >
                          Remove
                        </button>

                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                            disabled={isUpdating}
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                            disabled={isUpdating}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          ₪{((item.variant.priceCents * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div>
              <Card title="Order Summary">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₪{(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (17%)</span>
                    <span className="font-medium">₪{(tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₪{(shipping / 100).toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ₪{(total / 100).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    onClick={() => router.push("/checkout")}
                    disabled={cartItems.length === 0 || isUpdating}
                    className="w-full"
                  >
                    Proceed to Checkout
                  </Button>

                  <Link href="/products">
                    <Button variant="secondary" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
