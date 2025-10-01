import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * @openapi
 * /api/machines:
 *   get:
 *     summary: Get user's machines with available scripts
 *     description: |
 *       Returns a list of machines owned by the authenticated user, along with their available scripts.  
 *       - Each machine has an **id** and a **hostname**.  
 *       - Each machine contains a list of **scripts** (id + name) that can be executed on that machine.  
 *       - Use the `scriptId` from the response in the **Jobs API** (`POST /api/jobs`) to run a script.  
 *       
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of machines with their scripts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 machines:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier of the machine (Agent ID)
 *                         example: "cmg1nz9th0000jl04ydbxftug"
 *                       hostname:
 *                         type: string
 *                         description: Hostname of the machine
 *                         example: "agent2-vm"
 *                       scripts:
 *                         type: array
 *                         description: List of available scripts on this machine
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: Script ID
 *                               example: "cmg1p3wyz000jjy047isam87k"
 *                             name:
 *                               type: string
 *                               description: Human-readable script name
 *                               example: "101"
 *             example:
 *               machines:
 *                 - id: "cmg1nz9th0000jl04ydbxftug"
 *                   hostname: "agent2-vm"
 *                   scripts:
 *                     - id: "cmg1p3wyz000jjy047isam87k"
 *                       name: "101"
 *                     - id: "cmg1p416e000kjy04lg5iq325"
 *                       name: "203"
 *                     - id: "cmg1p49ky000ljy04mu8yy9j2"
 *                       name: "405"
 *                 - id: "cmg1mm5a80000jy041dw5n4l8"
 *                   hostname: "agent1-vm"
 *                   scripts:
 *                     - id: "cmg1mm61z0003jy04v4kuienc"
 *                       name: "102"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 */

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
