const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      name: "Admin User",
      password: password,
      role: "ADMIN",
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@company.com" },
    update: {},
    create: {
      email: "agent@company.com",
      name: "Agent User",
      password: password,
      role: "AGENT",
    },
  });

  console.log({ admin, agent });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
