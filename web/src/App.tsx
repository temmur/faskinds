
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, UserCheck, CalendarDays,
  BriefcaseBusiness, BrainCircuit, Bot, Bell,
  ChartNoAxesCombined, Settings, Search, Download,
  LogOut, Menu, X, Plus, Eye, CheckCircle2,
  Clock3, TrendingUp, ArrowUpRight, ShieldCheck,
  ChevronRight, Filter, Trash2, Pencil, Power
} from 'lucide-react';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, CartesianGrid
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';

type Language = 'ru' | 'uz';

const translations: Record<Language, Record<string, string>> = {
  ru: {
    'Dashboard': 'Панель управления',
    'Overview': 'Обзор',
    'PEOPLE': 'СОТРУДНИКИ',
    'MANAGEMENT': 'УПРАВЛЕНИЕ',
    'ANALYTICS': 'АНАЛИТИКА',
    'SYSTEM': 'СИСТЕМА',
    'Candidates': 'Кандидаты',
    'Qualified Candidates': 'Подходящие кандидаты',
    'Interviews': 'Собеседования',
    'Vacancies': 'Вакансии',
    'AI Evaluation': 'Оценка ИИ',
    'Telegram Bot': 'Telegram-бот',
    'Notifications': 'Уведомления',
    'Reports & Analytics': 'Отчёты и аналитика',
    'Settings': 'Настройки',
    'Sign out': 'Выйти',
    'Need a hand?': 'Нужна помощь?',
    'Visit the help center for setup guides.': 'Посетите центр помощи для получения инструкций.',
    'Get support': 'Получить поддержку',
    'Workspace': 'Рабочее пространство',
    'System live': 'Система работает',
    'Loading workspace…': 'Загрузка рабочего пространства…',
    'Good day, team': 'Добрый день, команда',
    'Here’s what’s happening across your hiring pipeline.': 'Здесь отображается текущая ситуация с подбором сотрудников.',
    'Total candidates': 'Всего кандидатов',
    'New applications': 'Новые заявки',
    'Completed interviews': 'Завершённые собеседования',
    'Qualified candidates': 'Подходящие кандидаты',
    'Pending review': 'Ожидают рассмотрения',
    'Hired candidates': 'Принятые сотрудники',
    'Application activity': 'Активность заявок',
    'Daily applications · last 14 days': 'Ежедневные заявки · последние 14 дней',
    'Applications by vacancy': 'Заявки по вакансиям',
    'Candidate distribution': 'Распределение кандидатов',
    'Latest applications': 'Последние заявки',
    'Most recent candidates entering your pipeline': 'Последние поступившие заявки',
    'View candidates': 'Посмотреть кандидатов',
    'View all': 'Посмотреть все',
    'Candidate': 'Кандидат',
    'Position': 'Должность',
    'AI score': 'Оценка ИИ',
    'Status': 'Статус',
    'Applied': 'Дата подачи',
    'Applied date': 'Дата подачи',
    'No phone provided': 'Телефон не указан',
    'No applications yet. New Telegram bot applications will appear here.': 'Пока нет заявок. Новые заявки из Telegram-бота появятся здесь.',
    'TALENT PIPELINE': 'ПОДБОР ПЕРСОНАЛА',
    'Review applications, compare candidate profiles and manage hiring decisions.': 'Просматривайте заявки, сравнивайте профили кандидатов и принимайте решения о найме.',
    'Candidates with an AI screening score of 70 or higher.': 'Кандидаты с оценкой ИИ 70 баллов и выше.',
    'Export CSV': 'Экспорт CSV',
    'Search name or phone…': 'Поиск по имени или телефону…',
    'All statuses': 'Все статусы',
    'Min score': 'Минимальная оценка',
    'Search': 'Поиск',
    'All applications': 'Все заявки',
    'Click a candidate to view their full application.': 'Нажмите на кандидата, чтобы посмотреть полную заявку.',
    'No candidates match these filters.': 'Нет кандидатов, соответствующих фильтрам.',
    'Showing': 'Показано',
    'of': 'из',
    'Previous': 'Назад',
    'Next': 'Далее',
    'CANDIDATE PROFILE': 'ПРОФИЛЬ КАНДИДАТА',
    'PHONE': 'ТЕЛЕФОН',
    'EMAIL': 'ЭЛЕКТРОННАЯ ПОЧТА',
    'EXPERIENCE': 'ОПЫТ РАБОТЫ',
    'AVAILABILITY': 'ДОСТУПНОСТЬ',
    'Not provided': 'Не указано',
    'AI SCREENING SCORE': 'ОЦЕНКА ИИ',
    'AI evaluation': 'Оценка ИИ',
    'AI evaluation has not been run for this candidate.': 'Для этого кандидата оценка ИИ ещё не проводилась.',
    'Candidate answers': 'Ответы кандидата',
    'Internal notes': 'Внутренние заметки',
    'Add an internal note…': 'Добавить внутреннюю заметку…',
    'Add note': 'Добавить заметку',
    'Activity history': 'История действий',
    'Invite to interview': 'Пригласить на собеседование',
    'Reject': 'Отклонить',
    'Mark as hired': 'Принять на работу',
    'HIRING MANAGEMENT': 'УПРАВЛЕНИЕ НАЙМОМ',
    'FasKids Vacancies': 'Вакансии FasKids',
    'Create, edit, activate, deactivate and manage the roles available in your Telegram bot.': 'Создавайте, редактируйте, активируйте и управляйте вакансиями в Telegram-боте.',
    'New vacancy': 'Новая вакансия',
    'ACTIVE': 'АКТИВНА',
    'INACTIVE': 'НЕАКТИВНА',
    'applicants': 'кандидатов',
    'Edit': 'Изменить',
    'Deactivate': 'Деактивировать',
    'Activate': 'Активировать',
    'Delete': 'Удалить',
    'No vacancies yet. Click "New vacancy" to create your first vacancy.': 'Пока нет вакансий. Нажмите «Новая вакансия», чтобы создать первую.',
    'Edit vacancy': 'Редактировать вакансию',
    'Create vacancy': 'Создать вакансию',
    'Job title': 'Название должности',
    'Description': 'Описание',
    'Requirements': 'Требования',
    'Work schedule': 'График работы',
    'Interview questions (one per line)': 'Вопросы для собеседования (каждый с новой строки)',
    'Save vacancy': 'Сохранить вакансию',
    'Saving...': 'Сохранение...',
    'ACTIVITY': 'АКТИВНОСТЬ',
    'Stay up to date with candidate and hiring activity.': 'Следите за действиями кандидатов и процессом найма.',
    'Mark read': 'Отметить прочитанным',
    'No notifications yet.': 'Пока нет уведомлений.',
    'CONFIGURATION': 'КОНФИГУРАЦИЯ',
    'Manage the core preferences for your HR workspace.': 'Управляйте основными настройками HR-платформы.',
    'General settings': 'Общие настройки',
    'Basic details for your store and hiring process.': 'Основная информация о компании и процессе найма.',
    'Store name': 'Название компании',
    'AI qualification threshold': 'Порог оценки ИИ',
    'Candidates meeting this score appear in Qualified Candidates.': 'Кандидаты с такой оценкой появятся в разделе подходящих кандидатов.',
    'Save settings': 'Сохранить настройки',
    'Only Super Admin can change settings.': 'Только главный администратор может изменять настройки.',
    'Security & integrations': 'Безопасность и интеграции',
    'Keep credentials private and configure integrations on the server.': 'Храните данные доступа в безопасности и настраивайте интеграции на сервере.',
    'Telegram Bot API': 'Telegram Bot API',
    'AI provider will be configured on the server.': 'Поставщик ИИ будет настроен на сервере.',
    'JWT authentication': 'JWT-аутентификация',
    'ENABLED': 'ВКЛЮЧЕНО',
    'SERVER ENV': 'НАСТРОЙКИ СЕРВЕРА',
    'WELCOME BACK': 'С ВОЗВРАЩЕНИЕМ',
    'Sign in to your': 'Войдите в своё',
    'workspace': 'рабочее пространство',
    'Enter your admin credentials to continue.': 'Введите данные администратора для продолжения.',
    'Email address': 'Электронная почта',
    'Password': 'Пароль',
    'Remember me': 'Запомнить меня',
    'Forgot password?': 'Забыли пароль?',
    'Reset access with the server command': 'Сброс доступа выполняется командой на сервере',
    'Sign in': 'Войти',
    'Signing in…': 'Вход...',
    'Protected administrator access': 'Защищённый доступ администратора',
    'THE PEOPLE BEHIND THE BRAND': 'ЛЮДИ, СОЗДАЮЩИЕ БРЕНД',
    'Build a team': 'Создайте команду',
    'that cares.': 'которая заботится.',
    'One connected': 'Единое',
    'Human-led': 'Решения',
    'decisions': 'принимают люди',
    'FASKIDS HR PLATFORM · SECURE WORKSPACE': 'HR-ПЛАТФОРМА FASKIDS · ЗАЩИЩЁННОЕ ПРОСТРАНСТВО',
    'WORKSPACE': 'РАБОЧЕЕ ПРОСТРАНСТВО',
    'Request failed': 'Ошибка запроса',
    'Login failed': 'Не удалось войти',
    'Question': 'Вопрос',
    'No vacancies yet.': 'Пока нет вакансий.',
    'Full-time': 'Полный рабочий день'
  },

  uz: {
    'Dashboard': 'Boshqaruv paneli',
    'Overview': 'Umumiy ko‘rinish',
    'PEOPLE': 'XODIMLAR',
    'MANAGEMENT': 'BOSHQARUV',
    'ANALYTICS': 'TAHLIL',
    'SYSTEM': 'TIZIM',
    'Candidates': 'Nomzodlar',
    'Qualified Candidates': 'Mos nomzodlar',
    'Interviews': 'Suhbatlar',
    'Vacancies': 'Vakansiyalar',
    'AI Evaluation': 'AI baholash',
    'Telegram Bot': 'Telegram bot',
    'Notifications': 'Bildirishnomalar',
    'Reports & Analytics': 'Hisobotlar va tahlil',
    'Settings': 'Sozlamalar',
    'Sign out': 'Chiqish',
    'Need a hand?': 'Yordam kerakmi?',
    'Visit the help center for setup guides.': 'Yo‘riqnomalar uchun yordam markaziga tashrif buyuring.',
    'Get support': 'Yordam olish',
    'Workspace': 'Ish maydoni',
    'System live': 'Tizim faol',
    'Loading workspace…': 'Ish maydoni yuklanmoqda…',
    'Good day, team': 'Assalomu alaykum, jamoa',
    'Here’s what’s happening across your hiring pipeline.': 'Xodimlarni tanlash jarayonidagi holat.',
    'Total candidates': 'Jami nomzodlar',
    'New applications': 'Yangi arizalar',
    'Completed interviews': 'Yakunlangan suhbatlar',
    'Qualified candidates': 'Mos nomzodlar',
    'Pending review': 'Ko‘rib chiqilmoqda',
    'Hired candidates': 'Ishga qabul qilinganlar',
    'Application activity': 'Arizalar faolligi',
    'Daily applications · last 14 days': 'Kunlik arizalar · oxirgi 14 kun',
    'Applications by vacancy': 'Vakansiyalar bo‘yicha arizalar',
    'Candidate distribution': 'Nomzodlar taqsimoti',
    'Latest applications': 'So‘nggi arizalar',
    'Most recent candidates entering your pipeline': 'Yangi kelib tushgan arizalar',
    'View candidates': 'Nomzodlarni ko‘rish',
    'View all': 'Barchasini ko‘rish',
    'Candidate': 'Nomzod',
    'Position': 'Lavozim',
    'AI score': 'AI bahosi',
    'Status': 'Holat',
    'Applied': 'Ariza sanasi',
    'Applied date': 'Ariza sanasi',
    'No phone provided': 'Telefon raqami kiritilmagan',
    'No applications yet. New Telegram bot applications will appear here.': 'Hozircha arizalar yo‘q. Telegram bot orqali kelgan arizalar shu yerda ko‘rinadi.',
    'TALENT PIPELINE': 'NOMZODLARNI TANLASH',
    'Review applications, compare candidate profiles and manage hiring decisions.': 'Arizalarni ko‘rib chiqing, nomzodlarni taqqoslang va ishga qabul qilish bo‘yicha qaror qabul qiling.',
    'Candidates with an AI screening score of 70 or higher.': 'AI bahosi 70 yoki undan yuqori bo‘lgan nomzodlar.',
    'Export CSV': 'CSV eksport',
    'Search name or phone…': 'Ism yoki telefon bo‘yicha qidirish…',
    'All statuses': 'Barcha holatlar',
    'Min score': 'Minimal baho',
    'Search': 'Qidirish',
    'All applications': 'Barcha arizalar',
    'Click a candidate to view their full application.': 'To‘liq arizani ko‘rish uchun nomzodni bosing.',
    'No candidates match these filters.': 'Ushbu filtrlarga mos nomzodlar topilmadi.',
    'Showing': 'Ko‘rsatilmoqda',
    'of': 'dan',
    'Previous': 'Oldingi',
    'Next': 'Keyingi',
    'CANDIDATE PROFILE': 'NOMZOD PROFILI',
    'PHONE': 'TELEFON',
    'EMAIL': 'ELEKTRON POCHTA',
    'EXPERIENCE': 'ISH TAJRIBASI',
    'AVAILABILITY': 'ISHLASH IMKONIYATI',
    'Not provided': 'Kiritilmagan',
    'AI SCREENING SCORE': 'AI BAHOSI',
    'AI evaluation': 'AI baholash',
    'AI evaluation has not been run for this candidate.': 'Ushbu nomzod hali AI tomonidan baholanmagan.',
    'Candidate answers': 'Nomzod javoblari',
    'Internal notes': 'Ichki qaydlar',
    'Add an internal note…': 'Ichki qayd qo‘shish…',
    'Add note': 'Qayd qo‘shish',
    'Activity history': 'Faoliyat tarixi',
    'Invite to interview': 'Suhbatga taklif qilish',
    'Reject': 'Rad etish',
    'Mark as hired': 'Ishga qabul qilish',
    'HIRING MANAGEMENT': 'ISHGA QABUL QILISH BOSHQARUVI',
    'FasKids Vacancies': 'FasKids vakansiyalari',
    'Create, edit, activate, deactivate and manage the roles available in your Telegram bot.': 'Telegram botdagi vakansiyalarni yarating, tahrirlang va boshqaring.',
    'New vacancy': 'Yangi vakansiya',
    'ACTIVE': 'FAOL',
    'INACTIVE': 'FAOL EMAS',
    'applicants': 'nafar nomzod',
    'Edit': 'Tahrirlash',
    'Deactivate': 'Faolsizlantirish',
    'Activate': 'Faollashtirish',
    'Delete': 'O‘chirish',
    'No vacancies yet. Click "New vacancy" to create your first vacancy.': 'Hozircha vakansiyalar yo‘q. Birinchi vakansiyani yaratish uchun «Yangi vakansiya» tugmasini bosing.',
    'Edit vacancy': 'Vakansiyani tahrirlash',
    'Create vacancy': 'Vakansiya yaratish',
    'Job title': 'Lavozim nomi',
    'Description': 'Tavsif',
    'Requirements': 'Talablar',
    'Work schedule': 'Ish jadvali',
    'Interview questions (one per line)': 'Suhbat savollari (har biri yangi qatorda)',
    'Save vacancy': 'Vakansiyani saqlash',
    'Saving...': 'Saqlanmoqda...',
    'ACTIVITY': 'FAOLIYAT',
    'Stay up to date with candidate and hiring activity.': 'Nomzodlar va ishga qabul qilish jarayonidagi yangiliklarni kuzating.',
    'Mark read': 'O‘qilgan deb belgilash',
    'No notifications yet.': 'Hozircha bildirishnomalar yo‘q.',
    'CONFIGURATION': 'SOZLAMALAR',
    'Manage the core preferences for your HR workspace.': 'HR platformasining asosiy sozlamalarini boshqaring.',
    'General settings': 'Umumiy sozlamalar',
    'Basic details for your store and hiring process.': 'Kompaniya va ishga qabul qilish jarayoni haqida asosiy ma’lumotlar.',
    'Store name': 'Kompaniya nomi',
    'AI qualification threshold': 'AI baholash chegarasi',
    'Candidates meeting this score appear in Qualified Candidates.': 'Ushbu bahoga ega nomzodlar mos nomzodlar bo‘limida ko‘rinadi.',
    'Save settings': 'Sozlamalarni saqlash',
    'Only Super Admin can change settings.': 'Sozlamalarni faqat bosh administrator o‘zgartira oladi.',
    'Security & integrations': 'Xavfsizlik va integratsiyalar',
    'Keep credentials private and configure integrations on the server.': 'Maxfiy ma’lumotlarni himoya qiling va integratsiyalarni serverda sozlang.',
    'Telegram Bot API': 'Telegram Bot API',
    'AI provider will be configured on the server.': 'AI xizmati serverda sozlanadi.',
    'JWT authentication': 'JWT autentifikatsiyasi',
    'ENABLED': 'FAOL',
    'SERVER ENV': 'SERVER SOZLAMALARI',
    'WELCOME BACK': 'XUSH KELIBSIZ',
    'Sign in to your': 'Hisobingizga',
    'workspace': 'kiring',
    'Enter your admin credentials to continue.': 'Davom etish uchun administrator ma’lumotlarini kiriting.',
    'Email address': 'Elektron pochta',
    'Password': 'Parol',
    'Remember me': 'Meni eslab qolish',
    'Forgot password?': 'Parolni unutdingizmi?',
    'Reset access with the server command': 'Kirish server buyrug‘i orqali tiklanadi',
    'Sign in': 'Kirish',
    'Signing in…': 'Kirilmoqda…',
    'Protected administrator access': 'Himoyalangan administrator kirishi',
    'THE PEOPLE BEHIND THE BRAND': 'BREND ORTIDAGI JAMOA',
    'Build a team': 'Jamoa tuzing',
    'that cares.': 'mehr bilan ishlaydigan.',
    'One connected': 'Yagona',
    'Human-led': 'Insonlar qabul qiladigan',
    'decisions': 'qarorlar',
    'FASKIDS HR PLATFORM · SECURE WORKSPACE': 'FASKIDS HR PLATFORMASI · HIMOYALANGAN ISH MAYDONI',
    'WORKSPACE': 'ISH MAYDONI',
    'Request failed': 'So‘rovda xatolik',
    'Login failed': 'Kirish amalga oshmadi',
    'Question': 'Savol',
    'Full-time': 'To‘liq ish kuni'
  }
};

let currentLanguage: Language = 'ru';

function t(text: string): string {
  return translations[currentLanguage][text] || text;
}

function translateStatus(status: string): string {
  const statuses: Record<string, { ru: string; uz: string }> = {
    NEW: { ru: 'НОВЫЙ', uz: 'YANGI' },
    PENDING_REVIEW: { ru: 'НА РАССМОТРЕНИИ', uz: 'KO‘RIB CHIQILMOQDA' },
    QUALIFIED: { ru: 'ПОДХОДИТ', uz: 'MOS' },
    INVITED: { ru: 'ПРИГЛАШЁН', uz: 'TAKLIF QILINGAN' },
    REJECTED: { ru: 'ОТКЛОНЁН', uz: 'RAD ETILGAN' },
    HIRED: { ru: 'ПРИНЯТ', uz: 'ISHGA QABUL QILINGAN' },
    PENDING: { ru: 'ОЖИДАЕТ', uz: 'KUTILMOQDA' },
    SENT: { ru: 'ДОСТАВЛЕНО', uz: 'YETKAZILDI' },
    FAILED: { ru: 'ОШИБКА', uz: 'XATO' }
  };

  return statuses[status]?.[currentLanguage] || status;
}

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

async function request(
  path: string,
  token: string,
  options: RequestInit = {}
) {
  const response = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `${t('Request failed')} (${response.status})`);
  }

  if (response.status === 204) return null;

  return response.json();
}

const nav = [
  ['Overview', 'Dashboard', LayoutDashboard],
  ['PEOPLE', 'Candidates', Users],
  ['', 'Qualified Candidates', UserCheck],
  ['', 'Interviews', CalendarDays],
  ['MANAGEMENT', 'Vacancies', BriefcaseBusiness],
  ['', 'AI Evaluation', BrainCircuit],
  ['', 'Telegram Bot', Bot],
  ['', 'Notifications', Bell],
  ['ANALYTICS', 'Reports & Analytics', ChartNoAxesCombined],
  ['SYSTEM', 'Settings', Settings]
] as const;

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('hr_token') || '');
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('Dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('fas_language');
    return saved === 'uz' ? 'uz' : 'ru';
  });

  currentLanguage = language;

  function changeLanguage(value: Language) {
    currentLanguage = value;
    localStorage.setItem('fas_language', value);
    setLanguage(value);
  }

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    request('/me', token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('hr_token');
        setToken('');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function logout() {
    localStorage.removeItem('hr_token');
    setToken('');
    setUser(null);
  }

  if (loading) {
    return <div className="loading">{t('Loading workspace…')}</div>;
  }

  if (!token || !user) {
    return (
      <Login
        language={language}
        changeLanguage={changeLanguage}
        onLogin={(tkn, u) => {
          localStorage.setItem('hr_token', tkn);
          setToken(tkn);
          setUser(u);
        }}
      />
    );
  }

  return (
    <div className="shell">
      <aside className={`sidebar ${collapsed ? 'small' : ''}`}>
        <div className="brand">
          <div className="brandmark">F</div>
          {!collapsed && (
            <div>
              <b>Fas<span>Kids</span></b>
              <small>PEOPLE MANAGEMENT</small>
            </div>
          )}
        </div>

        <button className="collapse" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>

        <div className="nav">
          {nav.map(([group, label, Icon]) => (
            <div key={label}>
              {group && group !== 'Overview' && (
                <div className="navgroup">
                  {collapsed ? '' : t(group)}
                </div>
              )}

              <button
                className={`navitem ${page === label ? 'active' : ''}`}
                onClick={() => setPage(label)}
                title={t(label)}
              >
                <Icon size={18} />
                {!collapsed && <span>{t(label)}</span>}
                {!collapsed && label === 'Qualified Candidates' && <em>70+</em>}
              </button>
            </div>
          ))}
        </div>

        <div className="sidebarbottom">
          <div className="helpbox">
            {!collapsed && (
              <>
                <b>{t('Need a hand?')}</b>
                <p>{t('Visit the help center for setup guides.')}</p>
                <a href="mailto:support@example.com">
                  {t('Get support')} <ArrowUpRight size={13} />
                </a>
              </>
            )}
          </div>

          <button className="navitem" onClick={logout}>
            <LogOut size={18} />
            {!collapsed && t('Sign out')}
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            {t('Workspace')} <ChevronRight size={14} /> <b>{t(page)}</b>
          </div>

          <div className="topright">
            <select
              className="language-select"
              value={language}
              onChange={e => changeLanguage(e.target.value as Language)}
              aria-label="Language"
            >
              <option value="ru">🇷🇺 RU</option>
              <option value="uz">🇺🇿 UZ</option>
            </select>

            <span className="live"><i /> {t('System live')}</span>

            <button className="iconbtn" onClick={() => setPage('Notifications')}>
              <Bell size={19} />
              <i className="dot" />
            </button>

            <div className="profile">
              <div className="avatar">{user.name?.slice(0, 1) || 'A'}</div>
              <div>
                <b>{user.name}</b>
                <small>{user.role.replace('_', ' ')}</small>
              </div>
            </div>
          </div>
        </header>

        <div className="content">
          {error && (
            <div className="error">
              {error}
              <button onClick={() => setError('')}>×</button>
            </div>
          )}

          <Page
            page={page}
            token={token}
            user={user}
            setPage={setPage}
            setError={setError}
          />
        </div>
      </main>
    </div>
  );
}

function Login({
  onLogin,
  language,
  changeLanguage
}: {
  onLogin: (t: string, u: User) => void;
  language: Language;
  changeLanguage: (value: Language) => void;
}) {
  const [email, setEmail] = useState('admin@faskids.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const response = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('Login failed'));
      }

      onLogin(data.token, data.user);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="loginpage">
      <div className="loginvisual">
        <div className="brand light">
          <div className="brandmark">F</div>
          <div>
            <b>Fas<span>Kids</span></b>
            <small>PEOPLE MANAGEMENT</small>
          </div>
        </div>

        <div className="visualcopy">
          <div className="eyebrow">{t('THE PEOPLE BEHIND THE BRAND')}</div>
          <h1>{t('Build a team')}<br /><i>{t('that cares.')}</i></h1>
          <p>
            {language === 'ru'
              ? 'Рабочее пространство для поиска людей, которые делают каждый момент важным.'
              : 'Har bir lahzani muhim qiladigan insonlarni topish uchun ish maydoni.'}
          </p>

          <div className="visualstats">
            <div>
              <b>01</b>
              <span>{t('One connected')}<br />{t('workspace')}</span>
            </div>
            <div>
              <b>100%</b>
              <span>{t('Human-led')}<br />{t('decisions')}</span>
            </div>
          </div>
        </div>

        <div className="visualfoot">{t('FASKIDS HR PLATFORM · SECURE WORKSPACE')}</div>
      </div>

      <div className="loginformwrap">
        <form className="loginform" onSubmit={submit}>
          <div className="login-language">
            <select
              className="language-select"
              value={language}
              onChange={e => changeLanguage(e.target.value as Language)}
            >
              <option value="ru">🇷🇺 Русский</option>
              <option value="uz">🇺🇿 O‘zbekcha</option>
            </select>
          </div>

          <div className="eyebrow">{t('WELCOME BACK')}</div>
          <h2>{t('Sign in to your')}<br />{t('workspace')}</h2>
          <p>{t('Enter your admin credentials to continue.')}</p>

          {error && <div className="error">{error}</div>}

          <label>{t('Email address')}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>{t('Password')}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <div className="loginoptions">
            <label className="check">
              <input type="checkbox" /> {t('Remember me')}
            </label>
            <span className="reset-hint" title={t('Reset access with the server command')}>
              {t('Forgot password?')}
            </span>
          </div>

          <button className="primary full" disabled={busy}>
            {busy ? t('Signing in…') : t('Sign in')} <ChevronRight size={17} />
          </button>

          <small className="secure">
            <ShieldCheck size={14} /> {t('Protected administrator access')}
          </small>
        </form>
      </div>
    </div>
  );
}

function Page({
  page,
  token,
  user,
  setPage,
  setError
}: {
  page: string;
  token: string;
  user: User;
  setPage: (p: string) => void;
  setError: (e: string) => void;
}) {
  if (page === 'Dashboard') return <Dashboard token={token} setPage={setPage} />;

  if (page === 'Candidates' || page === 'Qualified Candidates') {
    return (
      <Candidates
        token={token}
        qualified={page === 'Qualified Candidates'}
        setError={setError}
        canWrite={user.role !== 'VIEWER'}
      />
    );
  }

  if (page === 'Vacancies') {
    return <Vacancies token={token} user={user} setError={setError} />;
  }

  if (page === 'Notifications') return <Notifications token={token} />;

  if (page === 'Settings') {
    return <SettingsPage token={token} user={user} setError={setError} />;
  }

  if (page === 'AI Evaluation') {
    return (
      <AiEvaluation
        token={token}
        setError={setError}
        canWrite={user.role !== 'VIEWER'}
      />
    );
  }

  const pageNames: Record<string, string> = {
    'Interviews': 'Собеседования',
    'Reports & Analytics': 'Отчёты и аналитика',
    'Telegram Bot': 'Telegram-бот'
  };

  const pageNamesUz: Record<string, string> = {
    'Interviews': 'Suhbatlar',
    'Reports & Analytics': 'Hisobotlar va tahlil',
    'Telegram Bot': 'Telegram bot'
  };

  return (
    <div className="pagehead">
      <div>
        <div className="eyebrow">{t('WORKSPACE')}</div>
        <h1>
          {currentLanguage === 'ru'
            ? pageNames[page] || page
            : pageNamesUz[page] || page}
        </h1>
        <p>
          {currentLanguage === 'ru'
            ? 'Этот раздел готов к подключению к HR-процессам.'
            : 'Ushbu bo‘lim HR jarayonlariga ulanishga tayyor.'}
        </p>
      </div>
    </div>
  );
}

function Heading({
  eyebrow,
  title,
  desc,
  action
}: {
  eyebrow: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="pagehead">
      <div>
        <div className="eyebrow">{t(eyebrow)}</div>
        <h1>{t(title)}</h1>
        <p>{t(desc)}</p>
      </div>
      {action}
    </div>
  );
}

function Dashboard({
  token,
  setPage
}: {
  token: string;
  setPage: (p: string) => void;
}) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    request('/dashboard', token)
      .then(setData)
      .catch(e => setErr(e.message));
  }, [token]);

  if (!data) {
    return (
      <>
        <Heading
          eyebrow="Overview"
          title="Good day, team"
          desc="Here’s what’s happening across your hiring pipeline."
        />
        <div className="panel">{err || t('Loading workspace…')}</div>
      </>
    );
  }

  const s = data.stats;

  const cards = [
    ['Total candidates', s.total, Users, '#eef2ff'],
    ['New applications', s.newApps, TrendingUp, '#effaf5'],
    ['Completed interviews', s.completed, CalendarDays, '#fff6e9'],
    ['Qualified candidates', s.qualified, UserCheck, '#f4efff'],
    ['Pending review', s.pending, Clock3, '#fff0f0'],
    ['Hired candidates', s.hired, CheckCircle2, '#eaf8f5']
  ];

  return (
    <>
      <Heading
        eyebrow="HR OVERVIEW"
        title="Good day, team"
        desc="Here’s what’s happening across your hiring pipeline."
        action={
          <button className="outline" onClick={() => setPage('Candidates')}>
            <Users size={16} /> {t('View candidates')}
          </button>
        }
      />

      <div className="statsgrid">
        {cards.map(([label, value, Icon, bg]: any) => (
          <div className="statcard" key={label}>
            <div className="stathead">
              <span>{t(label)}</span>
              <div style={{ background: bg }}>
                <Icon size={18} />
              </div>
            </div>
            <strong>{value}</strong>
            <small>
              <span className="positive">
                {currentLanguage === 'ru' ? 'Актуально' : 'Faol'}
              </span>
              {' · '}
              {currentLanguage === 'ru' ? 'обновлено из базы данных' : 'bazadan yangilangan'}
            </small>
          </div>
        ))}
      </div>

      <div className="chartgrid">
        <div className="panel chartpanel">
          <div className="paneltitle">
            <div>
              <h3>{t('Application activity')}</h3>
              <p>{t('Daily applications · last 14 days')}</p>
            </div>
            <span className="tag">LIVE DATA</span>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.applicationsByDay}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5d69db" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#5d69db" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" />
                <XAxis dataKey="date" tickFormatter={v => v.slice(5)} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#5d69db" strokeWidth={2.5} fill="url(#fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chartpanel">
          <div className="paneltitle">
            <div>
              <h3>{t('Applications by vacancy')}</h3>
              <p>{t('Candidate distribution')}</p>
            </div>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byVacancy} layout="vertical" margin={{ left: 4, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#edf0f5" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={115} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6874df" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel tablepanel">
        <div className="paneltitle">
          <div>
            <h3>{t('Latest applications')}</h3>
            <p>{t('Most recent candidates entering your pipeline')}</p>
          </div>
          <button className="textbtn" onClick={() => setPage('Candidates')}>
            {t('View all')} <ArrowUpRight size={14} />
          </button>
        </div>
        <CandidateTable rows={data.latest || []} />
      </div>
    </>
  );
}

function CandidateTable({ rows }: { rows: any[] }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th>{t('Candidate')}</th>
            <th>{t('Position')}</th>
            <th>{t('AI score')}</th>
            <th>{t('Status')}</th>
            <th>{t('Applied')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.id}>
              <td>
                <div className="person">
                  <div className="avatar muted">{c.fullName?.slice(0, 1)}</div>
                  <div>
                    <b>{c.fullName}</b>
                    <small>{c.phone || t('No phone provided')}</small>
                  </div>
                </div>
              </td>
              <td>{c.vacancy?.title}</td>
              <td>
                <span className={`score ${c.aiScore >= 70 ? 'good' : ''}`}>
                  {c.aiScore}/100
                </span>
              </td>
              <td><Status status={c.status} /></td>
              <td>{new Date(c.createdAt).toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : 'uz-UZ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!rows.length && (
        <div className="empty">{t('No applications yet. New Telegram bot applications will appear here.')}</div>
      )}
    </div>
  );
}

function Status({ status }: { status: string }) {
  return (
    <span className={`status ${(status || 'NEW').toLowerCase()}`}>
      {translateStatus((status || 'NEW').replace(/ /g, '_'))}
    </span>
  );
}

function Candidates({
  token,
  qualified,
  setError,
  canWrite
}: {
  token: string;
  qualified: boolean;
  setError: (e: string) => void;
  canWrite: boolean;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [score, setScore] = useState(qualified ? '70' : '0');
  const [decisionBusy, setDecisionBusy] = useState(false);
  const [decisionNotice, setDecisionNotice] = useState('');

  async function load() {
    try {
      const d = await request(
        `/candidates?q=${encodeURIComponent(q)}&status=${status}&minScore=${score}&page=${page}`,
        token
      );
      setRows(d.items || []);
      setTotal(d.total || 0);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [token, page, status, score]);

  async function open(id: string) {
    try {
      setDetail(await request('/candidates/' + id, token));
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function changeStatus(s: string) {
    try {
      await request(`/candidates/${detail.id}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: s })
      });
      await open(detail.id);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function decide(decision: 'APPROVED' | 'REJECTED') {
    if (!detail || decisionBusy) return;

    const confirmed = window.confirm(
      currentLanguage === 'ru'
        ? decision === 'APPROVED'
          ? 'Одобрить кандидата и отправить ему сообщение в Telegram?'
          : 'Отказать кандидату и отправить ему сообщение в Telegram?'
        : decision === 'APPROVED'
          ? 'Nomzodni ma’qullab, Telegram orqali xabar yuborilsinmi?'
          : 'Nomzod rad etilib, Telegram orqali xabar yuborilsinmi?'
    );

    if (!confirmed) return;

    try {
      setDecisionBusy(true);
      setDecisionNotice('');

      const result = await request(`/candidates/${detail.id}/decision`, token, {
        method: 'POST',
        body: JSON.stringify({ decision })
      });

      setDecisionNotice(
        result.telegramSent
          ? currentLanguage === 'ru'
            ? 'Решение сохранено, сообщение успешно отправлено кандидату в Telegram.'
            : 'Qaror saqlandi va Telegram xabari nomzodga yuborildi.'
          : currentLanguage === 'ru'
            ? 'Решение сохранено, но Telegram-сообщение не доставлено. Исправьте настройки и повторите отправку.'
            : 'Qaror saqlandi, ammo Telegram xabari yetkazilmadi. Sozlamalarni tekshirib, qayta yuboring.'
      );

      await open(detail.id);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDecisionBusy(false);
    }
  }

  async function retryDecisionDelivery() {
    if (!detail || decisionBusy) return;

    try {
      setDecisionBusy(true);
      const result = await request(
        `/candidates/${detail.id}/decision/retry`,
        token,
        { method: 'POST' }
      );

      setDecisionNotice(
        result.telegramSent
          ? currentLanguage === 'ru'
            ? 'Сообщение успешно отправлено кандидату в Telegram.'
            : 'Telegram xabari nomzodga muvaffaqiyatli yuborildi.'
          : currentLanguage === 'ru'
            ? 'Сообщение снова не доставлено. Проверьте токен бота и Telegram ID кандидата.'
            : 'Xabar yana yetkazilmadi. Bot tokeni va nomzod Telegram ID sini tekshiring.'
      );

      await open(detail.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDecisionBusy(false);
    }
  }

  async function addNote() {
    if (!notes.trim() || !detail) return;

    try {
      await request(`/candidates/${detail.id}/notes`, token, {
        method: 'POST',
        body: JSON.stringify({ text: notes })
      });
      setNotes('');
      await open(detail.id);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <>
      <Heading
        eyebrow="TALENT PIPELINE"
        title={qualified ? 'Qualified Candidates' : 'Candidates'}
        desc={
          qualified
            ? 'Candidates with an AI screening score of 70 or higher.'
            : 'Review applications, compare candidate profiles and manage hiring decisions.'
        }
        action={
          <button
            className="outline"
            onClick={async () => {
              try {
                const r = await fetch(API + '/reports/export', {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (!r.ok) throw new Error('Export failed');
                const blob = await r.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'candidates.csv';
                a.click();
                URL.revokeObjectURL(url);
              } catch (e: any) {
                setError(e.message);
              }
            }}
          >
            <Download size={16} /> {t('Export CSV')}
          </button>
        }
      />

      <div className="panel filters">
        <div className="search">
          <Search size={17} />
          <input
            placeholder={t('Search name or phone…')}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
        </div>

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="ALL">{t('All statuses')}</option>
          {['NEW', 'PENDING_REVIEW', 'QUALIFIED', 'INVITED', 'REJECTED', 'HIRED'].map(s => (
            <option key={s} value={s}>{translateStatus(s)}</option>
          ))}
        </select>

        <div className="scorefilter">
          <Filter size={15} />
          <span>{t('Min score')}</span>
          <input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={e => setScore(e.target.value)}
          />
        </div>

        <button className="primary" onClick={() => {
          setPage(1);
          load();
        }}>
          {t('Search')}
        </button>
      </div>

      <div className="panel tablepanel">
        <div className="paneltitle">
          <div>
            <h3>{t('All applications')} <span className="count">{total}</span></h3>
            <p>{t('Click a candidate to view their full application.')}</p>
          </div>
        </div>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>{t('Candidate')}</th>
                <th>{t('Position')}</th>
                <th>{t('AI score')}</th>
                <th>{t('Status')}</th>
                <th>{t('Applied date')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id} onClick={() => open(c.id)} className="clickrow">
                  <td>
                    <div className="person">
                      <div className="avatar muted">{c.fullName?.slice(0, 1)}</div>
                      <div>
                        <b>{c.fullName}</b>
                        <small>{c.phone || '—'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{c.vacancy?.title || '—'}</td>
                  <td>
                    <span className={`score ${c.aiScore >= 70 ? 'good' : ''}`}>
                      {c.aiScore}/100
                    </span>
                  </td>
                  <td><Status status={c.status} /></td>
                  <td>{new Date(c.createdAt).toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : 'uz-UZ')}</td>
                  <td><Eye size={16} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {!rows.length && (
            <div className="empty">{t('No candidates match these filters.')}</div>
          )}
        </div>

        <div className="pagination">
          <span>{t('Showing')} {rows.length} {t('of')} {total}</span>
          <div>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('Previous')}</button>
            <span>{page}</span>
            <button disabled={rows.length < 20} onClick={() => setPage(page + 1)}>{t('Next')}</button>
          </div>
        </div>
      </div>

      {detail && (
        <div className="modalback" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modalhead">
              <div>
                <div className="eyebrow">{t('CANDIDATE PROFILE')}</div>
                <h2>{detail.fullName}</h2>
                <p>
                  {detail.vacancy?.title} · {t('Applied')} {new Date(detail.createdAt).toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : 'uz-UZ')}
                </p>
              </div>
              <button className="iconbtn" onClick={() => setDetail(null)}><X /></button>
            </div>

            <div className="profilegrid">
              <div><small>{t('PHONE')}</small><b>{detail.phone || t('Not provided')}</b></div>
              <div><small>{t('EMAIL')}</small><b>{detail.email || t('Not provided')}</b></div>
              <div><small>{t('EXPERIENCE')}</small><b>{detail.experience || t('Not provided')}</b></div>
              <div><small>{t('AVAILABILITY')}</small><b>{detail.availability || t('Not provided')}</b></div>
            </div>

            <div className="scorehero">
              <div>
                <small>{t('AI SCREENING SCORE')}</small>
                <strong>{detail.aiScore}<small>/100</small></strong>
              </div>
              <Status status={detail.status} />
            </div>

            {decisionNotice && (
              <div className="decisionnotice">{decisionNotice}</div>
            )}

            {detail.decision && (
              <div className={`decisioncard ${detail.decision.deliveryStatus.toLowerCase()}`}>
                <div>
                  <small>
                    {currentLanguage === 'ru' ? 'РЕШЕНИЕ HR' : 'HR QARORI'}
                  </small>
                  <b>
                    {detail.decision.type === 'APPROVED'
                      ? currentLanguage === 'ru' ? 'Кандидат одобрен' : 'Nomzod ma’qullandi'
                      : currentLanguage === 'ru' ? 'Кандидату отказано' : 'Nomzod rad etildi'}
                  </b>
                  <span>
                    {detail.decision.deliveryStatus === 'SENT'
                      ? currentLanguage === 'ru' ? 'Telegram-сообщение доставлено' : 'Telegram xabari yetkazildi'
                      : currentLanguage === 'ru' ? 'Telegram-сообщение ожидает повторной отправки' : 'Telegram xabari qayta yuborilishi kerak'}
                  </span>
                </div>
                <Status status={detail.decision.deliveryStatus} />
              </div>
            )}

            <h3>{t('AI evaluation')}</h3>
            <p className="summary">
              {detail.aiSummary || t('AI evaluation has not been run for this candidate.')}
            </p>

            <div className="criteria">
              {Object.entries(detail.criteria || {}).map(([k, v]: any) => (
                <div key={k}><span>{k}</span><b>{v}/100</b></div>
              ))}
            </div>

            <h3>{t('Candidate answers')}</h3>
            {(detail.answers || []).map((a: any, i: number) => (
              <div className="answer" key={i}>
                <b>{a.question || `${t('Question')} ${i + 1}`}</b>
                <p>{a.answer || String(a)}</p>
              </div>
            ))}

            <h3>{t('Internal notes')}</h3>
            {(detail.notes || []).map((n: any) => (
              <div className="answer" key={n.id}>
                <p>{n.text}</p>
                <small>{n.author} · {new Date(n.createdAt).toLocaleString(currentLanguage === 'ru' ? 'ru-RU' : 'uz-UZ')}</small>
              </div>
            ))}

            <div className="noteadd">
              <input
                placeholder={t('Add an internal note…')}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              <button className="primary" onClick={addNote}>{t('Add note')}</button>
            </div>

            <h3>{t('Activity history')}</h3>
            {(detail.history || []).map((h: any) => (
              <div className="history" key={h.id}>
                <b>{h.action.replace(/_/g, ' ')}</b>
                <span>{h.details} · {h.actor} · {new Date(h.createdAt).toLocaleString(currentLanguage === 'ru' ? 'ru-RU' : 'uz-UZ')}</span>
              </div>
            ))}

            <div className="actions">
              {canWrite && !detail.decision && (
                <>
                  <button
                    className="primary"
                    disabled={decisionBusy}
                    onClick={() => decide('APPROVED')}
                  >
                    {decisionBusy
                      ? currentLanguage === 'ru' ? 'Отправка…' : 'Yuborilmoqda…'
                      : currentLanguage === 'ru' ? 'Одобрить' : 'Ma’qullash'}
                  </button>
                  <button
                    className="danger"
                    disabled={decisionBusy}
                    onClick={() => decide('REJECTED')}
                  >
                    {currentLanguage === 'ru' ? 'Отказать' : 'Rad etish'}
                  </button>
                </>
              )}

              {canWrite && detail.decision && detail.decision.deliveryStatus !== 'SENT' && (
                <button
                  className="outline"
                  disabled={decisionBusy}
                  onClick={retryDecisionDelivery}
                >
                  {currentLanguage === 'ru'
                    ? 'Повторить отправку в Telegram'
                    : 'Telegram xabarini qayta yuborish'}
                </button>
              )}

              {canWrite && detail.status === 'INVITED' && (
                <button className="outline" onClick={() => changeStatus('HIRED')}>
                  {t('Mark as hired')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AiEvaluation({
  token,
  setError,
  canWrite
}: {
  token: string;
  setError: (e: string) => void;
  canWrite: boolean;
}) {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [vacancyId, setVacancyId] = useState('');
  const [run, setRun] = useState<any>(null);
  const [eligibleTotal, setEligibleTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const ru = currentLanguage === 'ru';
  const recommendations = Array.isArray(run?.recommendations)
    ? run.recommendations
    : [];

  useEffect(() => {
    request('/vacancies', token)
      .then(data => setVacancies(Array.isArray(data) ? data : []))
      .catch((e: any) => setError(e.message));
  }, [token]);

  useEffect(() => {
    setLoading(true);
    setEligibleTotal(null);
    request(
      `/ai/recommendations/latest?vacancyId=${encodeURIComponent(vacancyId)}`,
      token
    )
      .then(data => setRun(data.run || null))
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, vacancyId]);

  async function startAnalysis() {
    try {
      setRunning(true);
      setError('');
      const data = await request('/ai/recommendations', token, {
        method: 'POST',
        body: JSON.stringify(vacancyId ? { vacancyId } : {})
      });
      setRun(data.run);
      setEligibleTotal(data.eligibleTotal);
    } catch (e: any) {
      const message = String(e.message || '');
      setError(
        message.includes('requires usage credits')
          ? ru
            ? 'Для Ollama Cloud нужно пополнить usage credits или активировать подписку.'
            : 'Ollama Cloud uchun usage credits to‘ldirish yoki obunani faollashtirish kerak.'
          : message
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <Heading
        eyebrow="AI TALENT REVIEW"
        title={ru ? 'Рекомендации ИИ' : 'AI tavsiyalari'}
        desc={ru
          ? 'Сравните до 100 активных кандидатов и получите приоритетный список для ручного рассмотрения.'
          : '100 tagacha faol nomzodni taqqoslang va qo‘lda ko‘rib chiqish uchun ustuvor ro‘yxat oling.'}
      />

      <div className="panel ai-toolbar">
        <div className="ai-filter">
          <label>{ru ? 'Вакансия' : 'Vakansiya'}</label>
          <select value={vacancyId} onChange={e => setVacancyId(e.target.value)}>
            <option value="">{ru ? 'Все вакансии' : 'Barcha vakansiyalar'}</option>
            {vacancies.map(vacancy => (
              <option value={vacancy.id} key={vacancy.id}>{vacancy.title}</option>
            ))}
          </select>
        </div>

        <button
          className="primary ai-run-button"
          onClick={startAnalysis}
          disabled={!canWrite || running}
          title={!canWrite
            ? ru ? 'Недоступно для роли Viewer' : 'Viewer roli uchun mavjud emas'
            : undefined}
        >
          <BrainCircuit size={17} />
          {running
            ? ru ? 'ИИ анализирует…' : 'AI tahlil qilmoqda…'
            : ru ? 'Запустить AI-анализ' : 'AI tahlilni boshlash'}
        </button>
      </div>

      <div className="ai-advisory">
        <ShieldCheck size={18} />
        <div>
          <b>{ru ? 'Рекомендательный инструмент' : 'Tavsiya vositasi'}</b>
          <span>
            {ru
              ? 'ИИ не принимает решение о найме или отказе. Перед отправкой в Groq Cloud удаляются имя, контакты, ссылки и Telegram-имена; финальное решение всегда принимает HR.'
              : 'AI ishga olish yoki rad etish qarorini qabul qilmaydi. Groq Cloud’ga yuborishdan oldin ism, aloqa ma’lumotlari, havolalar va Telegram nomlari olib tashlanadi; yakuniy qarorni HR qabul qiladi.'}
          </span>
        </div>
      </div>

      {loading && <div className="panel empty">{t('Loading workspace…')}</div>}

      {!loading && !run && (
        <div className="panel ai-empty">
          <BrainCircuit size={34} />
          <h3>{ru ? 'Анализ ещё не запускался' : 'Tahlil hali ishga tushirilmagan'}</h3>
          <p>
            {ru
              ? 'Выберите вакансию или проанализируйте всех активных кандидатов.'
              : 'Vakansiyani tanlang yoki barcha faol nomzodlarni tahlil qiling.'}
          </p>
        </div>
      )}

      {!loading && run && (
        <>
          <div className="ai-summary-grid">
            <div className="panel ai-summary-card">
              <small>{ru ? 'ПРОАНАЛИЗИРОВАНО' : 'TAHLIL QILINDI'}</small>
              <strong>{run.totalCandidates}</strong>
              <span>
                {eligibleTotal && eligibleTotal > run.totalCandidates
                  ? ru
                    ? `из ${eligibleTotal} активных · лимит 100`
                    : `${eligibleTotal} faol nomzoddan · limit 100`
                  : ru ? 'активных кандидатов' : 'faol nomzod'}
              </span>
            </div>
            <div className="panel ai-summary-card recommended">
              <small>{ru ? 'РЕКОМЕНДОВАНО К ПРОСМОТРУ' : 'KO‘RIB CHIQISH TAVSIYA ETILDI'}</small>
              <strong>{run.recommendedCount}</strong>
              <span>{ru ? 'приоритетных анкет' : 'ustuvor anketa'}</span>
            </div>
            <div className="panel ai-summary-card">
              <small>{ru ? 'МОДЕЛЬ' : 'MODEL'}</small>
              <strong className="ai-model">{run.model}</strong>
              <span>{new Date(run.createdAt).toLocaleString(ru ? 'ru-RU' : 'uz-UZ')}</span>
            </div>
          </div>

          <div className="panel ai-insight">
            <div>
              <small>{ru ? 'ВЫВОД ИИ' : 'AI XULOSASI'}</small>
              <h3>{run.summary}</h3>
            </div>
            <div className="ai-criteria-box">
              <small>{ru ? 'ПРИНЦИП ОТБОРА' : 'TANLASH TAMOYILI'}</small>
              <p>{run.selectionCriteria}</p>
            </div>
          </div>

          <div className="panel ai-ranking">
            <div className="paneltitle">
              <div>
                <h3>{ru ? 'Рейтинг кандидатов' : 'Nomzodlar reytingi'}</h3>
                <p>
                  {ru
                    ? 'Имена возвращаются только внутри вашей админ-панели.'
                    : 'Ismlar faqat admin panelingiz ichida ko‘rsatiladi.'}
                </p>
              </div>
              <span className="tag">{run.vacancyTitle || (ru ? 'ВСЕ ВАКАНСИИ' : 'BARCHA VAKANSIYALAR')}</span>
            </div>

            <div className="ai-candidate-list">
              {recommendations.map((item: any) => (
                <div
                  className={`ai-candidate-row ${item.recommended ? 'is-recommended' : ''}`}
                  key={item.candidate.id}
                >
                  <div className="ai-rank">#{item.rank}</div>
                  <div className="ai-candidate-main">
                    <div className="ai-candidate-title">
                      <div>
                        <b>{item.candidate.fullName}</b>
                        <span>{item.candidate.vacancyTitle}</span>
                      </div>
                      {item.recommended && (
                        <span className="ai-recommended">
                          <CheckCircle2 size={13} />
                          {ru ? 'Рассмотреть' : 'Ko‘rib chiqish'}
                        </span>
                      )}
                    </div>
                    <p>{item.reason}</p>
                    <div className="ai-evidence">
                      {(item.strengths || []).map((strength: string, index: number) => (
                        <span className="strength" key={`s-${index}`}>+ {strength}</span>
                      ))}
                      {(item.concerns || []).map((concern: string, index: number) => (
                        <span className="concern" key={`c-${index}`}>! {concern}</span>
                      ))}
                    </div>
                  </div>
                  <div className="ai-score">
                    <strong>{item.score}</strong><small>/100</small>
                    <span>{item.verdict}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-run-meta">
              {ru ? 'Запустил' : 'Ishga tushirdi'}: {run.createdBy}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Vacancies({
  token,
  user,
  setError
}: {
  token: string;
  user: User;
  setError: (e: string) => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await request('/vacancies', token);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function save() {
    if (!form) return;

    if (!form.title?.trim() || !form.description?.trim()) {
      setError(
        currentLanguage === 'ru'
          ? 'Название и описание обязательны.'
          : 'Vakansiya nomi va tavsifi kiritilishi shart.'
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: (form.requirements || '').trim(),
        schedule: (form.schedule || 'Full-time').trim(),
        active: Boolean(form.active),
        questions: typeof form.questions === 'string'
          ? form.questions.split('\n').map((q: string) => q.trim()).filter(Boolean)
          : (form.questions || [])
      };

      if (form.id) {
        await request('/vacancies/' + form.id, token, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await request('/vacancies', token, {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            active: undefined
          })
        });
      }

      setForm(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(v: any) {
    try {
      await request('/vacancies/' + v.id, token, {
        method: 'PUT',
        body: JSON.stringify({
          title: v.title,
          description: v.description,
          requirements: v.requirements || '',
          schedule: v.schedule || 'Full-time',
          questions: v.questions || [],
          active: !v.active
        })
      });

      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function removeVacancy(v: any) {
    if (v._count?.candidates > 0) {
      setError(
        currentLanguage === 'ru'
          ? 'У этой вакансии есть заявки. Вместо удаления деактивируйте её.'
          : 'Ushbu vakansiyaga arizalar mavjud. Uni o‘chirish o‘rniga faolsizlantiring.'
      );
      return;
    }

    const confirmed = window.confirm(
      currentLanguage === 'ru'
        ? `Вы действительно хотите удалить "${v.title}"? Это действие нельзя отменить.`
        : `"${v.title}" vakansiyasini o‘chirmoqchimisiz? Bu amalni bekor qilib bo‘lmaydi.`
    );

    if (!confirmed) return;

    try {
      await request('/vacancies/' + v.id, token, {
        method: 'DELETE'
      });

      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <>
      <Heading
        eyebrow="HIRING MANAGEMENT"
        title="FasKids Vacancies"
        desc="Create, edit, activate, deactivate and manage the roles available in your Telegram bot."
        action={
          user.role === 'VIEWER' ? null : (
            <button
              className="primary"
              onClick={() => setForm({
                title: '',
                description: '',
                requirements: '',
                schedule: 'Full-time',
                active: true,
                questions: ''
              })}
            >
              <Plus size={16} /> {t('New vacancy')}
            </button>
          )
        }
      />

      <div className="vacancygrid">
        {items.map(v => (
          <div className="panel vacancy" key={v.id}>
            <div className="vacancyhead">
              <div className="vacancyicon"><BriefcaseBusiness /></div>
              <span className={`status ${v.active ? 'qualified' : 'rejected'}`}>
                {v.active ? t('ACTIVE') : t('INACTIVE')}
              </span>
            </div>

            <h3>{v.title}</h3>
            <p>{v.description}</p>

            <div className="vacancymeta">
              <span><Users size={15} /> {v._count?.candidates || 0} {t('applicants')}</span>
              <span>
                {v.schedule === 'Full-time'
                  ? t('Full-time')
                  : v.schedule}
              </span>
            </div>

            {user.role !== 'VIEWER' && (
              <div className="vacancyactions">
                <button
                  className="outline"
                  onClick={() => setForm({
                    ...v,
                    questions: (v.questions || []).join('\n')
                  })}
                >
                  <Pencil size={14} /> {t('Edit')}
                </button>

                <button className="textbtn" onClick={() => toggle(v)}>
                  <Power size={14} />
                  {v.active ? t('Deactivate') : t('Activate')}
                </button>

                {user.role === 'SUPER_ADMIN' && (
                  <button
                    className="textbtn"
                    disabled={(v._count?.candidates || 0) > 0}
                    onClick={() => removeVacancy(v)}
                    title={
                      (v._count?.candidates || 0) > 0
                        ? currentLanguage === 'ru'
                          ? 'Нельзя удалить вакансию с заявками'
                          : 'Arizalari mavjud vakansiyani o‘chirib bo‘lmaydi'
                        : t('Delete')
                    }
                  >
                    <Trash2 size={14} /> {t('Delete')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!items.length && (
        <div className="panel empty">
          {t('No vacancies yet. Click "New vacancy" to create your first vacancy.')}
        </div>
      )}

      {form && (
        <div className="modalback" onClick={() => !saving && setForm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modalhead">
              <div>
                <div className="eyebrow">FASKIDS RECRUITMENT</div>
                <h2>{form.id ? t('Edit vacancy') : t('Create vacancy')}</h2>
              </div>
              <button
                className="iconbtn"
                disabled={saving}
                onClick={() => setForm(null)}
              >
                <X />
              </button>
            </div>

            <label className="field">
              {t('Job title')}
              <input
                value={form.title || ''}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder={currentLanguage === 'ru' ? 'Например: Менеджер по продажам' : 'Masalan: Savdo menejeri'}
              />
            </label>

            <label className="field">
              {t('Description')}
              <textarea
                rows={3}
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder={currentLanguage === 'ru' ? 'Опишите обязанности...' : 'Vazifalarni tavsiflang...'}
              />
            </label>

            <label className="field">
              {t('Requirements')}
              <textarea
                rows={3}
                value={form.requirements || ''}
                onChange={e => setForm({ ...form, requirements: e.target.value })}
                placeholder={currentLanguage === 'ru' ? 'Укажите требования к должности...' : 'Lavozim talablarini kiriting...'}
              />
            </label>

            <label className="field">
              {t('Work schedule')}
              <input
                value={form.schedule || ''}
                onChange={e => setForm({ ...form, schedule: e.target.value })}
                placeholder={currentLanguage === 'ru' ? 'Полный день / смены' : 'To‘liq kun / smena'}
              />
            </label>

            <label className="field">
              {t('Interview questions (one per line)')}
              <textarea
                rows={6}
                value={form.questions || ''}
                onChange={e => setForm({ ...form, questions: e.target.value })}
                placeholder={currentLanguage === 'ru' ? 'Введите каждый вопрос с новой строки...' : 'Har bir savolni yangi qatordan kiriting...'}
              />
            </label>

            <button
              className="primary full"
              disabled={saving}
              onClick={save}
            >
              {saving ? t('Saving...') : t('Save vacancy')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Notifications({ token }: { token: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    request('/notifications', token)
      .then(setItems)
      .catch(e => setError(e.message));
  }, [token]);

  async function read(id: string) {
    try {
      await request('/notifications/' + id + '/read', token, {
        method: 'PATCH'
      });
      setItems(items.map(x => x.id === id ? { ...x, read: true } : x));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <>
      <Heading
        eyebrow="ACTIVITY"
        title="Notifications"
        desc="Stay up to date with candidate and hiring activity."
      />

      {error && <div className="error">{error}</div>}

      <div className="panel notifications">
        {items.map(n => (
          <div className={`notification ${n.read ? 'read' : ''}`} key={n.id}>
            <div className="notificationicon"><Bell size={17} /></div>
            <div>
              <b>{n.title}</b>
              <p>{n.message}</p>
              <small>{new Date(n.createdAt).toLocaleString(currentLanguage === 'ru' ? 'ru-RU' : 'uz-UZ')}</small>
            </div>
            {!n.read && (
              <button className="textbtn" onClick={() => read(n.id)}>
                {t('Mark read')}
              </button>
            )}
          </div>
        ))}

        {!items.length && <div className="empty">{t('No notifications yet.')}</div>}
      </div>
    </>
  );
}

function SettingsPage({
  token,
  user,
  setError
}: {
  token: string;
  user: User;
  setError: (e: string) => void;
}) {
  const [store, setStore] = useState('FasKids');
  const [threshold, setThreshold] = useState(70);

  useEffect(() => {
    request('/settings', token)
      .then(d => {
        setStore(d.storeName || 'FasKids');
        setThreshold(Number(d.qualificationThreshold || 70));
      })
      .catch(e => setError(e.message));
  }, [token]);

  async function save() {
    try {
      await request('/settings', token, {
        method: 'PUT',
        body: JSON.stringify({
          storeName: store,
          qualificationThreshold: threshold
        })
      });

      alert(
        currentLanguage === 'ru'
          ? 'Настройки сохранены'
          : 'Sozlamalar saqlandi'
      );
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <>
      <Heading
        eyebrow="CONFIGURATION"
        title="Settings"
        desc="Manage the core preferences for your HR workspace."
      />

      <div className="settingsgrid">
        <div className="panel settingpanel">
          <h3>{t('General settings')}</h3>
          <p>{t('Basic details for your store and hiring process.')}</p>

          <label className="field">
            {t('Store name')}
            <input value={store} onChange={e => setStore(e.target.value)} />
          </label>

          <label className="field">
            {t('AI qualification threshold')} <b>{threshold}/100</b>
            <input
              type="range"
              min="0"
              max="100"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
            />
            <small>{t('Candidates meeting this score appear in Qualified Candidates.')}</small>
          </label>

          <button className="primary" disabled={user.role !== 'SUPER_ADMIN'} onClick={save}>
            {t('Save settings')}
          </button>

          {user.role !== 'SUPER_ADMIN' && (
            <small>{t('Only Super Admin can change settings.')}</small>
          )}
        </div>

        <div className="panel settingpanel">
          <h3>{t('Security & integrations')}</h3>
          <p>{t('Keep credentials private and configure integrations on the server.')}</p>

          <div className="integration">
            <Bot />
            <div>
              <b>{t('Telegram Bot API')}</b>
              <small>
                {currentLanguage === 'ru'
                  ? 'Настройте TELEGRAM_BOT_TOKEN в bot/.env'
                  : 'TELEGRAM_BOT_TOKEN qiymatini bot/.env faylida sozlang'}
              </small>
            </div>
            <span className="status pending_review">{t('SERVER ENV')}</span>
          </div>

          <div className="integration">
            <BrainCircuit />
            <div>
              <b>{t('AI evaluation')}</b>
              <small>{t('AI provider will be configured on the server.')}</small>
            </div>
            <span className="status pending_review">{t('SERVER ENV')}</span>
          </div>

          <div className="integration">
            <ShieldCheck />
            <div>
              <b>{t('JWT authentication')}</b>
              <small>
                {currentLanguage === 'ru'
                  ? 'Используйте уникальный секрет длиной не менее 32 символов'
                  : 'Kamida 32 belgidan iborat maxfiy kalitdan foydalaning'}
              </small>
            </div>
            <span className="status qualified">{t('ENABLED')}</span>
          </div>
        </div>
      </div>
    </>
  );
}
