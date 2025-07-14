"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 font-medium">Invalid token.</p>
      </div>
    );
  }

  return (
    <div className="mt-50 flex items-center justify-center bg-white px-4 py-8">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#a80ba3]">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#a80ba3]">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#a80ba3] hover:bg-[#8c0b86] text-white"
            >
              Reset Password
            </Button>
            {message && (
              <p
                className={`text-sm ${message.toLowerCase().includes("error") ||
                    message.toLowerCase().includes("invalid")
                    ? "text-red-600"
                    : "text-green-600"
                  }`}
              >
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
