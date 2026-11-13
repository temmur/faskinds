import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const candidateId = 'integration-smoke-candidate';
const apiUrl = process.env.API_URL || 'http://127.0.0.1:4000/api';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  assert(email && password, 'ADMIN_EMAIL and ADMIN_PASSWORD are required');

  const vacancy = await db.vacancy.findFirst();
  assert(vacancy, 'Run the database seed before the smoke test');

  await db.candidate.deleteMany({ where: { id: candidateId } });
  await db.candidate.create({
    data: {
      id: candidateId,
      fullName: 'Integration Smoke Candidate',
      language: 'ru',
      telegramId: null,
      vacancyId: vacancy.id,
      answers: []
    }
  });

  const loginResponse = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const login = await loginResponse.json() as { token?: string };
  assert(loginResponse.ok && login.token, 'Administrator login failed');

  const decisionResponse = await fetch(
    `${apiUrl}/candidates/${candidateId}/decision`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${login.token}`
      },
      body: JSON.stringify({ decision: 'APPROVED' })
    }
  );
  const decision = await decisionResponse.json() as {
    telegramSent?: boolean;
  };

  assert(decisionResponse.status === 202, 'Expected queued/failed Telegram delivery');
  assert(decision.telegramSent === false, 'Smoke candidate must not receive Telegram');

  const detailResponse = await fetch(`${apiUrl}/candidates/${candidateId}`, {
    headers: { Authorization: `Bearer ${login.token}` }
  });
  const detail = await detailResponse.json() as {
    status?: string;
    decision?: { type?: string; deliveryStatus?: string };
  };

  assert(detailResponse.ok, 'Candidate detail request failed');
  assert(detail.status === 'INVITED', 'Approved candidate status was not updated');
  assert(detail.decision?.type === 'APPROVED', 'Decision audit record is missing');
  assert(detail.decision.deliveryStatus === 'FAILED', 'Delivery failure was not recorded');

  const duplicateResponse = await fetch(
    `${apiUrl}/candidates/${candidateId}/decision`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${login.token}`
      },
      body: JSON.stringify({ decision: 'REJECTED' })
    }
  );

  assert(duplicateResponse.status === 409, 'Duplicate decision was not blocked');
  console.log('Decision smoke test passed');
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.candidate.deleteMany({ where: { id: candidateId } });
    await db.$disconnect();
  });
