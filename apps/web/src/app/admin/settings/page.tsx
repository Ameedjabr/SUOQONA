"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { Card, Button } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="settings">
        <div className="p-6 max-w-2xl space-y-6">
          {/* General Settings */}
          <Card title="General Settings">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Store Name</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">Souqona</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Store Email</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">info@souqona.com</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Settings */}
          <Card title="Account Settings">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Admin Name</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{user?.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Admin Email</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{user?.email}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <Button variant="secondary">Change Password</Button>
              </div>
            </div>
          </Card>

          {/* Store Configuration */}
          <Card title="Store Configuration">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Currency</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">Israeli Shekel (₪)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Language</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">English</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                More configuration options coming soon, including shipping rates, payment methods, and tax settings.
              </p>
            </div>
          </Card>

          {/* API Settings */}
          <Card title="API Information">
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 font-medium mb-1">API Base URL</p>
                <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
                </p>
              </div>
              <p className="text-gray-600">
                Use these credentials in your integrations and API calls.
              </p>
            </div>
          </Card>

          {/* Database Info */}
          <Card title="System Information">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Node Environment</span>
                <span className="text-gray-900 font-medium">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next.js Version</span>
                <span className="text-gray-900 font-medium">15.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">React Version</span>
                <span className="text-gray-900 font-medium">19.0.0</span>
              </div>
            </div>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
