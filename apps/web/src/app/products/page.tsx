"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button, Input, Loader, EmptyState, Select, Badge } from "@/components/ui";
import { productApi, Product } from "@/services/api";
import ChatWidget from "@/components/ChatWidget";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page, search, sort]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const result = await productApi.search({
        page,
        limit: 20,
        search: search || undefined,
        sort: sort || undefined,
      });
      setProducts(result.products || []);
      setTotalPages(result.pages || 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Discover our entire collection</p>
          </div>
        </div>

        {/* Filters and Products */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Search</h3>
                    <Input
                      placeholder="Search products..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Sort by</h3>
                    <Select
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                      }}
                      options={[
                        { value: "newest", label: "Newest" },
                        { value: "price-asc", label: "Price: Low to High" },
                        { value: "price-desc", label: "Price: High to Low" },
                        { value: "popular", label: "Most Popular" },
                      ]}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader label="Loading products..." />
                </div>
              ) : error ? (
                <Card>
                  <div className="text-red-600 text-center py-8">{error}</div>
                </Card>
              ) : products.length === 0 ? (
                <Card>
                  <EmptyState title="No products found" description="Try adjusting your search filters" />
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {products.map((product) => (
                      <Link key={product.id} href={`/products/${product.slug}`}>
                        <Card className="hover:shadow-lg transition h-full cursor-pointer">
                          {/* Placeholder image */}
                          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-4 flex items-center justify-center">
                            <span className="text-6xl">📦</span>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600">{product.brand || "Brand"}</p>
                            <h3 className="text-lg font-semibold text-gray-900 mt-1 line-clamp-2">
                              {product.title}
                            </h3>

                            <div className="mt-4 flex items-baseline gap-2">
                              {product.priceCents && (
                                <>
                                  <span className="text-2xl font-bold text-indigo-600">
                                    ₪{(product.priceCents / 100).toFixed(2)}
                                  </span>
                                  {product.compareAtPriceCents && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ₪{(product.compareAtPriceCents / 100).toFixed(2)}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            <Badge
                              variant={product.status === "ACTIVE" ? "success" : "warning"}
                              className="mt-4"
                            >
                              {product.status}
                            </Badge>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="secondary"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-gray-600">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
