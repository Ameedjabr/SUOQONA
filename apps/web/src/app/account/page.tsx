"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";

export default function AccountProfile() {
  const { user } = useAuth();
  useProtectedRoute("CUSTOMER");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Account</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <Card>
                <nav className="space-y-2">
                  <a
                    href="/account"
                    className="block px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium transition"
                  >
                    Profile
                  </a>
                  <Link
                    href="/account/orders"
                    className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    My Orders
                  </Link>
                  <a
                    href="/account/addresses"
                    className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    Addresses
                  </a>
                  <a
                    href="/account/settings"
                    className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    Settings
                  </a>
                </nav>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile Card */}
              <Card title="Profile Information">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{user?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{user?.role}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <Button variant="secondary">Edit Profile</Button>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {new Date(user?.createdAt || "").getFullYear()}
                    </p>
                  </div>
                </Card>
                <Card>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">Active</p>
                  </div>
                </Card>
              </div>

              {/* Quick Links */}
              <Card title="Quick Links">
                <div className="space-y-2">
                  <Link href="/account/orders">
                    <Button variant="ghost" className="w-full justify-start">
                      📋 View My Orders
                    </Button>
                  </Link>
                  <a href="#" className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      💳 Payment Methods
                    </Button>
                  </a>
                  <a href="#" className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      🔐 Change Password
                    </Button>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
