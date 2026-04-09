import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function upgrade() {
  const phone = "9182641412";
  const phoneWithPlus = "+919182641412";
  const phoneWithPlusShort = "+9182641412";

  const result = await prisma.user.updateMany({
    where: {
      phone: { in: [phone, phoneWithPlus, phoneWithPlusShort] }
    },
    data: {
      role: "ADMIN"
    }
  });

  console.log(`Updated ${result.count} user(s) to ADMIN.`);
}

upgrade().finally(() => prisma.$disconnect());
