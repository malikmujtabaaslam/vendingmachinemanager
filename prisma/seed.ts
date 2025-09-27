import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Check if any user exists
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash("admin", 10);

    await prisma.user.create({
      data: {
        email: "admin@vmm.com",
        password: hashedPassword,
        role: "admin", // adjust if your schema has `role`
      },
    });

    console.log("✅ Default admin user created: admin@vmm.com / admin");
  } else {
    console.log("ℹ️ Users already exist, skipping admin seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
