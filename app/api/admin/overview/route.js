import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
    });

    const posts = await prisma.post.findMany({
      select: { id: true }, // lightweight select
    });

    const resolve = await prisma.post.count({ where: { status: "Resolve" } });
    const working = await prisma.post.count({ where: { status: "Working" } });
    const open = await prisma.post.count({ where: { status: "Open" } });

    const statusCounts = {
      Resolved: resolve,
      Working: working,
      Open: open,
    };

    return new Response(
      JSON.stringify({
        usersCount: users.length,
        issuesCount: posts.length,
        statusCounts,
        users:users,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in /api/admin/overview:", err);
    return new Response(
      JSON.stringify({ error: "Failed to load admin overview" }),
      { status: 500 }
    );
  }
}
