"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Truck, Clock, MapPin, Package, ShieldCheck, AlertCircle } from "lucide-react";

const ZONES = [
  { zone: "Nablus & surroundings", time: "1–2 business days", fee: "Free over ₪200 / ₪15 below" },
  { zone: "West Bank (major cities)", time: "2–3 business days", fee: "Free over ₪200 / ₪20 below" },
  { zone: "Other West Bank areas", time: "3–5 business days", fee: "Free over ₪200 / ₪25 below" },
  { zone: "Israel", time: "3–5 business days", fee: "Free over ₪200 / ₪25 below" },
];

const STEPS = [
  { Icon: Package,     title: "Order Confirmed", desc: "You'll receive a confirmation email with your order details immediately after checkout." },
  { Icon: Truck,       title: "Shipped",         desc: "Your order is handed to our courier partner. You'll get a tracking link via email." },
  { Icon: MapPin,      title: "Out for Delivery", desc: "Your package is on its way. You'll receive an SMS notification on the day of delivery." },
  { Icon: ShieldCheck, title: "Delivered",        desc: "Package delivered. If anything looks wrong, contact us within 48 hours." },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100 px-6 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FF5533" }}>Delivery</p>
            <h1 className="text-5xl font-black text-[#0F1F3D] mb-3">Shipping Info</h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Fast, reliable delivery — straight to your door. Here's everything you need to know.
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-14 space-y-10">

          {/* Free shipping banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 flex items-center gap-4 text-white"
            style={{ background: "linear-gradient(135deg, #0F1F3D, #1a3060)" }}
          >
            <Truck className="w-10 h-10 flex-shrink-0 opacity-80" />
            <div>
              <p className="font-black text-xl">Free shipping on orders over ₪200</p>
              <p className="text-white/60 text-sm mt-0.5">Applies automatically at checkout — no code needed.</p>
            </div>
          </motion.div>

          {/* Delivery zones */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF1F0] flex items-center justify-center">
                <MapPin className="w-4 h-4" style={{ color: "#FF5533" }} />
              </div>
              <h2 className="text-base font-black text-[#0F1F3D]">Delivery Zones & Times</h2>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="grid grid-cols-3 px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>Zone</span><span>Est. Delivery</span><span>Shipping Fee</span>
              </div>
              {ZONES.map((z, i) => (
                <motion.div key={z.zone}
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                  className="grid grid-cols-3 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-semibold text-[#0F1F3D]">{z.zone}</span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />{z.time}
                  </span>
                  <span className="text-sm text-gray-600">{z.fee}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-black text-[#0F1F3D] mb-6">How Delivery Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map(({ Icon, title, desc }, i) => (
                <div key={title} className="flex flex-col items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#FFF1F0", color: "#FF5533" }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-white px-2 py-0.5 rounded-full" style={{ background: "#0F1F3D" }}>
                        {i + 1}
                      </span>
                      <p className="text-sm font-black text-[#0F1F3D]">{title}</p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Note */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Please note:</strong> Delivery times may be affected by public holidays, weather, or other circumstances outside our control. We'll keep you updated via email and SMS.
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
