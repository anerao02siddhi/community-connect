"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="mt-50 flex items-center justify-center bg-white px-4 py-8">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#a80ba3]">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 gap-3">
              <Label htmlFor="email" className="text-[#a80ba3]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#a80ba3] hover:bg-[#8c0b86] text-white"
            >
              Send Reset Link
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
