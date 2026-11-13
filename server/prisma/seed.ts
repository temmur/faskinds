import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const db = new PrismaClient();

async function main() {
  const credentials = z.object({
    email: z.string().email().transform(value => value.trim().toLowerCase()),
    password: z.string().min(12)
  }).parse({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  });

  const { email, password } = credentials;

  const passwordHash = await bcrypt.hash(password, 12);

  await db.admin.upsert({
    where: { email },
    update: {
      passwordHash,
      name: 'FasKids Administrator',
      role: 'SUPER_ADMIN',
    },
    create: {
      email,
      name: 'FasKids Administrator',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  const count = await db.vacancy.count();

  if (!count) {
    await db.vacancy.createMany({
      data: [
        {
          title: 'Sales Assistant',
          description: 'Help customers choose children’s clothing and maintain the sales floor.',
          requirements: 'Friendly communication, responsibility, punctuality.',
          schedule: 'Full-time / shifts',
          questions: [
            'Tell us about yourself.',
            'How would you help a parent choosing a size?',
            'What does good customer service mean to you?',
          ],
        },
        {
          title: 'Cashier',
          description: 'Process purchases and support customers at checkout.',
          requirements: 'Accuracy, honesty, basic numeracy.',
          schedule: 'Shift work',
          questions: [
            'Describe your experience with payments.',
            'How do you handle a busy queue?',
          ],
        },
        {
          title: 'Warehouse Assistant',
          description: 'Receive, organize and prepare stock.',
          requirements: 'Attention to detail and reliability.',
          schedule: 'Full-time',
          questions: [
            'How do you keep items organized?',
            'How do you prevent picking mistakes?',
          ],
        },
      ],
    });
  }

  await db.setting.upsert({
    where: { key: 'qualificationThreshold' },
    update: {},
    create: { key: 'qualificationThreshold', value: '70' },
  });

  await db.setting.upsert({
    where: { key: 'storeName' },
    update: {},
    create: { key: 'storeName', value: 'FSAKids' },
  });

  console.log(`Seed complete. Admin: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
