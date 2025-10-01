import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId, scriptId } = await req.json();
  console.log("Creating job for agent:", agentId, "scriptId:", scriptId);

  // Verify agent exists
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) {
    return NextResponse.json({ error: "No agent" }, { status: 404 });
  }

  // Create the job (pending defaults to true)
  const job = await prisma.job.create({
    data: {
      agentId,
      scriptId,
      userId: decoded.sub,
      // pending: true,  // ✅ not needed, default handles it
    },
  });

  return NextResponse.json(job, { status: 201 });
}


export async function GET(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (decoded.role === "admin") {
    const jobs = await prisma.job.findMany({
      include: { agent: true, user: true, script: true },
      orderBy: { createdAt: "desc" }, // ✅ reverse order
    });
    return NextResponse.json(jobs);
  } else {
    const jobs = await prisma.job.findMany({
      where: { userId: decoded.sub },
      include: { agent: true, script: true },
      orderBy: { createdAt: "desc" }, // ✅ reverse order
    });
    return NextResponse.json(jobs);
  }
}
