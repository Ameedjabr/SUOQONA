"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ArrowLeft, Store, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData]   = useState({ email: "", password: "" });
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [error, setError]         = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = t("login.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = t("login.errors.emailInvalid");
    if (!formData.password) newErrors.password = t("login.errors.passwordRequired");
    else if (formData.password.length < 6)
      newErrors.password = t("login.errors.passwordLength");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setError(null);
      await login(formData.email, formData.password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.errors.loginFailed"));
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #0F1F3D 0%, #162A50 60%, #1a1a2e 100%)" }}
    >
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 px-16 py-14">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FF5533" }}>
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">Souqona</span>
        </div>

        <div>
          <h1 className="text-white font-black leading-tight mb-4" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
            {t("login.heroTitle")}
          </h1>
          <p className="text-white/50 text-base leading-relaxed">{t("login.heroDesc")}</p>
        </div>

        <p className="text-white/20 text-sm">&copy; {new Date().getFullYear()} Souqona. {t("common.copyright")}</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.backToHome")}
          </Link>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FF5533" }}>
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black text-lg">Souqona</span>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-[#0F1F3D]">{t("login.title")}</h2>
              <p className="text-gray-500 text-sm mt-1">{t("login.subtitle")}</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#0F1F3D] mb-1.5">{t("login.email")}</label>
                <div className="relative">
                  <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => { setFormData((p) => ({ ...p, email: e.target.value })); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
                    placeholder="admin@example.com"
                    className={`w-full ps-10 pe-4 py-3 rounded-xl border text-sm text-[#0F1F3D] placeholder-gray-400 outline-none transition
                      ${errors.email ? "border-red-400 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-[#FF5533] focus:ring-2 focus:ring-[#FF5533]/15 bg-gray-50"}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#0F1F3D] mb-1.5">{t("login.password")}</label>
                <div className="relative">
                  <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => { setFormData((p) => ({ ...p, password: e.target.value })); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
                    placeholder="••••••••"
                    className={`w-full ps-10 pe-11 py-3 rounded-xl border text-sm text-[#0F1F3D] placeholder-gray-400 outline-none transition
                      ${errors.password ? "border-red-400 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-[#FF5533] focus:ring-2 focus:ring-[#FF5533]/15 bg-gray-50"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF5533] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: "#FF5533" }}>
                  {t("login.forgotPassword")}
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition disabled:opacity-60"
                style={{ background: "#FF5533" }}
              >
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <>{t("login.signIn")} <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
              {t("login.noAccount")}{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: "#FF5533" }}>
                {t("login.signUp")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
