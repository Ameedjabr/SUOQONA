"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/hooks/useProtectedRoute";
import { Pagination } from "@/components/ui";
import { userApi, User } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";

const AVATAR_COLORS = [
  "from-violet-400 to-indigo-500",
  "from-pink-400 to-rose-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-amber-500",
  "from-blue-400 to-cyan-500",
];

function getAvatarColor(name: string) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function AdminCustomers() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadUsers(); }, [page, search, accessToken]);

  const loadUsers = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const result = await userApi.getAll(accessToken, { page, limit: 20, search: search || undefined });
      setUsers(result.users || []);
      setTotalPages(result.pages || 1);
      setTotal(result.total || result.users?.length || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const admins = users.filter((u) => u.role === "ADMIN").length;
  const active = users.filter((u) => u.isActive).length;
  const inactive = users.filter((u) => !u.isActive).length;

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout currentPage="customers">
        <div className="p-5 space-y-4 max-w-[1400px] mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
              <p className="text-slate-500 text-base mt-1">
                {total > 0 ? `${total.toLocaleString()} registered users` : "Manage your user base"}
              </p>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
                {error}
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-lg">×</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Users", value: total, icon: Users, color: "text-slate-700", bg: "bg-slate-50", iconColor: "text-slate-500" },
              { label: "Admins", value: admins, icon: ShieldCheck, color: "text-violet-700", bg: "bg-violet-50", iconColor: "text-violet-500" },
              { label: "Active", value: active, icon: UserCheck, color: "text-emerald-700", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
              { label: "Inactive", value: inactive, icon: UserX, color: "text-red-700", bg: "bg-red-50", iconColor: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-36" />
                      <div className="h-3 bg-slate-100 rounded w-48" />
                    </div>
                    <div className="h-6 bg-slate-100 rounded-full w-16" />
                    <div className="h-6 bg-slate-100 rounded-full w-16" />
                    <div className="h-4 bg-slate-100 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Users className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-slate-600">No customers found</p>
                <p className="text-sm mt-1">
                  {search ? "Try a different search" : "Customers appear here after they register"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map((user, i) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(user.fullName)} flex items-center justify-center flex-shrink-0`}>
                                <span className="text-white text-sm font-bold">
                                  {user.fullName?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <span className="font-semibold text-slate-900">{user.fullName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              user.role === "ADMIN" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                            }`}>
                              {user.role === "ADMIN" && <ShieldCheck className="w-3 h-3" />}
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-400"}`} />
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs">{formatDate(user.createdAt)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} isLoading={isLoading} />
              </>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
