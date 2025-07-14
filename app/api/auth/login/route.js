import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

export async function POST(req) {
  const { email, password } = await req.json();

  // 1️⃣  Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // 2️⃣  Check password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (user.role === "user" && user.isSuspended) {
    return Response.json(
      { error: "Your account has been suspended by admin." },
      { status: 403 }
    );
  }

  // 3️⃣  **NEW** — block unapproved officials
  if (user.role === "official" && !user.isApproved) {
    return Response.json(
      { error: "Your official account is not approved by admin yet." },
      { status: 403 }
    );
  }

  // 4️⃣  Generate JWT
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  // 5️⃣  Return token + safe user info
  return Response.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
