import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';

const db = new PrismaClient();

const credentials = z.object({
  email: z.string().email().transform(value => value.trim().toLowerCase()),
  password: z.string()
    .min(12, 'ADMIN_PASSWORD must contain at least 12 characters')
    .regex(/[a-z]/, 'ADMIN_PASSWORD must contain a lowercase letter')
    .regex(/[A-Z]/, 'ADMIN_PASSWORD must contain an uppercase letter')
    .regex(/[0-9]/, 'ADMIN_PASSWORD must contain a number'),
  name: z.string().trim().min(2).max(100)
}).parse({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  name: process.env.ADMIN_NAME || 'FasKids Administrator'
});

async function main() {
  const passwordHash = await bcrypt.hash(credentials.password, 12);

  const admin = await db.admin.upsert({
    where: { email: credentials.email },
    update: {
      passwordHash,
      name: credentials.name,
      role: Role.SUPER_ADMIN
    },
    create: {
      email: credentials.email,
      passwordHash,
      name: credentials.name,
      role: Role.SUPER_ADMIN
    }
  });

  console.log(`Administrator access reset for ${admin.email}`);
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
