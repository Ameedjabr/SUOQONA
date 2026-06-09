"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ShoppingCart, Zap, Package, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button, Loader, Toast } from "@/components/ui";
import { productApi, Product, cartApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import ChatWidget from "@/components/ChatWidget";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function ProductDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  useEffect(() => {
    if (!slug) return;
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightboxOpen(false); resetView(); }
      if (e.key === "ArrowLeft") { prevImage(); resetView(); }
      if (e.key === "ArrowRight") { nextImage(); resetView(); }
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 0.25, 6));
      if (e.key === "-") setZoom(z => Math.max(z - 0.25, 0.5));
      if (e.key === "0") resetView();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, resetView]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const el = imgRef.current?.parentElement;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(z => Math.min(Math.max(0.5, z - e.deltaY * 0.002), 6));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [lightboxOpen]);

  const loadProduct = async () => {
    try {
      const data = await productApi.getBySlug(slug);
      setProduct(data);
      setActiveImg(0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  const images = product?.images ?? [];

  const prevImage = useCallback(() => { setActiveImg(i => (i === 0 ? images.length - 1 : i - 1)); resetView(); }, [images.length, resetView]);
  const nextImage = useCallback(() => { setActiveImg(i => (i === images.length - 1 ? 0 : i + 1)); resetView(); }, [images.length, resetView]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onMouseUp = () => { dragging.current = false; };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!accessToken || !product?.variants?.[0]) return;
    setIsAddingToCart(true);
    try {
      await cartApi.addItem(accessToken, product.variants[0].id, quantity);
      setSuccess(t("productDetail.addedToCart"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!accessToken || !product?.variants?.[0]) return;
    setIsBuyingNow(true);
    try {
      await cartApi.addItem(accessToken, product.variants[0].id, quantity);
      router.push("/cart");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process");
      setIsBuyingNow(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center"><Loader label={t("productDetail.loadingProduct")} /></div>
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t("productDetail.notFound")}</h2>
              <p className="text-gray-600 mb-4">{t("productDetail.notFoundDesc")}</p>
              <Button onClick={() => router.push("/products")}>{t("productDetail.backToProducts")}</Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPct =
    product.compareAtPriceCents && product.priceCents
      ? Math.round((1 - product.priceCents / product.compareAtPriceCents) * 100)
      : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* ── Lightbox with zoom & pan ── */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white/70 text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(6, z + 0.25))}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={resetView}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <p className="text-white/50 text-sm">{activeImg + 1} / {images.length}</p>

            <button
              onClick={() => { setLightboxOpen(false); resetView(); }}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image area */}
          <div
            className="flex-1 overflow-hidden relative flex items-center justify-center"
            style={{ cursor: zoom > 1 ? (dragging.current ? "grabbing" : "grab") : "default" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img
              ref={imgRef}
              src={images[activeImg].url}
              alt={images[activeImg].alt || product.title}
              draggable={false}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: dragging.current ? "none" : "transform 0.15s ease",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                userSelect: "none",
              }}
            />
          </div>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => { prevImage(); resetView(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => { nextImage(); resetView(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom hint */}
          <p className="text-white/30 text-xs text-center py-2 flex-shrink-0">
            {t("productDetail.lightboxHint")}
          </p>
        </div>
      )}

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
          {success && <Toast type="success" message={success} onClose={() => setSuccess(null)} />}

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition"
          >
            <ChevronLeft className="w-4 h-4" /> {t("productDetail.back")}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* ── Image Gallery ── */}
            <div className="space-y-3">
              <div
                className="relative w-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-zoom-in"
                onClick={() => images.length > 0 && setLightboxOpen(true)}
              >
                {images.length > 0 ? (
                  <img
                    src={images[activeImg].url}
                    alt={images[activeImg].alt || product.title}
                    className="w-full h-auto object-contain"
                    style={{ imageRendering: "auto" }}
                  />
                ) : (
                  <div className="w-full h-80 flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-300" />
                  </div>
                )}

                {images.length > 0 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/40 text-white text-xs rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <ZoomIn className="w-3 h-3" /> {t("productDetail.clickToZoom")}
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                          className={`w-2 h-2 rounded-full transition ${i === activeImg ? "bg-indigo-600 scale-125" : "bg-gray-300"}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {discountPct && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                    -{discountPct}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveImg(idx); resetView(); }}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                        idx === activeImg ? "border-indigo-500 shadow-md" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={img.url} alt={img.alt || product.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ── */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-indigo-500 uppercase tracking-wide">{product.brand || t("productDetail.brand")}</p>
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-1 leading-tight">{product.title}</h1>
              </div>

              {product.priceCents && (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-indigo-600">
                    ₪{(product.priceCents / 100).toFixed(2)}
                  </span>
                  {product.compareAtPriceCents && (
                    <span className="text-lg text-gray-400 line-through">
                      ₪{(product.compareAtPriceCents / 100).toFixed(2)}
                    </span>
                  )}
                  {discountPct && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-semibold rounded-lg">
                      {t("products.save")} {discountPct}%
                    </span>
                  )}
                </div>
              )}

              {product.description && (
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1">{t("productDetail.description")}</h2>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t("productDetail.quantity")}</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isBuyingNow}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold flex items-center justify-center gap-2 hover:bg-indigo-50 transition disabled:opacity-50"
                >
                  {isAddingToCart ? (
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  {t("productDetail.addToCart")}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || isBuyingNow}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isBuyingNow ? (
                    <div className="w-4 h-4 border-2 border-indigo-200 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {t("productDetail.buyNow")}
                </button>
              </div>

              <Card>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("productDetail.sku")}</span>
                    <span className="font-medium">{product.variants?.[0]?.sku || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("productDetail.availability")}</span>
                    <span className="font-medium text-green-600">{t("productDetail.inStock")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("productDetail.status")}</span>
                    <span className="font-medium">{product.status}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("productDetail.relatedProducts")}</h2>
            <p className="text-gray-500">{t("productDetail.moreComingSoon")}</p>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
