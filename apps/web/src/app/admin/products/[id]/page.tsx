"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Save, Package, Tag, DollarSign,
  AlertCircle, Wand2, Plus, Trash2, Edit2, Image as ImageIcon,
  Layers, X, Check, Upload, Eye, EyeOff,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { productApi, variantApi, imageApi, categoryApi, Category, ProductVariant, UploadImageResponse } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";

// ─── helpers ────────────────────────────────────────────────────────────────

function slugify(t: string) {
  return t.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "").replace(/--+/g, "-").replace(/^-|-$/g, "");
}

// ─── types ───────────────────────────────────────────────────────────────────

interface VariantForm {
  sku: string;
  barcode: string;
  priceCents: number;
  compareAtPriceCents: number;
  isActive: boolean;
  initialStock: number;
  optionValues: { key: string; value: string }[];
}

const BLANK_VARIANT: VariantForm = {
  sku: "", barcode: "", priceCents: 0, compareAtPriceCents: 0,
  isActive: true, initialStock: 0, optionValues: [],
};

// ─── status options ──────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "DRAFT",    label: "Draft",    desc: "Not visible to customers", color: "bg-amber-100 text-amber-700" },
  { value: "ACTIVE",   label: "Active",   desc: "Visible and purchasable",  color: "bg-emerald-100 text-emerald-700" },
  { value: "ARCHIVED", label: "Archived", desc: "Hidden from store",        color: "bg-slate-100 text-slate-600" },
];

// ─── toast helper ────────────────────────────────────────────────────────────

function Toast({ toast }: { toast: { type: "success" | "error"; msg: string } | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className={`fixed top-5 right-5 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── flat category list for checkboxes ───────────────────────────────────────

function flattenCategories(cats: Category[], depth = 0): { cat: Category; depth: number }[] {
  const out: { cat: Category; depth: number }[] = [];
  for (const c of cats) {
    out.push({ cat: c, depth });
    if (c.children?.length) out.push(...flattenCategories(c.children, depth + 1));
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════

export default function ProductForm() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const isNew = productId === "new" || !productId;
  const { accessToken } = useAuth();

  // ── core form ──
  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", brand: "",
    priceCents: 0, compareAtPriceCents: 0, status: "DRAFT",
  });
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [slugAuto, setSlugAuto] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);

  // ── categories ──
  const [allCategories, setAllCategories]     = useState<Category[]>([]);
  const [selectedCatIds, setSelectedCatIds]   = useState<string[]>([]);

  // ── variants ──
  const [variants, setVariants]               = useState<ProductVariant[]>([]);
  const [variantModal, setVariantModal]       = useState<{ open: boolean; editing: ProductVariant | null }>({ open: false, editing: null });
  const [variantForm, setVariantForm]         = useState<VariantForm>(BLANK_VARIANT);
  const [variantSaving, setVariantSaving]     = useState(false);
  const [variantDeleting, setVariantDeleting] = useState<string | null>(null);

  // ── images ──
  const [images, setImages]         = useState<UploadImageResponse[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [deletingImg, setDeletingImg] = useState<string | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  // ── ui ──
  const [tab, setTab]       = useState(0);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [toast, setToast]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── load on mount ──────────────────────────────────────────────────────────

  useEffect(() => {
    categoryApi.getAll()
      .then((cats) => setAllCategories(Array.isArray(cats) ? cats : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew || !accessToken) { setIsLoading(false); return; }

    Promise.all([
      productApi.getById(productId),
      variantApi.getByProduct(productId),
      imageApi.getProductImages(productId),
    ])
      .then(([product, vars, imgs]) => {
        setFormData({
          title: product.title,
          slug: product.slug,
          description: product.description || "",
          brand: product.brand || "",
          priceCents: product.priceCents || 0,
          compareAtPriceCents: product.compareAtPriceCents || 0,
          status: product.status,
        });
        setSlugAuto(false);
        const catLinks = (product as any).categories || [];
        setSelectedCatIds(catLinks.map((l: any) => l.category?.id || l.categoryId || l.id).filter(Boolean));
        setVariants(Array.isArray(vars) ? vars : []);
        setImages(Array.isArray(imgs) ? imgs : []);
      })
      .catch((err) => showToast("error", err.message || "Failed to load product"))
      .finally(() => setIsLoading(false));
  }, [productId, isNew, accessToken]);

  // ── details form ───────────────────────────────────────────────────────────

  const setField = (field: string, value: string | number) => {
    setFormData((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleTitleChange = (value: string) => {
    const next = { ...formData, title: value };
    if (slugAuto) next.slug = slugify(value);
    setFormData(next);
    if (errors.title) setErrors((e) => ({ ...e, title: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = "Title is required";
    if (!formData.slug.trim()) e.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(formData.slug)) e.slug = "Lowercase letters, numbers and hyphens only";
    if (formData.priceCents < 0) e.priceCents = "Must be 0 or more";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveDetails = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate() || !accessToken) return;
    setIsSaving(true);
    try {
      if (isNew) {
        const created = await productApi.create(accessToken, formData);
        showToast("success", "Product created — you can now add variants & images");
        setTimeout(() => router.replace(`/admin/products/${(created as any).id}`), 1200);
      } else {
        await productApi.update(accessToken, productId, { ...formData, categoryIds: selectedCatIds });
        showToast("success", "Product saved");
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // ── variants ───────────────────────────────────────────────────────────────

  const openVariantModal = (v?: ProductVariant) => {
    if (v) {
      const opts = v.optionValues
        ? Object.entries(v.optionValues).map(([key, value]) => ({ key, value }))
        : [];
      setVariantForm({
        sku: v.sku,
        barcode: v.barcode || "",
        priceCents: v.priceCents,
        compareAtPriceCents: v.compareAtPriceCents || 0,
        isActive: v.isActive,
        initialStock: 0,
        optionValues: opts,
      });
      setVariantModal({ open: true, editing: v });
    } else {
      setVariantForm(BLANK_VARIANT);
      setVariantModal({ open: true, editing: null });
    }
  };

  const handleSaveVariant = async () => {
    if (!accessToken || !productId || isNew) return;
    if (!variantForm.sku.trim()) { showToast("error", "SKU is required"); return; }
    setVariantSaving(true);
    try {
      const optionValues = variantForm.optionValues.reduce<Record<string, string>>((acc, { key, value }) => {
        if (key.trim()) acc[key.trim()] = value;
        return acc;
      }, {});

      if (variantModal.editing) {
        const updated = await variantApi.update(accessToken, variantModal.editing.id, {
          sku: variantForm.sku,
          barcode: variantForm.barcode || undefined,
          priceCents: variantForm.priceCents,
          compareAtPriceCents: variantForm.compareAtPriceCents || undefined,
          isActive: variantForm.isActive,
          optionValues,
        });
        setVariants((vs) => vs.map((v) => (v.id === updated.id ? updated : v)));
        showToast("success", "Variant updated");
      } else {
        const created = await variantApi.create(accessToken, productId, {
          sku: variantForm.sku,
          barcode: variantForm.barcode || undefined,
          priceCents: variantForm.priceCents,
          compareAtPriceCents: variantForm.compareAtPriceCents || undefined,
          isActive: variantForm.isActive,
          optionValues,
          initialStock: variantForm.initialStock,
        } as any);
        setVariants((vs) => [...vs, created]);
        showToast("success", "Variant added");
      }
      setVariantModal({ open: false, editing: null });
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save variant");
    } finally {
      setVariantSaving(false);
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!accessToken) return;
    setVariantDeleting(id);
    try {
      await variantApi.delete(accessToken, id);
      setVariants((vs) => vs.filter((v) => v.id !== id));
      showToast("success", "Variant deleted");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete variant");
    } finally {
      setVariantDeleting(null);
    }
  };

  // ── images ─────────────────────────────────────────────────────────────────

  const handleUploadImages = async (files: FileList) => {
    if (!accessToken || !productId || isNew) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("images", f));
      const uploaded = await imageApi.uploadForProduct(accessToken, productId, fd);
      setImages((imgs) => [...imgs, ...(Array.isArray(uploaded) ? uploaded : [uploaded])]);
      showToast("success", `${files.length} image(s) uploaded`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!accessToken) return;
    setDeletingImg(id);
    try {
      await imageApi.delete(accessToken, id);
      setImages((imgs) => imgs.filter((i) => i.id !== id));
      showToast("success", "Image deleted");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setDeletingImg(null);
    }
  };

  // ── loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminLayout currentPage="products">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm mt-3">Loading product…</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  const flatCats = flattenCategories(allCategories);
  const TABS = isNew
    ? [{ label: "Details", icon: Package }]
    : [
        { label: "Details", icon: Package },
        { label: `Variants (${variants.length})`, icon: Tag },
        { label: `Images (${images.length})`, icon: ImageIcon },
      ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="products">
        <div className="p-5 max-w-5xl mx-auto space-y-4">
          <Toast toast={toast} />

          {/* Header */}
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/admin/products")}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{isNew ? "Create Product" : "Edit Product"}</h1>
              <p className="text-base text-slate-500 mt-1">
                {isNew ? "Fill in the details below — variants & images can be added after saving" : formData.title}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {TABS.map((t, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === i ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB 0: DETAILS ─────────────────────────────────────────────── */}
          {tab === 0 && (
            <form onSubmit={handleSaveDetails} className="space-y-5">

              {/* Basic Info */}
              <Section icon={Package} title="Basic Information">
                <div className="space-y-5">
                  <Field label="Product Title" required error={errors.title}>
                    <input type="text" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Premium Wireless Headphones"
                      className={inputCls(!!errors.title)} />
                  </Field>

                  <Field label="URL Slug" required error={errors.slug}
                    labelRight={isNew ? (
                      <button type="button"
                        onClick={() => { setSlugAuto(!slugAuto); if (!slugAuto) setField("slug", slugify(formData.title)); }}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${slugAuto ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                        <Wand2 className="w-3 h-3" />{slugAuto ? "Auto (on)" : "Auto"}
                      </button>
                    ) : undefined}
                  >
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/</span>
                      <input type="text" value={formData.slug}
                        onChange={(e) => { setSlugAuto(false); setField("slug", e.target.value); }}
                        placeholder="product-url-slug"
                        className={`pl-7 ${inputCls(!!errors.slug)} font-mono`} />
                    </div>
                    {!errors.slug && <p className="text-slate-400 text-xs mt-1">Lowercase letters, numbers and hyphens only</p>}
                  </Field>

                  <Field label="Brand">
                    <input type="text" value={formData.brand}
                      onChange={(e) => setField("brand", e.target.value)}
                      placeholder="Brand or manufacturer name"
                      className={inputCls(false)} />
                  </Field>

                  <Field label="Description">
                    <textarea value={formData.description}
                      onChange={(e) => setField("description", e.target.value)}
                      placeholder="Describe this product's features and benefits…"
                      rows={4}
                      className={`${inputCls(false)} resize-none`} />
                  </Field>
                </div>
              </Section>

              {/* Pricing */}
              <Section icon={DollarSign} title="Pricing">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price (₪)" error={errors.priceCents}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
                      <input type="number" step="0.01" min="0"
                        value={formData.priceCents / 100 || ""}
                        onChange={(e) => setField("priceCents", Math.round((parseFloat(e.target.value) || 0) * 100))}
                        placeholder="0.00" className={`pl-7 ${inputCls(!!errors.priceCents)}`} />
                    </div>
                  </Field>
                  <Field label="Compare-at Price (₪)" helper="Shows as crossed-out price">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
                      <input type="number" step="0.01" min="0"
                        value={formData.compareAtPriceCents / 100 || ""}
                        onChange={(e) => setField("compareAtPriceCents", Math.round((parseFloat(e.target.value) || 0) * 100))}
                        placeholder="0.00" className={`pl-7 ${inputCls(false)}`} />
                    </div>
                  </Field>
                </div>
                {formData.priceCents > 0 && formData.compareAtPriceCents > formData.priceCents && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                    <Check className="w-3 h-3" />
                    Discount: {Math.round(((formData.compareAtPriceCents - formData.priceCents) / formData.compareAtPriceCents) * 100)}% off
                  </div>
                )}
              </Section>

              {/* Visibility */}
              <Section icon={Eye} title="Visibility">
                <div className="grid grid-cols-3 gap-3">
                  {STATUS_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setField("status", opt.value)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        formData.status === opt.value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}>
                      {formData.status === opt.value && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${opt.color} mb-2`}>{opt.label}</span>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Categories (only for edit) */}
              {!isNew && flatCats.length > 0 && (
                <Section icon={Layers} title="Categories">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {flatCats.map(({ cat, depth }) => (
                      <label key={cat.id}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                          selectedCatIds.includes(cat.id)
                            ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                        style={{ paddingLeft: depth * 12 + 12 }}
                      >
                        <input type="checkbox" className="sr-only"
                          checked={selectedCatIds.includes(cat.id)}
                          onChange={(e) => setSelectedCatIds((ids) =>
                            e.target.checked ? [...ids, cat.id] : ids.filter((id) => id !== cat.id)
                          )}
                        />
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedCatIds.includes(cat.id) ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                        }`}>
                          {selectedCatIds.includes(cat.id) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-sm font-medium truncate">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedCatIds.length > 0 && (
                    <p className="text-xs text-indigo-600 mt-3">{selectedCatIds.length} categor{selectedCatIds.length === 1 ? "y" : "ies"} selected</p>
                  )}
                </Section>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pb-6">
                <button type="button" disabled={isSaving} onClick={() => router.push("/admin/products")}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* ── TAB 1: VARIANTS ────────────────────────────────────────────── */}
          {tab === 1 && !isNew && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{variants.length} variant{variants.length !== 1 ? "s" : ""}</p>
                <button onClick={() => openVariantModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
                  <Tag className="w-10 h-10 opacity-30 mb-3" />
                  <p className="font-medium text-slate-600">No variants yet</p>
                  <p className="text-sm mt-1">Variants define specific SKUs (e.g. size, color)</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Options</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {variants.map((v) => {
                        const stock = (v as any).inventoryItem?.onHand ?? "—";
                        const opts = v.optionValues ? Object.entries(v.optionValues) : [];
                        return (
                          <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-slate-900 font-medium">{v.sku}</td>
                            <td className="px-5 py-3.5">
                              {opts.length > 0
                                ? <div className="flex flex-wrap gap-1">{opts.map(([k, val]) => (
                                    <span key={k} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{k}: {val}</span>
                                  ))}</div>
                                : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-slate-900 tabular-nums">₪{(v.priceCents / 100).toFixed(2)}</td>
                            <td className="px-5 py-3.5 text-slate-600 tabular-nums">{stock}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${v.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                {v.isActive ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Inactive</>}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openVariantModal(v)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button onClick={() => handleDeleteVariant(v.id)} disabled={variantDeleting === v.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                                  {variantDeleting === v.id
                                    ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                    : <Trash2 className="w-3 h-3" />}
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: IMAGES ──────────────────────────────────────────────── */}
          {tab === 2 && !isNew && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{images.length} image{images.length !== 1 ? "s" : ""}</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading…" : "Upload Images"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => e.target.files && handleUploadImages(e.target.files)} />
              </div>

              {images.length === 0 ? (
                <div
                  className="bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-10 h-10 opacity-30 mb-3" />
                  <p className="font-medium text-slate-600">No images yet</p>
                  <p className="text-sm mt-1">Click or drag files here to upload</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="group relative bg-slate-100 rounded-xl overflow-hidden aspect-square border border-slate-200">
                      <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleDeleteImage(img.id)} disabled={deletingImg === img.id}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                          {deletingImg === img.id
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div
                    className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add more</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── VARIANT MODAL ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {variantModal.open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !variantSaving && setVariantModal({ open: false, editing: null })}>
              <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">
                    {variantModal.editing ? "Edit Variant" : "Add Variant"}
                  </h2>
                  <button onClick={() => setVariantModal({ open: false, editing: null })} disabled={variantSaving}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* SKU + Barcode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">SKU <span className="text-red-500">*</span></label>
                      <input type="text" value={variantForm.sku}
                        onChange={(e) => setVariantForm((f) => ({ ...f, sku: e.target.value }))}
                        placeholder="e.g. PROD-RED-L"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Barcode</label>
                      <input type="text" value={variantForm.barcode}
                        onChange={(e) => setVariantForm((f) => ({ ...f, barcode: e.target.value }))}
                        placeholder="EAN / UPC"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Price (₪) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
                        <input type="number" step="0.01" min="0"
                          value={variantForm.priceCents / 100 || ""}
                          onChange={(e) => setVariantForm((f) => ({ ...f, priceCents: Math.round((parseFloat(e.target.value) || 0) * 100) }))}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Compare-at (₪)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₪</span>
                        <input type="number" step="0.01" min="0"
                          value={variantForm.compareAtPriceCents / 100 || ""}
                          onChange={(e) => setVariantForm((f) => ({ ...f, compareAtPriceCents: Math.round((parseFloat(e.target.value) || 0) * 100) }))}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                      </div>
                    </div>
                  </div>

                  {/* Stock (only on create) */}
                  {!variantModal.editing && (
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Initial Stock</label>
                      <input type="number" min="0"
                        value={variantForm.initialStock || ""}
                        onChange={(e) => setVariantForm((f) => ({ ...f, initialStock: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                    </div>
                  )}

                  {/* Option Values */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-600">Option Values</label>
                      <button type="button"
                        onClick={() => setVariantForm((f) => ({ ...f, optionValues: [...f.optionValues, { key: "", value: "" }] }))}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {variantForm.optionValues.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input type="text" value={opt.key}
                            onChange={(e) => setVariantForm((f) => {
                              const opts = [...f.optionValues];
                              opts[idx] = { ...opts[idx], key: e.target.value };
                              return { ...f, optionValues: opts };
                            })}
                            placeholder="color" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                          <span className="text-slate-300">:</span>
                          <input type="text" value={opt.value}
                            onChange={(e) => setVariantForm((f) => {
                              const opts = [...f.optionValues];
                              opts[idx] = { ...opts[idx], value: e.target.value };
                              return { ...f, optionValues: opts };
                            })}
                            placeholder="Red" className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                          <button type="button"
                            onClick={() => setVariantForm((f) => ({ ...f, optionValues: f.optionValues.filter((_, i) => i !== idx) }))}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-between py-2 border-t border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Active</p>
                      <p className="text-xs text-slate-400">Inactive variants can't be purchased</p>
                    </div>
                    <button type="button" onClick={() => setVariantForm((f) => ({ ...f, isActive: !f.isActive }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${variantForm.isActive ? "bg-indigo-600" : "bg-slate-200"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${variantForm.isActive ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                  <button onClick={() => setVariantModal({ open: false, editing: null })} disabled={variantSaving}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleSaveVariant} disabled={variantSaving}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {variantSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    {variantSaving ? "Saving…" : variantModal.editing ? "Update Variant" : "Add Variant"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AdminLayout>
    </ProtectedRoute>
  );
}

// ─── tiny layout helpers ─────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return `w-full px-4 py-2.5 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
    hasError ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-400"
  }`;
}

function Section({ icon: Icon, title, children }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
        <Icon className="w-4 h-4 text-slate-400" />
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, required, error, helper, labelRight, children }: {
  label: string;
  required?: boolean;
  error?: string;
  helper?: string;
  labelRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {labelRight}
      </div>
      {children}
      {error && <p className="flex items-center gap-1 text-red-600 text-xs mt-1.5"><AlertCircle className="w-3 h-3" />{error}</p>}
      {!error && helper && <p className="text-slate-400 text-xs mt-1.5">{helper}</p>}
    </div>
  );
}
