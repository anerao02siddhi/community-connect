// /app/api/admin/users/unsuspend/route.js
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req) {
    try {
        const { userId } = await req.json();

        const user = await prisma.user.update({
            where: { id: userId },
            data: { isSuspended: false },
        });

        return NextResponse.json({ message: "User unsuspended", user });
    } catch (err) {
        return NextResponse.json({ error: "Failed to unsuspend user" }, { status: 500 });
    }
}
