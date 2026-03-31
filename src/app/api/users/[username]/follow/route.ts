import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

interface Params {
  username: string;
}

export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;

  const follower = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const following = await prisma.user.findFirst({
    where: { name: username },
  });

  if (!follower || !following) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (follower.id === following.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  try {
    const follow = await prisma.follow.create({
      data: {
        followerId: follower.id,
        followingId: following.id,
      },
    });

    await createNotification(following.id, follower.id, "FOLLOW");

    return NextResponse.json(follow);
  } catch (e: any) {
    return NextResponse.json({ error: "Already following" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;

  const follower = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const following = await prisma.user.findFirst({
    where: { name: username },
  });

  if (!follower || !following) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: following.id,
        },
      },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Not following" }, { status: 400 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findFirst({
    where: { name: username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let isFollowing = false;
  if (session?.user?.email) {
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (me) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: me.id,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }
  }

  return NextResponse.json({
    followersCount: user._count.followers,
    followingCount: user._count.following,
    isFollowing,
  });
}