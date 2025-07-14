import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return new Response(JSON.stringify({ error: "Token and password are required" }), { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return new Response(JSON.stringify({ message: "Password reset successful" }), { status: 200 });
}
