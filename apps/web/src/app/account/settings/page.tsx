"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { userApi, authApi } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, ArrowLeft, Loader2, CheckCircle,
  AtSign, Mail, LogOut, Lock, Eye, EyeOff, ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const { user, accessToken, logout, updateUser } = useAuth();
  useProtectedRoute("CUSTOMER");

  const [username, setUsername]         = useState(user?.fullName || "");
  const [email, setEmail]               = useState(user?.email || "");
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingEmail, setEditingEmail]       = useState(false);
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [pwError, setPwError]           = useState(false);

  const isEditing = editingUsername || editingEmail;

  const cancelField = (field: "username" | "email") => {
    if (field === "username") { setUsername(user?.fullName || ""); setEditingUsername(false); }
    if (field === "email")    { setEmail(user?.email || "");       setEditingEmail(false); }
    setError(null); setPwError(false); setPassword("");
  };

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!accessToken || !user?.email) return;

    setError(null);
    setPwError(false);
    setSaved(false);

    if (!password) {
      setError("Please enter your current password to confirm changes.");
      setPwError(true);
      return;
    }

    setSaving(true);
    try {
      // Verify password by attempting login with current email
      await authApi.login(user.email, password);
      // Password correct — now update profile
      const updated = await userApi.updateProfile(accessToken, { fullName: username, email });
      updateUser({ fullName: updated.fullName, email: updated.email });
      setPassword("");
      setEditingUsername(false);
      setEditingEmail(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch {
      setError("Incorrect password. Please try again.");
      setPwError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-gray-100" style={{ background: "#0F1F3D" }}>
          <div className="max-w-2xl mx-auto px-6 py-10">
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-5 hover:opacity-80 transition"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FF5533" }}>
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Account</p>
                <h1 className="text-2xl font-black text-white">Settings</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">

          {/* Profile section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-black text-[#0F1F3D]">Profile Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">Update your username or email address</p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">

              {/* Feedback messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl"
                  >
                    <Lock className="w-4 h-4 flex-shrink-0" /> {error}
                  </motion.div>
                )}
                {saved && (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-100 px-4 py-3 rounded-xl"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> Changes saved successfully
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!editingUsername}
                      placeholder="Your username"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border transition ${
                        editingUsername
                          ? "border-[#FF5533] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5533]/15"
                          : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {editingUsername ? (
                    <button
                      type="button"
                      onClick={() => cancelField("username")}
                      className="px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition flex-shrink-0"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingUsername(true)}
                      className="px-4 py-2.5 text-xs font-bold rounded-xl text-white hover:brightness-110 transition flex-shrink-0"
                      style={{ background: "#0F1F3D" }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!editingEmail}
                      placeholder="your@email.com"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border transition ${
                        editingEmail
                          ? "border-[#FF5533] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF5533]/15"
                          : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {editingEmail ? (
                    <button
                      type="button"
                      onClick={() => cancelField("email")}
                      className="px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition flex-shrink-0"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingEmail(true)}
                      className="px-4 py-2.5 text-xs font-bold rounded-xl text-white hover:brightness-110 transition flex-shrink-0"
                      style={{ background: "#0F1F3D" }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Password confirmation — only shown when editing */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    key="pw-confirm"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-2xl p-4 space-y-3"
                    style={{ background: "#F7F4EF", border: "1px solid #E8E4DE" }}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#FF5533" }} />
                      <p className="text-xs font-bold text-gray-600">
                        Confirm with your current password to save changes
                      </p>
                    </div>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${pwError ? "text-red-400" : "text-gray-400"}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPwError(false); setError(null); }}
                        placeholder="Enter your current password"
                        className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                          pwError
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400/15"
                            : "border-gray-200 focus:border-[#FF5533] focus:ring-[#FF5533]/15"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl hover:brightness-110 transition disabled:opacity-60"
                        style={{ background: "#FF5533" }}
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {saving ? "Verifying…" : "Save Changes"}
                      </button>
                      {saved && (
                        <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" /> Saved
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Account info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-black text-[#0F1F3D]">Account Information</h2>
              <p className="text-xs text-gray-400 mt-0.5">Read-only details about your account</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Account ID",     value: user?.id ? `…${user.id.slice(-8)}` : "—" },
                { label: "Member Since",   value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                { label: "Account Status", value: user?.isActive ? "Active" : "Inactive" },
                { label: "Role",           value: user?.role || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl px-4 py-3" style={{ background: "#F7F4EF" }}>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-[#0F1F3D]">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sign out */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-red-50">
              <h2 className="text-sm font-black text-red-600">Sign Out</h2>
              <p className="text-xs text-gray-400 mt-0.5">Log out of your account on this device</p>
            </div>
            <div className="p-6">
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-red-500 rounded-xl border border-red-200 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
