"use client";
import { SessionProvider } from "next-auth/react"; // Optional, if you're using NextAuth
import { UserProvider } from "@/context/UserContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
}
