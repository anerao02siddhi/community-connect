import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    const { userId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isApproved: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: false },
    });

    return NextResponse.json({ message: "User rejected", user: updatedUser });
  } catch (err) {
    console.error("Reject error:", err);
    return NextResponse.json({ error: "Failed to reject user" }, { status: 500 });
  }
}
