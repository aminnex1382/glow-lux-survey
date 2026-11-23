import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'responses.json');

// Ensure data directory and file exist
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
}

app.use(cors());
app.use(express.json());

// Helper to read responses safely
function getResponses() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading responses.json:', err);
    return [];
  }
}

// Helper to save responses safely
function saveResponses(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET all responses
app.get('/api/responses', (req, res) => {
  const responses = getResponses();
  res.json({
    success: true,
    count: responses.length,
    data: responses
  });
});

// POST a new response
app.post('/api/responses', (req, res) => {
  try {
    const { answers, contact, metadata } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid payload: answers object required.' });
    }

    const responses = getResponses();
    const newEntry = {
      id: 'resp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      submittedAt: new Date().toISOString(),
      answers,
      contact: contact || null,
      metadata: metadata || null
    };

    responses.push(newEntry);
    saveResponses(responses);

    console.log(`[${new Date().toLocaleTimeString('fa-IR')}] پاسخ جدید با موفقیت در responses.json ذخیره شد. مجموع پاسخ‌ها: ${responses.length}`);

    res.json({
      success: true,
      message: 'پاسخ شما با موفقیت در فایل ذخیره شد.',
      count: responses.length,
      data: newEntry
    });
  } catch (err) {
    console.error('Failed to save response:', err);
    res.status(500).json({ success: false, message: 'خطا در ذخیره اطلاعات در سرور' });
  }
});

// POST / PATCH contact info for a specific response
app.post('/api/responses/:id/contact', (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone } = req.body;
    const responses = getResponses();
    const index = responses.findIndex(r => r.id === id);

    if (index !== -1) {
      responses[index].contact = {
        fullName: fullName || '',
        phone: phone || '',
        savedAt: new Date().toISOString()
      };
      saveResponses(responses);
      console.log(`[${new Date().toLocaleTimeString('fa-IR')}] اطلاعات تماس برای ${id} به روز شد: ${fullName} (${phone})`);
      return res.json({ success: true, message: 'اطلاعات تماس با موفقیت ثبت شد.', data: responses[index] });
    }

    res.status(404).json({ success: false, message: 'پاسخ مورد نظر یافت نشد.' });
  } catch (err) {
    console.error('Failed to update contact:', err);
    res.status(500).json({ success: false, message: 'خطا در ذخیره اطلاعات تماس' });
  }
});

// DELETE / Reset responses
app.delete('/api/responses', (req, res) => {
  try {
    saveResponses([]);
    res.json({ success: true, message: 'تمامی پاسخ‌ها با موفقیت پاک شدند.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطا در پاک‌سازی اطلاعات' });
  }
});

// Optional: Serve frontend dist if available
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==========================================`);
  console.log(`✨ سرور ذخیره‌سازی داده‌های نظرسنجی GLOW LUX فعال شد.`);
  console.log(`📡 پورت سرور API: http://localhost:${PORT}`);
  console.log(`📱 دسترسی شبکه: http://10.140.123.115:${PORT}`);
  console.log(`📁 مسیر فایل داده‌ها: ${DATA_FILE}`);
  console.log(`==========================================\n`);
});
