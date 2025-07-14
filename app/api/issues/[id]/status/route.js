import prisma from "@/lib/prisma";

export async function PUT(req, context) {
  const { id } = await context.params;
  const { status } = await req.json();

  if (!["Open", "Working", "Resolve"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const updatedIssue = await prisma.post.update({
      where: { id },
      data: { status },
    });
    return Response.json(updatedIssue);
  } catch (error) {
    return Response.json({ error: "Issue not found" }, { status: 404 });
  }
}

