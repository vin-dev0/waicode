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
  const { title, body, baseBranch, headBranch } = await request.json();

  if (!title || !baseBranch || !headBranch) {
    return NextResponse.json({ error: "Title, baseBranch, and headBranch are required" }, { status: 400 });
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
    const pr = await prisma.pullRequest.create({
      data: {
        title,
        body,
        baseBranch,
        headBranch,
        repoId: repository.id,
        authorId: user.id,
      },
    });
    return NextResponse.json(pr);
  } catch (e: any) {
    console.error("PR_CREATE_ERROR:", e);
    return NextResponse.json({ error: "Error creating pull request" }, { status: 500 });
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

  const pr = await prisma.pullRequest.findUnique({
    where: { id },
    include: {
      repo: {
        include: { owner: true }
      }
    }
  });

  if (!pr) {
    return NextResponse.json({ error: "Pull request not found" }, { status: 404 });
  }

  // Only repo owner can merge or close
  if (pr.repo.owner.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updatedPr = await prisma.pullRequest.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updatedPr);
  } catch (e: any) {
    console.error("PR_UPDATE_ERROR:", e);
    return NextResponse.json({ error: "Error updating pull request" }, { status: 500 });
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

  const prs = await prisma.pullRequest.findMany({
    where: { repoId: repository.id },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(prs);
}