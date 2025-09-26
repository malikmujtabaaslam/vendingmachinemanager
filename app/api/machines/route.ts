import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

const ONLINE_INTERVAL = parseInt(process.env.ONLINE_INTERVAL || "5"); // seconds

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = decoded.sub;

  // Fetch single user with their agents and jobs
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      agents: {
        include: {
          scripts: true,
        },
      },
      jobs: true, // all jobs for this user
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();

  const machines = await Promise.all(
    user.agents.map(async (agent) => {
      const isOnline =
        (now.getTime() - new Date(agent.updatedAt).getTime()) / 1000 <
        ONLINE_INTERVAL;

      const scripts = await Promise.all(
        agent.scripts.map(async (s) => {
          const lastJob = await prisma.job.findFirst({
            where: { scriptId: s.id },
            orderBy: { createdAt: "desc" },
          });

          return {
            id: s.id,
            filename: s.filename,
            lastJob: lastJob
              ? {
                  id: lastJob.id,
                  pending: lastJob.pending,
                  stdout: lastJob.stdout,
                  stderr: lastJob.stderr,
                  exitCode: lastJob.exitCode,
                  createdAt: lastJob.createdAt,
                  completedAt: lastJob.completedAt,
                }
              : null,
          };
        })
      );

      return {
        id: agent.id,
        hostname: agent.hostname,
        isonline: isOnline,
        scripts,
      };
    })
  );

  const formattedUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    machines,
  };

  return NextResponse.json({ user: formattedUser });
}
