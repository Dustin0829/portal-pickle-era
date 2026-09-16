import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
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

async function upsertCredentialUser(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "student";
}) {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, accounts: { where: { providerId: "credential" }, select: { id: true } } },
  });

  const userId = existing?.id ?? randomUUID();
  await prisma.user.upsert({
    where: { email },
    create: {
      id: userId,
      name: input.name,
      email,
      emailVerified: true,
      role: input.role,
    },
    update: {
      name: input.name,
      role: input.role,
      emailVerified: true,
    },
  });

  const accountId = existing?.accounts[0]?.id ?? randomUUID();
  if (existing?.accounts[0]) {
    await prisma.account.update({
      where: { id: accountId },
      data: { password: passwordHash },
    });
  } else {
    await prisma.account.create({
      data: {
        id: accountId,
        accountId: userId,
        providerId: "credential",
        userId,
        password: passwordHash,
      },
    });
  }
}

async function main() {
  await prisma.example.deleteMany();

  await prisma.example.createMany({
    data: labels.map((label) => ({ label })),
    skipDuplicates: true,
  });

  await upsertCredentialUser({ ...ADMIN_FIXTURE, role: "admin" });
  for (const player of PLAYER_FIXTURES) {
    await upsertCredentialUser({ ...player, role: "student" });
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
