import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/modules/auth/auth.crypto.js";

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

/** Local demo accounts — match former SPA fixtures (password: password1). */
const ADMIN_FIXTURE = {
  name: "Facility Admin",
  email: "admin@pickleera.local",
  password: "password1",
} as const;

const PLAYER_FIXTURES = [
  {
    name: "Demo Player",
    email: "player@pickleera.local",
    password: "password1",
  },
  {
    name: "Maya Santos",
    email: "maya.santos@example.com",
    password: "password1",
  },
] as const;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function upsertUser(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "student";
}) {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  await prisma.user.upsert({
    where: { email },
    create: {
      name: input.name,
      email,
      passwordHash,
      role: input.role,
    },
    update: {
      name: input.name,
      passwordHash,
      role: input.role,
    },
  });
}

async function main() {
  await prisma.example.deleteMany();

  await prisma.example.createMany({
    data: labels.map((label) => ({ label })),
  });

  await upsertUser({ ...ADMIN_FIXTURE, role: "admin" });
  for (const player of PLAYER_FIXTURES) {
    await upsertUser({ ...player, role: "student" });
  }
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
