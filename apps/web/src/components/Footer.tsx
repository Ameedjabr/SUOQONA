"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold text-white">Souqona</span>
            </div>
            <p className="text-sm text-gray-400">Premium e-commerce platform for modern businesses.</p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-indigo-400 transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-indigo-400 transition">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-indigo-400 transition">
                  Special Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-indigo-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-indigo-400 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-indigo-400 transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-indigo-400 transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex items-center justify-between text-sm">
          <p>&copy; 2024 Souqona. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-indigo-400 transition">
              Twitter
            </Link>
            <Link href="#" className="hover:text-indigo-400 transition">
              Facebook
            </Link>
            <Link href="#" className="hover:text-indigo-400 transition">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
