"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { categoryApi, Category } from "@/services/api";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryApi.getAll()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div style={{ background: "#0F1F3D" }} className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>{t("common.browse")}</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">{t("categories.title")}</h1>
            <p className="text-white/40 mt-2 text-sm">{t("categories.subtitle")}</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200" />
                  <div className="h-10 bg-white" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto opacity-20 mb-4" />
              <p className="text-lg font-bold text-gray-500">{t("categories.noCategories")}</p>
            </div>
          ) : (
            <div className="space-y-10">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  {/* Parent category */}
                  <Link href={`/categories/${cat.slug}`}>
                    <motion.div
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow mb-4"
                      style={{ height: 200 }}
                    >
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "#0F1F3D" }}>
                          <ShoppingBag className="w-12 h-12 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h2 className="text-white font-black text-2xl leading-tight mb-1">{cat.name}</h2>
                        {cat.children?.length ? (
                          <p className="text-white/60 text-sm mb-2">{t("categories.subcategories", { count: cat.children.length })}</p>
                        ) : null}
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white/80 group-hover:text-white transition">
                          {t("categories.shopNow")} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  </Link>

                  {/* Subcategories */}
                  {cat.children?.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pl-4 border-l-2" style={{ borderColor: "rgba(255,85,51,0.3)" }}>
                      {cat.children.map((child) => (
                        <Link key={child.id} href={`/categories/${child.slug}`}>
                          <motion.div
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            className="group rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="h-28 overflow-hidden relative" style={{ background: "#F7F4EF" }}>
                              {child.image ? (
                                <img
                                  src={child.image}
                                  alt={child.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="w-6 h-6 text-gray-200" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                            </div>
                            <div className="px-3 py-2.5 flex items-center justify-between">
                              <p className="text-sm font-bold text-[#0F1F3D]">{child.name}</p>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#FF5533] transition-colors" />
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </motion.div>
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
