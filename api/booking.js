const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

const SUBMIT_COOLDOWN_MS = 10000; // 10s per IP
const ipTimestamps = new Map();

// Clean old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, ts] of ipTimestamps) {
        if (now - ts > SUBMIT_COOLDOWN_MS * 2) ipTimestamps.delete(ip);
    }
}, 300000);

export default async function handler(req, res) {
    // Only POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS — only allow own origin
    const origin = req.headers.origin || '';
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
    if (allowedOrigins.length && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Rate limiting by IP
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const lastSubmit = ipTimestamps.get(ip);
    if (lastSubmit && Date.now() - lastSubmit < SUBMIT_COOLDOWN_MS) {
        return res.status(429).json({ error: 'Too many requests. Please wait.' });
    }

    // Validate body
    const { name, phone, instagram, plan } = req.body || {};

    if (!name || !phone || !instagram) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (typeof name !== 'string' || name.length > 100) {
        return res.status(400).json({ error: 'Invalid name' });
    }

    // Phone: digits, optional leading +, 7-15 digits
    const phoneClean = String(phone).replace(/[\s\-()]/g, '');
    if (!/^\+?\d{7,15}$/.test(phoneClean)) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Instagram: letters, digits, dots, underscores, 1-30 chars
    const igHandle = String(instagram).replace(/^@/, '');
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(igHandle)) {
        return res.status(400).json({ error: 'Invalid Instagram username' });
    }

    // Plan whitelist
    const allowedPlans = ['profi', 'expert', 'не обрано', ''];
    const safePlan = allowedPlans.includes(plan) ? plan : 'не обрано';

    if (!GOOGLE_SHEETS_URL) {
        console.error('GOOGLE_SHEETS_WEBHOOK_URL env variable is not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Record timestamp for rate limiting
    ipTimestamps.set(ip, Date.now());

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                name: name.slice(0, 100),
                phone: phoneClean,
                instagram: '@' + igHandle,
                plan: safePlan,
                timestamp: new Date().toISOString()
            })
        });

        clearTimeout(timeout);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Google Sheets submission failed:', err.message);
        return res.status(502).json({ error: 'Failed to submit. Please try again.' });
    }
}
