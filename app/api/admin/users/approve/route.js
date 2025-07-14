import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const officials = await prisma.user.findMany({
            where: {
                role: "official",
                isApproved: false,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
            },
        });

        return NextResponse.json(officials);
    } catch (err) {
        console.error("Fetch unapproved officials error:", err);
        return NextResponse.json({ error: "Could not fetch officials" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { userId } = await req.json();
        
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isApproved: true },
        });

        return NextResponse.json({ message: "User rejected", user: updatedUser });
    } catch (err) {
        console.error("Reject error:", err);
        return NextResponse.json({ error: "Failed to reject user" }, { status: 500 });
    }
}



