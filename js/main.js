(function ($) {
  "use strict";
  //============= header button hide js start here =============
  $('.header-button').on('click', function() {
    $('.body-overlay').toggleClass('show')
  }); 
  $('.body-overlay').on('click', function() {
    $('.header-button').trigger('click')
    $(this).removeClass('show');
  }); 
  // =============== Header Hide Click On Body Js End =========
  // ==========================================
  //      Start Document Ready function
  // ==========================================
  $(document).ready(function () {

  // ========================== Header Hide Scroll Bar Js Start =====================
    $('.navbar-toggler.header-button').on('click', function() {
      $('body').toggleClass('scroll-hidden-sm')
    }); 
    $('.body-overlay').on('click', function() {
      $('body').removeClass('scroll-hidden-sm')
    }); 
  // ========================== Header Hide Scroll Bar Js End =====================
    
    // ================== Password Show Hide Js Start ==========
    $(".toggle-password").on('click', function() {
      $(this).toggleClass(" fa-eye-slash");
      var input = $($(this).attr("id"));
      if (input.attr("type") == "password") {
      input.attr("type", "text");
      } else {
      input.attr("type", "password");
      }
    });
  // =============== Password Show Hide Js End =================
    
  // ============================ToolTip Js Start=====================
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))  
  // ============================ToolTip Js End========================
    
  
     // ================== Sidebar Menu Js Start ===============
    // Sidebar Dropdown Menu Start
    $(".has-dropdown > a").click(function() {
      $(".sidebar-submenu").slideUp(200);
      if (
        $(this)
          .parent()
          .hasClass("active")
      ) {
        $(".has-dropdown").removeClass("active");
        $(this)
          .parent()
          .removeClass("active");
      } else {
        $(".has-dropdown").removeClass("active");
        $(this)
          .next(".sidebar-submenu")
          .slideDown(200);
        $(this)
          .parent()
          .addClass("active");
      }
    });
    //==================== Sidebar Dropdown Menu End================

  // ====================Sidebar Icon & Overlay js ================
    $(".dashboard-body__bar-icon").on("click", function() {
      $(".sidebar-menu").addClass('show-sidebar'); 
      $(".sidebar-overlay").addClass('show'); 
    });
    $(".sidebar-menu__close, .sidebar-overlay").on("click", function() {
      $(".sidebar-menu").removeClass('show-sidebar'); 
      $(".sidebar-overlay").removeClass('show'); 
    });
    // Sidebar Icon & Overlay js 
  // ===================== Sidebar Menu Js End =================

  // ==================== Dashboard User Profile Dropdown Start ==================
  $('.user-info__button').on('click', function() {
    $('.user-info-dropdown').toggleClass('show'); 
  }); 
  
  $('.user-info__button').attr('tabindex', -1).focus();  

  $('.user-info__button').on('focusout', function() {
    $('.user-info-dropdown').removeClass('show'); 
  }); 
  // ==================== Dashboard User Profile Dropdown End ==================
 
  
});
  
  // ========================= Preloader Js Start =====================
    $(window).on("load", function(){
      $('.preloader').fadeOut(); 
    })
    // ========================= Preloader Js End=====================

    // ========================= Header Sticky Js Start ==============
    $(window).on('scroll', function() {
      if ($(window).scrollTop() >= 300) {
        $('.header').addClass('fixed-header');
      }
      else {
          $('.header').removeClass('fixed-header');
      }
    }); 
    // ========================= Header Sticky Js End===================
    
    //============================ Scroll To Top Icon Js Start =========
    var btn = $('.scroll-top');

    $(window).scroll(function() {
      if ($(window).scrollTop() > 300) {
        btn.addClass('show');
      } else {
        btn.removeClass('show');
      }
    });

    btn.on('click', function(e) {
      e.preventDefault();
      $('html, body').animate({scrollTop:0}, '300');
    });
//========================= Scroll To Top Icon Js End ======================

})(jQuery);

// investment form handler (client-side Telegram API)
// WARNING: Placing a bot token in client-side JS exposes it publicly. Use only for quick demos or trusted networks.
// Recommended: keep a server endpoint in production to protect the token.
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('investment-form');
  if (!form) return;

  // TODO: Replace these placeholders with your actual bot token and chat id.
  // BE AWARE: anyone who views your site source can read the token.
  var BOT_TOKEN = '8184859355:AAHkc-9DBOLVNNMl0lKUg_O3mvfRX2T1nqM';
  var CHAT_ID = '5614423542';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var submitBtn = document.getElementById('investment-submit');
    submitBtn.disabled = true;
    submitBtn.innerText = 'جاري الإرسال...';

    var fullname = document.getElementById('fullname').value.trim();
    var wallet = document.getElementById('wallet').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var amount = document.getElementById('amount').value.trim();
  var telegramUsernameEl = document.getElementById('telegram_username');
  var telegramUsername = telegramUsernameEl ? telegramUsernameEl.value.trim() : '';
    var receiptInput = document.getElementById('receipt');

    // clear previous feedback
    var res = document.getElementById('investment-result');
    res.style.display = 'none';
    res.innerHTML = '';
    var fileWrapperElm = document.querySelector('.file-input-wrapper');
    if (fileWrapperElm) fileWrapperElm.classList.remove('error');

    if (!fullname || !wallet || !phone || !amount) {
      var msg = 'جميع الحقول مطلوبة.';
      if (window.iziToast) iziToast.error({ title: 'حقول ناقصة', message: msg, position: 'topRight' });
      res.className = 'form-feedback error show';
      res.innerHTML = '<button class="close-inline" onclick="this.parentNode.style.display=\'none\'">×</button><strong>خطأ:</strong> ' + msg;
      submitBtn.disabled = false;
      submitBtn.innerText = 'تأكيد الاشتراك';
      return;
    }

    // Build message text
    var message = 'مستخدم جديد - طلب اشتراك:\n';
    message += 'الاسم: ' + fullname + '\n';
    message += 'المحفظة (USDT): ' + wallet + '\n';
    message += 'الجوال: ' + phone + '\n';
    message += 'المبلغ: ' + amount + '\n';
  if (telegramUsername) message += 'يوزر تيليجرام: ' + telegramUsername + '\n';
    message += 'وقت الإرسال: ' + new Date().toLocaleString() + '\n';

    // First: send text message
    var sendMsgUrl = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage';
    fetch(sendMsgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    }).then(function (resp) {
      return resp.json();
    }).then(function (data) {
      if (!data || !data.ok) {
        throw new Error((data && data.description) ? data.description : 'خطأ عند إرسال الرسالة');
      }

      // If there's a file, upload it
      if (receiptInput && receiptInput.files && receiptInput.files.length > 0) {
        var file = receiptInput.files[0];
        // limit size to 5MB
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('حجم الملف أكبر من الحد المسموح به (5MB).');
        }
        var formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        formData.append('document', file, file.name);
        var sendDocUrl = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendDocument';

        return fetch(sendDocUrl, {
          method: 'POST',
          body: formData
        }).then(function (r) { return r.json(); });
      }
      // if no file was provided, return ok and show a warning requiring attachment
      var noFile = !(receiptInput && receiptInput.files && receiptInput.files.length > 0);
      if (noFile) {
        // highlight file wrapper and show inline error
        if (fileWrapperElm) fileWrapperElm.classList.add('error');
        throw new Error('الرجاء إرفاق إيصال الدفع.');
      }
      return { ok: true };
    }).then(function (docResp) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'تأكيد الاشتراك';
      if (docResp && docResp.ok) {
        if (window.iziToast) {
          iziToast.success({ title: 'تم الإرسال', message: 'تم ارسال الرسالة بنجاح. سيتم التواصل معك قريباً. شكراً على صبرك.', position: 'topRight' });
        }
        var res = document.getElementById('investment-result');
        res.className = 'form-feedback success show';
        res.style.display = 'flex';
        res.innerHTML = '<div class="icon"><i class="las la-check"></i></div><div class="text">تم ارسال الرسالة بنجاح. سيتم التواصل معك قريباً. شكراً على صبرك.</div><button class="close-inline" onclick="this.parentNode.style.display=\'none\'">×</button>';
        // auto-hide after 6s
        setTimeout(function () { if (res) res.style.display = 'none'; }, 6000);
        form.reset();
      } else {
        throw new Error((docResp && docResp.description) ? docResp.description : 'حصل خطأ أثناء الإرسال.');
      }
    }).catch(function (err) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'تأكيد الاشتراك';
      var msg = err && err.message ? err.message : 'حصل خطأ أثناء الإرسال.';
      if (window.iziToast) {
        iziToast.error({ title: 'خطأ', message: msg, position: 'topRight' });
      }
      res.className = 'form-feedback error show';
      res.style.display = 'block';
      res.innerHTML = '<button class="close-inline" onclick="this.parentNode.style.display=\'none\'">×</button><strong>خطأ:</strong> ' + msg;
      console.error(err);
    });
  });
});

// File input label update and basic drag/drop
document.addEventListener('DOMContentLoaded', function () {
  var fileWrapper = document.querySelector('.file-input-wrapper');
  if (!fileWrapper) return;
  var input = fileWrapper.querySelector('input[type=file]');
  var label = fileWrapper.querySelector('.file-input-label');

  label.addEventListener('click', function () { input.click(); });
  input.addEventListener('change', function () {
    if (input.files && input.files.length > 0) {
      label.innerHTML = '<i class="las la-file"></i> ' + input.files[0].name;
      var fileWrapperElm = document.querySelector('.file-input-wrapper');
      if (fileWrapperElm) fileWrapperElm.classList.remove('error');
      var res = document.getElementById('investment-result');
      if (res) { res.style.display = 'none'; res.className='form-feedback'; res.innerHTML=''; }
    } else {
      label.innerHTML = '<i class="las la-file-upload"></i> اضغط لإرفاق الإيصال أو اسحبه هنا';
    }
  });

  // drag/drop
  fileWrapper.addEventListener('dragover', function (e) { e.preventDefault(); fileWrapper.classList.add('dragover'); });
  fileWrapper.addEventListener('dragleave', function (e) { fileWrapper.classList.remove('dragover'); });
  fileWrapper.addEventListener('drop', function (e) {
    e.preventDefault(); fileWrapper.classList.remove('dragover');
    var files = e.dataTransfer.files;
    if (files && files.length) {
      input.files = files;
      input.dispatchEvent(new Event('change'));
    }
  });
});
