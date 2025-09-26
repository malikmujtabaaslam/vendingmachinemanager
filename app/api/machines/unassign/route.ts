import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;

  if (!decoded || decoded.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId } = await req.json();

  // Optional: verify that the agent actually belongs to the user before unassigning
  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: { ownerId: null }, // remove assignment
  });

  return NextResponse.json({ agent });
}
