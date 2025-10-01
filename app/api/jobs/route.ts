import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scriptId } = await req.json();

  // ✅ Find the script and its agent
  const script = await prisma.script.findUnique({
    where: { id: scriptId },
    include: { agent: true },
  });

  if (!script) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  if (!script.agent) {
    return NextResponse.json({ error: "No agent linked to this script" }, { status: 404 });
  }

  // ✅ Create job using script.agentId
  const job = await prisma.job.create({
    data: {
      agentId: script.agentId!,
      scriptId,
      userId: decoded.sub,
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
