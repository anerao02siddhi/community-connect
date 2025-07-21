import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return new Response(JSON.stringify({ error: "Missing userId" }), {
                status: 400,
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                profileImage: true,
                isSuspended: true,
                isApproved: true,
            },
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({ user }), { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}


export async function POST(req) {
    try {
        const body = await req.json();
        const { userId, profileImage } = body;

        if (!userId || !profileImage) {
            return NextResponse.json(
                { error: "Missing userId or profileImage" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profileImage },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
            },
        });

        return NextResponse.json(
            { message: "Profile image updated", user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating profile image:", error);
        return NextResponse.json(
            { error: "Internal Server Error", detail: error.message },
            { status: 500 }
        );
    }
}
