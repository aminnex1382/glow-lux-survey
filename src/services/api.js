// API Service - Connected to PHP + MySQL Backend via Host Shared IP (No Domain)
// Backend URL: http://185.211.57.7/~torqyrai/api

const DEFAULT_API_BASE_URL = 'http://185.211.57.7/~torqyrai/api';

const API_URL_STORAGE_KEY = 'glow_lux_api_base_url_v2';
const PENDING_SYNC_KEY = 'glow_lux_pending_sync_v1';
const LOCAL_CACHE_RESPONSES_KEY = 'glow_lux_survey_vault_v3';
const TELEGRAM_CONFIG_KEY = 'glow_lux_telegram_config';
const PERSONALIZED_LINKS_KEY = 'glow_lux_personalized_links_v1';

// Track connection health for Admin Dashboard diagnostics
let lastServerStatus = {
  online: null, // null = untested, true = connected, false = unreachable/ssl error
  lastChecked: null,
  errorDetail: null,
  isSslIssue: false
};

export function getApiBaseUrl() {
  try {
    const saved = localStorage.getItem(API_URL_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
    // If hosted directly on the cPanel server IP, match its active protocol automatically
    if (typeof window !== 'undefined' && window.location.hostname === '185.211.57.7') {
      return `${window.location.protocol}//185.211.57.7/~torqyrai/api`;
    }
  } catch (e) {}
  return DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url) {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(API_URL_STORAGE_KEY);
    } else {
      localStorage.setItem(API_URL_STORAGE_KEY, url.trim().replace(/\/+$/, ''));
    }
  } catch (e) {}
}

export function getLastServerStatus() {
  return { ...lastServerStatus };
}

// Local Fallback Helpers (Used ONLY as resilient buffer when backend/SSL is unreachable)
function getCachedResponses() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_RESPONSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCachedResponses(data) {
  try {
    localStorage.setItem(LOCAL_CACHE_RESPONSES_KEY, JSON.stringify(data));
  } catch (e) {}
}

function getPendingSyncQueue() {
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function savePendingSyncQueue(queue) {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
  } catch (e) {}
}

/**
 * Resilient fetch wrapper with timeout and SSL/Mixed-Content handling
 */
async function apiFetch(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const urlsToTry = [`${baseUrl}${cleanEndpoint}`];

  // Try alternate protocol (HTTPS <-> HTTP) as seamless fallback depending on browser/SSL state
  if (baseUrl.startsWith('http://')) {
    urlsToTry.push(`${baseUrl.replace(/^http:\/\//, 'https://')}${cleanEndpoint}`);
  } else if (baseUrl.startsWith('https://')) {
    urlsToTry.push(`${baseUrl.replace(/^https:\/\//, 'http://')}${cleanEndpoint}`);
  }

  let lastError = null;

  for (const targetUrl of urlsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

    try {
      const fetchOptions = {
        method: options.method || 'GET',
        signal: controller.signal,
        mode: 'cors'
      };

      if (options.body) {
        fetchOptions.headers = {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        };
        fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      } else if (options.headers) {
        fetchOptions.headers = options.headers;
      }

      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errText = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson?.error) errText = errJson.error;
        } catch (e) {}
        throw new Error(errText);
      }

      const json = await response.json();
      lastServerStatus = {
        online: true,
        lastChecked: new Date().toISOString(),
        errorDetail: null,
        isSslIssue: false
      };
      return json;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
    }
  }

  // Detect probable SSL / Mixed-Content / Network error without crashing UI
  const errMsg = lastError?.name === 'AbortError'
    ? 'اتصال به سرور بک‌اند به دلیل تایم‌اوت قطع شد.'
    : (lastError?.message || 'خطا در برقراری ارتباط با سرور بک‌اند');

  const isLikelySslOrCors = errMsg.includes('Failed to fetch') ||
                            errMsg.includes('NetworkError') ||
                            errMsg.includes('Load failed') ||
                            errMsg.includes('SSL') ||
                            errMsg.includes('certificate');

  lastServerStatus = {
    online: false,
    lastChecked: new Date().toISOString(),
    errorDetail: isLikelySslOrCors
      ? 'عدم دسترسی به سرور یا خطای گواهی SSL (مرورگر درخواست ناامن یا گواهی نامعتبر را مسدود کرده است).'
      : errMsg,
    isSslIssue: isLikelySslOrCors
  };

  throw lastError || new Error(errMsg);
}

// Client-side Telegram Fallback (Only used if PHP backend could not be reached)
async function dispatchClientTelegramFallback(answers, contact, metadata, questions = []) {
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
    } else if (contact && (contact.fullName || contact.phone)) {
      header += `👤 <b>نام کاربر:</b> ${contact.fullName || 'ثبت نشده'}\n`;
      header += `📞 <b>شماره تماس:</b> <code>${contact.phone || 'ثبت نشده'}</code>\n`;
    } else {
      header += `👤 <b>مخاطب:</b> عمومی (بدون ثبت شماره)\n`;
    }
    header += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    let body = `📋 <b>جزئیات کامل تمام پاسخ‌ها:</b>\n\n`;
    questions.forEach((q, idx) => {
      const ans = answers[q.id];
      const disp = ans && ans.toString().trim() ? ans.toString().trim() : '<i>(بدون پاسخ)</i>';
      body += `<b>${idx + 1}. ${q.question}</b>\n👉 <b>پاسخ:</b> ${disp}\n\n`;
    });

    const fullMsg = header + body + `━━━━━━━━━━━━━━━━━━━━━━\n🌿 راز زیبایی ماندگار`;
    await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: fullMsg.slice(0, 4000),
        parse_mode: 'HTML'
      })
    });
  } catch (e) {}
}

export const surveyApi = {
  getApiBaseUrl,
  setApiBaseUrl,
  getLastServerStatus,

  // Ping backend server & check MySQL status
  async pingServer() {
    try {
      const res = await apiFetch('/index.php', { timeoutMs: 6000 });
      return {
        online: true,
        ...res
      };
    } catch (err) {
      return {
        online: false,
        error: lastServerStatus.errorDetail || err.message,
        isSslIssue: lastServerStatus.isSslIssue
      };
    }
  },

  // Get count of unsynced offline items
  getPendingSyncCount() {
    return getPendingSyncQueue().length;
  },

  // Sync any offline-queued submissions to MySQL backend
  async syncPendingToServer() {
    const queue = getPendingSyncQueue();
    if (queue.length === 0) return { synced: 0, remaining: 0 };

    const remaining = [];
    let synced = 0;

    for (const item of queue) {
      try {
        await apiFetch('/responses.php', {
          method: 'POST',
          body: {
            answers: item.answers,
            contact: item.contact,
            metadata: item.metadata,
            questions: item.questions || []
          }
        });
        synced++;
      } catch (e) {
        remaining.push(item);
      }
    }

    savePendingSyncQueue(remaining);
    return { synced, remaining: remaining.length };
  },

  // ==========================================
  // Responses CRUD (MySQL Backend Primary)
  // ==========================================
  async fetchResponses() {
    try {
      const json = await apiFetch('/responses.php');
      if (json.success && Array.isArray(json.data)) {
        saveCachedResponses(json.data);
        return { data: json.data, source: 'server' };
      }
    } catch (err) {
      console.warn('Backend fetchResponses unavailable, falling back to cache:', err.message);
    }
    return { data: getCachedResponses(), source: 'local' };
  },

  async submitResponse(answers, contact = null, metadata = null, questions = []) {
    try {
      const json = await apiFetch('/responses.php', {
        method: 'POST',
        body: { answers, contact, metadata, questions }
      });

      if (json.success && json.data) {
        const cached = getCachedResponses();
        cached.unshift(json.data);
        saveCachedResponses(cached);
        return {
          success: true,
          savedItem: json.data,
          source: 'server'
        };
      }
    } catch (err) {
      console.warn('Backend submitResponse failed (SSL/Network), buffering locally:', err.message);
    }

    // Resilient fallback if backend is temporarily unreachable or blocked by SSL
    const fallbackItem = {
      id: 'resp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      submittedAt: new Date().toISOString(),
      answers,
      contact: contact || null,
      metadata: metadata || null
    };

    const cached = getCachedResponses();
    cached.unshift(fallbackItem);
    saveCachedResponses(cached);

    // Queue for future database sync
    const queue = getPendingSyncQueue();
    queue.push({ ...fallbackItem, questions });
    savePendingSyncQueue(queue);

    // Try client Telegram fallback
    dispatchClientTelegramFallback(answers, contact, metadata, questions);

    return {
      success: true,
      savedItem: fallbackItem,
      source: 'local'
    };
  },

  async saveContactInfo(responseId, contactData, questions = []) {
    let serverSuccess = false;
    try {
      const json = await apiFetch('/contact.php', {
        method: 'POST',
        body: {
          responseId,
          fullName: contactData.fullName || '',
          phone: contactData.phone || '',
          questions
        }
      });
      if (json.success) {
        serverSuccess = true;
      }
    } catch (err) {
      console.warn('Backend saveContactInfo failed, updating local buffer:', err.message);
    }

    // Update local cache & pending queue if item was buffered
    const contactObj = {
      fullName: contactData.fullName || '',
      phone: contactData.phone || '',
      savedAt: new Date().toISOString()
    };

    const cached = getCachedResponses();
    const target = cached.find(item => item.id === responseId) || cached[0];
    if (target) {
      target.contact = contactObj;
      saveCachedResponses(cached);
    }

    if (!serverSuccess) {
      const queue = getPendingSyncQueue();
      const qTarget = queue.find(item => item.id === responseId);
      if (qTarget) {
        qTarget.contact = contactObj;
        savePendingSyncQueue(queue);
      }
      if (target) {
        dispatchClientTelegramFallback(target.answers || {}, contactObj, target.metadata, questions);
      }
    }

    return {
      success: true,
      source: serverSuccess ? 'server' : 'local'
    };
  },

  async resetResponses() {
    try {
      await apiFetch('/responses.php', { method: 'DELETE' });
    } catch (e) {}
    saveCachedResponses([]);
    savePendingSyncQueue([]);
    return true;
  },

  // ==========================================
  // Dynamic Questions (MySQL Backend Primary)
  // ==========================================
  async fetchQuestions() {
    try {
      const json = await apiFetch('/questions.php');
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return { data: json.data, source: 'server' };
      }
    } catch (err) {
      console.warn('Backend fetchQuestions unavailable:', err.message);
    }
    return { data: null, source: 'local' };
  },

  async saveQuestionsToServer(questionsList) {
    try {
      const json = await apiFetch('/questions.php', {
        method: 'POST',
        body: { questions: questionsList }
      });
      return { success: !!json.success, source: 'server' };
    } catch (err) {
      return { success: false, source: 'local', error: err.message };
    }
  },

  async resetQuestionsOnServer() {
    try {
      const json = await apiFetch('/questions.php', { method: 'PUT' });
      if (json.success && Array.isArray(json.data)) {
        return { success: true, data: json.data, source: 'server' };
      }
    } catch (err) {}
    return { success: false, source: 'local' };
  },

  // ==========================================
  // Personalized VIP Links (MySQL Backend Primary)
  // ==========================================
  async fetchPersonalizedLinks() {
    try {
      const json = await apiFetch('/links.php');
      if (json.success && Array.isArray(json.data)) {
        localStorage.setItem(PERSONALIZED_LINKS_KEY, JSON.stringify(json.data));
        return json.data;
      }
    } catch (err) {}
    return this.getPersonalizedLinks();
  },

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

  async createPersonalizedLink(recipientName, note = '') {
    try {
      const json = await apiFetch('/links.php', {
        method: 'POST',
        body: { recipientName, note }
      });
      if (json.success && json.data) {
        const links = this.getPersonalizedLinks();
        links.unshift(json.data);
        this.savePersonalizedLinks(links);
        return json.data;
      }
    } catch (err) {}

    // Fallback
    const links = this.getPersonalizedLinks();
    const newLink = {
      id: 'vip_' + Math.random().toString(36).substring(2, 8),
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

  async deletePersonalizedLink(id) {
    try {
      await apiFetch(`/links.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {}

    const links = this.getPersonalizedLinks().filter(l => l.id !== id);
    this.savePersonalizedLinks(links);
    return links;
  },

  // ==========================================
  // Settings & Telegram Config (MySQL Backend)
  // ==========================================
  async fetchTelegramConfig() {
    try {
      const json = await apiFetch('/settings.php');
      if (json.success && json.data) {
        const cfg = {
          botToken: json.data.botToken || '',
          chatId: json.data.chatId || ''
        };
        localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(cfg));
        return cfg;
      }
    } catch (err) {}
    return this.getTelegramConfig();
  },

  getTelegramConfig() {
    try {
      const raw = localStorage.getItem(TELEGRAM_CONFIG_KEY);
      return raw ? JSON.parse(raw) : { botToken: '', chatId: '' };
    } catch (e) {
      return { botToken: '', chatId: '' };
    }
  },

  async saveTelegramConfig(config) {
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
    try {
      await apiFetch('/settings.php', {
        method: 'POST',
        body: {
          action: 'telegram',
          botToken: config.botToken,
          chatId: config.chatId
        }
      });
      return true;
    } catch (err) {
      return false;
    }
  },

  // JSON Export / Import Helpers
  downloadJson(responses) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(responses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `glow_lux_survey_responses_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  async importJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed)) {
            saveCachedResponses(parsed);
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
