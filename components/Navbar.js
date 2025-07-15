"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Home } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function Navbar() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login-register");
  };

  const handleLogin = () => {
    toast("Redirecting to login...");
    router.push("/login-register");
  };

  const handleDashboard = () => {
    router.push("/admin/dashboard");
  };

  const handleHome = () => {
    toast("Going Home...");
    router.push("/");
  };

  const handleIssues = () => {
    toast("Going To Issues...");
    router.push("/admin/all-issues");
  };

  const handleRequest = () => {
    toast("Going To Request Page...");
    router.push("/admin/request-page");
  };

  const handleOfficialIssues = () => {
    toast("Going to Official Dashboard...");
    router.push("/officials/all-issues");
  };

  return (
    <header className="bg-[#f9ddf8] shadow-md sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={handleHome}
        >
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={44}
            height={44}
            className="object-contain"
          />
          <div className="flex gap-1.5">
            <h1 className="text-3xl font-Poppins font-semibold tracking-wide text-[#a80ba3]">
              Community
            </h1>
            <h1 className="text-xl font-Poppins font-semibold tracking-wide text-[#a80ba3]">
              Connect
            </h1>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-4 items-center">
          {user ? (
            <>
              {user.role === "admin" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDashboard}
                    className="rounded-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    Dashboard
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleIssues}
                    className="rounded-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    All Issues
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRequest}
                    className="rounded-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    Requests
                  </Button>
                </>
              )}

              {user.role === "official" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOfficialIssues}
                    className="rounded-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    Official Dashboard
                  </Button>
                </>
              )}

              {user.role !== "admin" && user.role !== "official" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleHome}
                    className="rounded-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    Home
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast("Opening My Issues...");
                      router.push("/my-issues");
                    }}
                    className="rounded-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    My Issues
                  </Button>
                </>
              )}

              <span className="text-base font-medium text-[#a80ba3]">Hi, {user.name}</span>
              <Button
                size="sm"
                onClick={handleLogout}
                className="bg-[#a80ba3] text-white rounded-full hover:bg-[#cda0cc]"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="rounded-full bg-[#a80ba3] text-white hover:bg-[#cda0cc]"
              onClick={handleLogin}
            >
              Login
            </Button>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#a80ba3]" />
            ) : (
              <Menu className="h-6 w-6 text-[#a80ba3]" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 mt-1 md:hidden bg-white border-t px-4 py-3 space-y-3 shadow-lg z-50">
          {user ? (
            <>
              {user.role === "admin" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleDashboard();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    Dashboard
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleIssues();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    All Issues
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleRequest();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    All Requests
                  </Button>
                </>
              )}

              {user.role === "official" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleOfficialIssues();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                >
                  Official Dashboard
                </Button>
              )}

              {user.role !== "admin" && user.role !== "official" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      router.push("/my-issues");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
                  >
                    My Issues
                  </Button>
                </>
              )}

              <span className="block text-gray-800 text-base font-medium">
                Hi, {user.name}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#a80ba3] text-white rounded-full hover:bg-gray-300"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="w-full rounded-full bg-[#a80ba3] text-white hover:bg-[#cda0cc]"
              onClick={() => {
                handleLogin();
                setMobileMenuOpen(false);
              }}
            >
              Login
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
