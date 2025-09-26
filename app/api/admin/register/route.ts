import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const adminExists = await prisma.user.findFirst({ where: { role: "admin" } });
  if (adminExists) {
    return NextResponse.json({ error: "Admin already registered" }, { status: 400 });
  }

  const hashed = await hashPassword(data.password);
  const admin = await prisma.user.create({
    data: { email: data.email, password: hashed, role: "admin" },
  });

  const token = signToken({ id: admin.id, role: admin.role });
  return NextResponse.json({ token });
}
