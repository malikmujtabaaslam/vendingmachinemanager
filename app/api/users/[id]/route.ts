// app/api/users/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: any) {
  // get id safely
  const userId = context.params?.id as string;
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = auth ? verifyToken(auth) : null;

  if (!decoded || decoded.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  try {
    // Remove ownership of all agents assigned to this user first
    await prisma.agent.updateMany({
      where: { ownerId: userId },
      data: { ownerId: null },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
