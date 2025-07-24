import { NextResponse } from "next/server";
import { transporter, mailOptions } from "@/lib/mailer";

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const otpStore = new Map(); // Store OTPs in memory (temporary)

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const otp = generateOTP();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: "Your OTP for Community Connect",
      html: `<p>Your OTP is: <strong>${otp}</strong><br/>It will expire in 5 minutes.</p>`,
    });

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

// Export the OTP store for verification route
export { otpStore };
