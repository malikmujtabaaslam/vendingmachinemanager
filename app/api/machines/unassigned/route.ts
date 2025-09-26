import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;

  if (!decoded || decoded.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unassignedAgents = await prisma.agent.findMany({
    where: { ownerId: null },
    select: { id: true, hostname: true },
  });

  return NextResponse.json({ agents: unassignedAgents });
}
