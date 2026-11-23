export const SURVEY_INFO = {
  channelName: "راز زیبایی ماندگار | از نگاه علم",
  brandName: "GLOW LUX",
  title: "🌸 نظرسنجی نیازسنجی مخاطبان GLOW LUX",
  subtitle: "دغدغه‌ها در زمینه زیبایی، سلامت پوست و مو",
  description: "دوستان عزیز، دوست داریم بدونیم بیشتر چه دغدغه‌هایی در زمینه زیبایی، سلامت پوست و مو دارید تا مطالب آینده کانال رو بر اساس نیاز و علاقه شما آماده کنیم. ❤️",
  contactPhone: "09370776973",
  contactPhoneDisplay: "۰۹۳۷۰۷۷۶۹۷۳",
  contactId: "@Zieba_Nafis",
  contactIdLink: "https://t.me/Zieba_Nafis",
  supportMessage: "ما اینجا هستیم تا به دغدغه‌های واقعی شما پاسخ بدیم. اگر برای شناخت نیازهای پوست و مو یا انتخاب محصولات مراقبتی مناسب به راهنمایی نیاز دارید، می‌تونید با ما در ارتباط باشید.",
  estimatedTime: "کمتر از ۲ دقیقه",
  privacyNotice: "این نظرسنجی کاملاً بی‌نام بوده و نیازی به وارد کردن هیچ‌گونه اطلاعات فردی نیست."
};

export const DEFAULT_QUESTIONS = [
  {
    id: "q_skin",
    section: "بخش اول: سلامت و زیبایی پوست",
    sectionBadge: "مشکلات پوستی",
    question: "دوست دارید بیشتر درباره کدام مشکلات پوستی در کانال صحبت کنیم؟",
    type: "choice",
    options: [
      "لک‌های پوستی و جای جوش",
      "تیرگی زیر چشم و نواحی مختلف بدن",
      "جوش و آکنه",
      "خشکی و کم‌آبی پوست",
      "چربی بیش از حد پوست",
      "منافذ باز و بافت ناهموار پوست",
      "چین‌وچروک و افتادگی پوست",
      "حساسیت، قرمزی و التهاب پوست"
    ]
  },
  {
    id: "q_hair",
    section: "بخش دوم: سلامت و مراقبت مو",
    sectionBadge: "سلامت مو",
    question: "مهم‌ترین دغدغه شما درباره مو چیست؟",
    type: "choice",
    options: [
      "ریزش مو",
      "شوره و خارش پوست سر",
      "خشکی و شکنندگی مو",
      "موخوره و وز شدن مو",
      "چربی بیش از حد کف سر",
      "کم‌پشتی و کاهش حجم مو",
      "کدر شدن و آسیب‌دیدگی مو"
    ]
  },
  {
    id: "q_topics",
    section: "بخش سوم: موضوعات آموزشی و محتوایی",
    sectionBadge: "موضوعات مورد علاقه",
    question: "دوست دارید درباره کدام موضوعات بیشتر اطلاعات داشته باشید؟",
    type: "choice",
    options: [
      "آبرسانی و مراقبت روزانه پوست",
      "جوانسازی و پیشگیری از چروک",
      "روش‌های مراقبت از پوست و مو",
      "شناخت محصولات و ترکیبات مؤثر",
      "مراقبت از بدن و رفع تیرگی‌ها",
      "کاهش وزن و تناسب اندام",
      "دردهای عضلانی و راهکارهای مراقبتی"
    ]
  },
  {
    id: "q_feedback",
    section: "بخش چهارم: پرسش‌ها و نظرات شما",
    sectionBadge: "پاسخ به سوالات شما",
    question: "آیا درباره مشکل خاصی در زمینه پوست یا مو سؤال دارید که دوست دارید در کانال به آن پاسخ بدهیم؟",
    type: "text",
    placeholder: "سؤالات، دغدغه‌ها و پیشنهادهای خود را اینجا بنویسید (یا در پیام خصوصی با ما مطرح کنید)...",
    required: false
  }
];

export const QUESTIONS = DEFAULT_QUESTIONS;

const QUESTIONS_STORAGE_KEY = 'glow_lux_survey_questions_v2';

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
