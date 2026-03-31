import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ repos: [], users: [] });
  }

  const repos = await prisma.repository.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
      ],
      isPrivate: false,
    },
    include: {
      owner: true,
    },
    take: 5,
  });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
      ],
    },
    take: 5,
  });

  return NextResponse.json({ repos, users });
}