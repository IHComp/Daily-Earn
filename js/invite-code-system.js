// نظام أكواد الدعوة - مهيأ للعمل مع Supabase
(function() {
    'use strict';

    // ==================== التهيئة ====================
    const STORAGE_KEYS = {
        USER_SESSION: 'invite_user_session',
        USED_CODES: 'invite_used_codes',
        USER_NAME: 'invite_user_name',
        USER_CODE: 'invite_user_code'
    };

    const SESSION_COOKIE = 'invite_session';

    function setSessionCookie() {
        const maxAgeDays = 7;
        document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${maxAgeDays * 24 * 60 * 60}`;
    }

    function clearSessionCookie() {
        document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }

    function hasSessionCookie() {
        return document.cookie.split(';').some(c => c.trim().startsWith(`${SESSION_COOKIE}=`));
    }

    if (!window.SUPABASE_CONFIG) {
        console.error('SUPABASE_CONFIG غير معرف. تأكد من إعداد js/supabase-config.js');
        return;
    }

    if (!window.supabase || !window.supabase.createClient) {
        console.error('مكتبة Supabase غير محمّلة. تأكد من تضمين @supabase/supabase-js قبل هذا الملف.');
        return;
    }

    const { createClient } = window.supabase;
    const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

    // ==================== إشعار تليجرام ====================
    async function sendTelegramNotification(userName, code) {
        try {
            const token = window.TELEGRAM_BOT_TOKEN;
            const chatId = window.TELEGRAM_CHAT_ID;
            if (!token || !chatId) {
                return;
            }
            const text = [
                'تم تسجيل دخول بكود دعوة:',
                'الاسم: ' + userName,
                'الكود: ' + code.toUpperCase(),
                'الوقت: ' + new Date().toLocaleString()
            ].join('\n');

            await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: text })
            });
        } catch (err) {
            console.warn('فشل إرسال إشعار التليجرام:', err);
        }
    }

    // ==================== وظائف التخزين المحلي ====================
    function getUsedCodes() {
        try {
            const used = localStorage.getItem(STORAGE_KEYS.USED_CODES);
            return used ? JSON.parse(used) : [];
        } catch (e) {
            return [];
        }
    }

    function saveUsedCode(code, userName) {
        try {
            const used = getUsedCodes();
            const upper = code.toUpperCase();
            const exists = used.some(item => item.code === upper && item.userName === userName);
            if (!exists) {
                used.push({
                    code: upper,
                    userName: userName,
                    usedAt: new Date().toISOString()
                });
                localStorage.setItem(STORAGE_KEYS.USED_CODES, JSON.stringify(used));
            }
        } catch (e) {
            console.error('Error saving used code:', e);
        }
    }

    function saveUserSession(userName, code) {
        try {
            const session = {
                userName: userName,
                code: code.toUpperCase(),
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
            localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
            localStorage.setItem(STORAGE_KEYS.USER_CODE, code.toUpperCase());
            setSessionCookie();
        } catch (e) {
            console.error('Error saving session:', e);
        }
    }

    function getUserSession() {
        try {
            const session = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
            return session ? JSON.parse(session) : null;
        } catch (e) {
            return null;
        }
    }

    // ==================== التحقق من الجلسة ====================
    function checkSession() {
        const session = getUserSession();
        if (session) {
            const used = getUsedCodes();
            const codeUsed = used.find(item => item.code === session.code && item.userName === session.userName);
            if (codeUsed) {
                return true;
            }
        }
        return false;
    }

    // ==================== عرض/إخفاء الواجهة ====================
    function showInviteOverlay() {
        const overlay = document.getElementById('invite-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function hideInviteOverlay() {
        const overlay = document.getElementById('invite-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    function setButtonState(btn, isLoading) {
        if (!btn) return;
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'جاري التحقق...' : 'دخول';
    }

    // ==================== التحقق من الكود عبر Supabase ====================
    async function validateInviteCode(userName, code) {
        const codeUpper = (code || '').toUpperCase().trim();
        const nameTrimmed = (userName || '').trim();

        if (!nameTrimmed || !codeUpper) {
            return { success: false, message: 'الرجاء إدخال الاسم وكود الدعوة' };
        }

        // جلب الكود من قاعدة البيانات
        const { data: inviteRow, error: fetchError } = await supabaseClient
            .from('invite_codes')
            .select('code,max_uses,used_count,is_active')
            .eq('code', codeUpper)
            .maybeSingle();

        if (fetchError) {
            console.error(fetchError);
            return { success: false, message: 'خطأ في الاتصال بالسيرفر. حاول مرة أخرى.' };
        }

        if (!inviteRow) {
            return { success: false, message: 'كود الدعوة غير صحيح' };
        }

        if (!inviteRow.is_active) {
            return { success: false, message: 'الكود غير مفعل حالياً' };
        }

        if (inviteRow.used_count >= inviteRow.max_uses) {
            return { success: false, message: 'تم الوصول للحد الأقصى لاستخدام الكود' };
        }

        // تحديث عدد الاستخدامات
        const nowIso = new Date().toISOString();
        const { error: updateError } = await supabaseClient
            .from('invite_codes')
            .update({
                used_count: inviteRow.used_count + 1,
                last_used_at: nowIso
            })
            .eq('code', codeUpper);

        if (updateError) {
            console.error(updateError);
            return { success: false, message: 'تعذّر تحديث حالة الكود. حاول مرة أخرى.' };
        }

        // تسجيل الاستخدام
        const userInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        const { error: logError } = await supabaseClient
            .from('code_usage_logs')
            .insert({
                code: codeUpper,
                user_name: nameTrimmed,
                user_info: userInfo
            });

        if (logError) {
            console.warn('فشل تسجيل الاستخدام في السجل:', logError);
        }

        // حفظ الجلسة محلياً (لتجاوز الواجهة بعد نجاح التحقق)
        saveUsedCode(codeUpper, nameTrimmed);
        saveUserSession(nameTrimmed, codeUpper);

        return { success: true, message: `مرحباً ${nameTrimmed}! تم التحقق بنجاح` };
    }

    // ==================== معالج الإرسال ====================
    async function handleSubmit(event) {
        event.preventDefault();

        const userNameInput = document.getElementById('invite-user-name');
        const codeInput = document.getElementById('invite-code');
        const errorMessage = document.getElementById('invite-error-message');
        const submitBtn = document.getElementById('invite-submit-btn');

        const userName = userNameInput ? userNameInput.value : '';
        const code = codeInput ? codeInput.value : '';

        if (errorMessage) {
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';
        }

        setButtonState(submitBtn, true);

        const validation = await validateInviteCode(userName, code);

        if (validation.success) {
            if (errorMessage) {
                errorMessage.className = 'invite-message invite-success';
                errorMessage.textContent = validation.message;
                errorMessage.style.display = 'block';
            }

            // إرسال إشعار إلى تليجرام (لا يؤثر على تجربة المستخدم)
            sendTelegramNotification(userName, code);

            setTimeout(() => {
                hideInviteOverlay();
            }, 800);
        } else {
            if (errorMessage) {
                errorMessage.className = 'invite-message invite-error';
                errorMessage.textContent = validation.message;
                errorMessage.style.display = 'block';
            }
            setButtonState(submitBtn, false);
        }
    }

    // ==================== تهيئة النظام ====================
    function initInviteSystem() {
        // إذا كان الكوكيز غير موجود لكن جلسة localStorage موجودة، نفرض إعادة تسجيل الدخول
        if (!hasSessionCookie()) {
            localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
            localStorage.removeItem(STORAGE_KEYS.USER_NAME);
            localStorage.removeItem(STORAGE_KEYS.USER_CODE);
        }

        if (checkSession()) {
            hideInviteOverlay();
            return;
        }

        showInviteOverlay();

        const form = document.getElementById('invite-form');
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }

        const submitBtn = document.getElementById('invite-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleSubmit(e);
            });
        }

        const codeInput = document.getElementById('invite-code');
        if (codeInput) {
            codeInput.addEventListener('input', function(e) {
                e.target.value = e.target.value.toUpperCase();
            });
        }

        const overlay = document.getElementById('invite-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    }

    // ==================== تشغيل النظام عند تحميل الصفحة ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInviteSystem);
    } else {
        initInviteSystem();
    }

    // ==================== تصدير الوظائف للاستخدام الخارجي ====================
    window.InviteCodeSystem = {
        checkSession: checkSession,
        logout: function() {
            localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
            localStorage.removeItem(STORAGE_KEYS.USER_NAME);
            localStorage.removeItem(STORAGE_KEYS.USER_CODE);
            clearSessionCookie();
            showInviteOverlay();
        },
        getUsedCodes: getUsedCodes,
        getUserName: function() {
            return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
        }
    };

})();

