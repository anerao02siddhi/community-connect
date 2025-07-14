import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    const issues = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        upvotes: true,
        upvotedBy: true,
        address: true,
        taluka: true,
        district: true,
        state: true,
        location: true,
        imageUrl: true,
        status: true,
        userId: true,
        category: true,
        issueType: true,
      },
    });

    const issuesWithUpvoteFlag = issues.map((issue) => ({
      ...issue,
      hasUpvoted: issue.upvotedBy.includes(userId),
    }));

    return Response.json(issuesWithUpvoteFlag);
  } catch (error) {
    console.error("Error fetching user issues:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
