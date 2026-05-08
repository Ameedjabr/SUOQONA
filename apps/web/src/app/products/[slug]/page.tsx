"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button, Loader, Toast } from "@/components/ui";
import { productApi, Product, cartApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import ChatWidget from "@/components/ChatWidget";

export default function ProductDetail() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const data = await productApi.getBySlug(slug);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!accessToken || !product?.variants?.[0]) return;

    setIsAddingToCart(true);
    try {
      await cartApi.addItem(accessToken, product.variants[0].id, quantity);
      setSuccess("Added to cart!");
      setTimeout(() => router.push("/cart"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader label="Loading product..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Product not found</h2>
              <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
              <Button onClick={() => router.push("/products")}>Back to Products</Button>
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
          {success && (
            <Toast type="success" message={success} onClose={() => setSuccess(null)} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image */}
            <div>
              <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-8xl">📦</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images?.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    className="w-full h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center"
                  >
                    <span className="text-2xl">📦</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600">{product.brand || "Brand"}</p>
                <h1 className="text-4xl font-bold text-gray-900 mt-2">{product.title}</h1>
              </div>

              {/* Price */}
              <div className="space-y-2">
                {product.priceCents && (
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-indigo-600">
                      ₪{(product.priceCents / 100).toFixed(2)}
                    </span>
                    {product.compareAtPriceCents && (
                      <span className="text-lg text-gray-500 line-through">
                        ₪{(product.compareAtPriceCents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                size="lg"
                onClick={handleAddToCart}
                isLoading={isAddingToCart}
                className="w-full"
              >
                🛒 Add to Cart
              </Button>

              {/* Details Card */}
              <Card>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU</span>
                    <span className="font-medium">{product.variants?.[0]?.sku || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability</span>
                    <span className="font-medium text-green-600">In Stock</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium">{product.status}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <p className="text-gray-600">More products coming soon...</p>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
