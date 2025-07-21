import prisma from "@/lib/prisma";

/**
 * GET /api/issues/:id/comments
 * Fetch all comments for an issue
 */
export async function GET(request, context) {
  const { id } = await context.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { name: true } },
      },
    });

    return Response.json(comments);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

/**
 * POST /api/issues/:id/comments
 * Create a new comment
 */
// export async function POST(request, context) {
//   const { id } = await context.params;
//   const { text, userId } = await request.json();

//   if (!text) {
//     return Response.json({ error: "Comment cannot be empty" }, { status: 400 });
//   }

//   if (!userId) {
//     return Response.json({ error: "User ID is required" }, { status: 400 });
//   }

//   try {
//     const comment = await prisma.comment.create({
//       data: {
//         text,
//         post: { connect: { id } },
//         user: { connect: { id: userId } },
//       },
//       include: {
//         user: { select: { name: true } },
//       },
//     });

//     return Response.json(comment);
//   } catch (error) {
//     console.error(error);
//     return Response.json({ error: "Issue not found or user invalid" }, { status: 404 });
//   }
// }
export async function POST(request, context) {
  const { id } = await context.params;
  const { text, userId, parentId } = await request.json();

  if (!text) {
    return Response.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  if (!userId) {
    return Response.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        post: { connect: { id } },
        user: { connect: { id: userId } },
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return Response.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return Response.json({ error: "Issue not found, user invalid, or parentId broken" }, { status: 500 });
  }
}
