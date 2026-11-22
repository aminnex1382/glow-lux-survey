// Initial fallback responses if offline or running as static build
const INITIAL_FALLBACK_DATA = [
  {
    "id": "sample-1",
    "submittedAt": "2026-11-22T14:30:00.000Z",
    "answers": {
      "q1": "چربی شکم و پهلو",
      "q2": "تغذیه سالم",
      "q3": "زردی و تغییر رنگ دندان",
      "q4": "کمردرد",
      "q5": "ریزش مو",
      "q6": "خشکی و زبری پوست",
      "q7": "رسیدن به استقلال مالی",
      "q8": "خیلی زیاد، دنبالش هستم",
      "q9": "همه موارد",
      "q10": "کانال بسیار عالی و با کلاسی دارید. لطفاً بیشتر در مورد مکمل‌های کلاژن و روتین پوستی روز و شب توضیح بدید."
    },
    "contact": {
      "fullName": "مریم رضایی",
      "phone": "09123456789",
      "savedAt": "2026-11-22T14:32:00.000Z"
    }
  },
  {
    "id": "sample-2",
    "submittedAt": "2026-11-22T18:15:00.000Z",
    "answers": {
      "q1": "تناسب اندام و حفظ وزن",
      "q2": "سبک زندگی سالم",
      "q3": "بیشتر به پیشگیری و مراقبت علاقه دارم",
      "q4": "گردندرد و گرفتگی عضلات",
      "q5": "نازکی و کم‌پشتی",
      "q6": "لک و ناهمواری پوست",
      "q7": "رشد فردی و پیشرفت",
      "q8": "دوست داری بیشتر بدونم",
      "q9": "یادگیری مهارت‌های جدید",
      "q10": "معرفی محصولات گیاهی و بدون عوارض رو در اولویت قرار بدید ممنون از زحماتتون."
    },
    "contact": {
      "fullName": "سارا محمدی",
      "phone": "09351234567",
      "savedAt": "2026-11-22T18:17:00.000Z"
    }
  },
  {
    "id": "sample-3",
    "submittedAt": "2026-11-22T21:05:00.000Z",
    "answers": {
      "q1": "اضافه وزن و چاقی",
      "q2": "کنترل وزن",
      "q3": "پوسیدگی و مشکلات لثه",
      "q4": "زانودرد و پادرد",
      "q5": "خشکی و شکنندگی",
      "q6": "تیرگی آرنج، زانو و نواحی بدن",
      "q7": "نیاز به درآمد بیشتر",
      "q8": "خیلی زیاد، دنبالش هستم",
      "q9": "درآمد و استقلال مالی",
      "q10": "اگر امکانش هست برای تیرگی نواحی بدن کرم‌های تست شده و تضمینی معرفی کنید."
    },
    "contact": null
  }
];

const STORAGE_KEY = 'glow_lux_survey_responses_v2';

function getLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_DATA));
      return INITIAL_FALLBACK_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_FALLBACK_DATA;
  }
}

function saveLocalData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

export const surveyApi = {
  // Fetch all responses (tries API first, falls back to localStorage)
  async fetchResponses() {
    try {
      const res = await fetch('/api/responses');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          saveLocalData(json.data); // sync local copy
          return { data: json.data, source: 'server' };
        }
      }
    } catch (err) {
      console.warn('API server not reachable, using local storage.');
    }
    return { data: getLocalData(), source: 'local' };
  },

  // Submit response
  async submitResponse(answers, contact = null) {
    let serverSuccess = false;
    let savedItem = null;

    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, contact })
      });
      if (res.ok) {
        const json = await res.json();
        serverSuccess = true;
        savedItem = json.data;
      }
    } catch (err) {
      console.warn('Backend not available to save, saving locally.');
    }

    // Always ensure it is also saved in local data
    const local = getLocalData();
    const newEntry = savedItem || {
      id: 'resp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      submittedAt: new Date().toISOString(),
      answers,
      contact: contact || null
    };
    
    // Check if not already in local array
    const existingIndex = local.findIndex(item => item.id === newEntry.id);
    if (existingIndex === -1) {
      local.push(newEntry);
    } else {
      local[existingIndex] = newEntry;
    }
    saveLocalData(local);

    return {
      success: true,
      savedItem: newEntry,
      source: serverSuccess ? 'server' : 'local'
    };
  },

  // Save / Update contact info for an existing response
  async saveContactInfo(responseId, contactData) {
    let serverSuccess = false;

    if (responseId) {
      try {
        const res = await fetch(`/api/responses/${responseId}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        });
        if (res.ok) {
          serverSuccess = true;
        }
      } catch (err) {
        console.warn('Backend contact update failed, saving locally.');
      }
    }

    // Update in local storage
    const local = getLocalData();
    const target = local.find(item => item.id === responseId) || local[local.length - 1];
    if (target) {
      target.contact = {
        fullName: contactData.fullName || '',
        phone: contactData.phone || '',
        savedAt: new Date().toISOString()
      };
      saveLocalData(local);
    }

    return {
      success: true,
      source: serverSuccess ? 'server' : 'local'
    };
  },

  // Reset all responses
  async resetResponses() {
    try {
      await fetch('/api/responses', { method: 'DELETE' });
    } catch (e) {}
    saveLocalData([]);
    return true;
  },

  // Export responses as JSON file
  downloadJson(responses) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(responses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `glow_lux_survey_responses_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Import responses from JSON
  async importJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed)) {
            saveLocalData(parsed);
            resolve(parsed);
          } else {
            reject(new Error('ساختار فایل JSON باید یک آرایه از پاسخ‌ها باشد.'));
          }
        } catch (err) {
          reject(new Error('خطا در خواندن فایل JSON: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('خطا در دسترسی به فایل'));
      reader.readAsText(file);
    });
  }
};
