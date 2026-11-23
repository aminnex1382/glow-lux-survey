export const SURVEY_INFO = {
  channelName: "راز زیبایی ماندگار، از نگاه علم",
  brandName: "GLOW LUX",
  title: "🌸 نظرسنجی جامع شناخت نیازها و دغدغه‌های شما در GLOW LUX",
  subtitle: "نیازسنجی تخصصی زیبایی، پوست، مو و سبک زندگی سالم",
  description: "همراهان عزیز، دوست داریم بیشتر با نیازها، دغدغه‌ها و علاقه‌مندی‌های شما آشنا بشیم تا مطالب آموزشی و کاربردی کانال رو بر اساس خواسته‌های خودتون آماده کنیم. لطفاً در نظرسنجی زیر شرکت کنید. ❤️",
  contactPhone: "09370776973",
  contactPhoneDisplay: "۰۹۳۷۰۷۷۶۹۷۳",
  contactId: "@Zieba_Nafis",
  contactIdLink: "https://rubika.ir/Zieba_Nafis",
  rubikaId: "@Zieba_Nafis",
  rubikaLink: "https://rubika.ir/Zieba_Nafis",
  telegramId: "@Zieba_Nafis",
  telegramLink: "https://t.me/Zieba_Nafis",
  supportTitle: "💗 حرف آخر؛ دوست داریم بیشتر از شما بشنویم!",
  supportMessage: "اگر مشکل یا سؤال خاصی درباره پوست، مو، زیبایی و سلامت دارید که در گزینه‌ها به آن اشاره نشده، یا برای انتخاب محصولات مراقبتی مناسب به راهنمایی نیاز دارید، می‌تونید با ما در ارتباط باشید.",
  estimatedTime: "کمتر از ۲ دقیقه",
  privacyNotice: "این نظرسنجی کاملاً بی‌نام بوده و پاسخ‌های شما مستقیماً نقشه راه محتوای آینده GLOW LUX را مشخص می‌کند."
};

export const DEFAULT_QUESTIONS = [
  // بخش اول: سلامت و تناسب اندام
  {
    id: "q1",
    section: "بخش اول: سلامت و تناسب اندام",
    sectionBadge: "تناسب اندام",
    question: "۱. کدوم موضوع درباره تناسب اندام بیشتر دغدغه شماست؟",
    type: "choice",
    options: [
      "اضافه‌وزن و چاقی",
      "لاغری و کمبود وزن",
      "چربی شکم و پهلو",
      "تناسب اندام و حفظ وزن",
      "فعلاً دغدغه‌ای ندارم"
    ]
  },
  {
    id: "q2",
    section: "بخش اول: سلامت و تناسب اندام",
    sectionBadge: "آموزش سلامتی",
    question: "۲. دوست دارید درباره چه موضوعی بیشتر آموزش ببینید؟",
    type: "choice",
    options: [
      "تغذیه سالم",
      "کنترل وزن",
      "افزایش انرژی و شادابی",
      "سبک زندگی سالم"
    ]
  },

  // بخش دوم: سلامت دهان و دندان
  {
    id: "q3",
    section: "بخش دوم: سلامت دهان و دندان",
    sectionBadge: "بهداشت دهان و دندان",
    question: "۳. کدوم مشکل دهان و دندان بیشتر براتون مطرحه؟",
    type: "choice",
    options: [
      "بوی نامطبوع دهان",
      "حساسیت دندان",
      "پوسیدگی و مشکلات لثه",
      "زردی و تغییر رنگ دندان",
      "پیشگیری و مراقبت از دهان و دندان"
    ]
  },

  // بخش سوم: دردهای عضلانی و مفصلی
  {
    id: "q4",
    section: "بخش سوم: دردهای عضلانی و مفصلی",
    sectionBadge: "عضلات و مفاصل",
    question: "۴. آیا با دردهای عضلانی یا مفصلی مواجه هستید؟",
    type: "choice",
    options: [
      "کمردرد",
      "زانودرد و پادرد",
      "درد مفاصل",
      "گردن‌درد و گرفتگی عضلات",
      "خیر، مشکلی ندارم"
    ]
  },

  // بخش چهارم: سلامت و زیبایی پوست صورت
  {
    id: "q5",
    section: "بخش چهارم: سلامت و زیبایی پوست صورت",
    sectionBadge: "مشکلات پوستی",
    question: "۵. دوست دارید بیشتر درباره کدام مشکلات پوستی آموزش ببینید؟",
    type: "choice",
    options: [
      "لک‌های پوستی و جای جوش",
      "جوش و آکنه",
      "تیرگی زیر چشم",
      "خشکی و کم‌آبی پوست",
      "چربی بیش از حد پوست",
      "منافذ قابل مشاهده پوست",
      "چین‌وچروک و افتادگی پوست",
      "حساسیت، قرمزی و التهاب"
    ]
  },
  {
    id: "q6",
    section: "بخش چهارم: سلامت و زیبایی پوست صورت",
    sectionBadge: "مراقبت پوست صورت",
    question: "۶. درباره مراقبت از پوست صورت بیشتر به کدام موضوع علاقه دارید؟",
    type: "choice",
    options: [
      "آبرسانی و مرطوب‌کنندگی",
      "پاکسازی صحیح پوست",
      "جوانسازی و پیشگیری از چروک",
      "شناخت محصولات و ترکیبات مؤثر",
      "روتین مراقبتی مناسب پوست"
    ]
  },

  // بخش پنجم: سلامت و زیبایی مو
  {
    id: "q7",
    section: "بخش پنجم: سلامت و زیبایی مو",
    sectionBadge: "سلامت مو",
    question: "۷. مهم‌ترین دغدغه شما درباره موهاتون چیه؟",
    type: "choice",
    options: [
      "ریزش مو",
      "نازکی و کم‌پشتی مو",
      "خشکی و شکنندگی",
      "چربی و شوره سر",
      "موخوره و وز شدن مو",
      "رشد کم و ضعیف بودن مو"
    ]
  },

  // بخش ششم: پوست بدن
  {
    id: "q8",
    section: "بخش ششم: پوست بدن",
    sectionBadge: "مراقبت بدن",
    question: "۸. درباره پوست بدنتون کدوم مشکل رو بیشتر تجربه می‌کنید؟",
    type: "choice",
    options: [
      "خشکی و زبری پوست",
      "تیرگی آرنج، زانو و نواحی مختلف بدن",
      "جوش بدن",
      "لک و ناهمواری پوست",
      "شل‌شدن و کاهش استحکام پوست"
    ]
  },

  // بخش هفتم: انگیزه، هدف و درآمد
  {
    id: "q9",
    section: "بخش هفتم: انگیزه، هدف و درآمد",
    sectionBadge: "دغدغه فکری",
    question: "۹. این روزها کدوم موضوع بیشتر ذهنتون رو مشغول کرده؟",
    type: "choice",
    options: [
      "نیاز به درآمد بیشتر",
      "پیدا کردن شغل یا فرصت کاری",
      "رسیدن به استقلال مالی",
      "پیدا کردن انگیزه و هدف",
      "رشد فردی و پیشرفت"
    ]
  },
  {
    id: "q10",
    section: "بخش هفتم: انگیزه، هدف و درآمد",
    sectionBadge: "فرصت‌های درآمدی",
    question: "۱۰. اگر فرصتی برای کسب درآمد در کنار فعالیت‌های روزمره‌تون داشته باشید، چقدر براتون جذابه؟",
    type: "choice",
    options: [
      "خیلی زیاد، دنبالش هستم",
      "دوست دارم بیشتر بدونم",
      "اگر زمان و شرایطش مناسب باشه",
      "فعلاً علاقه‌ای ندارم"
    ]
  },
  {
    id: "q11",
    section: "بخش هفتم: انگیزه، هدف و درآمد",
    sectionBadge: "رشد فردی",
    question: "۱۱. دوست دارید در چه زمینه‌ای بیشتر رشد کنید؟",
    type: "choice",
    options: [
      "اعتمادبه‌نفس و مهارت‌های فردی",
      "درآمد و استقلال مالی",
      "یادگیری مهارت‌های جدید",
      "سلامتی و زیبایی",
      "همه موارد"
    ]
  },

  // بخش پایانی: سوال تشریحی و تایپی
  {
    id: "q12",
    section: "بخش پایانی: پرسش‌ها و نظرات شما",
    sectionBadge: "ارتباط مستقیم",
    question: "۱۲. آیا درباره مشکل خاصی در زمینه پوست، مو، زیبایی یا سلامت سؤال یا نظری دارید که در گزینه‌های بالا به آن اشاره نشده؟",
    type: "text",
    placeholder: "سؤالات، دغدغه‌ها و پیشنهادهای خود را اینجا بنویسید (یا در پیام خصوصی با ما مطرح کنید)...",
    required: false
  }
];

export const QUESTIONS = DEFAULT_QUESTIONS;

const QUESTIONS_STORAGE_KEY = 'glow_lux_survey_questions_v4';

export function getDynamicQuestions() {
  try {
    const raw = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load dynamic questions:', e);
  }
  return DEFAULT_QUESTIONS;
}

export function saveDynamicQuestions(questionsList) {
  try {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questionsList));
  } catch (e) {
    console.error('Failed to save dynamic questions:', e);
  }
}

export function resetDynamicQuestions() {
  try {
    localStorage.removeItem(QUESTIONS_STORAGE_KEY);
  } catch (e) {}
  return DEFAULT_QUESTIONS;
}
