import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- PURGING ALL DATA (Clean Slate) ---');
  
  // High-level wipe (Order matters due to relations)
  await prisma.auditLog.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.call.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.pricingTier.deleteMany();
  await prisma.product.deleteMany();

  console.log('--- ALL DATA REMOVED SUCCESSFULLY ---');
  
  // Optionally create 1 Admin agent so the system isn't "broken" for listing
  await prisma.agent.create({
    data: {
      name: 'System Admin',
      email: 'admin@salesanalytics.com',
      role: 'ADMIN',
    }
  });

  console.log('--- Base Admin Created ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
