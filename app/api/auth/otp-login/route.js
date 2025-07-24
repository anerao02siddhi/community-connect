import { NextResponse } from "next/server";
import { otpStore } from "../../verify/send-otp/route"; // adjust path if needed
import prisma from "@/lib/prisma";
import { SignJWT } from "jose";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const record = otpStore.get(email);
    if (!record) {
      return NextResponse.json({ error: "No OTP found for this email" }, { status: 400 });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (record.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    otpStore.delete(email); // OTP is single-use

    // ✅ Find user in DB
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found. Please register first." }, { status: 404 });
    }

    // ✅ Role-based checks
    if (user.role === "user" && user.isSuspended) {
      return NextResponse.json(
        { error: "Your account has been suspended by admin." },
        { status: 403 }
      );
    }

    if (user.role === "official" && !user.isApproved) {
      return NextResponse.json(
        { error: "Your official account is not approved by admin yet." },
        { status: 403 }
      );
    }

    // ✅ Generate JWT
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // ✅ Return token + safe user
    return NextResponse.json({ token, user }, { status: 200 });

  } catch (error) {
    console.error("OTP login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
