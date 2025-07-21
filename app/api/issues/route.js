import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { title, description, location, email, imageUrl, state, district, taluka, address, pincode, category, issueType } = await req.json();

    if (!title || !description || !email || !address || !pincode || !category || !issueType || !state || !district || !taluka) {
      return Response.json({ error: "All fields are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    const issue = await prisma.post.create({
      data: {
        title,
        description,
        location,
        state,
        district,
        taluka,
        address,
        userId: user.id,
        imageUrl: imageUrl ? [imageUrl] : [],
        pincode,
        category,
        issueType,
      },
    });

    return Response.json(issue);
  } catch (error) {
    console.error("Error creating issue:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const issues = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        upvotes: true,
        upvotedBy: true, // Array of userIds
        address: true,
        taluka: true,
        district: true,
        state: true,
        location: true,
        imageUrl: true,
        afterImageUrl: true,
        status: true,
        userId: true,
        category: true,
        issueType: true,
      },
    });

    const issuesWithUpvoteFlag = issues.map((issue) => {
      const hasUpvoted =
        userId && Array.isArray(issue.upvotedBy)
          ? issue.upvotedBy.includes(userId)
          : false;

      return {
        ...issue,
        hasUpvoted: Boolean(hasUpvoted),
      };
    });

    return new Response(JSON.stringify(issuesWithUpvoteFlag), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching all issues:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}


