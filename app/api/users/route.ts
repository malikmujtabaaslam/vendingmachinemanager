import { prisma } from "@/lib/prisma";
import { hashPassword, verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

const ONLINE_INTERVAL = parseInt(process.env.ONLINE_INTERVAL || "5"); // seconds

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;
  if (!decoded || decoded.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: { email: data.email, password: hashed, role: "user" },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;
  if (!decoded || decoded.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch users with their agents and scripts/jobs
  const users = await prisma.user.findMany({
    include: {
      agents: {
        include: {
          scripts: true,
        },
      },
      jobs: true, // all jobs for this user
    },
  });

  const now = new Date();

  const formattedUsers = await Promise.all(
    users.map(async (u) => {
      const machines = await Promise.all(
        u.agents.map(async (agent) => {
          // Determine isonline
          const isOnline =
            (now.getTime() - new Date(agent.updatedAt).getTime()) / 1000 <
            ONLINE_INTERVAL;
          // For each script of this agent, get latest job
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

      return {
        id: u.id,
        email: u.email,
        role: u.role,
        machines,
      };
    })
  );
  return NextResponse.json({ users: formattedUsers });
}