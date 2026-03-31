import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: { name: owner },
    },
    include: { owner: true }
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  try {
    const star = await prisma.star.create({
      data: {
        userId: user.id,
        repoId: repository.id,
      },
    });

    await createNotification(repository.ownerId, user.id, "STAR", repository.id);

    return NextResponse.json(star);
  } catch (e: any) {
    return NextResponse.json({ error: "Already starred" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: { name: owner },
    },
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  try {
    await prisma.star.delete({
      where: {
        userId_repoId: {
          userId: user.id,
          repoId: repository.id,
        },
      },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Not starred" }, { status: 400 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { owner, repo } = await params;
  const session = await getServerSession(authOptions);

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: { name: owner },
    },
    include: {
      _count: {
        select: { stars: true },
      },
    },
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  let isStarred = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user) {
      const star = await prisma.star.findUnique({
        where: {
          userId_repoId: {
            userId: user.id,
            repoId: repository.id,
          },
        },
      });
      isStarred = !!star;
    }
  }

  return NextResponse.json({
    count: repository._count.stars,
    isStarred,
  });
}