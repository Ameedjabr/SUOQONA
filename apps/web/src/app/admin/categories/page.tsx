"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Layers, X, Save, Check, AlertCircle, ChevronRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { categoryApi, Category } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";

// ── helpers ──────────────────────────────────────────────────────────────────

function slugify(t: string) {
  return t.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "").replace(/--+/g, "-").replace(/^-|-$/g, "");
}

function flattenCategories(cats: Category[], depth = 0): { cat: Category; depth: number }[] {
  const out: { cat: Category; depth: number }[] = [];
  for (const c of cats) {
    out.push({ cat: c, depth });
    if (c.children?.length) out.push(...flattenCategories(c.children, depth + 1));
  }
  return out;
}

function countDescendants(cat: Category): number {
  if (!cat.children?.length) return 0;
  return cat.children.reduce((s, c) => s + 1 + countDescendants(c), 0);
}

// ── main component ────────────────────────────────────────────────────────────

interface CatForm { name: string; slug: string; parentId: string; slugAuto: boolean; }

const BLANK: CatForm = { name: "", slug: "", parentId: "", slugAuto: true };

export default function AdminCategories() {
  const { accessToken } = useAuth();
  const [categories, setCategories]   = useState<Category[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [modal, setModal]             = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [form, setForm]               = useState<CatForm>(BLANK);
  const [formError, setFormError]     = useState("");
  const [isSaving, setIsSaving]       = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [toast, setToast]             = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      showToast("error", "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  // ── open modal ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(BLANK);
    setFormError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId || "", slugAuto: false });
    setFormError("");
    setModal({ open: true, editing: cat });
  };

  // ── save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!accessToken) return;
    const name = form.name.trim();
    if (!name) { setFormError("Name is required"); return; }
    const slug = form.slug.trim() || slugify(name);
    if (!/^[a-z0-9-]+$/.test(slug)) { setFormError("Slug: lowercase letters, numbers and hyphens only"); return; }

    setIsSaving(true);
    setFormError("");
    try {
      const payload = { name, slug, parentId: form.parentId || null };
      if (modal.editing) {
        const updated = await categoryApi.update(accessToken, modal.editing.id, payload);
        showToast("success", "Category updated");
        setModal({ open: false, editing: null });
        await loadCategories();
        void updated;
      } else {
        await categoryApi.create(accessToken, payload);
        showToast("success", "Category created");
        setModal({ open: false, editing: null });
        await loadCategories();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // ── delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (cat: Category) => {
    if (!accessToken) return;
    setDeletingId(cat.id);
    try {
      await categoryApi.delete(accessToken, cat.id);
      showToast("success", `"${cat.name}" deleted`);
      setConfirmDelete(null);
      await loadCategories();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────

  const flat = flattenCategories(categories);
  const allFlat = flattenCategories(categories); // for parent picker in modal

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="categories">
        <div className="p-5 space-y-4 max-w-5xl mx-auto">

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
                  toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                }`}>
                {toast.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
              <p className="text-slate-500 text-base mt-1">Organise your product catalogue into categories</p>
            </div>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> New Category
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: flat.length },
              { label: "Top-level", value: categories.length },
              { label: "Nested", value: flat.length - categories.length },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-slate-700 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 bg-slate-100 rounded w-32" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-slate-100 rounded-lg w-14" />
                      <div className="h-8 bg-slate-100 rounded-lg w-14" />
                    </div>
                  </div>
                ))}
              </div>
            ) : flat.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Layers className="w-12 h-12 opacity-30 mb-4" />
                <p className="text-base font-medium text-slate-600">No categories yet</p>
                <p className="text-sm mt-1">Create your first category to organise products</p>
                <button onClick={openCreate}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" /> New Category
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {flat.map(({ cat, depth }, i) => {
                  const descendants = countDescendants(cat);
                  return (
                    <motion.div key={cat.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                      style={{ paddingLeft: depth * 20 + 20 }}
                    >
                      {/* Indent indicator */}
                      {depth > 0 && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 -ml-1" />
                      )}

                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        depth === 0 ? "bg-indigo-100" : depth === 1 ? "bg-violet-100" : "bg-slate-100"
                      }`}>
                        <Layers className={`w-4 h-4 ${depth === 0 ? "text-indigo-500" : depth === 1 ? "text-violet-500" : "text-slate-400"}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{cat.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-slate-400">/{cat.slug}</span>
                          {descendants > 0 && (
                            <span className="text-xs text-slate-400">· {descendants} sub-categor{descendants === 1 ? "y" : "ies"}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => openEdit(cat)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => setConfirmDelete(cat)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Create / Edit Modal ────────────────────────────────────────── */}
        <AnimatePresence>
          {modal.open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !isSaving && setModal({ open: false, editing: null })}>
              <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}>

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">
                    {modal.editing ? "Edit Category" : "New Category"}
                  </h2>
                  <button onClick={() => setModal({ open: false, editing: null })} disabled={isSaving}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={form.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm((f) => ({ ...f, name, slug: f.slugAuto ? slugify(name) : f.slug }));
                        setFormError("");
                      }}
                      placeholder="e.g. Electronics"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                      autoFocus
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-slate-700">Slug</label>
                      <button type="button"
                        onClick={() => setForm((f) => ({ ...f, slugAuto: !f.slugAuto, slug: !f.slugAuto ? slugify(f.name) : f.slug }))}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                          form.slugAuto ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}>
                        Auto {form.slugAuto ? "(on)" : "(off)"}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/</span>
                      <input type="text" value={form.slug}
                        onChange={(e) => { setForm((f) => ({ ...f, slug: e.target.value, slugAuto: false })); setFormError(""); }}
                        placeholder="electronics"
                        className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
                    </div>
                  </div>

                  {/* Parent Category */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Parent Category</label>
                    <select value={form.parentId}
                      onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white">
                      <option value="">— None (top-level) —</option>
                      {allFlat
                        .filter(({ cat }) => !modal.editing || cat.id !== modal.editing.id)
                        .map(({ cat, depth }) => (
                          <option key={cat.id} value={cat.id}>
                            {"  ".repeat(depth)}{depth > 0 ? "└ " : ""}{cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Error */}
                  {formError && (
                    <p className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
                    </p>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                  <button onClick={() => setModal({ open: false, editing: null })} disabled={isSaving}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSaving
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Save className="w-4 h-4" />}
                    {isSaving ? "Saving…" : modal.editing ? "Update" : "Create"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Delete Confirm Modal ───────────────────────────────────────── */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !deletingId && setConfirmDelete(null)}>
              <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 text-center">Delete "{confirmDelete.name}"?</h2>
                {countDescendants(confirmDelete) > 0 && (
                  <p className="text-amber-700 text-xs text-center bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                    This will also delete {countDescendants(confirmDelete)} sub-categor{countDescendants(confirmDelete) === 1 ? "y" : "ies"}.
                  </p>
                )}
                <p className="text-slate-500 text-sm text-center mt-3 mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDelete(null)} disabled={!!deletingId}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(confirmDelete)} disabled={!!deletingId}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {deletingId
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                    Delete
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
