// API and Data Persistence Service (Secure & Sanitized)

// Empty initial fallback data to prevent leaking any mock or real contacts in public repository
const INITIAL_FALLBACK_DATA = [];

const STORAGE_KEY = 'glow_lux_survey_vault_v3';
const TELEGRAM_CONFIG_KEY = 'glow_lux_telegram_config';

function getLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
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

// Optional: Send private notification directly to Telegram if configured by admin
async function dispatchTelegramNotification(answers, contact) {
  try {
    const rawConfig = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (!rawConfig) return;
    const config = JSON.parse(rawConfig);
    if (!config.botToken || !config.chatId) return;

    let text = `🌸 <b>پاسخ جدید در نظرسنجی GLOW LUX</b>\n\n`;
    if (contact && (contact.fullName || contact.phone)) {
      text += `👤 <b>نام:</b> ${contact.fullName || 'ثبت نشده'}\n`;
      text += `📞 <b>شماره تماس:</b> ${contact.phone || 'ثبت نشده'}\n\n`;
    }
    text += `📋 <b>پاسخ‌های کلیدی:</b>\n`;
    if (answers.q1) text += `▫️ دغدغه اندام: ${answers.q1}\n`;
    if (answers.q5) text += `▫️ دغدغه مو: ${answers.q5}\n`;
    if (answers.q6) text += `▫️ دغدغه پوست: ${answers.q6}\n`;
    if (answers.q10) text += `\n💬 <b>نظر متنی:</b>\n${answers.q10}\n`;

    await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.warn('Telegram notification skipped/failed:', err);
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
      // Running on static GitHub Pages or server offline
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
    } catch (err) {}

    // Always ensure it is also saved in local data
    const local = getLocalData();
    const newEntry = savedItem || {
      id: 'resp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      submittedAt: new Date().toISOString(),
      answers,
      contact: contact || null
    };
    
    local.push(newEntry);
    saveLocalData(local);

    // Trigger Telegram alert if configured
    dispatchTelegramNotification(answers, contact);

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
      } catch (err) {}
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

      // Trigger notification with contact info
      dispatchTelegramNotification(target.answers || {}, target.contact);
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
  },

  // Telegram Config Helpers
  getTelegramConfig() {
    try {
      const raw = localStorage.getItem(TELEGRAM_CONFIG_KEY);
      return raw ? JSON.parse(raw) : { botToken: '', chatId: '' };
    } catch (e) {
      return { botToken: '', chatId: '' };
    }
  },

  saveTelegramConfig(config) {
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
  }
};
