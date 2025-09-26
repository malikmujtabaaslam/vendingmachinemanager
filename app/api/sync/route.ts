import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ----------------- Helper Functions -----------------

// Validate agent and token
async function getAgent(agent_id: string, token?: string) {
  const agent = await prisma.agent.findUnique({ where: { id: agent_id } });
  if (!agent || agent.token !== token) {
    throw new Error("Unauthorized");
  }
  return agent;
}

// Fetch current scripts for agent
async function getCurrentScripts(agent_id: string) {
  return prisma.script.findMany({ where: { agentId: agent_id } });
}

// Sync scripts: add missing, remove extra, update timestamps
async function syncScripts(agent_id: string, incomingScripts: string[]) {
  const currentScripts = await getCurrentScripts(agent_id);
  const currentScriptNames = currentScripts.map((s) => s.filename);

  // Scripts to add
  const scriptsToAdd = incomingScripts.filter((s) => !currentScriptNames.includes(s));
  if (scriptsToAdd.length > 0) {
    await prisma.script.createMany({
      data: scriptsToAdd.map((filename) => ({
        filename,
        agentId: agent_id,
      })),
    });
  }

  // Scripts to remove
  const scriptsToRemove = currentScripts.filter((s) => !incomingScripts.includes(s.filename));
  if (scriptsToRemove.length > 0) {
    await prisma.script.deleteMany({
      where: { id: { in: scriptsToRemove.map((s) => s.id) } },
    });
  }

  // Update agent's last updated timestamp
  await prisma.agent.update({
    where: { id: agent_id },
    data: { updatedAt: new Date() },
  });
}

// Fetch pending jobs for agent
async function getPendingJobs(agent_id: string) {
  return prisma.job.findMany({
    where: { agentId: agent_id, pending: true },
    orderBy: { createdAt: "asc" },
    take: 1, // one job at a time
    include: {
      script: { select: { id: true, filename: true } }, // ✅ include script name
    },
  });
}

// ----------------- API Route -----------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_id, scripts } = body;
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    console.log("Sync request from agent:", body);

    if (!agent_id || !scripts || !Array.isArray(scripts)) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    // Validate agent & token
    await getAgent(agent_id, token);

    // Sync scripts
    await syncScripts(agent_id, scripts);

    // Return pending jobs
    const jobs = await getPendingJobs(agent_id);
    console.log(`Returning ${jobs.length} pending jobs to agent ${JSON.stringify(jobs)}`);
    return NextResponse.json({ success: true, jobs });
  } catch (err: any) {
    console.error("Error syncing scripts:", err.message || err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
