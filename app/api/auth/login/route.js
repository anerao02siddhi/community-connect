import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

export async function POST(req) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("1d")
  .sign(new TextEncoder().encode(process.env.JWT_SECRET));


  return Response.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, } });
}
