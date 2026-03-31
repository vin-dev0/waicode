import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commitFileToGit, deleteFileFromGit, syncGitToPrisma } from "@/lib/git";

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
  const { path: rawPath, content, message } = await request.json();

  if (!rawPath || !content) {
    return NextResponse.json({ error: "Path and content are required" }, { status: 400 });
  }

  // Sanitize path: remove leading slashes and prevent directory traversal
  const path = rawPath.replace(/^\/+/, "").replace(/\.\.\//g, "");
  console.log(`DEBUG: Creating file at sanitized path: ${path} for repo: ${repo}`);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: {
        name: owner,
      },
    },
    include: {
      owner: true,
    },
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  try {
    const repoName = repository.name;
    const branch = "main";
    const commitMessage = message || `Create ${path}`;

    await commitFileToGit(
      repository.owner.name!,
      repoName,
      branch,
      path,
      content,
      commitMessage,
      user.name || "Unknown",
      user.email || "unknown@example.com"
    );

    // Sync database with what we just pushed
    await syncGitToPrisma(repository.owner.name!, repoName);

    // Fetch the stored version that was just synced
    const file = await prisma.file.findFirst({
      where: {
        path,
        repository: { id: repository.id },
        branch: branch
      }
    });

    return NextResponse.json(file);
  } catch (e: any) {
    console.error("FILE_CREATE_ERROR:", e);
    return NextResponse.json({ error: "Error creating file" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { owner, repo } = await params;
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  const file = await prisma.file.findFirst({
    where: {
      path,
      repository: {
        name: repo,
        owner: {
          name: owner,
        },
      },
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json(file);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;
  const { path: rawPath, content, message } = await request.json();
  const path = rawPath.replace(/^\/+/, "").replace(/\.\.\//g, "");

  const file = await prisma.file.findFirst({
    where: {
      path,
      repository: {
        name: repo,
        owner: {
          name: owner,
        },
      },
    },
    include: {
      repository: {
        include: {
          owner: true,
        },
      },
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (file.repository.owner.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const repoName = file.repository.name;
    const branch = file.branch || "main";
    const commitMessage = message || `Update ${path}`;

    await commitFileToGit(
      file.repository.owner.name!,
      repoName,
      branch,
      path,
      content,
      commitMessage,
      user.name || "Unknown",
      user.email || "unknown@example.com"
    );

    // Sync database with what we just pushed
    await syncGitToPrisma(file.repository.owner.name!, repoName);

    // Fetch the updated version
    const updatedFile = await prisma.file.findFirst({
      where: {
        path,
        repository: { id: file.repository.id },
        branch: branch
      }
    });

    return NextResponse.json(updatedFile);
  } catch (e: any) {
    console.error("FILE_UPDATE_ERROR:", e);
    return NextResponse.json({ error: "Error updating file" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  const file = await prisma.file.findFirst({
    where: {
      path,
      repository: {
        name: repo,
        owner: {
          name: owner,
        },
      },
    },
    include: {
      repository: {
        include: {
          owner: true,
        },
      },
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (file.repository.owner.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const repoName = file.repository.name;
    const branch = file.branch || "main";
    const commitMessage = `Delete ${path}`;

    await deleteFileFromGit(
      file.repository.owner.name!,
      repoName,
      branch,
      path,
      commitMessage,
      user.name || "Unknown",
      user.email || "unknown@example.com"
    );

    // Sync database with the deletion
    await syncGitToPrisma(file.repository.owner.name!, repoName);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("FILE_DELETE_ERROR:", e);
    return NextResponse.json({ error: "Error deleting file" }, { status: 500 });
  }
}