import { PrismaClient } from "@prisma/client";
import { transporter, mailOptions } from "@/lib/mailer";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return new Response(JSON.stringify({ error: "No user found with that email" }), { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  });

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    ...mailOptions,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset.</p>
      <p>Click this link to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 1 hour.</p>
    `,
  });

  return new Response(JSON.stringify({ message: "Reset email sent" }), { status: 200 });
}
