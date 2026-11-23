export const SURVEY_INFO = {
  channelName: "راز زیبایی ماندگار | از نگاه علم",
  brandName: "GLOW LUX",
  subtitle: "نظرسنجی تخصصی و نیازسنجی مخاطبان",
  description: "به نظرسنجی ویژه کانال «راز زیبایی ماندگار» خوش آمدید. دیدگاه‌ها و نیازهای واقعی شما نقشه راه ما در تولید آموزش‌ها و انتخاب برترین محصولات علمی و بهداشتی است.",
  estimatedTime: "کمتر از ۲ دقیقه",
  privacyNotice: "این نظرسنجی کاملاً بی‌نام بوده و نیازی به وارد کردن هیچ‌گونه اطلاعات فردی (مانند نام یا شماره تماس) نیست."
};

export const DEFAULT_QUESTIONS = [
  {
    id: "q1",
    section: "بخش اول: سلامت و تناسب اندام",
    sectionBadge: "تناسب اندام",
    question: "کدوم موضوع درباره تناسب اندام بیشتر دغدغه شماست؟",
    type: "choice",
    options: [
      "اضافه وزن و چاقی",
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
    question: "دوست داری درباره چه موضوعی بیشتر آموزش ببینی؟",
    type: "choice",
    options: [
      "تغذیه سالم",
      "کنترل وزن",
      "افزایش انرژی و شادابی",
      "سبک زندگی سالم"
    ]
  },
  {
    id: "q3",
    section: "بخش دوم: سلامت دهان و دندان",
    sectionBadge: "بهداشت دهان و دندان",
    question: "کدوم مشکل دهان و دندان بیشتر برات مطرحه؟",
    type: "choice",
    options: [
      "بوی نامطبوع دهان",
      "حساسیت دندان",
      "پوسیدگی و مشکلات لثه",
      "زردی و تغییر رنگ دندان",
      "بیشتر به پیشگیری و مراقبت علاقه دارم"
    ]
  },
  {
    id: "q4",
    section: "بخش سوم: دردهای عضلانی و مفصلی",
    sectionBadge: "سلامت مفاصل و عضلات",
    question: "آیا با دردهای عضلانی یا مفصلی مواجه هستی؟",
    type: "choice",
    options: [
      "کمردرد",
      "زانودرد و پادرد",
      "درد مفاصل",
      "گردندرد و گرفتگی عضلات",
      "خیر، مشکلی ندارم"
    ]
  },
  {
    id: "q5",
    section: "بخش چهارم: سلامت و زیبایی مو",
    sectionBadge: "مراقبت مو",
    question: "مهم‌ترین دغدغه‌ات درباره موهات چیه؟",
    type: "choice",
    options: [
      "ریزش مو",
      "نازکی و کم‌پشتی",
      "خشکی و شکنندگی",
      "چربی و شوره سر",
      "رشد کم و ضعیف بودن مو"
    ]
  },
  {
    id: "q6",
    section: "بخش پنجم: پوست بدن",
    sectionBadge: "مراقبت پوست",
    question: "درباره پوست بدنت کدوم مشکل رو بیشتر تجربه می‌کنی؟",
    type: "choice",
    options: [
      "خشکی و زبری پوست",
      "تیرگی آرنج، زانو و نواحی بدن",
      "جوش بدن",
      "لک و ناهمواری پوست",
      "شل‌شدن و کاهش استحکام پوست"
    ]
  },
  {
    id: "q7",
    section: "بخش ششم: انگیزه، هدف و درآمد",
    sectionBadge: "انگیزه و اشتغال",
    question: "این روزها کدوم موضوع بیشتر ذهنت رو مشغول کرده؟",
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
    id: "q8",
    section: "بخش ششم: انگیزه، هدف و درآمد",
    sectionBadge: "فرصت‌های درآمدی",
    question: "اگر فرصتی برای کسب درآمد در کنار فعالیت‌های روزمره‌ات داشته باشی، چقدر برات جذابه؟",
    type: "choice",
    options: [
      "خیلی زیاد، دنبالش هستم",
      "دوست داری بیشتر بدونم",
      "اگر زمان و شرایطش مناسب باشه",
      "فعلاً علاقه‌ای ندارم"
    ]
  },
  {
    id: "q9",
    section: "بخش ششم: انگیزه، هدف و درآمد",
    sectionBadge: "رشد فردی",
    question: "دوست داری در چه زمینه‌ای بیشتر رشد کنی؟",
    type: "choice",
    options: [
      "اعتمادبه‌نفس و مهارت‌های فردی",
      "درآمد و استقلال مالی",
      "یادگیری مهارت‌های جدید",
      "سلامتی و زیبایی",
      "همه موارد"
    ]
  },
  {
    id: "q10",
    section: "بخش پایانی: پیشنهادات و انتقادات",
    sectionBadge: "نظرات شما",
    question: "هرگونه نظر، انتقاد، پیشنهاد یا درخواست محصول/محتوا برای کانال «راز زیبایی ماندگار | GLOW LUX» دارید با ما در میان بگذارید:",
    type: "text",
    placeholder: "اینجا بنویسید... نظرات صادقانه شما برای ما فوق‌العاده با ارزش است (اختیاری)",
    required: false
  }
];

export const QUESTIONS = DEFAULT_QUESTIONS;

const QUESTIONS_STORAGE_KEY = 'glow_lux_survey_questions_v1';

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
