// app/api/users/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;

  const { userId, password } = await req.json();
  const hashed = await hashPassword(password);

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin can update any user, else user can update self only
  if (decoded.role !== "admin" && decoded.sub !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return NextResponse.json({ user });
}
