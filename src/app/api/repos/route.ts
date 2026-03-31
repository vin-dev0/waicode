import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initBareRepo } from "@/lib/git";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, isPrivate } = await request.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const repo = await prisma.repository.create({
      data: {
        name,
        description,
        ownerId: user.id,
        isPrivate: isPrivate || false,
      },
    });

    // Initialize physical git repository
    await initBareRepo(user.name!, name);

    return NextResponse.json(repo);
  } catch (e: any) {
    console.error("REPO_CREATE_ERROR:", e);
    return NextResponse.json({ error: "Error creating repository" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const getAll = searchParams.get("all") === "true";

  if (getAll) {
    const repos = await prisma.repository.findMany({
      where: { isPrivate: false },
      include: { 
        owner: true,
        forkedFrom: {
          include: { owner: true }
        },
        _count: {
          select: { stars: true }
        }
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(repos);
  }

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const repos = await prisma.repository.findMany({
    where: { ownerId: user.id },
    include: { 
      owner: true,
      _count: {
        select: { stars: true }
      }
    },
  });

  return NextResponse.json(repos);
}