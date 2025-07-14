// /app/api/admin/users/suspend/route.js
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    const { userId } = await req.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true },
    });

    return NextResponse.json({ message: "User suspended", user });
  } catch (err) {
    return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 });
  }
}
