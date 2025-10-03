import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email and password, return a JWT and set HttpOnly cookie.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "mypassword123"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged in"
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 role:
 *                   type: string
 *                   example: "user"
 *                 userId:
 *                   type: string
 *                   example: "abc123"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *       400:
 *         description: Invalid login credentials
 */
export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid login" }, { status: 400 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid login" }, { status: 400 });
  }

  // Include role in the token payload
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return NextResponse.json(
    {
      message: "Logged in",
      token,
      role: user.role,
      userId: user.id,
      email: user.email,
    },
    {
      status: 200,
      headers: {
        "Set-Cookie": `token=${token}; Path=/; HttpOnly; Max-Age=86400;`,
      },
    }
  );
}
