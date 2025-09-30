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

  console.time("users-api");

  // Fetch everything in one go
  const users = await prisma.user.findMany({
    include: {
      agents: {
        include: {
          scripts: true,
        },
      },
    },
  });

  // Collect all script IDs
  const allScriptIds = users.flatMap(u => u.agents.flatMap(a => a.scripts.map(s => s.id)));

  // Pre-fetch last jobs for all scripts in a single query
  const lastJobs = await prisma.job.findMany({
    where: { scriptId: { in: allScriptIds } },
    orderBy: { createdAt: "desc" },
    distinct: ["scriptId"], // Only keep the latest per script
  });

  // Index jobs by scriptId
  const lastJobsByScriptId = new Map(lastJobs.map(j => [j.scriptId, j]));

  const now = new Date();

  const formattedUsers = users.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    machines: u.agents.map(agent => ({
      id: agent.id,
      hostname: agent.hostname,
      isonline: (now.getTime() - new Date(agent.updatedAt).getTime()) / 1000 < ONLINE_INTERVAL,
      scripts: agent.scripts.map(s => ({
        id: s.id,
        filename: s.filename,
        lastJob: lastJobsByScriptId.get(s.id) || null,
      })),
    })),
  }));

  console.timeEnd("users-api");
  return NextResponse.json({ users: formattedUsers });
}


