"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Home, LogOut, User } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function Navbar() {
  const { user, logout } = useUser();
  const router = useRouter();

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
    toast("Going Dashboard...");
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
                  <Button className='hover:text-[#a80ba3]' variant="outline" onClick={handleDashboard}>
                    Dashboard
                  </Button>
                  <Button className='hover:text-[#a80ba3]' variant="outline" onClick={handleIssues}>
                    All Issues
                  </Button>
                  <Button className='hover:text-[#a80ba3]' variant="outline" onClick={handleRequest}>
                    Requests
                  </Button>
                </>
              )}

              {user.role === "official" && (
                <Button variant="outline" onClick={handleOfficialIssues}>
                  Official Dashboard
                </Button>
              )}

              {user.role !== "admin" && user.role !== "official" && (
                <>
                  <Button className='hover:text-[#a80ba3]' variant="outline" onClick={handleHome}>
                    <Home className="h-4 w-4 mr-1" />
                    Home
                  </Button>
                  <Button
                    variant="outline"
                    className='hover:text-[#a80ba3]'
                    onClick={() => {
                      toast("Opening My Issues...");
                      router.push("/my-issues");
                    }}
                  >
                    My Issues
                  </Button>
                </>
              )}

              {/* Desktop Profile Dropdown */}
              <DropdownMenu >
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage
                      src={user.profileImage || "/images/avatar.jpeg"}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name?.split(" ")[0]?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className='bg-white'>
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.profileImage || "/images/avatar.jpeg"}
                      />
                      <AvatarFallback>
                        {user.name?.split(" ")[0]?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{user.name}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")} className='font-semibold'>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 font-semibold"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              className="rounded-full bg-[#a80ba3] text-white hover:bg-[#cda0cc]"
              onClick={handleLogin}
            >
              Login
            </Button>
          )}
        </nav>

        {/* Mobile Avatar Dropdown (no hamburger icon) */}
        <div className="md:hidden">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarImage
                    src={user.profileImage || "/images/avatar.jpeg"}
                    alt={user.name}
                  />
                  <AvatarFallback>
                    {user.name?.split(" ")[0]?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 bg-white">
                {/* Profile Info */}
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.profileImage || "/images/avatar.jpeg"}
                    />
                    <AvatarFallback>
                      {user.name?.split(" ")[0]?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{user.name}</span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Profile Link */}
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="font-semibold hover:text-[#a80ba3]"
                >
                  <User className="w-4 h-4" />
                  Profile
                </DropdownMenuItem>

                {/* Admin Menu */}
                {user.role === "admin" && (
                  <>
                    <DropdownMenuItem
                      onClick={handleDashboard}
                      className="font-semibold hover:text-[#a80ba3]"
                    >
                      🛠️  Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleIssues}
                      className="font-semibold hover:text-[#a80ba3]"
                    >
                      📝  All Issues
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleRequest}
                      className="font-semibold hover:text-[#a80ba3]"
                    >
                      📥  All Requests
                    </DropdownMenuItem>
                  </>
                )}

                {/* Official Menu */}
                {user.role === "official" && (
                  <DropdownMenuItem
                    onClick={() => router.push("/officials/all-issues")}
                    className="font-semibold hover:text-[#a80ba3]"
                  >
                    🛠️ Official Dashboard
                  </DropdownMenuItem>
                )}

                {/* User Menu */}
                {user.role !== "admin" && user.role !== "official" && (
                  <DropdownMenuItem
                    onClick={() => router.push("/my-issues")}
                    className="font-semibold hover:text-[#a80ba3]"
                  >
                    🗂️ My Issues
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 font-semibold"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleLogin}
              className="rounded-full bg-[#a80ba3] text-white hover:bg-[#cda0cc]"
            >
              Login
            </Button>
          )}
        </div>

      </div>
    </header>
  );
}
