"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ NEW
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !token) {
      toast.error("Missing password or token.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Password reset successfully.");
        setPassword("");
        setConfirmPassword("");
        router.push("login-register");
      } else {
        toast.error(data.error || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-red-600 font-medium text-center">Invalid token.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#a80ba3]">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-[#a80ba3]">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 relative">
              <Label htmlFor="confirm-password" className="text-[#a80ba3]">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-[#a80ba3] hover:bg-[#8c0b86] text-white"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
