"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";           // NEW

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // NEW
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // NEW: separate show/hide toggles for each side
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const router = useRouter();
  const { login } = useUser();

  /* ---------- LOGIN ---------- */
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

      toast.success(`Welcome ${data.user.name}`);
      if (data.user.role === "admin") router.push("/admin/dashboard");
      else if (data.user.role === "official") router.push("/officials/all-issues");
      else router.push("/");
    } else {
      toast.error(data.error || "Login failed");
    }
  };

  /* ---------- REGISTER ---------- */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    const loadingToast = toast.loading("Registering...");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone, role }),
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
    <div className="min-h-screen w-full flex items-start justify-center pt-32 bg-[#ffeefe] p-4">
      <div className="w-full max-w-3xl relative">
        <div
          className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""
            }`}
        >
          {/* ---------- FRONT — LOGIN ---------- */}
          <div className="absolute w-full backface-hidden bg-white shadow-lg rounded-2xl flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#a80ba3]">
                Login
              </h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {/* --- Password with eye icon --- */}
                <div className="relative">
                  <Input
                    type={showLoginPassword ? "text" : "password"} // NEW
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-2 flex items-center"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#a80ba3] hover:bg-[#922a8f] text-white"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <div className="text-sm text-center md:text-right">
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

            {/* Divider & image */}
            <div className="hidden md:block w-[2px] bg-[#a80ba3] opacity-80"></div>
            <div className="hidden md:flex w-1/2 bg-[#fcd8fc] items-center justify-center rounded-tr-2xl rounded-br-2xl overflow-hidden relative">
              <Image
                src="/images/community.png"
                alt="Login Illustration"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* ---------- BACK — REGISTER ---------- */}
          <div className="absolute w-full backface-hidden rotate-y-180 bg-white shadow-lg rounded-2xl flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#a80ba3]">
                Register
              </h1>
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {/* --- Password with eye icon --- */}
                <div className="relative">
                  <Input
                    type={showRegisterPassword ? "text" : "password"} // NEW
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-2 flex items-center"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute inset-y-0 right-2 flex items-center"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>


                {/* Role selection */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Register As
                  </label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="official">Official</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#a80ba3] text-white hover:bg-[#922a8f]"
                >
                  Register
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#a80ba3] text-[#a80ba3] hover:bg-[#fcd8fc]"
                  onClick={() => setIsFlipped(false)}
                >
                  Already have an account?
                </Button>
              </form>
            </div>

            {/* Divider & image */}
            <div className="hidden md:block w-[2px] bg-[#a80ba3] opacity-80"></div>
            <div className="hidden md:flex w-1/2 bg-[#fcd8fc] items-center justify-center rounded-tr-2xl rounded-br-2xl overflow-hidden relative">
              <Image
                src="/images/community.png"
                alt="Register Illustration"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
