"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { addressApi, Address } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Plus, Trash2, Star, ArrowLeft, X, Loader2,
} from "lucide-react";

const EMPTY: Partial<Address> = {
  label: "", fullName: "", phonePrimary: "", country: "Palestine",
  city: "", area: "", addressLine1: "", addressLine2: "", isDefault: false,
};

function Field({
  label, value, onChange, placeholder, required = false, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-[#FF5533] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5533] focus:ring-2 focus:ring-[#FF5533]/15 transition"
      />
    </div>
  );
}

export default function AddressesPage() {
  const { accessToken } = useAuth();
  useProtectedRoute("CUSTOMER");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<Partial<Address>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const load = () => {
    if (!accessToken) return;
    addressApi.getMyAddresses(accessToken)
      .then((r) => setAddresses(Array.isArray(r) ? r : (r?.addresses ?? [])))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [accessToken]);

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    try {
      await addressApi.create(accessToken, form);
      setShowForm(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    setDeletingId(id);
    try {
      await addressApi.delete(accessToken, id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
    } finally {
      setDeletingId(null);
    }
  };

  const set = (key: keyof Address) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-gray-100" style={{ background: "#0F1F3D" }}>
          <div className="max-w-3xl mx-auto px-6 py-10">
            <Link href="/account" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-5 hover:opacity-80 transition" style={{ color: "rgba(255,255,255,0.4)" }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FF5533" }}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Account</p>
                <h1 className="text-2xl font-black text-white">My Addresses</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">

          {/* Add button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed text-sm font-bold transition-all"
              style={{ borderColor: "#FF5533", color: "#FF5533" }}
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          )}

          {/* Add form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between" style={{ background: "#0F1F3D" }}>
                  <span className="text-sm font-black text-white">New Address</span>
                  <button onClick={() => { setShowForm(false); setForm(EMPTY); setError(null); }} className="text-white/40 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Label (e.g. Home)" value={form.label || ""} onChange={set("label")} placeholder="Home" />
                    <Field label="Full Name" value={form.fullName || ""} onChange={set("fullName")} placeholder="Your name" required />
                    <Field label="Phone" value={form.phonePrimary || ""} onChange={set("phonePrimary")} placeholder="+972 5X XXX XXXX" required type="tel" />
                    <Field label="Country" value={form.country || ""} onChange={set("country")} placeholder="Palestine" required />
                    <Field label="City" value={form.city || ""} onChange={set("city")} placeholder="Nablus" required />
                    <Field label="Area / District" value={form.area || ""} onChange={set("area")} placeholder="Old City" required />
                  </div>
                  <Field label="Address Line 1" value={form.addressLine1 || ""} onChange={set("addressLine1")} placeholder="Street name and number" required />
                  <Field label="Address Line 2 (optional)" value={form.addressLine2 || ""} onChange={set("addressLine2")} placeholder="Apartment, floor, etc." />
                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={!!form.isDefault}
                      onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#FF5533]"
                    />
                    <label htmlFor="isDefault" className="text-sm font-semibold text-gray-600 cursor-pointer">Set as default address</label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl hover:brightness-110 transition disabled:opacity-60"
                      style={{ background: "#FF5533" }}
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setForm(EMPTY); setError(null); }}
                      className="px-6 py-2.5 text-sm font-bold text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Address list */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-28 animate-pulse" />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <MapPin className="w-12 h-12 opacity-20 mb-4" />
              <p className="text-lg font-bold text-gray-500">No addresses saved</p>
              <p className="text-sm mt-1">Add an address to speed up checkout</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr, i) => (
                <motion.div
                  key={addr.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border shadow-sm px-6 py-5 flex items-start gap-4"
                  style={{ borderColor: addr.isDefault ? "#FF5533" : "#F3F4F6" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: addr.isDefault ? "#FFF1F0" : "#F7F4EF" }}>
                    <MapPin className="w-5 h-5" style={{ color: addr.isDefault ? "#FF5533" : "#9CA3AF" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {addr.label && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#F7F4EF", color: "#0F1F3D" }}>{addr.label}</span>}
                      {addr.isDefault && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "#FFF1F0", color: "#FF5533" }}>
                          <Star className="w-3 h-3" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#0F1F3D]">{addr.fullName}</p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                      {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}<br />
                      {addr.area}, {addr.city}, {addr.country}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{addr.phonePrimary}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                  >
                    {deletingId === addr.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
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
