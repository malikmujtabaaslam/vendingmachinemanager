import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * @openapi
 * /api/jobs:
 *   post:
 *     summary: Run a script on its associated machine
 *     description: |
 *       Create a job to run a specific script on its associated agent.
 *       - Users can only run scripts on agents they own.
 *       - Admins can run scripts on any agent.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scriptId
 *             properties:
 *               scriptId:
 *                 type: string
 *                 description: The unique identifier of the script to run
 *                 example: "cmg1p3wyz000jjy047isam87k"
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *             example:
 *               id: 31
 *               scriptId: "cmg1p3wyz000jjy047isam87k"
 *               pending: true
 *               stdout: null
 *               stderr: null
 *               exitCode: null
 *               createdAt: "2025-10-01T12:14:06.610Z"
 *               completedAt: null
 *               agentId: "cmg1nz9th0000jl04ydbxftug"
 *               userId: "cmg1l10c70000l204ju3z3ghc"
 *       401:
 *         description: Unauthorized (missing/invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *               message: "Authentication token is missing or invalid"
 *       404:
 *         description: Script or Agent not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               scriptNotFound:
 *                 value:
 *                   error: "Not Found"
 *                   message: "Script not found"
 *               agentNotFound:
 *                 value:
 *                   error: "Not Found"
 *                   message: "No agent linked to this script"
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scriptId } = await req.json();

  // ✅ Find the script and its agent + owner
  const script = await prisma.script.findUnique({
    where: { id: scriptId },
    include: {
      agent: true,
    },
  });

  if (!script) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  if (!script.agent) {
    return NextResponse.json({ error: "No agent linked to this script" }, { status: 404 });
  }

  // ✅ Ensure the authenticated user owns the agent (or allow admins)
  if (decoded.role !== "admin" && script.agent.ownerId !== decoded.sub) {
    return NextResponse.json({ error: "Forbidden: Not your agent" }, { status: 403 });
  }

  // ✅ Create job
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
