
import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { Prisma, PrismaClient } from '@prisma/client';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is missing in bot/.env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const db = new PrismaClient();

type Language = 'ru' | 'uz';

type Step = 'language' | 'vacancy' | 'name' | 'phone' | 'answers';

type Session = {
  step: Step;
  language: Language;
  vacancyId?: string;
  vacancyTitle?: string;
  name?: string;
  phone?: string;
  answers: string[];
  index: number;
};

type Evaluation = {
  score: number;
  criteria: Record<string, number>;
  strengths: string[];
  concerns: string[];
  summary: string;
};

const sessions = new Map<number, Session>();

const questions: Record<Language, string[]> = {
  ru: [
    'Расскажите кратко о себе.',
    'Почему вы хотите работать именно в компании FasKids?',
    'Есть ли у вас опыт работы в продажах или с клиентами?',
    'На что вы обращаете внимание при общении с клиентами?',
    'Как вы поступите, если клиент останется недоволен товаром?',
    'Как вы организуете работу, если одновременно обращаются несколько клиентов?',
    'Что для вас самое важное в обслуживании клиентов?',
    'Умеете ли вы пользоваться Telegram, Instagram и другими социальными сетями?',
    'Какие у вас навыки работы с компьютером и офисными программами?',
    'Что вы сделаете, если заметите, что неправильно оформили заказ клиента?',
    'Как вы реагируете на стрессовые ситуации во время работы?',
    'Насколько комфортно вам работать в команде?',
    'Сможете ли вы соблюдать рабочий график и выполнять поставленные задачи?',
    'Готовы ли вы обучаться новым знаниям и навыкам?',
    'Почему мы должны принять именно вас в команду FasKids?',
    'Когда вы готовы приступить к работе?'
  ],
  uz: [
    'O‘zingiz haqingizda qisqacha ma’lumot bering.',
    'Nima uchun aynan FasKids kompaniyasida ishlamoqchisiz?',
    'Oldin savdo yoki mijozlar bilan ishlash tajribangiz bo‘lganmi?',
    'Mijozlar bilan muloqot qilishda nimalarga e’tibor berasiz?',
    'Agar mijoz mahsulotdan norozi bo‘lsa, qanday yo‘l tutasiz?',
    'Bir vaqtning o‘zida bir nechta mijoz murojaat qilsa, ishni qanday tashkil qilasiz?',
    'Siz uchun mijozlarga xizmat ko‘rsatishda eng muhim narsa nima?',
    'Telegram, Instagram va boshqa ijtimoiy tarmoqlardan foydalana olasizmi?',
    'Kompyuter va ofis dasturlari bilan ishlash ko‘nikmalaringiz qanday?',
    'Agar mijoz buyurtmasini noto‘g‘ri rasmiylashtirganingizni sezsangiz, nima qilasiz?',
    'Ish jarayonida stressli vaziyatlarga qanday munosabat bildirasiz?',
    'Jamoa bilan ishlash siz uchun qanchalik qulay?',
    'Ish vaqtiga rioya qilish va belgilangan vazifalarni bajarishga tayyormisiz?',
    'Yangi bilim va ko‘nikmalarni o‘rganishga tayyormisiz?',
    'Nima uchun aynan sizni FasKids jamoasiga qabul qilishimiz kerak?',
    'Qachondan boshlab ish faoliyatingizni boshlashingiz mumkin?'
  ]
};

const translations = {
  ru: {
    welcome: 'Добро пожаловать в FasKids! 👋\n\nМы рады, что вы хотите стать частью нашей команды.\n\nСначала выберите язык:',
    language: 'Выберите язык:',
    chooseVacancy: 'Выберите вакансию, на которую хотите подать заявку:',
    noVacancies: 'Сейчас открытых вакансий нет. Попробуйте позже.',
    name: 'Введите ваше имя и фамилию:',
    phone: 'Отправьте свой номер телефона кнопкой ниже или введите его вручную.',
    sharePhone: '📱 Отправить номер телефона',
    invalidPhone: 'Пожалуйста, отправьте номер телефона или введите его текстом.',
    firstQuestion: 'Теперь ответьте на несколько вопросов.',
    question: 'Вопрос',
    of: 'из',
    answerText: 'Пожалуйста, отправьте ответ текстовым сообщением.',
    submitted: '✅ Ваша заявка успешно отправлена!\n\nНаша HR-команда рассмотрит её и свяжется с вами, если ваш профиль подойдёт для вакансии.\n\nСпасибо, что выбрали FasKids! ❤️',
    evaluating: 'Спасибо! Все ответы получены. Оцениваем вашу анкету...',
    error: 'Произошла ошибка. Пожалуйста, попробуйте снова, отправив /start.',
    vacancyUnavailable: 'Эта вакансия больше недоступна. Отправьте /start.',
    adminTitle: '⭐ Новая рекомендация для HR',
    adminName: 'Имя',
    adminPosition: 'Вакансия',
    adminScore: 'Оценка AI',
    adminReview: 'Пожалуйста, проверьте полную анкету в Admin Panel.',
    aiUnavailable: 'AI-анализ недоступен. Требуется ручная проверка HR.'
  },
  uz: {
    welcome: 'FasKids kompaniyasiga xush kelibsiz! 👋\n\nJamoamizga qo‘shilishni xohlayotganingizdan xursandmiz.\n\nAvval tilni tanlang:',
    language: 'Tilni tanlang:',
    chooseVacancy: 'Ariza topshirmoqchi bo‘lgan lavozimingizni tanlang:',
    noVacancies: 'Hozirda ochiq ish o‘rinlari mavjud emas. Keyinroq urinib ko‘ring.',
    name: 'Ism va familiyangizni kiriting:',
    phone: 'Quyidagi tugma orqali telefon raqamingizni yuboring yoki uni matn shaklida kiriting.',
    sharePhone: '📱 Telefon raqamni yuborish',
    invalidPhone: 'Iltimos, telefon raqamingizni yuboring yoki matn shaklida kiriting.',
    firstQuestion: 'Endi bir nechta savolga javob bering.',
    question: 'Savol',
    of: 'dan',
    answerText: 'Iltimos, javobingizni matn shaklida yuboring.',
    submitted: '✅ Arizangiz muvaffaqiyatli yuborildi!\n\nHR jamoamiz arizangizni ko‘rib chiqadi va lavozimga mos kelsangiz siz bilan bog‘lanadi.\n\nFasKids kompaniyasini tanlaganingiz uchun rahmat! ❤️',
    evaluating: 'Rahmat! Barcha javoblaringiz qabul qilindi. Arizangiz baholanmoqda...',
    error: 'Xatolik yuz berdi. Iltimos, /start buyrug‘ini yuborib qayta urinib ko‘ring.',
    vacancyUnavailable: 'Bu ish o‘rni endi mavjud emas. /start buyrug‘ini yuboring.',
    adminTitle: '⭐ HR uchun yangi tavsiya',
    adminName: 'Ism',
    adminPosition: 'Lavozim',
    adminScore: 'AI bahosi',
    adminReview: 'Iltimos, to‘liq arizani Admin Panel orqali ko‘rib chiqing.',
    aiUnavailable: 'AI tahlili mavjud emas. HR tomonidan qo‘lda tekshirish kerak.'
  }
};

const vacancyNames: Record<string, Record<Language, string>> = {
  'Продавец-консультант': {
    ru: 'Продавец-консультант',
    uz: 'Savdo maslahatchisi'
  },
  'Кассир': {
    ru: 'Кассир',
    uz: 'Kassir'
  },
  'Администратор магазина': {
    ru: 'Администратор магазина',
    uz: 'Do‘kon administratori'
  },
  'Менеджер по продажам': {
    ru: 'Менеджер по продажам',
    uz: 'Savdo menejeri'
  },
  'SMM-специалист': {
    ru: 'SMM-специалист',
    uz: 'SMM mutaxassisi'
  },
  'Сотрудник склада': {
    ru: 'Сотрудник склада',
    uz: 'Ombor xodimi'
  },
  'Оператор онлайн-заказов': {
    ru: 'Оператор онлайн-заказов',
    uz: 'Onlayn buyurtmalar operatori'
  },
  'Помощник менеджера': {
    ru: 'Помощник менеджера',
    uz: 'Menejer yordamchisi'
  }
};

function getVacancyTitle(title: string, language: Language): string {
  return vacancyNames[title]?.[language] || title;
}

function getQuestions(language: Language): string[] {
  return questions[language];
}

async function evaluateCandidate(
  language: Language,
  answers: string[]
): Promise<Evaluation> {
  const key = process.env.OPENAI_API_KEY;

  const fallback: Evaluation = {
    score: 0,
    criteria: {},
    strengths: [],
    concerns: ['AI analysis unavailable. Manual HR review required.'],
    summary: translations[language].aiUnavailable
  };

  if (!key) {
    console.warn('OPENAI_API_KEY is not configured.');
    return fallback;
  }

  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `
You are an assistant supporting fair, job-related screening
for a children's clothing store.

Evaluate only job-related evidence in the candidate's answers.

Do not evaluate age, gender, ethnicity, disability, appearance,
religion, family status, or other protected or irrelevant traits.

Evaluate these five criteria:
1. Communication: 0-20
2. Responsibility: 0-20
3. Problem solving: 0-20
4. Understanding of customer service and the role: 0-20
5. Motivation and willingness to learn: 0-20

The total score must be an integer from 0 to 100.
Use the same standards for every candidate.
Do not penalize a candidate merely for having no previous work experience.
Do not infer skills that are not supported by the answers.
Do not make a hiring decision. Human HR review is always required.

Return valid JSON:
{
  "score": 0,
  "criteria": {
    "communication": 0,
    "responsibility": 0,
    "problemSolving": 0,
    "roleUnderstanding": 0,
    "motivation": 0
  },
  "strengths": [],
  "concerns": [],
  "summary": ""
}
              `
            },
            {
              role: 'user',
              content: JSON.stringify({
                language,
                answers: getQuestions(language).map((question, index) => ({
                  question,
                  answer: answers[index] || ''
                }))
              })
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty AI response');
    }

    const result = JSON.parse(content);
    const criteria = result.criteria || {};

    return {
      score: Math.max(
        0,
        Math.min(100, Math.round(Number(result.score) || 0))
      ),
      criteria,
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      concerns: Array.isArray(result.concerns) ? result.concerns : [],
      summary: String(result.summary || 'No summary available')
    };
  } catch (error) {
    console.error('AI evaluation error:', error);
    return fallback;
  }
}

async function showVacancies(chatId: number, language: Language) {
  const t = translations[language];

  const vacancies = await db.vacancy.findMany({
    where: { active: true },
    orderBy: { title: 'asc' }
  });

  if (vacancies.length === 0) {
    await bot.sendMessage(chatId, t.noVacancies);
    return;
  }

  const keyboard = vacancies.map((vacancy) => [{
    text: getVacancyTitle(vacancy.title, language),
    callback_data: `vac:${vacancy.id}`
  }]);

  sessions.set(chatId, {
    step: 'vacancy',
    language,
    answers: [],
    index: 0
  });

  await bot.sendMessage(chatId, t.chooseVacancy, {
    reply_markup: { inline_keyboard: keyboard }
  });
}

async function start(chatId: number) {
  sessions.set(chatId, {
    step: 'language',
    language: 'ru',
    answers: [],
    index: 0
  });

  await bot.sendMessage(chatId, translations.ru.welcome, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🇷🇺 Русский', callback_data: 'lang:ru' },
          { text: '🇺🇿 O‘zbekcha', callback_data: 'lang:uz' }
        ]
      ]
    }
  });
}

async function sendQuestion(chatId: number, session: Session) {
  const t = translations[session.language];
  const list = getQuestions(session.language);
  const question = list[session.index];

  await bot.sendMessage(
    chatId,
    `${t.question} ${session.index + 1} ${t.of} ${list.length}:\n\n${question}`
  );
}

async function finish(chatId: number, session: Session) {
  const t = translations[session.language];

  await bot.sendMessage(chatId, t.evaluating);

  const evaluation = await evaluateCandidate(
    session.language,
    session.answers
  );

  if (!session.vacancyId || !session.vacancyTitle) {
    throw new Error('Vacancy information is missing');
  }

  const candidate = await db.candidate.create({
    data: {
      telegramId: String(chatId),
      fullName: session.name || 'Unknown',
      phone: session.phone,

      // Сохраняем язык анкеты в базе данных.
      language: session.language,

      experience: session.answers[2] || '',
      availability: session.answers[15] || '',
      answers: getQuestions(session.language).map((question, index) => ({
        question,
        answer: session.answers[index] || ''
      })) as Prisma.InputJsonValue,
      aiScore: evaluation.score,
      criteria: evaluation.criteria as Prisma.InputJsonValue,
      strengths: evaluation.strengths as Prisma.InputJsonValue,
      concerns: evaluation.concerns as Prisma.InputJsonValue,
      aiSummary: evaluation.summary,
      status: evaluation.score >= 70 ? 'QUALIFIED' : 'PENDING_REVIEW',
      vacancyId: session.vacancyId
    }
  });

  await db.activity.create({
    data: {
      candidateId: candidate.id,
      action: 'APPLICATION_RECEIVED',
      details: `Application submitted through Telegram. Language: ${session.language}`,
      actor: 'Telegram Bot'
    }
  });

  await db.notification.create({
    data: {
      title: evaluation.score >= 70
        ? 'Candidate recommended for HR review'
        : 'New application received',
      message:
        `${candidate.fullName} applied for ${session.vacancyTitle}. ` +
        `AI score: ${evaluation.score}/100. Candidate ID: ${candidate.id}`
    }
  });

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  // Ошибка уведомления администратора не должна мешать
  // сохранению заявки и подтверждению кандидату.
  if (adminChatId && evaluation.score >= 70) {
    try {
      await bot.sendMessage(
        adminChatId,
        `${t.adminTitle}\n\n` +
        `${t.adminName}: ${candidate.fullName}\n` +
        `${t.adminPosition}: ${session.vacancyTitle}\n` +
        `${t.adminScore}: ${evaluation.score}/100\n\n` +
        `${evaluation.summary}\n\n` +
        `${t.adminReview}\n` +
        `Candidate ID: ${candidate.id}`
      );
    } catch (error) {
      console.error('Admin notification error:', error);
    }
  }

  await bot.sendMessage(chatId, t.submitted, {
    reply_markup: { remove_keyboard: true }
  });

  sessions.delete(chatId);
}

bot.onText(/^\/start(?:@\w+)?$/i, async (msg) => {
  try {
    await start(msg.chat.id);
  } catch (error) {
    console.error('Start error:', error);

    await bot.sendMessage(
      msg.chat.id,
      'An error occurred. Please try again later.'
    );
  }
});

bot.on('callback_query', async (query) => {
  if (!query.message || !query.data) return;

  const chatId = query.message.chat.id;

  try {
    await bot.answerCallbackQuery(query.id);

    if (query.data.startsWith('lang:')) {
      const language = query.data.slice(5) as Language;

      if (language !== 'ru' && language !== 'uz') return;

      await showVacancies(chatId, language);
      return;
    }

    if (query.data.startsWith('vac:')) {
      const current = sessions.get(chatId);

      if (!current || current.step !== 'vacancy') {
        await bot.sendMessage(chatId, 'Please send /start first.');
        return;
      }

      const vacancyId = query.data.slice(4);

      const vacancy = await db.vacancy.findFirst({
        where: {
          id: vacancyId,
          active: true
        }
      });

      if (!vacancy) {
        await bot.sendMessage(
          chatId,
          translations[current.language].vacancyUnavailable
        );
        return;
      }

      const session: Session = {
        step: 'name',
        language: current.language,
        vacancyId: vacancy.id,
        vacancyTitle: getVacancyTitle(vacancy.title, current.language),
        answers: [],
        index: 0
      };

      sessions.set(chatId, session);

      await bot.sendMessage(
        chatId,
        `${translations[session.language].name}\n\n` +
        `Vacancy: ${session.vacancyTitle}`
      );
    }
  } catch (error) {
    console.error('Callback error:', error);

    await bot.sendMessage(
      chatId,
      'Something went wrong. Please try /start.'
    );
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim() || '';

  if (text.startsWith('/')) return;

  const session = sessions.get(chatId);

  if (!session) return;

  if (session.step === 'language' || session.step === 'vacancy') {
    return;
  }

  try {
    if (session.step === 'name') {
      if (!text) {
        await bot.sendMessage(
          chatId,
          translations[session.language].name
        );
        return;
      }

      session.name = text;
      session.step = 'phone';

      await bot.sendMessage(
        chatId,
        translations[session.language].phone,
        {
          reply_markup: {
            keyboard: [[{
              text: translations[session.language].sharePhone,
              request_contact: true
            }]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        }
      );

      return;
    }

    if (session.step === 'phone') {
      const phone = msg.contact?.phone_number || text;

      if (!phone) {
        await bot.sendMessage(
          chatId,
          translations[session.language].invalidPhone
        );
        return;
      }

      session.phone = phone;
      session.step = 'answers';
      session.index = 0;

      await bot.sendMessage(
        chatId,
        translations[session.language].firstQuestion,
        {
          reply_markup: { remove_keyboard: true }
        }
      );

      await sendQuestion(chatId, session);
      return;
    }

    if (session.step === 'answers') {
      if (!text) {
        await bot.sendMessage(
          chatId,
          translations[session.language].answerText
        );
        return;
      }

      session.answers[session.index] = text;
      session.index++;

      if (session.index < getQuestions(session.language).length) {
        await sendQuestion(chatId, session);
      } else {
        await finish(chatId, session);
      }
    }
  } catch (error) {
    console.error('Message handling error:', error);

    await bot.sendMessage(
      chatId,
      translations[session.language].error,
      { reply_markup: { remove_keyboard: true } }
    );

    sessions.delete(chatId);
  }
});

bot.on('polling_error', (error) => {
  console.error('Telegram polling error:', error.message);
});

console.log('FasKids Telegram Bot is running!');

process.on('SIGINT', async () => {
  await bot.stopPolling();
  await db.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await bot.stopPolling();
  await db.$disconnect();
  process.exit(0);
});
