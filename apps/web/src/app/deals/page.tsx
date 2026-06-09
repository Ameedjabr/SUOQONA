"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { productApi, Product } from "@/services/api";
import { Package, Tag, Zap } from "lucide-react";

function formatPrice(cents: number) {
  return `₪${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productApi.search({ limit: 20, sort: "newest" })
      .then((res) => {
        const withDiscount = (res.products || []).filter(
          (p: Product) => p.compareAtPriceCents && p.priceCents && p.compareAtPriceCents > p.priceCents
        );
        setDeals(withDiscount);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="px-6 py-14 text-center text-white" style={{ background: "linear-gradient(135deg, #0F1F3D 0%, #1a2f5a 100%)" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ background: "#FF5533" }}>
              <Zap className="w-3.5 h-3.5" /> Limited Time Offers
            </div>
            <h1 className="text-5xl font-black mb-3">Special Deals</h1>
            <p className="text-white/60 text-lg max-w-lg mx-auto">
              Hand-picked discounts on top products — updated regularly.
            </p>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-5 bg-gray-100 rounded w-20 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-gray-400">
              <Tag className="w-16 h-16 opacity-20 mb-4" />
              <p className="text-xl font-bold text-gray-600">No deals right now</p>
              <p className="text-sm mt-1">Check back soon — new offers are added regularly.</p>
              <Link href="/products">
                <button className="mt-6 px-6 py-3 text-sm font-bold text-white rounded-xl hover:brightness-110 transition"
                  style={{ background: "#FF5533" }}>
                  Browse all products
                </button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6 font-medium">{deals.length} deal{deals.length !== 1 ? "s" : ""} available</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {deals.map((product, i) => {
                  const pct = product.compareAtPriceCents && product.priceCents
                    ? Math.round(((product.compareAtPriceCents - product.priceCents) / product.compareAtPriceCents) * 100)
                    : 0;
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: (i % 4) * 0.06 }}
                      viewport={{ once: true }}
                    >
                      <Link href={`/products/${product.slug}`}>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                          <div className="relative h-52 bg-[#F7F4EF] overflow-hidden">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-200" />
                              </div>
                            )}
                            <span className="absolute top-3 left-3 text-white text-[11px] font-black px-2.5 py-1 rounded-full"
                              style={{ background: "#FF5533" }}>
                              -{pct}%
                            </span>
                          </div>
                          <div className="p-4">
                            {product.brand && (
                              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{product.brand}</p>
                            )}
                            <h3 className="text-sm font-bold text-[#0F1F3D] line-clamp-2 leading-snug mb-3">{product.title}</h3>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-black" style={{ color: "#FF5533" }}>
                                {formatPrice(product.priceCents!)}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.compareAtPriceCents!)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
