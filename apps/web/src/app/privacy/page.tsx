"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Shield } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `When you create an account or place an order, we collect personal information such as your name, email address, phone number, and delivery address. We also collect usage data such as pages visited, search queries, and device information to improve your shopping experience.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to process and deliver your orders, send order confirmations and shipping updates, personalise your shopping experience, improve our platform and services, and contact you about promotions or updates (only if you opt in).`,
  },
  {
    title: "3. Sharing Your Information",
    body: `We do not sell your personal data. We share your information only with trusted service providers who help us operate our platform — including payment processors and delivery partners — who are contractually required to protect your data.`,
  },
  {
    title: "4. Data Security",
    body: `We use industry-standard SSL encryption to protect your data in transit. Payment card details are never stored on our servers — all transactions are processed by certified payment providers. We regularly review and update our security practices.`,
  },
  {
    title: "5. Cookies",
    body: `We use cookies to maintain your session, remember your preferences, and analyse site traffic. You can disable cookies in your browser settings, though this may affect some functionality of the site.`,
  },
  {
    title: "6. Your Rights",
    body: `You have the right to access, correct, or delete your personal data at any time. You may also request a copy of the data we hold about you. To exercise these rights, contact us at support@souqona.com.`,
  },
  {
    title: "7. Data Retention",
    body: `We retain your data for as long as your account is active or as needed to provide our services. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it for legal or accounting purposes.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our website. Your continued use of Souqona after changes take effect constitutes your acceptance of the updated policy.`,
  },
  {
    title: "9. Contact Us",
    body: `If you have any questions about this Privacy Policy or how we handle your data, please contact our team at support@souqona.com or write to us at: Souqona, Nablus, Palestine.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100 px-6 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "#EEF2FF", color: "#4F46E5" }}>
              <Shield className="w-7 h-7" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FF5533" }}>Legal</p>
            <h1 className="text-5xl font-black text-[#0F1F3D] mb-3">Privacy Policy</h1>
            <p className="text-gray-400 text-sm">Last updated: May 11, 2025</p>
          </motion.div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-8"
          >
            <p className="text-gray-600 text-sm leading-relaxed border-l-4 pl-4" style={{ borderColor: "#FF5533" }}>
              At Souqona, we are committed to protecting your privacy. This policy explains what data we collect, how we use it, and the choices you have.
            </p>

            {SECTIONS.map(({ title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                viewport={{ once: true }}
              >
                <h2 className="text-base font-black text-[#0F1F3D] mb-2">{title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
