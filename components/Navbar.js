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

  const handleMyIssues = () => {
    toast("Opening My Issues...");
    router.push("/my-issues");
  };

  const handleHome = () => {
    toast("Going Home...");
    router.push("/");
  };

  return (
    <header className="bg-[#f9ddf8] shadow-md sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo + Name */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleHome}
            className="rounded-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
          {user ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleMyIssues}
                className="rounded-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
              >
                My Issues
              </Button>
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

        {/* Mobile Menu Icon */}
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 mt-1 md:hidden bg-white border-t px-4 py-3 space-y-3 shadow-lg z-50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              handleHome();
              setMobileMenuOpen(false);
            }}
            className="w-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
          {user ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  handleMyIssues();
                  setMobileMenuOpen(false);
                }}
                className="w-full border border-[#a80ba3] text-[#a80ba3] hover:bg-[#f4d2f3]"
              >
                My Issues
              </Button>
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
