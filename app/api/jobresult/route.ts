import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agent_id, jobid, stdout, stderr, exit_code } = body;
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!agent_id || !jobid) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const agent = await prisma.agent.findUnique({ where: { id: agent_id } });
  if (!agent || agent.token !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await prisma.job.update({
    where: { id: jobid },
    data: {
      pending: false,
      stdout,
      stderr,
      exitCode: exit_code,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
