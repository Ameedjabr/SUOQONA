"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, ArrowLeft, Store, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = t("register.errors.fullNameRequired");
    if (!formData.email) newErrors.email = t("register.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t("register.errors.emailInvalid");
    if (!formData.password) newErrors.password = t("register.errors.passwordRequired");
    else if (formData.password.length < 6) newErrors.password = t("register.errors.passwordLength");
    if (!formData.confirmPassword) newErrors.confirmPassword = t("register.errors.confirmRequired");
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t("register.errors.passwordsMismatch");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setError(null);
      await register(formData.email, formData.password, formData.fullName);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register.errors.failed"));
    }
  };

  const field = (
    key: keyof typeof formData,
    label: string,
    type: string,
    placeholder: string,
    icon: React.ReactNode,
    toggle?: React.ReactNode,
  ) => (
    <div>
      <label className="block text-sm font-semibold text-[#0F1F3D] mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          value={formData[key]}
          onChange={(e) => {
            setFormData((p) => ({ ...p, [key]: e.target.value }));
            if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
          }}
          placeholder={placeholder}
          className={`w-full ps-10 ${toggle ? "pe-11" : "pe-4"} py-3 rounded-xl border text-sm text-[#0F1F3D] placeholder-gray-400 outline-none transition
            ${errors[key]
              ? "border-red-400 focus:border-red-500 bg-red-50"
              : "border-gray-200 focus:border-[#FF5533] focus:ring-2 focus:ring-[#FF5533]/15 bg-gray-50"
            }`}
        />
        {toggle}
      </div>
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

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
            {t("register.heroTitle")}
          </h1>
          <p className="text-white/50 text-base leading-relaxed">{t("register.heroDesc")}</p>
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
              <h2 className="text-2xl font-black text-[#0F1F3D]">{t("register.title")}</h2>
              <p className="text-gray-500 text-sm mt-1">{t("register.subtitle")}</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {field("fullName", t("register.fullName"), "text", "John Doe",
                <User className="w-4 h-4" />
              )}
              {field("email", t("register.email"), "email", "you@example.com",
                <Mail className="w-4 h-4" />
              )}
              {field(
                "password", t("register.password"),
                showPassword ? "text" : "password",
                "••••••••",
                <Lock className="w-4 h-4" />,
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF5533] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
              {field(
                "confirmPassword", t("register.confirmPassword"),
                showConfirm ? "text" : "password",
                "••••••••",
                <Lock className="w-4 h-4" />,
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF5533] transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}

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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <>{t("register.submit")} <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
              {t("register.haveAccount")}{" "}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: "#FF5533" }}>
                {t("register.signIn")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
