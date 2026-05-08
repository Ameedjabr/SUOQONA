"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi, ApiError } from "@/services/api";
import { Card, Button, Input, Toast } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email format";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      setError(null);
      await authApi.requestPasswordReset(email);
      setSuccess("Check your email for password reset instructions");
      setStep("reset");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to request reset";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!token) newErrors.token = "Reset token is required";
    if (!newPassword) newErrors.newPassword = "Password is required";
    else if (newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      setError(null);
      await authApi.resetPassword(token, newPassword);
      setSuccess("Password reset successfully! You can now login.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to reset password";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-3xl font-bold text-indigo-600">S</span>
          </div>
        </div>

        {/* Card */}
        <Card className="shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
              <p className="text-gray-600 mt-2">
                {step === "email"
                  ? "Enter your email to receive reset instructions"
                  : "Enter your reset token and new password"}
              </p>
            </div>

            {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
            {success && (
              <Toast type="success" message={success} onClose={() => setSuccess(null)} />
            )}

            {step === "email" ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  error={errors.email}
                  placeholder="you@example.com"
                />

                <Button type="submit" isLoading={isLoading} className="w-full">
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  label="Reset Token"
                  type="text"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (errors.token) setErrors((prev) => ({ ...prev, token: "" }));
                  }}
                  error={errors.token}
                  placeholder="Paste token from email"
                />

                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword)
                      setErrors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  error={errors.newPassword}
                  placeholder="••••••"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  error={errors.confirmPassword}
                  placeholder="••••••"
                />

                <Button type="submit" isLoading={isLoading} className="w-full">
                  Reset Password
                </Button>
              </form>
            )}

            <div className="border-t border-gray-200 pt-4 text-center text-sm">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-8">
          &copy; 2024 Souqona. All rights reserved.
        </p>
      </div>
    </div>
  );
}
