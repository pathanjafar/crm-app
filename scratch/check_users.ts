import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const users = await prisma.user.findMany();
  console.log("Current Users in DB:");
  console.table(users.map(u => ({ id: u.id, name: u.name, phone: u.phone, role: u.role })));
}

check().finally(() => prisma.$disconnect());
