import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = decoded.sub;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      agents: {
        include: {
          scripts: { select: { id: true, filename: true } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const machines = user.agents.map((agent) => ({
    id: agent.id,
    hostname: agent.hostname,
    scripts: agent.scripts.map((s) => ({
      id: s.id,
      name: s.filename.replace(/\.[^/.]+$/, ""), // strip extension for cleaner display
    })),
  }));

  return NextResponse.json({ machines });
}
