"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { useTranslation } from "react-i18next";
import "@/i18n";

const statsValues = ["10K+", "500+", "50+", "24/7"];
const statsKeys = ["customers", "products", "brands", "support"] as const;

const team = [
  { name: "Ameed Jabr", role: "Founder & CEO", avatar: "A" },
  { name: "Tech Team",  role: "Engineering",   avatar: "T" },
  { name: "Design Team",role: "UI/UX",         avatar: "D" },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const valuesList = t("about.valuesList", { returnObjects: true }) as { icon: string; title: string; desc: string }[];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 px-4 py-20 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-bold mb-5">{t("about.title")}</h1>
            <p className="text-xl text-indigo-100 leading-relaxed">{t("about.subtitle")}</p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="bg-white py-14 px-4 border-b border-gray-100">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsKeys.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-indigo-600">{statsValues[i]}</p>
                <p className="text-gray-600 mt-1 font-medium">{t(`about.stats.${key}`)}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-5">{t("about.mission")}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{t("about.missionText")}</p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 text-center mb-12"
            >
              {t("about.values")}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.isArray(valuesList) && valuesList.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:shadow-md transition"
                >
                  <div className="text-4xl mb-4">{v.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 text-center mb-12"
            >
              {t("about.team")}
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-7 text-center border border-gray-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{member.avatar}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">{t("about.ctaTitle")}</h2>
            <p className="text-indigo-100 mb-8 text-lg">{t("about.ctaDesc")}</p>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition"
              >
                {t("about.ctaButton")}
              </motion.button>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
