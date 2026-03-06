// ==================== ContentZVD App ====================

document.addEventListener('DOMContentLoaded', () => {

    // --- Constants ---
    const ALLOWED_LANGS = ['uk', 'ru', 'en'];
    const SUBMIT_COOLDOWN = 30000;
    let lastSubmitTime = 0;
    let currentLangData = null;
    const rawLang = localStorage.getItem('lang');
    let currentLang = ALLOWED_LANGS.includes(rawLang) ? rawLang : 'uk';
    const langCache = {};

    // --- 1. Hero Section Typing ---
    let textToTypeHero = "Інста-алгоритм ігнорує тебе, але я пропоную вибір, який змінить усе.";
    const typedContentHero = document.getElementById('typed-hero');
    const buttonsContainer = document.getElementById('action-buttons');
    let charIndexHero = 0;

    // Pre-load translated hero text
    (async () => {
        try {
            const savedLang = ALLOWED_LANGS.includes(rawLang) ? rawLang : 'uk';
            if (savedLang !== 'uk') {
                const resp = await fetch('lang/' + savedLang + '.json');
                const data = await resp.json();
                if (data.hero_typed) textToTypeHero = data.hero_typed;
            }
        } catch(e) {}
    })();

    function typeWriterHero() {
        if (charIndexHero < textToTypeHero.length) {
            typedContentHero.textContent += textToTypeHero.charAt(charIndexHero);
            charIndexHero++;
            setTimeout(typeWriterHero, 12 + (Math.random() * 5));
        } else {
            setTimeout(() => {
                buttonsContainer.classList.remove('opacity-0', 'translate-y-8');
            }, 500);
        }
    }
    setTimeout(typeWriterHero, 2600);

    // --- 2. Matrix Rain Background ---
    (function initMatrixRain() {
        const canvas = document.getElementById('matrix-rain-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
        const FPS = 15;
        const FRAME_INTERVAL = 1000 / FPS;
        let columns = [];
        let animId = null;
        let lastTime = 0;
        let fontSize = 14;

        function buildColumns() {
            const container = canvas.parentElement;
            const dpr = window.devicePixelRatio || 1;
            const w = container.clientWidth, h = container.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            fontSize = Math.max(10, Math.min(16, w * 0.01));
            const colW = fontSize * 0.7;
            columns = [];
            for (let x = 0; x < w; x += colW) {
                columns.push({
                    x: x,
                    currentY: Math.random() * h,
                    speed: 0.3 + Math.random() * 1.2
                });
            }
        }

        function draw(timestamp) {
            animId = requestAnimationFrame(draw);
            if (timestamp - lastTime < FRAME_INTERVAL) return;
            lastTime = timestamp;

            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width / dpr, h = canvas.height / dpr;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, w, h);

            ctx.font = fontSize + 'px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            for (const col of columns) {
                const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
                ctx.fillStyle = '#ccffcc';
                ctx.fillText(ch, col.x, col.currentY);
                ctx.fillStyle = 'rgba(0, 255, 65, 0.6)';
                ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], col.x, col.currentY - fontSize);

                col.currentY += fontSize * col.speed;
                if (col.currentY > h) {
                    col.currentY = -fontSize;
                    col.speed = 0.3 + Math.random() * 1.2;
                }
            }
        }

        function start() {
            buildColumns();
            if (!animId) animId = requestAnimationFrame(draw);
        }

        function stop() {
            if (animId) { cancelAnimationFrame(animId); animId = null; }
        }

        const heroSection = document.getElementById('section-hero');
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) start();
            else stop();
        }, { threshold: 0.05 });
        observer.observe(heroSection);

        let lastWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth;
            if (newWidth === lastWidth) return;
            lastWidth = newWidth;
            if (animId) { buildColumns(); ctx.clearRect(0, 0, canvas.width, canvas.height); }
        });

        start();
    })();

    // --- 3. Timer & Holo Button ---
    function getKyivNow() {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Kyiv' }));
    }

    function updateTimerAndSpots() {
        const now = getKyivNow();
        const timerElement = document.getElementById('timer-val');
        const spotsElement = document.getElementById('spots-val');
        const openHour = 9;
        const closeHour = 23;
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentSec = now.getSeconds();

        if (currentHour < openHour || currentHour >= closeHour) {
            timerElement.textContent = "00:00:00";
            spotsElement.textContent = "0";
            return;
        }

        const secsLeft = (closeHour - currentHour - 1) * 3600 + (60 - currentMin - 1) * 60 + (60 - currentSec);
        const h = Math.floor(secsLeft / 3600);
        const m = Math.floor((secsLeft % 3600) / 60);
        const s = secsLeft % 60;
        timerElement.textContent =
            String(h).padStart(2, '0') + ':' +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0');

        const totalMinutes = (closeHour - openHour) * 60;
        const elapsed = (currentHour - openHour) * 60 + currentMin;
        const spots = Math.max(0, 5 - Math.floor((elapsed / totalMinutes) * 5));
        spotsElement.textContent = String(spots);
    }

    updateTimerAndSpots();
    setInterval(updateTimerAndSpots, 1000);

    const holoButtons = document.querySelectorAll('.btn-holo');
    holoButtons.forEach(btn => {
        const glow = btn.querySelector('.cursor-glow');
        if(!glow) return;
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            glow.style.left = `${x}px`;
            glow.style.top = `${y}px`;
        });
        btn.addEventListener('mouseleave', () => {
            setTimeout(() => { glow.style.left = `50%`; glow.style.top = `50%`; }, 300);
        });
    });

    // --- 4. Pain Points Typing ---
    let headlineTextPain = "> ВИЯВЛЕНО КРИТИЧНІ БОЛІ АКАУНТА_";
    (async () => {
        try {
            const savedLang = ALLOWED_LANGS.includes(rawLang) ? rawLang : 'uk';
            if (savedLang !== 'uk') {
                const resp = await fetch('lang/' + savedLang + '.json');
                const data = await resp.json();
                if (data.pain_headline) headlineTextPain = data.pain_headline;
            }
        } catch(e) {}
    })();

    const typedElementPain = document.getElementById('typed-pain');
    const cursorPain = document.getElementById('cursor-pain');
    let charIndexPain = 0;
    let painTypingStarted = false;

    function typeWriterPain() {
        if (charIndexPain < headlineTextPain.length) {
            typedElementPain.textContent += headlineTextPain.charAt(charIndexPain);
            charIndexPain++;
            cursorPain.style.opacity = Math.random() > 0.5 ? '1' : '0.5';
            setTimeout(typeWriterPain, 18 + (Math.random() * 15));
        } else {
            cursorPain.style.opacity = '1';
            cursorPain.classList.add('animate-pulse-fast');
            typedElementPain.classList.add('text-glow-matrix', 'text-matrix-DEFAULT');
            typedElementPain.textContent = headlineTextPain.replace('_', '');
        }
    }

    const painSection = document.getElementById('section-pain-points');
    const painObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !painTypingStarted) {
            painTypingStarted = true;
            setTimeout(typeWriterPain, 150);
            painObserver.disconnect();
        }
    }, { threshold: 0.15 });
    painObserver.observe(painSection);

    // --- 5. Booking Modal ---
    window.selectPlan = function(plan) {
        document.getElementById('field-plan').value = plan;
        const btnProfi = document.getElementById('plan-btn-profi');
        const btnExpert = document.getElementById('plan-btn-expert');
        btnProfi.className = 'flex-1 py-3 rounded-xl border text-sm font-bold tracking-wider uppercase text-center transition-all duration-300 border-matrix-DEFAULT/30 text-matrix-DEFAULT/60 bg-transparent';
        btnExpert.className = 'flex-1 py-3 rounded-xl border text-sm font-bold tracking-wider uppercase text-center transition-all duration-300 border-neon-blue/30 text-neon-blue/60 bg-transparent';
        if (plan === 'profi') {
            btnProfi.className = 'flex-1 py-3 rounded-xl border text-sm font-bold tracking-wider uppercase text-center transition-all duration-300 border-matrix-DEFAULT bg-matrix-DEFAULT/15 text-matrix-DEFAULT shadow-[0_0_15px_rgba(0,255,65,0.15)]';
        } else if (plan === 'expert') {
            btnExpert.className = 'flex-1 py-3 rounded-xl border text-sm font-bold tracking-wider uppercase text-center transition-all duration-300 border-neon-blue bg-neon-blue/15 text-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.15)]';
        }
    };

    window.openBookingModal = function(plan) {
        if (plan) window.selectPlan(plan);
        const modal = document.getElementById('booking-modal');
        const card = document.getElementById('modal-card');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            card.classList.remove('scale-95', 'opacity-0');
            card.classList.add('scale-100', 'opacity-100');
        });
    };

    window.closeBookingModal = function() {
        const modal = document.getElementById('booking-modal');
        const card = document.getElementById('modal-card');
        card.classList.add('scale-95', 'opacity-0');
        card.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
            document.getElementById('form-error').classList.add('hidden');
            document.getElementById('form-success').classList.add('hidden');
            document.getElementById('booking-form').reset();
            document.getElementById('form-submit-btn').disabled = false;
            document.getElementById('form-submit-btn').textContent = (currentLangData && currentLangData.modal_submit) || 'Submit request';
            document.getElementById('form-submit-btn').classList.remove('hidden');
            document.getElementById('field-plan').value = '';
            window.selectPlan('');
        }, 300);
    };

    window.submitBooking = function(e) {
        e.preventDefault();
        const name = document.getElementById('field-name').value.trim();
        const phone = document.getElementById('field-phone').value.trim();
        const instagram = document.getElementById('field-instagram').value.trim();
        const plan = document.getElementById('field-plan').value;
        const errorEl = document.getElementById('form-error');
        const successEl = document.getElementById('form-success');
        const submitBtn = document.getElementById('form-submit-btn');

        errorEl.classList.add('hidden');

        if (!name || !phone || !instagram) {
            errorEl.textContent = (currentLangData && currentLangData.modal_error_fill) || 'Please fill in all fields';
            errorEl.classList.remove('hidden');
            return false;
        }

        const phoneClean = phone.replace(/[\s\-\(\)]/g, '');
        if (!/^\+?\d{7,15}$/.test(phoneClean)) {
            errorEl.textContent = (currentLangData && currentLangData.modal_error_phone) || 'Please enter a valid phone number';
            errorEl.classList.remove('hidden');
            return false;
        }

        const igHandle = instagram.replace(/^@/, '');
        if (!/^[a-zA-Z0-9._]{1,30}$/.test(igHandle)) {
            errorEl.textContent = (currentLangData && currentLangData.modal_error_instagram) || 'Please enter a valid Instagram username';
            errorEl.classList.remove('hidden');
            return false;
        }

        const now = Date.now();
        if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
            const secsLeft = Math.ceil((SUBMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
            errorEl.textContent = (currentLangData && currentLangData.modal_error_cooldown) || 'Please wait ' + secsLeft + 's before submitting again';
            errorEl.classList.remove('hidden');
            return false;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = (currentLangData && currentLangData.modal_sending) || 'Sending...';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        lastSubmitTime = Date.now();

        fetch('/api/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                name: name,
                phone: phone,
                instagram: '@' + igHandle,
                plan: plan || 'не обрано'
            })
        }).then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error('Server error');
            }
            document.getElementById('booking-form').reset();
            successEl.classList.remove('hidden');
            submitBtn.classList.add('hidden');
            setTimeout(window.closeBookingModal, 3000);
        }).catch(() => {
            clearTimeout(timeoutId);
            lastSubmitTime = 0;
            errorEl.textContent = (currentLangData && currentLangData.modal_error_send) || 'Sending error. Please try again.';
            errorEl.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = (currentLangData && currentLangData.modal_submit) || 'Submit request';
        });

        return false;
    };

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeBookingModal();
    });

    // --- 6. FAQ Accordion ---
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // --- 7. i18n Language Switching ---
    async function loadLang(lang) {
        if (langCache[lang]) return langCache[lang];
        const resp = await fetch(`lang/${lang}.json`);
        const data = await resp.json();
        langCache[lang] = data;
        return data;
    }

    function applyLang(data) {
        currentLangData = data;
        const langMap = { uk: 'uk', ru: 'ru', en: 'en' };
        document.documentElement.lang = langMap[currentLang] || 'uk';

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (data[key] !== undefined) {
                if (key === 'cases_case') {
                    const num = el.textContent.match(/#(\d+)/);
                    if (num) {
                        el.textContent = data[key] + ' #' + num[1];
                        return;
                    }
                }
                el.textContent = data[key];
            }
        });

        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (data[key] !== undefined) {
                el.placeholder = data[key];
            }
        });

        document.querySelectorAll('text[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (data[key] !== undefined) {
                el.textContent = data[key];
            }
        });

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        const _heroEl = document.getElementById('typed-hero');
        if (_heroEl && _heroEl.textContent.length > 0) {
            _heroEl.textContent = data.hero_typed || '';
        }

        const _painEl = document.getElementById('typed-pain');
        if (_painEl && _painEl.textContent.length > 0) {
            const txt = data.pain_headline || '';
            _painEl.textContent = txt.replace('_', '');
        }
    }

    window.setLang = async function(lang) {
        if (!ALLOWED_LANGS.includes(lang)) lang = 'uk';
        currentLang = lang;
        localStorage.setItem('lang', lang);
        const data = await loadLang(lang);
        applyLang(data);
    };

    // Apply saved language on load
    (async function initLang() {
        const data = await loadLang(currentLang);
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });
        if (currentLang !== 'uk') {
            applyLang(data);
        } else {
            currentLangData = data;
        }
    })();
});
