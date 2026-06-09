"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { ArrowRight, Clock, User } from "lucide-react";

const POSTS = [
  {
    slug: "top-tech-picks",
    category: "Technology",
    title: "Top Tech Picks for 2025",
    excerpt: "From ultra-thin laptops to noise-cancelling headphones — here are the gadgets worth your money this year.",
    author: "Souqona Team",
    date: "May 5, 2025",
    readTime: "4 min read",
    color: "#4F46E5",
    bg: "#EEF2FF",
  },
  {
    slug: "home-refresh-guide",
    category: "Home & Living",
    title: "How to Refresh Your Home on a Budget",
    excerpt: "Small changes, big impact. We rounded up the best affordable home upgrades you can order today.",
    author: "Souqona Team",
    date: "April 22, 2025",
    readTime: "5 min read",
    color: "#16A34A",
    bg: "#F0FDF4",
  },
  {
    slug: "spring-fashion-trends",
    category: "Fashion",
    title: "Spring Fashion Trends You'll Actually Wear",
    excerpt: "No runway required. Our style guide covers everyday looks that are both comfortable and on-trend.",
    author: "Souqona Team",
    date: "April 10, 2025",
    readTime: "3 min read",
    color: "#DB2777",
    bg: "#FDF4FF",
  },
  {
    slug: "smart-shopping-tips",
    category: "Shopping Tips",
    title: "5 Smart Shopping Tips to Save More",
    excerpt: "How to make the most of filters, price alerts, and category deals on Souqona.",
    author: "Souqona Team",
    date: "March 28, 2025",
    readTime: "3 min read",
    color: "#FF5533",
    bg: "#FFF1F0",
  },
  {
    slug: "fitness-gear-guide",
    category: "Sports & Fitness",
    title: "Build Your Home Gym Without Breaking the Bank",
    excerpt: "You don't need a fancy gym membership. Here's the essential gear to get fit from home.",
    author: "Souqona Team",
    date: "March 14, 2025",
    readTime: "6 min read",
    color: "#0284C7",
    bg: "#F0F9FF",
  },
  {
    slug: "kitchen-essentials",
    category: "Kitchen",
    title: "Kitchen Essentials Every Home Cook Needs",
    excerpt: "Upgrade your cooking setup with these must-have tools — from knife sets to smart appliances.",
    author: "Souqona Team",
    date: "February 28, 2025",
    readTime: "4 min read",
    color: "#D97706",
    bg: "#FFF7ED",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100 px-6 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FF5533" }}>Journal</p>
            <h1 className="text-5xl font-black text-[#0F1F3D] mb-3">Souqona Blog</h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Shopping guides, style tips, and product highlights — all in one place.
            </p>
          </motion.div>
        </div>

        {/* Posts grid */}
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 3) * 0.08 }}
                viewport={{ once: true }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group h-full flex flex-col">
                    {/* Colour band */}
                    <div className="h-2 w-full" style={{ background: post.color }} />
                    <div className="p-6 flex flex-col flex-1">
                      <span
                        className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 w-fit"
                        style={{ background: post.bg, color: post.color }}
                      >
                        {post.category}
                      </span>
                      <h2 className="text-lg font-black text-[#0F1F3D] leading-snug mb-2 group-hover:text-[#FF5533] transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#FF5533] transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
