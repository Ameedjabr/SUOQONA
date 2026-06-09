"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/i18n";

function LogoMark() {
  const size = 36;
  const sq = Math.round(size * 0.74);
  const off = size - sq;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="absolute" style={{ bottom: 0, right: 0, width: sq, height: sq, borderRadius: Math.round(sq * 0.28), background: "#FF5533" }} />
      <div className="absolute flex items-center justify-center" style={{ top: 0, left: 0, width: sq, height: sq, borderRadius: Math.round(sq * 0.28), background: "#fff" }}>
        <span style={{ color: "#0F1F3D", fontWeight: 900, fontSize: Math.round(sq * 0.52), lineHeight: 1 }}>S</span>
      </div>
      <div className="absolute" style={{ top: 0, right: 0, width: off * 0.7, height: off * 0.7, borderRadius: "50%", background: "#FF5533" }} />
    </div>
  );
}

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{ background: "#0F1F3D" }} className="text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <LogoMark />
              <div className="flex flex-col leading-none">
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 17, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  Souq<span style={{ color: "#FF5533" }}>ona</span>
                </span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 2 }}>
                  Marketplace
                </span>
              </div>
            </div>
            <p className="text-sm text-white/45 leading-relaxed">{t("footer.tagline")}</p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-black text-white text-sm uppercase tracking-wider mb-4">{t("footer.shop")}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{t("footer.allProducts")}</Link></li>
              <li><Link href="/categories" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{t("footer.categories")}</Link></li>
              <li><Link href="/deals" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{t("footer.specialDeals")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-black text-white text-sm uppercase tracking-wider mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{t("footer.aboutUs")}</Link></li>
              <li><Link href="/blog" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{t("footer.blog")}</Link></li>
              <li><Link href="/contact" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{t("footer.contact")}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-black text-white text-sm uppercase tracking-wider mb-4">{t("footer.support")}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/help" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{t("footer.helpCenter")}</Link></li>
              <li><Link href="/shipping" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{t("footer.shippingInfo")}</Link></li>
              <li><Link href="/privacy" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{t("footer.privacyPolicy")}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "rgba(255,255,255,0.35)" }}>{t("footer.copyright")}</p>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.35)" }}>Twitter</Link>
            <Link href="#" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.35)" }}>Facebook</Link>
            <Link href="#" className="transition-colors duration-150 hover:text-white" style={{ color: "rgba(255,255,255,0.35)" }}>Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
