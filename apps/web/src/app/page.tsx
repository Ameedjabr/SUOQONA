"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Button } from "@/components/ui";
import {
  AnimatedContainer,
  AnimatedList,
  AnimatedItem,
  PageTransition,
  containerVariants,
  itemVariants,
} from "@/components/ui/animations";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white flex flex-col overflow-hidden">
        <Header />

        {/* Hero Section with Animations */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 px-4 py-20 md:py-32 min-h-[600px] flex items-center">
          {/* Animated Background Elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-7xl mx-auto w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div variants={fadeInUp}>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold backdrop-blur-md"
                  >
                    ✨ Welcome to Souqona
                  </motion.span>
                </motion.div>

                <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-bold text-white leading-tight">
                  Shop Smart with AI Assistance
                </motion.h1>

                <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-indigo-100">
                  Discover curated collections and get personalized recommendations from our intelligent shopping assistant.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/products">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 border-0 w-full sm:w-auto">
                        Shop Now
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-lg bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition border border-indigo-400"
                  >
                    Learn More
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden md:block"
              >
                <motion.div
                  animate={{ y: [0, -30, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="relative w-full h-96"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <div className="text-7xl">🛍️</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600">Explore our diverse collection of premium products</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { name: "Electronics", icon: "📱", color: "from-blue-500 to-blue-600" },
                { name: "Fashion", icon: "👕", color: "from-pink-500 to-pink-600" },
                { name: "Home & Garden", icon: "🏠", color: "from-green-500 to-green-600" },
                { name: "Sports", icon: "⚽", color: "from-orange-500 to-orange-600" },
              ].map((cat) => (
                <motion.div key={cat.name} variants={itemVariants}>
                  <Link href={`/categories/${cat.name.toLowerCase()}`}>
                    <motion.div
                      whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      className={`bg-gradient-to-br ${cat.color} rounded-2xl p-8 text-white hover:shadow-2xl transition transform cursor-pointer relative overflow-hidden group`}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20"
                      />
                      <motion.div className="relative z-10">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-5xl mb-4"
                        >
                          {cat.icon}
                        </motion.div>
                        <h3 className="text-2xl font-bold">{cat.name}</h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="text-sm text-white/80 mt-2"
                        >
                          Explore products →
                        </motion.p>
                      </motion.div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 px-4 bg-gray-50">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 mb-12 text-center"
            >
              Why Choose Souqona
            </motion.h2>

            <AnimatedList>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: "🚀",
                    title: "Fast Shipping",
                    description: "Get your orders delivered quickly and safely",
                  },
                  {
                    icon: "🤖",
                    title: "AI Shopping Assistant",
                    description: "Smart recommendations personalized for you",
                  },
                  {
                    icon: "🛡️",
                    title: "Secure Checkout",
                    description: "Your payment and data are always protected",
                  },
                  {
                    icon: "💰",
                    title: "Best Prices",
                    description: "Competitive pricing with regular deals",
                  },
                ].map((feature, idx) => (
                  <AnimatedItem key={idx}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-lg p-8 border border-gray-200 hover:border-indigo-300 transition"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl mb-4"
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </motion.div>
                  </AnimatedItem>
                ))}
              </div>
            </AnimatedList>
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 mb-12 text-center"
            >
              What Our Customers Say
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  name: "Sarah Johnson",
                  role: "Happy Customer",
                  text: "The AI assistant helped me find exactly what I was looking for. Amazing experience!",
                },
                {
                  name: "Ahmed Hassan",
                  role: "Regular Shopper",
                  text: "Fast delivery, great prices, and the chat support is incredibly helpful.",
                },
                {
                  name: "Leila Cohen",
                  role: "Verified Buyer",
                  text: "Best online shopping experience I've had. Definitely coming back!",
                },
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm hover:shadow-lg transition"
                >
                  <motion.div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-yellow-400"
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </motion.div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Newsletter */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Subscribe to our newsletter for exclusive offers and new product launches.
            </p>
            <motion.form className="flex flex-col sm:flex-row gap-3">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Subscribe
              </motion.button>
            </motion.form>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 mb-6"
            >
              Ready to Start Shopping?
            </motion.h2>
            <p className="text-xl text-gray-600 mb-8">
              Browse our collection of thousands of premium products curated just for you.
            </p>
            <Link href="/products">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg">Explore Products</Button>
              </motion.div>
            </Link>
          </motion.div>
        </section>

        <Footer />
        <ChatWidget />
      </div>
    </PageTransition>
  );
}
