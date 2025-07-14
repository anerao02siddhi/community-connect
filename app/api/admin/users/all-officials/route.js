import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const officials = await prisma.user.findMany({
      where: {
        role: "official",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isApproved: true,
        isSuspended: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(officials);
  } catch (error) {
    console.error("Error fetching all officials:", error);
    return NextResponse.json(
      { error: "Failed to fetch officials" },
      { status: 500 }
    );
  }
}
