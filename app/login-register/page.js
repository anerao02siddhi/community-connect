"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();
  const { login } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Logging in...");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);
    toast.dismiss(loadingToast);

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      login(data.user);

      toast.success("Login successful!");
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      toast.error(data.error || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Registering...");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    toast.dismiss(loadingToast);

    if (res.ok) {
      toast.success("Registration successful! Please login.");
      setIsFlipped(false);
    } else {
      toast.error(data.error || "Registration failed");
    }
  };

  return (
    <div className="h-screen w-screen overflow-y-auto hide-scrollbar flex justify-center items-center bg-[#ffeefe]">
      <div className="relative perspective">
        <div
          className={`transition-transform duration-700 w-[768px] h-[400px] relative transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
        >
          {/* Front - Login */}
          <div className="absolute w-full h-full backface-hidden bg-white shadow-2xl rounded-2xl flex">
            <div className="w-1/2 p-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-center mb-6 text-[#a80ba3]">Login</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-[#a80ba3] hover:bg-[#922a8f] text-white"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-sm text-right">
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-[#a80ba3] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#a80ba3] text-[#a80ba3] hover:bg-[#fcd8fc]"
                  onClick={() => setIsFlipped(true)}
                >
                  Create New Account
                </Button>
              </form>
            </div>
            <div className="w-[2px] bg-[#a80ba3] opacity-80"></div>
            <div className="w-1/2 bg-[#fcd8fc] flex items-center justify-center rounded-tr-2xl rounded-br-2xl overflow-hidden relative">
              <Image
                src="/images/community.png"
                alt="Login Illustration"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Back - Register */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white shadow-2xl rounded-2xl flex">
            <div className="w-1/2 p-8 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-center mb-6 text-[#a80ba3]">Register</h1>
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full bg-[#a80ba3] text-white hover:bg-[#922a8f]">
                  Register
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#a80ba3] text-[#a80ba3] hover:bg-[#fcd8fc]"
                  onClick={() => setIsFlipped(false)}
                >
                  Already have an account ?
                </Button>
              </form>
            </div>
            <div className="w-[2px] bg-[#a80ba3] opacity-80"></div>
            <div className="w-1/2 bg-[#fcd8fc] flex items-center justify-center rounded-tr-2xl rounded-br-2xl overflow-hidden relative">
              <Image
                src="/images/community.png"
                alt="Login Illustration"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
