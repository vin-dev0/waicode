import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { getRepoPath } from "@/lib/git";

interface Params {
  owner: string;
  repo: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  const { owner, repo } = await params;
  const repoPath = await getRepoPath(owner, repo);
  const branch = request.nextUrl.searchParams.get("ref") || "main";

  const gitProcess = spawn("git", ["archive", "--format=zip", branch], {
    cwd: repoPath,
  });

  const stream = new ReadableStream({
    start(controller) {
      gitProcess.stdout.on("data", (chunk) => controller.enqueue(chunk));
      gitProcess.stdout.on("end", () => controller.close());
      gitProcess.stderr.on("data", (data) => console.error("GIT ARCHIVE ERROR:", data.toString()));
      gitProcess.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${repo}-${branch}.zip"`,
    },
  });
}
