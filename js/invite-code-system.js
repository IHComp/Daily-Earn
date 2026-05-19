// نظام أكواد الدعوة — Google Apps Script (GET only - no CORS issues)
(function() {
    'use strict';

    const STORAGE_KEYS = {
        USER_SESSION: 'invite_user_session',
        USED_CODES:   'invite_used_codes',
        USER_NAME:    'invite_user_name',
        USER_CODE:    'invite_user_code'
    };
    const SESSION_COOKIE = 'invite_session';

    function setSessionCookie() {
        document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${7 * 24 * 60 * 60}`;
    }
    function clearSessionCookie() {
        document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    function hasSessionCookie() {
        return document.cookie.split(';').some(c => c.trim().startsWith(`${SESSION_COOKIE}=`));
    }

    if (!window.GAS_CONFIG || !window.GAS_CONFIG.url) {
        console.error('GAS_CONFIG غير معرّف');
        return;
    }
    const GAS_URL = window.GAS_CONFIG.url;

    // إشعار تيليجرام
    async function sendTelegramNotification(userName, code) {
        try {
            const token  = window.TELEGRAM_BOT_TOKEN;
            const chatId = window.TELEGRAM_CHAT_ID;
            if (!token || !chatId) return;
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: `دخول جديد:\nالاسم: ${userName}\nالكود: ${code}\nالوقت: ${new Date().toLocaleString()}` })
            });
        } catch (err) { console.warn('تيليجرام:', err); }
    }

    function getUsedCodes() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USED_CODES) || '[]'); }
        catch (e) { return []; }
    }
    function saveUsedCode(code, userName) {
        try {
            const used = getUsedCodes();
            if (!used.some(i => i.code === code && i.userName === userName))
                used.push({ code, userName, usedAt: new Date().toISOString() });
            localStorage.setItem(STORAGE_KEYS.USED_CODES, JSON.stringify(used));
        } catch (e) {}
    }
    function saveUserSession(userName, code) {
        try {
            localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify({ userName, code, timestamp: new Date().toISOString() }));
            localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
            localStorage.setItem(STORAGE_KEYS.USER_CODE, code);
            setSessionCookie();
        } catch (e) {}
    }
    function getUserSession() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_SESSION) || 'null'); }
        catch (e) { return null; }
    }
    function checkSession() {
        const s = getUserSession();
        if (!s) return false;
        return getUsedCodes().some(i => i.code === s.code && i.userName === s.userName);
    }

    function showInviteOverlay() {
        const o = document.getElementById('invite-overlay');
        if (o) { o.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
    }
    function hideInviteOverlay() {
        const o = document.getElementById('invite-overlay');
        if (o) { o.style.display = 'none'; document.body.style.overflow = ''; }
    }
    function setButtonState(btn, loading) {
        if (!btn) return;
        btn.disabled    = loading;
        btn.textContent = loading ? 'جاري التحقق...' : 'دخول';
    }

    // كل شيء عبر GET — بدون CORS
    async function validateInviteCode(userName, code) {
        const codeUpper   = (code || '').toUpperCase().trim();
        const nameTrimmed = (userName || '').trim();

        if (!nameTrimmed || !codeUpper)
            return { success: false, message: 'الرجاء إدخال الاسم وكود الدعوة' };

        try {
            const userInfo = encodeURIComponent(JSON.stringify({
                userAgent: navigator.userAgent,
                language:  navigator.language,
                timeZone:  Intl.DateTimeFormat().resolvedOptions().timeZone
            }));

            const url = `${GAS_URL}?action=useCode&code=${encodeURIComponent(codeUpper)}&userName=${encodeURIComponent(nameTrimmed)}&userInfo=${userInfo}`;
            const res  = await fetch(url);
            const data = await res.json();

            if (data.success) {
                saveUsedCode(codeUpper, nameTrimmed);
                saveUserSession(nameTrimmed, codeUpper);
            }
            return data;
        } catch (err) {
            console.error('GAS error:', err);
            return { success: false, message: 'خطأ في الاتصال. حاول مرة أخرى.' };
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const userNameInput = document.getElementById('invite-user-name');
        const codeInput     = document.getElementById('invite-code');
        const errorMessage  = document.getElementById('invite-error-message');
        const submitBtn     = document.getElementById('invite-submit-btn');

        if (errorMessage) { errorMessage.style.display = 'none'; errorMessage.textContent = ''; }
        setButtonState(submitBtn, true);

        const result = await validateInviteCode(
            userNameInput ? userNameInput.value : '',
            codeInput     ? codeInput.value     : ''
        );

        if (result.success) {
            if (errorMessage) {
                errorMessage.className   = 'invite-message invite-success';
                errorMessage.textContent = result.message;
                errorMessage.style.display = 'block';
            }
            sendTelegramNotification(userNameInput.value, codeInput.value);
            setTimeout(() => hideInviteOverlay(), 800);
        } else {
            if (errorMessage) {
                errorMessage.className   = 'invite-message invite-error';
                errorMessage.textContent = result.message;
                errorMessage.style.display = 'block';
            }
            setButtonState(submitBtn, false);
        }
    }

    function initInviteSystem() {
        if (!hasSessionCookie()) {
            localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
            localStorage.removeItem(STORAGE_KEYS.USER_NAME);
            localStorage.removeItem(STORAGE_KEYS.USER_CODE);
        }
        if (checkSession()) { hideInviteOverlay(); return; }
        showInviteOverlay();

        const form = document.getElementById('invite-form');
        if (form) form.addEventListener('submit', handleSubmit);

        const btn = document.getElementById('invite-submit-btn');
        if (btn) btn.addEventListener('click', e => { e.preventDefault(); handleSubmit(e); });

        const inp = document.getElementById('invite-code');
        if (inp) inp.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });

        const overlay = document.getElementById('invite-overlay');
        if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) { e.preventDefault(); e.stopPropagation(); } });
    }

    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', initInviteSystem);
    else
        initInviteSystem();

    window.InviteCodeSystem = {
        checkSession,
        logout() {
            localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
            localStorage.removeItem(STORAGE_KEYS.USER_NAME);
            localStorage.removeItem(STORAGE_KEYS.USER_CODE);
            clearSessionCookie();
            showInviteOverlay();
        },
        getUsedCodes,
        getUserName() { return localStorage.getItem(STORAGE_KEYS.USER_NAME) || ''; }
    };
})();
