"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { useState } from "react";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md bg-white/95"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold">S</span>
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-gray-900"
            >
              Souqona
            </motion.span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "/products", label: "Products" },
              { href: "/categories", label: "Categories" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
            ].map((item, idx) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={item.href} className="group">
                  <motion.span
                    className="relative text-gray-700 hover:text-indigo-600 transition"
                    whileHover={{ y: -2 }}
                  >
                    {item.label}
                    <motion.div
                      layoutId="underline"
                      className="h-0.5 bg-indigo-600 absolute -bottom-1 left-0 w-0 group-hover:w-full transition-all duration-300"
                    />
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link href="/cart">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm">
                  🛒 Cart
                </Button>
              </motion.div>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === "ADMIN" && (
                  <Link href="/admin">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="secondary" size="sm">
                        Admin
                      </Button>
                    </motion.div>
                  </Link>
                )}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-gray-900 font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  {user?.fullName}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => logout()}
                  className="text-gray-700 hover:text-red-600 text-sm font-medium transition"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="sm">Sign Up</Button>
                  </motion.div>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700"
            >
              ≡
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: mobileMenuOpen ? "auto" : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-4 py-4 space-y-2 border-t border-gray-200">
            {[
              { href: "/products", label: "Products" },
              { href: "/categories", label: "Categories" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="block px-4 py-2 text-gray-700 hover:text-indigo-600 transition"
                >
                  {item.label}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
