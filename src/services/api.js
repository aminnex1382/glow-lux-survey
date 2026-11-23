// API and Data Persistence Service (Secure, Full Telegram Dispatch & Personalized Links)

const INITIAL_FALLBACK_DATA = [];

const STORAGE_KEY = 'glow_lux_survey_vault_v3';
const TELEGRAM_CONFIG_KEY = 'glow_lux_telegram_config';
const PERSONALIZED_LINKS_KEY = 'glow_lux_personalized_links_v1';

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

// Helper to chunk and send Telegram messages (respecting 4096 character limit)
async function sendTelegramMessage(botToken, chatId, htmlText) {
  const MAX_CHUNK = 3800;
  if (htmlText.length <= MAX_CHUNK) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML'
      })
    });
  } else {
    // Split text into chunks
    const lines = htmlText.split('\n');
    let currentChunk = '';
    for (const line of lines) {
      if ((currentChunk + '\n' + line).length > MAX_CHUNK) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: currentChunk,
            parse_mode: 'HTML'
          })
        });
        currentChunk = line;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
      }
    }
    if (currentChunk.trim()) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: currentChunk,
          parse_mode: 'HTML'
        })
      });
    }
  }
}

// Send COMPLETE and thorough details of all questions and answers to Telegram
async function dispatchTelegramNotification(answers, contact, metadata, questions = []) {
  try {
    const rawConfig = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (!rawConfig) return;
    const config = JSON.parse(rawConfig);
    if (!config.botToken || !config.chatId) return;

    const dateStr = new Date().toLocaleDateString('fa-IR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let header = `✨ <b>پاسخ جدید در نظرسنجی GLOW LUX</b> ✨\n`;
    header += `📅 <b>زمان ثبت:</b> ${dateStr}\n`;
    header += `━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (metadata?.isPersonalized && metadata?.recipientName) {
      header += `🎯 <b>نوع پاسخ:</b> لینک اختصاصی ویژه 💎\n`;
      header += `👤 <b>مخاطب اختصاصی:</b> <u>${metadata.recipientName}</u>\n`;
      if (metadata.refId) {
        header += `🆔 <b>شناسه لینک:</b> <code>${metadata.refId}</code>\n`;
      }
      header += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    } else if (contact && (contact.fullName || contact.phone)) {
      header += `👤 <b>نام کاربر:</b> ${contact.fullName || 'ثبت نشده'}\n`;
      header += `📞 <b>شماره تماس:</b> <code>${contact.phone || 'ثبت نشده'}</code>\n`;
      header += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    } else {
      header += `👤 <b>مخاطب:</b> عمومی (بدون ثبت شماره)\n`;
      header += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    let questionsBody = `📋 <b>جزئیات کامل تمام پاسخ‌ها:</b>\n\n`;

    if (Array.isArray(questions) && questions.length > 0) {
      questions.forEach((q, idx) => {
        const ans = answers[q.id];
        const displayAnswer = ans && ans.trim() ? ans.trim() : '<i>(بدون پاسخ)</i>';
        questionsBody += `<b>${idx + 1}. ${q.question}</b>\n`;
        questionsBody += `👉 <b>پاسخ:</b> ${displayAnswer}\n\n`;
      });
    } else {
      // Fallback if questions array not passed
      Object.entries(answers).forEach(([key, val], idx) => {
        if (val && val.trim()) {
          questionsBody += `<b>سوال ${key}:</b> ${val.trim()}\n\n`;
        }
      });
    }

    questionsBody += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    questionsBody += `🌿 راز زیبایی ماندگار | از نگاه علم`;

    const fullMessage = header + questionsBody;
    await sendTelegramMessage(config.botToken, config.chatId, fullMessage);
  } catch (err) {
    console.warn('Telegram full notification failed:', err);
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
    } catch (err) {}
    return { data: getLocalData(), source: 'local' };
  },

  // Submit response with answers, optional contact, metadata (personalized link info), and questions definition
  async submitResponse(answers, contact = null, metadata = null, questions = []) {
    let serverSuccess = false;
    let savedItem = null;

    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, contact, metadata })
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
      contact: contact || null,
      metadata: metadata || null
    };
    
    local.push(newEntry);
    saveLocalData(local);

    // If response was from a personalized link, mark it as answered
    if (metadata?.refId) {
      this.markPersonalizedLinkAnswered(metadata.refId, newEntry.id);
    }

    // Trigger full Telegram alert with all questions & answers
    dispatchTelegramNotification(answers, contact, metadata, questions);

    return {
      success: true,
      savedItem: newEntry,
      source: serverSuccess ? 'server' : 'local'
    };
  },

  // Save / Update contact info for an existing response
  async saveContactInfo(responseId, contactData, questions = []) {
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

      // Re-trigger full Telegram notification with contact info
      dispatchTelegramNotification(target.answers || {}, target.contact, target.metadata, questions);
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
  },

  // ==========================================
  // Personalized Links Management
  // ==========================================
  getPersonalizedLinks() {
    try {
      const raw = localStorage.getItem(PERSONALIZED_LINKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  savePersonalizedLinks(links) {
    try {
      localStorage.setItem(PERSONALIZED_LINKS_KEY, JSON.stringify(links));
    } catch (e) {}
  },

  createPersonalizedLink(recipientName, note = '') {
    const links = this.getPersonalizedLinks();
    const refId = 'vip_' + Math.random().toString(36).substring(2, 8);
    const newLink = {
      id: refId,
      recipientName: recipientName.trim(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
      isAnswered: false,
      responseId: null,
      answeredAt: null
    };

    links.unshift(newLink);
    this.savePersonalizedLinks(links);
    return newLink;
  },

  deletePersonalizedLink(id) {
    const links = this.getPersonalizedLinks().filter(l => l.id !== id);
    this.savePersonalizedLinks(links);
    return links;
  },

  markPersonalizedLinkAnswered(refId, responseId) {
    const links = this.getPersonalizedLinks();
    const link = links.find(l => l.id === refId);
    if (link) {
      link.isAnswered = true;
      link.responseId = responseId;
      link.answeredAt = new Date().toISOString();
      this.savePersonalizedLinks(links);
    }
  }
};
