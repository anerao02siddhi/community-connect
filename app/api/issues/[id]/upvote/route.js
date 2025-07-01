import prisma from "@/lib/prisma";

export async function POST(req, context) {
  const postId = context.params.id;
  const { userId } = await req.json();

  if (!userId) {
    return Response.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    // 1️⃣ Load the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        upvotes: true,
        upvotedBy: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found." }, { status: 404 });
    }

    let updatedPost;

    // 2️⃣ Check if the user already upvoted
    const hasUpvoted = post.upvotedBy.includes(userId);

    if (hasUpvoted) {
      // 3️⃣ Remove upvote
      updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          upvotes: { decrement: 1 },
          upvotedBy: {
            set: post.upvotedBy.filter((id) => id !== userId),
          },
        },
        select: {
          upvotes: true,
          upvotedBy: true,
        },
      });
    } else {
      // 4️⃣ Add upvote
      updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          upvotes: { increment: 1 },
          upvotedBy: {
            set: [...post.upvotedBy, userId],
          },
        },
        select: {
          upvotes: true,
          upvotedBy: true,
        },
      });
    }

    return Response.json({
      upvotes: updatedPost.upvotes,
      hasUpvoted: !hasUpvoted,
    });
  } catch (error) {
    console.error("Upvote toggle error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

