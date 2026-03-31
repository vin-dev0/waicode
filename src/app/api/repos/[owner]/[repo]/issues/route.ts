import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  owner: string;
  repo: string;
}

export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;
  const { title, body } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: {
        name: owner,
      },
    },
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const issue = await prisma.issue.create({
      data: {
        title,
        body,
        repoId: repository.id,
        authorId: user.id,
      },
    });
    return NextResponse.json(issue);
  } catch (e: any) {
    console.error("ISSUE_CREATE_ERROR:", e);
    return NextResponse.json({ error: "Error creating issue" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
  }

  try {
    const issue = await prisma.issue.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(issue);
  } catch (e: any) {
    console.error("ISSUE_UPDATE_ERROR:", e);
    return NextResponse.json({ error: "Error updating issue" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { owner, repo } = await params;

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: {
        name: owner,
      },
    },
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const issues = await prisma.issue.findMany({
    where: { repoId: repository.id },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(issues);
}