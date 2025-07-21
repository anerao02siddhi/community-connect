import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get user from custom header
async function getUserFromRequest(req) {
  const userStr = req.headers.get("x-user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    let { issueId } = body;

    if (!issueId) {
      return NextResponse.json({ error: "Issue ID is required" }, { status: 400 });
    }

    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch issue to check ownership
    const issue = await prisma.post.findUnique({
      where: { id: issueId },
      select: { userId: true },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Admins and Officials can delete any issue
    const isPrivileged = user.role === "admin" || user.role === "official";

    // Normal users can delete only their own issues
    const isOwner = issue.userId === user.id;

    if (!isPrivileged && !isOwner) {
      return NextResponse.json({ error: "Forbidden: You can't delete this issue" }, { status: 403 });
    }

    // Proceed with delete
    await prisma.post.delete({
      where: { id: issueId },
    });

    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (err) {
    console.error("Delete API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
