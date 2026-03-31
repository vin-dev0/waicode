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

  const originalRepo = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: { name: owner },
    },
    include: {
      files: true,
      owner: true,
    },
  });

  if (!originalRepo) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (currentUser.name === owner) {
    return NextResponse.json({ error: "Cannot fork your own repository" }, { status: 400 });
  }

  // Check if user already has a repo with the same name
  const existingRepo = await prisma.repository.findFirst({
    where: {
      name: repo,
      ownerId: currentUser.id,
    },
  });

  if (existingRepo) {
    return NextResponse.json({ error: "You already have a repository with this name" }, { status: 400 });
  }

  try {
    const forkedRepo = await prisma.repository.create({
      data: {
        name: originalRepo.name,
        description: originalRepo.description,
        ownerId: currentUser.id,
        forkedFromId: originalRepo.id,
        isPrivate: originalRepo.isPrivate,
        files: {
          create: originalRepo.files.map((f: any) => ({
            path: f.path,
            content: f.content,
            branch: f.branch,
          })),
        },
      },
    });

    await prisma.commit.create({
      data: {
        message: `Forked from ${owner}/${repo}`,
        authorId: currentUser.id,
        repoId: forkedRepo.id,
      },
    });

    await createNotification(originalRepo.ownerId, currentUser.id, "FORK", forkedRepo.id);

    return NextResponse.json(forkedRepo);
  } catch (e: any) {
    console.error("FORK_ERROR:", e);
    return NextResponse.json({ error: "Error forking repository" }, { status: 500 });
  }
}