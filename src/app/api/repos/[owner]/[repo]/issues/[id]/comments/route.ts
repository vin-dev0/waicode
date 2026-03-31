import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

interface Params {
  owner: string;
  repo: string;
  id: string;
}

export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { body, prId } = await request.json();

  if (!body) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        body,
        issueId: prId ? null : id,
        prId: prId ? id : null,
        authorId: user.id,
      },
    });

    // Notify issue/PR author
    if (prId) {
      const pr = await prisma.pullRequest.findUnique({ where: { id }, select: { authorId: true } });
      if (pr) await createNotification(pr.authorId, user.id, "COMMENT", id);
    } else {
      const issue = await prisma.issue.findUnique({ where: { id }, select: { authorId: true } });
      if (issue) await createNotification(issue.authorId, user.id, "COMMENT", id);
    }

    return NextResponse.json(comment);
  } catch (e: any) {
    console.error("COMMENT_CREATE_ERROR:", e);
    return NextResponse.json({ error: "Error creating comment" }, { status: 500 });
  }
}