"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/providers/AuthProvider";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";
import { motion } from "framer-motion";
import {
  User, ShoppingBag, MapPin, Settings, LogOut,
  ChevronRight, Shield, Package, Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/i18n";

function SidebarItem({
  href, label, desc, Icon, active = false,
}: { href: string; label: string; desc: string; Icon: React.ElementType; active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
        active ? "text-white" : "text-white/60 hover:text-white hover:bg-white/8"
      }`}
      style={active ? { background: "#FF5533" } : {}}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          active ? "bg-white/20" : "bg-white/10 group-hover:bg-white/15"
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-none mb-0.5">{label}</p>
          <p className={`text-[11px] leading-none ${active ? "text-white/70" : "text-white/35"}`}>{desc}</p>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity ${active ? "opacity-70" : "opacity-0 group-hover:opacity-40"}`} />
      </div>
    </Link>
  );
}

export default function AccountProfile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  useProtectedRoute("CUSTOMER");

  const NAV = [
    { href: "/account",           labelKey: "account.nav.profile",   Icon: User,        descKey: "account.nav.profileDesc"   },
    { href: "/account/orders",    labelKey: "account.nav.orders",    Icon: ShoppingBag, descKey: "account.nav.ordersDesc"    },
    { href: "/account/addresses", labelKey: "account.nav.addresses", Icon: MapPin,      descKey: "account.nav.addressesDesc" },
    { href: "/account/settings",  labelKey: "account.nav.settings",  Icon: Settings,    descKey: "account.nav.settingsDesc"  },
  ];

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero banner */}
        <div className="border-b border-gray-100" style={{ background: "#0F1F3D" }}>
          <div className="max-w-5xl mx-auto px-6 py-10 flex items-center gap-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
              style={{ background: "#FF5533" }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                {t("account.title")}
              </p>
              <h1 className="text-2xl font-black text-white leading-none">
                {t("account.welcomeBack", { name: user?.fullName?.split(" ")[0] })}
              </h1>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.email}</p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8 flex gap-6 items-start">

          {/* Sidebar */}
          <aside className="w-60 flex-shrink-0 hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{ background: "#0F1F3D", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <nav className="p-2 space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest px-4 pt-3 pb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {t("common.navigation")}
                </p>
                {NAV.map(({ href, labelKey, Icon, descKey }) => (
                  <SidebarItem
                    key={href}
                    href={href}
                    label={t(labelKey)}
                    desc={t(descKey)}
                    Icon={Icon}
                    active={href === "/account"}
                  />
                ))}
              </nav>

              <div className="mx-4 my-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

              <div className="p-2 pb-3">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-red-500/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold leading-none mb-0.5">{t("auth.signOut")}</p>
                    <p className="text-[11px] leading-none opacity-50">{t("account.signOutDesc")}</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-black text-[#0F1F3D]">{t("account.profileInfo")}</h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A" }}>{t("common.active")}</span>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { labelKey: "account.fields.fullName",    value: user?.fullName,  Icon: User     },
                  { labelKey: "account.fields.email",       value: user?.email,     Icon: Shield   },
                  { labelKey: "account.fields.accountType", value: user?.role === "CUSTOMER" ? t("account.fields.customer") : user?.role, Icon: Package },
                  { labelKey: "account.fields.memberSince", value: memberSince,     Icon: Clock    },
                ].map(({ labelKey, value, Icon }) => (
                  <div key={labelKey} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "#F7F4EF" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#0F1F3D" }}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{t(labelKey)}</p>
                      <p className="text-sm font-bold text-[#0F1F3D]">{value || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-black text-[#0F1F3D]">{t("account.quickActions")}</h2>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/account/orders">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-[#FF5533] hover:bg-[#FF5533]/4 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: "#FFF1F0" }}>
                      <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: "#FF5533" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F1F3D]">{t("account.nav.orders")}</p>
                      <p className="text-xs text-gray-400">{t("account.viewHistory")}</p>
                    </div>
                  </div>
                </Link>
                <Link href="/products">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-[#0F1F3D] hover:bg-[#0F1F3D]/4 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EEF2FF" }}>
                      <Package className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: "#4F46E5" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F1F3D]">{t("account.browse")}</p>
                      <p className="text-xs text-gray-400">{t("account.browseDesc")}</p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer group w-full text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 group-hover:text-red-600">{t("auth.signOut")}</p>
                    <p className="text-xs text-gray-400">{t("account.logOutSafely")}</p>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Mobile nav */}
            <div className="md:hidden bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {NAV.map(({ href, labelKey, Icon }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 last:border-0 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                    <Icon className="w-4 h-4 text-gray-400" />
                    {t(labelKey)}
                    <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
