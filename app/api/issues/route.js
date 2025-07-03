import prisma from "@/lib/prisma";
export async function POST(req) {
  try {
    const { title, description, location, email, imageUrl, state, district, taluka, address, pincode } = await req.json();

    if (!title || !description || !location || !email || !address || !pincode) {
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
        upvotedBy: true, // this array field
        address: true,
        taluka: true,
        district: true,
        state: true,
        location: true,
        imageUrl: true,
      },
    });

    // Attach hasUpvoted
    const issuesWithHasUpvoted = issues.map((issue) => ({
      ...issue,
      hasUpvoted: userId ? issue.upvotedBy.includes(userId) : false,
    }));

    return Response.json(issuesWithHasUpvoted);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return Response.json(
      { error: "Internal Server Error", detail: error.message },
      { status: 500 }
    );
  }
}
