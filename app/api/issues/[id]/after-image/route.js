import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  const { id } = params;
  const { afterImageUrl, status } = await request.json();

  try {
    const updatedIssue = await prisma.post.update({
      where: { id },
      data: {
        afterImageUrl: afterImageUrl ? [afterImageUrl] : [],
        ...(status && { status }), // Only update status if provided
      },
    });

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';