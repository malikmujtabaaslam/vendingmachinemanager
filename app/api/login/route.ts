import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Invalid login" }, { status: 400 });

  const valid = await verifyPassword(password, user.password);
  if (!valid) return NextResponse.json({ error: "Invalid login" }, { status: 400 });
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
    { message: "Logged in", token, role: user.role, userId: user.id, email: user.email },
    {
      status: 200,
      headers: {
        "Set-Cookie": `token=${token}; Path=/; HttpOnly; Max-Age=86400;`,
      },
    }
  );
}
