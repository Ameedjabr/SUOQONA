"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n";
import {
  ShoppingCart, Menu, X, LayoutDashboard, LogOut,
  Settings, ShoppingBag, User, ChevronDown, Globe,
} from "lucide-react";

/* ── Logo mark ─────────────────────────────────────────────────── */
function LogoMark({ size = 38 }: { size?: number }) {
  const sq = Math.round(size * 0.74);
  const off = size - sq;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="absolute" style={{ bottom: 0, right: 0, width: sq, height: sq, borderRadius: Math.round(sq * 0.28), background: "#FF5533" }} />
      <div className="absolute flex items-center justify-center" style={{ top: 0, left: 0, width: sq, height: sq, borderRadius: Math.round(sq * 0.28), background: "#0F1F3D" }}>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: Math.round(sq * 0.52), lineHeight: 1, letterSpacing: "-0.04em" }}>S</span>
      </div>
      <div className="absolute" style={{ top: 0, right: 0, width: off * 0.7, height: off * 0.7, borderRadius: "50%", background: "#FF5533" }} />
    </div>
  );
}

function Wordmark() {
  return (
    <div className="flex flex-col leading-none select-none">
      <span style={{ color: "#0F1F3D", fontWeight: 900, fontSize: 18, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
        Souq<span style={{ color: "#FF5533" }}>ona</span>
      </span>
      <span style={{ color: "#0F1F3D", opacity: 0.35, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", lineHeight: 1, marginTop: 2 }}>
        Marketplace
      </span>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group relative text-sm font-semibold text-gray-600 hover:text-[#0F1F3D] transition-colors">
      {label}
      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#FF5533] rounded-full group-hover:w-full transition-all duration-250" />
    </Link>
  );
}

/* ── Language Switcher ─────────────────────────────────────────── */
function LangSwitcher() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  function toggle() {
    const next = isAr ? "en" : "ar";
    i18n.changeLanguage(next);
    localStorage.setItem("souqona_lang", next);
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      title={isAr ? "Switch to English" : "التبديل إلى العربية"}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#FF5533] hover:bg-[#FF5533]/6 transition-all"
    >
      <Globe className="w-3.5 h-3.5 text-gray-500" />
      <span className="text-xs font-bold text-gray-600" style={{ fontFamily: isAr ? "inherit" : "inherit" }}>
        {isAr ? "EN" : "AR"}
      </span>
    </motion.button>
  );
}

/* ── Main Header ───────────────────────────────────────────────── */
export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: "/",         label: t("nav.home")    },
    { href: "/products", label: t("nav.shop")    },
    { href: "/about",    label: t("nav.about")   },
    { href: "/contact",  label: t("nav.contact") },
  ];

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <LogoMark size={38} />
            </motion.div>
            <Wordmark />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Language switcher */}
            <LangSwitcher />

            {/* Cart */}
            <Link href="/cart">
              <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[#FF5533] px-3 py-2 rounded-xl hover:bg-[#FF5533]/8 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">{t("cart")}</span>
              </motion.button>
            </Link>

            {isAuthenticated ? (
              /* ── User dropdown ── */
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border transition-all"
                  style={{
                    background: dropdownOpen ? "#FFF1F0" : "#F9F9F9",
                    borderColor: dropdownOpen ? "#FF5533" : "#E5E7EB",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ background: "#FF5533" }}
                  >
                    {initial}
                  </div>
                  <span className="text-xs font-bold text-gray-700 max-w-[80px] truncate">
                    {user?.fullName?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute end-0 top-full mt-2.5 w-60 bg-white rounded-2xl shadow-2xl overflow-hidden"
                      style={{ border: "1px solid rgba(0,0,0,0.07)" }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-4" style={{ background: "#0F1F3D" }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                            style={{ background: "#FF5533" }}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                            <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="p-2">
                        {user?.role === "ADMIN" ? (
                          <Link href="/admin" onClick={() => setDropdownOpen(false)}>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-[#0F1F3D] hover:text-white transition-all group">
                              <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                                <LayoutDashboard className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                              </div>
                              {t("auth.adminPanel")}
                            </div>
                          </Link>
                        ) : (
                          <>
                            <Link href="/account" onClick={() => setDropdownOpen(false)}>
                              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#0F1F3D] transition-all group">
                                <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#FF5533]/10 flex items-center justify-center transition-colors">
                                  <User className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF5533]" />
                                </div>
                                {t("auth.myAccount")}
                              </div>
                            </Link>
                            <Link href="/account/orders" onClick={() => setDropdownOpen(false)}>
                              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#0F1F3D] transition-all group">
                                <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#FF5533]/10 flex items-center justify-center transition-colors">
                                  <ShoppingBag className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF5533]" />
                                </div>
                                {t("auth.myOrders")}
                              </div>
                            </Link>
                            <Link href="/account/settings" onClick={() => setDropdownOpen(false)}>
                              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#0F1F3D] transition-all group">
                                <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#FF5533]/10 flex items-center justify-center transition-colors">
                                  <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF5533]" />
                                </div>
                                {t("auth.settings")}
                              </div>
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Sign out */}
                      <div className="p-2 pt-0" style={{ borderTop: "1px solid #F3F4F6" }}>
                        <button
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                            <LogOut className="w-3.5 h-3.5 text-red-400" />
                          </div>
                          {t("auth.signOut")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-sm font-semibold text-gray-600 hover:text-[#0F1F3D] px-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    {t("auth.login")}
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-sm font-bold text-white px-4 py-2 rounded-xl transition-all hover:brightness-110"
                    style={{ background: "#FF5533" }}
                  >
                    {t("auth.signUp")}
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="px-2 py-4 space-y-1">
                {navLinks.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="block px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#FF5533] rounded-xl hover:bg-[#FF5533]/6 transition-all"
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                ))}
                <div className="border-t border-gray-100 pt-3 mt-3 flex flex-col gap-1.5 px-2">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black" style={{ background: "#FF5533" }}>
                          {initial}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F1F3D]">{user?.fullName}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      <Link href="/account" onClick={() => setMobileOpen(false)}>
                        <button className="w-full text-left text-sm font-semibold text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:text-[#0F1F3D] transition-all flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" /> {t("auth.myAccount")}
                        </button>
                      </Link>
                      <Link href="/account/orders" onClick={() => setMobileOpen(false)}>
                        <button className="w-full text-left text-sm font-semibold text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:text-[#0F1F3D] transition-all flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-gray-400" /> {t("auth.myOrders")}
                        </button>
                      </Link>
                      <Link href="/account/settings" onClick={() => setMobileOpen(false)}>
                        <button className="w-full text-left text-sm font-semibold text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:text-[#0F1F3D] transition-all flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-400" /> {t("auth.settings")}
                        </button>
                      </Link>
                      {user?.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setMobileOpen(false)}>
                          <button className="w-full text-left text-sm font-semibold text-[#0F1F3D] px-4 py-2.5 rounded-xl border border-[#0F1F3D]/20 hover:bg-[#0F1F3D] hover:text-white transition-all flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" /> {t("auth.adminPanel")}
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="w-full text-left text-sm font-semibold text-red-500 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-all flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> {t("auth.signOut")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <button className="w-full text-sm font-semibold text-[#0F1F3D] px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                          {t("auth.login")}
                        </button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        <button className="w-full text-sm font-bold text-white px-4 py-2.5 rounded-xl hover:brightness-110 transition-all" style={{ background: "#FF5533" }}>
                          {t("auth.signUp")}
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
