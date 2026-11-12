
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  PrismaClient,
  Role,
  CandidateStatus
} from '@prisma/client';
import { z } from 'zod';

const db = new PrismaClient();
const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}));

app.use(express.json({ limit: '1mb' }));

const secret =
  process.env.JWT_SECRET ||
  'dev-only-change-this-secret-before-deploying';

type AuthReq = Request & {
  user?: {
    id: string;
    role: Role;
    email: string;
  };
};

function auth(
  req: AuthReq,
  res: Response,
  next: NextFunction
) {
  const h = req.headers.authorization;

  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  try {
    req.user = jwt.verify(
      h.slice(7),
      secret
    ) as AuthReq['user'];

    next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
}

function roles(...allowed: Role[]) {
  return (
    req: AuthReq,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      });
    }

    next();
  };
}

const writeRoles = [
  Role.SUPER_ADMIN,
  Role.HR_MANAGER
];

// --------------------------------------------------
// CANDIDATE ANSWERS NORMALIZATION
// --------------------------------------------------

function getQuestionText(question: unknown): string {
  if (typeof question === 'string') {
    return question;
  }

  if (
    question &&
    typeof question === 'object' &&
    !Array.isArray(question)
  ) {
    const item = question as Record<string, unknown>;

    return String(
      item.question ??
      item.text ??
      item.title ??
      ''
    );
  }

  return '';
}

function getAnswerText(answer: unknown): string {
  if (answer === null || answer === undefined) {
    return '';
  }

  if (typeof answer === 'string') {
    return answer;
  }

  if (
    typeof answer === 'number' ||
    typeof answer === 'boolean'
  ) {
    return String(answer);
  }

  if (Array.isArray(answer)) {
    return answer
      .map(item => getAnswerText(item))
      .filter(Boolean)
      .join(', ');
  }

  if (typeof answer === 'object') {
    const item = answer as Record<string, unknown>;

    const value =
      item.answer ??
      item.answerText ??
      item.value ??
      item.text;

    if (value !== undefined) {
      return getAnswerText(value);
    }

    return JSON.stringify(answer);
  }

  return String(answer);
}

function normalizeAnswers(
  rawAnswers: unknown,
  rawQuestions: unknown
) {
  const questions = Array.isArray(rawQuestions)
    ? rawQuestions.map(getQuestionText)
    : [];

  let answers: unknown = rawAnswers;

  if (
    answers &&
    typeof answers === 'object' &&
    !Array.isArray(answers) &&
    'answers' in answers
  ) {
    answers = (answers as Record<string, unknown>).answers;
  }

  if (Array.isArray(answers)) {
    return answers.map((item, index) => {
      if (
        item &&
        typeof item === 'object' &&
        !Array.isArray(item)
      ) {
        const answerItem =
          item as Record<string, unknown>;

        const question =
          answerItem.question ??
          answerItem.questionText ??
          answerItem.textQuestion ??
          questions[index] ??
          `Question ${index + 1}`;

        const answer =
          answerItem.answer ??
          answerItem.answerText ??
          answerItem.value ??
          answerItem.text ??
          '';

        return {
          question: getQuestionText(question),
          answer: getAnswerText(answer)
        };
      }

      return {
        question:
          questions[index] ||
          `Question ${index + 1}`,
        answer: getAnswerText(item)
      };
    });
  }

  if (
    answers &&
    typeof answers === 'object'
  ) {
    return Object.entries(
      answers as Record<string, unknown>
    ).map(([key, value], index) => {
      const numericIndex = Number(key);

      const question =
        Number.isInteger(numericIndex) &&
        numericIndex >= 0 &&
        questions[numericIndex]
          ? questions[numericIndex]
          : key;

      return {
        question,
        answer: getAnswerText(value)
      };
    });
  }

  return [];
}

// --------------------------------------------------
// HEALTH
// --------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------

app.post('/api/auth/login', async (req, res) => {
  const parsed = z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Enter a valid email and password'
    });
  }

  const admin = await db.admin.findUnique({
    where: {
      email: parsed.data.email
    }
  });

  if (
    !admin ||
    !(await bcrypt.compare(
      parsed.data.password,
      admin.passwordHash
    ))
  ) {
    return res.status(401).json({
      error: 'Incorrect email or password'
    });
  }

  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role
    },
    secret,
    { expiresIn: '12h' }
  );

  res.json({
    token,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  });
});

app.get(
  '/api/me',
  auth,
  async (req: AuthReq, res) => {
    const admin = await db.admin.findUnique({
      where: {
        id: req.user!.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    res.json(admin);
  }
);

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

app.get('/api/dashboard', auth, async (_req, res) => {
  const [
    total,
    newApps,
    completed,
    qualified,
    pending,
    hired,
    byVacancy,
    latest,
    avg
  ] = await Promise.all([
    db.candidate.count(),

    db.candidate.count({
      where: { status: 'NEW' }
    }),

    db.candidate.count({
      where: {
        interviewAt: { not: null }
      }
    }),

    db.candidate.count({
      where: {
        aiScore: { gte: 70 }
      }
    }),

    db.candidate.count({
      where: {
        status: 'PENDING_REVIEW'
      }
    }),

    db.candidate.count({
      where: { status: 'HIRED' }
    }),

    db.vacancy.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            candidates: true
          }
        }
      }
    }),

    db.candidate.findMany({
      take: 7,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        vacancy: {
          select: { title: true }
        }
      }
    }),

    db.candidate.aggregate({
      _avg: { aiScore: true }
    })
  ]);

  const since = new Date();
  since.setDate(since.getDate() - 13);

  const raw = await db.candidate.findMany({
    where: {
      createdAt: { gte: since }
    },
    select: {
      createdAt: true
    }
  });

  const days = Array.from(
    { length: 14 },
    (_, index) => {
      const date = new Date();

      date.setDate(
        date.getDate() - (13 - index)
      );

      const key = date.toISOString().slice(0, 10);

      return {
        date: key,
        count: raw.filter(candidate =>
          candidate.createdAt
            .toISOString()
            .slice(0, 10) === key
        ).length
      };
    }
  );

  res.json({
    stats: {
      total,
      newApps,
      completed,
      qualified,
      pending,
      hired,
      averageScore: Math.round(
        avg._avg.aiScore || 0
      )
    },

    byVacancy: byVacancy.map(vacancy => ({
      name: vacancy.title,
      count: vacancy._count.candidates
    })),

    applicationsByDay: days,
    latest
  });
});

// --------------------------------------------------
// CANDIDATES LIST
// --------------------------------------------------

app.get('/api/candidates', auth, async (req, res) => {
  const q = String(req.query.q || '');
  const status = String(req.query.status || '');
  const vacancyId = String(req.query.vacancyId || '');

  const min = Number(req.query.minScore || 0);
  const max = Number(req.query.maxScore || 100);

  const page = Math.max(
    1,
    Number(req.query.page || 1)
  );

  const take = 20;

  const where: any = {
    AND: [
      {
        OR: [
          {
            fullName: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            phone: {
              contains: q
            }
          }
        ]
      },
      {
        aiScore: {
          gte: min,
          lte: max
        }
      },
      ...(status && status !== 'ALL'
        ? [{ status }]
        : []),
      ...(vacancyId
        ? [{ vacancyId }]
        : [])
    ]
  };

  const [items, total] = await Promise.all([
    db.candidate.findMany({
      where,
      include: {
        vacancy: {
          select: { title: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * take,
      take
    }),

    db.candidate.count({ where })
  ]);

  res.json({
    items,
    total,
    page,
    pages: Math.ceil(total / take)
  });
});

// --------------------------------------------------
// SINGLE CANDIDATE
// --------------------------------------------------

app.get(
  '/api/candidates/:id',
  auth,
  async (req, res) => {
    const candidate = await db.candidate.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        vacancy: true,
        notes: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        history: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({
        error: 'Candidate not found'
      });
    }

    const formattedAnswers = normalizeAnswers(
      candidate.answers,
      candidate.vacancy.questions
    );

    res.json({
      ...candidate,
      answers: formattedAnswers
    });
  }
);

// --------------------------------------------------
// CHANGE CANDIDATE STATUS
// --------------------------------------------------

app.patch(
  '/api/candidates/:id/status',
  auth,
  roles(...writeRoles),
  async (req: AuthReq, res) => {
    try {
      const parsed = z.object({
        status: z.nativeEnum(CandidateStatus)
      }).safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: 'Invalid status'
        });
      }

      const { status } = parsed.data;

      const candidate = await db.candidate.findUnique({
        where: {
          id: req.params.id
        }
      });

      if (!candidate) {
        return res.status(404).json({
          error: 'Candidate not found'
        });
      }

      let telegramSent = false;

      if (
        status === CandidateStatus.INVITED ||
        status === CandidateStatus.REJECTED
      ) {
        if (!candidate.telegramId) {
          return res.status(400).json({
            error: 'Candidate has no Telegram chat ID',
            telegramSent: false
          });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
          return res.status(500).json({
            error: 'TELEGRAM_BOT_TOKEN is not configured',
            telegramSent: false
          });
        }

        const language =
          candidate.language === 'uz' ? 'uz' : 'ru';

        let message = '';

        if (status === CandidateStatus.INVITED) {
          message = language === 'uz'
            ? `Assalomu alaykum, ${candidate.fullName}!

FasKids kompaniyasidagi ishga topshirgan arizangiz ko‘rib chiqildi.

Sizni tanlovning keyingi bosqichiga taklif qilamiz. Tez orada siz bilan bog‘lanamiz.

Hurmat bilan,
FasKids HR jamoasi`
            : `Здравствуйте, ${candidate.fullName}!

Ваша заявка на работу в компании FasKids рассмотрена.

Мы приглашаем вас на следующий этап отбора. В ближайшее время с вами свяжется наша команда.

С уважением,
HR-команда FasKids`;
        }

        if (status === CandidateStatus.REJECTED) {
          message = language === 'uz'
            ? `Assalomu alaykum, ${candidate.fullName}!

FasKids kompaniyasidagi vakansiyaga bildirgan qiziqishingiz uchun rahmat.

Afsuski, hozircha sizning nomzodingiz keyingi bosqichga tanlanmadi.

Sizga kelgusi faoliyatingizda muvaffaqiyat tilaymiz!

Hurmat bilan,
FasKids HR jamoasi`
            : `Здравствуйте, ${candidate.fullName}!

Благодарим вас за интерес к вакансии компании FasKids.

К сожалению, на данный момент ваша кандидатура не прошла на следующий этап отбора.

Желаем вам успехов в дальнейшей карьере!

С уважением,
HR-команда FasKids`;
        }

        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: candidate.telegramId,
              text: message
            })
          }
        );

        const telegramResult = await telegramResponse.json();

        if (!telegramResponse.ok || !telegramResult.ok) {
          console.error(
            'Telegram message error:',
            telegramResult
          );

          return res.status(502).json({
            error: 'Failed to send Telegram message',
            telegramSent: false
          });
        }

        telegramSent = true;
      }

      const updatedCandidate = await db.candidate.update({
        where: {
          id: candidate.id
        },
        data: {
          status
        }
      });

      await db.activity.create({
        data: {
          candidateId: candidate.id,
          action: 'STATUS_CHANGED',
          details: `Status changed to ${status}`,
          actor: req.user!.email
        }
      });

      await db.notification.create({
        data: {
          title: 'Candidate status updated',
          message: `${candidate.fullName}: ${status}`
        }
      });

      return res.json({
        ...updatedCandidate,
        telegramSent
      });

    } catch (error) {
      console.error('Change candidate status error:', error);

      return res.status(500).json({
        error: 'Failed to update candidate status',
        telegramSent: false
      });
    }
  }
);

// --------------------------------------------------
// CANDIDATE NOTES
// --------------------------------------------------

app.post(
  '/api/candidates/:id/notes',
  auth,
  roles(...writeRoles),
  async (req: AuthReq, res) => {
    const parsed = z.object({
      text: z.string().min(1).max(2000)
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Note must be 1–2000 characters'
      });
    }

    const note = await db.note.create({
      data: {
        candidateId: req.params.id,
        text: parsed.data.text,
        author: req.user!.email
      }
    });

    await db.activity.create({
      data: {
        candidateId: req.params.id,
        action: 'NOTE_ADDED',
        details: 'Internal note added',
        actor: req.user!.email
      }
    });

    res.json(note);
  }
);

// --------------------------------------------------
// VACANCIES
// --------------------------------------------------

app.get('/api/vacancies', auth, async (_req, res) => {
  const vacancies = await db.vacancy.findMany({
    include: {
      _count: {
        select: {
          candidates: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(vacancies);
});

app.post(
  '/api/vacancies',
  auth,
  roles(...writeRoles),
  async (req, res) => {
    const parsed = z.object({
      title: z.string().min(2),
      description: z.string().min(2),
      requirements: z.string(),
      schedule: z.string(),
      questions: z.array(z.string())
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid vacancy details'
      });
    }

    const vacancy = await db.vacancy.create({
      data: parsed.data
    });

    res.status(201).json(vacancy);
  }
);

app.put(
  '/api/vacancies/:id',
  auth,
  roles(...writeRoles),
  async (req, res) => {
    const parsed = z.object({
      title: z.string().min(2),
      description: z.string(),
      requirements: z.string(),
      schedule: z.string(),
      active: z.boolean(),
      questions: z.array(z.string())
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid vacancy details'
      });
    }

    const vacancy = await db.vacancy.update({
      where: {
        id: req.params.id
      },
      data: parsed.data
    });

    res.json(vacancy);
  }
);

app.delete(
  '/api/vacancies/:id',
  auth,
  roles(Role.SUPER_ADMIN),
  async (req, res) => {
    const count = await db.candidate.count({
      where: {
        vacancyId: req.params.id
      }
    });

    if (count > 0) {
      return res.status(409).json({
        error: 'Vacancy has applications. Deactivate it instead.'
      });
    }

    await db.vacancy.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({ ok: true });
  }
);

// --------------------------------------------------
// NOTIFICATIONS
// --------------------------------------------------

app.get(
  '/api/notifications',
  auth,
  async (_req, res) => {
    const notifications = await db.notification.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    res.json(notifications);
  }
);

app.patch(
  '/api/notifications/:id/read',
  auth,
  async (req, res) => {
    const notification = await db.notification.update({
      where: {
        id: req.params.id
      },
      data: {
        read: true
      }
    });

    res.json(notification);
  }
);

// --------------------------------------------------
// SETTINGS
// --------------------------------------------------

app.get(
  '/api/settings',
  auth,
  roles(Role.SUPER_ADMIN, Role.HR_MANAGER),
  async (_req, res) => {
    const rows = await db.setting.findMany();

    res.json(
      Object.fromEntries(
        rows.map(item => [
          item.key,
          item.value
        ])
      )
    );
  }
);

app.put(
  '/api/settings',
  auth,
  roles(Role.SUPER_ADMIN),
  async (req, res) => {
    const parsed = z.object({
      qualificationThreshold: z.coerce
        .number()
        .int()
        .min(0)
        .max(100),

      storeName: z.string()
        .min(1)
        .max(100)
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid settings'
      });
    }

    for (const [key, value] of Object.entries(parsed.data)) {
      await db.setting.upsert({
        where: { key },
        update: {
          value: String(value)
        },
        create: {
          key,
          value: String(value)
        }
      });
    }

    res.json({ ok: true });
  }
);

// --------------------------------------------------
// CSV EXPORT
// --------------------------------------------------

app.get(
  '/api/reports/export',
  auth,
  async (_req, res) => {
    const rows = await db.candidate.findMany({
      include: {
        vacancy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const escapeCsv = (value: any) =>
      `"${String(value ?? '').replaceAll('"', '""')}"`;

    const lines = [
      [
        'Name',
        'Phone',
        'Email',
        'Vacancy',
        'AI Score',
        'Status',
        'Applied Date'
      ].join(','),

      ...rows.map(candidate =>
        [
          candidate.fullName,
          candidate.phone,
          candidate.email,
          candidate.vacancy.title,
          candidate.aiScore,
          candidate.status,
          candidate.createdAt.toISOString()
        ]
          .map(escapeCsv)
          .join(',')
      )
    ];

    res.setHeader(
      'Content-Type',
      'text/csv; charset=utf-8'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="candidates.csv"'
    );

    res.send('\uFEFF' + lines.join('\n'));
  }
);

// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  res.status(500).json({
    error: 'Internal server error'
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(
    `HR API listening on http://localhost:${port}`
  );
});
