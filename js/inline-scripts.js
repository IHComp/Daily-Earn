// Extracted inline scripts from index.html

function openPopup() {
    document.getElementById("popup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function copyAddress() {
    var addrEl = document.getElementById('deposit-address');
    if (!addrEl) return;
    var text = addrEl.textContent || addrEl.innerText || '';

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text.trim()).then(function() {
            showCopyFeedback();
        }).catch(function(err) {
            if (typeof iziToast !== 'undefined') {
                iziToast.error({ title: 'خطأ', message: 'تعذّر نسخ العنوان: ' + (err.message || err), position: 'topRight' });
            } else {
                alert('تعذّر نسخ العنوان');
            }
        });
        return;
    }

    try {
        var textarea = document.createElement('textarea');
        textarea.value = text.trim();
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        var successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
            showCopyFeedback();
        } else {
            throw new Error('copy command was unsuccessful');
        }
    } catch (e) {
        if (typeof iziToast !== 'undefined') {
            iziToast.error({ title: 'خطأ', message: 'تعذّر نسخ العنوان', position: 'topRight' });
        } else {
            alert('تعذّر نسخ العنوان');
        }
    }
}

function showCopyFeedback(targetBtn) {
    try {
        var btn = targetBtn || document.getElementById('copy-address-btn');
        if (btn) {
            var original = btn.innerHTML;
            btn.innerHTML = 'تم النسخ';
            btn.disabled = true;
            setTimeout(function() { btn.innerHTML = original; btn.disabled = false; }, 1600);
        }

        var wrapper = btn ? btn.parentNode : null;
        if (wrapper) {
            var badge = wrapper.querySelector('.copy-feedback');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'copy-feedback';
                badge.innerText = 'تم النسخ ✓';
                badge.setAttribute('aria-hidden', 'true');
                wrapper.appendChild(badge);
            }
            badge.style.opacity = '1';
            badge.style.transform = 'translateY(0)';
            setTimeout(function() { badge.style.opacity = '0'; badge.style.transform = 'translateY(-6px)'; }, 1400);
        }

        if (typeof iziToast !== 'undefined') {
            iziToast.success({ title: '', message: 'تم نسخ العنوان إلى الحافظة', position: 'topRight', timeout: 1600 });
        }
    } catch (e) {
        console.log('copy feedback error', e);
    }
}

function copyAddressFromButton(el) {
    if (el) { el.classList.add('copy-active'); }
    try { showCopyFeedback(el); } catch (e) {}
    copyAddress();
    setTimeout(function() { if (el) el.classList.remove('copy-active'); }, 700);
}

// expose to global (already global when defined in browser script)
