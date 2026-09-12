import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const labels = [
  "First example",
  "Launch checklist",
  "Admin dashboard",
  "Customer import",
  "Billing workflow",
  "Webhook listener",
  "AI processing job",
  "Content moderation",
  "Feature flag rollout",
  "Audit log review",
];

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.example.deleteMany();

  await prisma.example.createMany({
    data: labels.map((label) => ({ label })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
