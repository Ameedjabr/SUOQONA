"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { ChevronDown, ChevronUp, ShoppingBag, Truck, RotateCcw, CreditCard, User, MessageCircle } from "lucide-react";
import { useState } from "react";

const SECTIONS = [
  {
    Icon: ShoppingBag, title: "Orders & Purchasing", color: "#FF5533", bg: "#FFF1F0",
    faqs: [
      { q: "How do I place an order?", a: "Browse our catalogue, add items to your cart, and proceed to checkout. You'll need an account to complete your purchase." },
      { q: "Can I modify my order after placing it?", a: "Orders can be modified within 1 hour of placement. Contact our support team immediately at support@souqona.com." },
      { q: "How do I track my order?", a: "Log in to your account, go to My Orders, and click on any order to see its current status and tracking details." },
    ],
  },
  {
    Icon: Truck, title: "Shipping & Delivery", color: "#0284C7", bg: "#F0F9FF",
    faqs: [
      { q: "How long does delivery take?", a: "Standard delivery takes 3–5 business days. Express delivery (1–2 days) is available for select areas." },
      { q: "Do you offer free shipping?", a: "Yes! Orders over ₪200 qualify for free standard shipping across all supported regions." },
      { q: "Which areas do you deliver to?", a: "We currently deliver across Palestine and Israel. More regions coming soon." },
    ],
  },
  {
    Icon: RotateCcw, title: "Returns & Refunds", color: "#16A34A", bg: "#F0FDF4",
    faqs: [
      { q: "What is your return policy?", a: "You can return most items within 14 days of delivery in their original condition and packaging." },
      { q: "How do I start a return?", a: "Go to My Orders, select the item you want to return, and follow the return instructions. Our team will arrange a pickup." },
      { q: "When will I receive my refund?", a: "Refunds are processed within 5–7 business days after we receive and inspect the returned item." },
    ],
  },
  {
    Icon: CreditCard, title: "Payments", color: "#7C3AED", bg: "#F5F3FF",
    faqs: [
      { q: "What payment methods do you accept?", a: "We accept credit/debit cards (Visa, Mastercard), bank transfers, and cash on delivery for eligible orders." },
      { q: "Is my payment information secure?", a: "Yes. All transactions are encrypted with bank-grade SSL security. We never store your full card details." },
      { q: "Can I pay in instalments?", a: "Instalment options are available for orders over ₪500. Look for the 'Pay Later' option at checkout." },
    ],
  },
  {
    Icon: User, title: "My Account", color: "#D97706", bg: "#FFF7ED",
    faqs: [
      { q: "How do I create an account?", a: "Click 'Sign Up' in the top navigation, fill in your name, email, and password, and you're good to go." },
      { q: "I forgot my password — what do I do?", a: "Click 'Forgot password?' on the login page and we'll send a reset link to your email address." },
      { q: "How do I update my profile?", a: "Log in, go to My Account, and you can update your name, email, and address from there." },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="text-sm font-semibold text-[#0F1F3D]">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#FF5533] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-500 leading-relaxed pb-4"
        >
          {a}
        </motion.p>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100 px-6 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FF5533" }}>Support</p>
            <h1 className="text-5xl font-black text-[#0F1F3D] mb-3">Help Center</h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Find answers to common questions, or reach out and we'll help you right away.
            </p>
            <Link href="/contact">
              <button className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl hover:brightness-110 transition"
                style={{ background: "#FF5533" }}>
                <MessageCircle className="w-4 h-4" /> Contact Support
              </button>
            </Link>
          </motion.div>
        </div>

        {/* FAQ sections */}
        <div className="max-w-3xl mx-auto px-6 py-14 space-y-6">
          {SECTIONS.map(({ Icon, title, color, bg, faqs }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-base font-black text-[#0F1F3D]">{title}</h2>
              </div>
              <div className="px-6">
                {faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
