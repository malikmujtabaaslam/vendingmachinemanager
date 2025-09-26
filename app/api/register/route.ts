import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { hostname, username, client_uuid } = body;

  if (!hostname || !username || !client_uuid) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  // generate one-time token
  const token = randomBytes(32).toString("hex");

  const agent = await prisma.agent.create({
    data: {
      hostname,
      username,
      clientUuid: client_uuid,
      token,
    },
  });

  return NextResponse.json({
    agent_id: agent.id,
    token: agent.token,
  });
}
