import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";


/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a job by ID
 *     description: |
 *       Fetch detailed information about a specific job by ID.  
 *       - **Admins** can access all jobs.  
 *       - **Normal users** can only access jobs they own.  
 *       Useful for checking execution results of a script on a machine.
 *     tags:
 *       - Jobs
 *     operationId: getJobById
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the job
 *         example: 42
 *     responses:
 *       200:
 *         description: Job details successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *             examples:
 *               success:
 *                 summary: Example successful job
 *                 value:
 *                   id: 42
 *                   machine: "ubuntu-server-01"
 *                   script: "24-reboot.sh"
 *                   pending: false
 *                   stdout: "Rebooting..."
 *                   stderr: null
 *                   exitCode: 0
 *                   createdAt: "2025-09-30T12:34:56.789Z"
 *                   completedAt: "2025-09-30T12:35:10.123Z"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *               message: "Authentication token is missing or invalid"
 *       403:
 *         description: Forbidden (user tried to access a job they do not own)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Forbidden"
 *               message: "You do not have permission to access this job"
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Not Found"
 *               message: "Job with ID 42 was not found"
 *
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier of the job
 *           example: 42
 *         machine:
 *           type: string
 *           description: Hostname of the machine where the job is executed
 *           example: "ubuntu-server-01"
 *         script:
 *           type: string
 *           description: Name of the executed script file
 *           example: "24-reboot.sh"
 *         pending:
 *           type: boolean
 *           description: Indicates if the job is still running
 *           example: false
 *         stdout:
 *           type: string
 *           description: Standard output logs from the script execution
 *           example: "Rebooting..."
 *         stderr:
 *           type: string
 *           description: Error output logs (if any) from the script execution
 *           example: null
 *         exitCode:
 *           type: integer
 *           description: Script exit code (0 means success)
 *           example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Time when the job was created
 *           example: "2025-09-30T12:34:56.789Z"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Time when the job finished (null if still pending)
 *           example: "2025-09-30T12:35:10.123Z"
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error type
 *           example: "Unauthorized"
 *         message:
 *           type: string
 *           description: Detailed error message
 *           example: "Authentication token is missing or invalid"
 */

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;   // ✅ await params

  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobId = Number(id);
  if (isNaN(jobId)) {
    return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { agent: true, script: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (decoded.role !== "admin" && job.userId !== decoded.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: job.id,
    machine: job.agent?.hostname,
    script: job.script?.filename,
    pending: job.pending,
    stdout: job.stdout,
    stderr: job.stderr,
    exitCode: job.exitCode,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  });
}