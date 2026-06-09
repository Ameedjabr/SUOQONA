"use client";

import "@/i18n";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  // On first mount: restore the language saved in localStorage.
  // This runs only on the client, after hydration is complete, so
  // there is no server/client HTML mismatch.
  useEffect(() => {
    const stored = localStorage.getItem("souqona_lang");
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  }, []);

  // Keep <html dir> and <html lang> in sync whenever language changes.
  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return <>{children}</>;
}
