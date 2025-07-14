import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");        // ?role=user  | ?role=official | ?role=all

    /* ----------------------------------------------------------
       Build the Prisma 'where' clause:

       1. If a specific role is requested (and it isn’t "all"),
          filter by that role.
       2. Regardless, always exclude role === "admin".
    ---------------------------------------------------------- */
    const where = {
      ...(role && role !== "all" ? { role } : {}),
      NOT: {
        role: { in: ["admin"] },
      },
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        role: true,
        isSuspended: true,
        isApproved:true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json(
      { error: "Internal Server Error", detail: error.message },
      { status: 500 }
    );
  }
}
