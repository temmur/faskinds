
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const vacancies = [
  {
    title: 'Продавец-консультант',
    description: 'Консультирование покупателей и помощь в выборе детской одежды.',
    requirements: 'Коммуникабельность, ответственность, вежливость.',
    schedule: 'Full-time'
  },
  {
    title: 'Кассир',
    description: 'Работа с кассой и оформление покупок.',
    requirements: 'Внимательность, честность, ответственность.',
    schedule: 'Full-time'
  },
  {
    title: 'Администратор магазина',
    description: 'Организация ежедневной работы магазина.',
    requirements: 'Организованность, коммуникация, ответственность.',
    schedule: 'Full-time'
  },
  {
    title: 'Менеджер по продажам',
    description: 'Работа с покупателями и увеличение продаж.',
    requirements: 'Навыки общения, работа с клиентами.',
    schedule: 'Full-time'
  },
  {
    title: 'SMM-специалист',
    description: 'Подготовка контента и ведение социальных сетей.',
    requirements: 'Навыки работы с социальными сетями и контентом.',
    schedule: 'Flexible'
  },
  {
    title: 'Сотрудник склада',
    description: 'Приём, проверка и организация хранения товаров.',
    requirements: 'Внимательность, аккуратность, ответственность.',
    schedule: 'Full-time'
  },
  {
    title: 'Оператор онлайн-заказов',
    description: 'Обработка заказов, поступающих через интернет.',
    requirements: 'Грамотное общение, внимательность, базовые навыки ПК.',
    schedule: 'Full-time'
  },
  {
    title: 'Помощник менеджера',
    description: 'Помощь менеджеру в текущих организационных задачах.',
    requirements: 'Организованность, коммуникабельность, желание учиться.',
    schedule: 'Full-time'
  }
];

async function main() {
  for (const vacancy of vacancies) {
    const existing = await db.vacancy.findFirst({
      where: { title: vacancy.title }
    });

    if (existing) {
      await db.vacancy.update({
        where: { id: existing.id },
        data: {
          ...vacancy,
          active: true
        }
      });

      console.log(`Updated: ${vacancy.title}`);
    } else {
      await db.vacancy.create({
        data: {
          ...vacancy,
          active: true,
          questions: {
            ru: [],
            uz: []
          }
        }
      });

      console.log(`Created: ${vacancy.title}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
