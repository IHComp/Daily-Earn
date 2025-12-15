# دليل إعداد Supabase لأكواد الدعوة

## نظرة عامة
تم تعديل نظام أكواد الدعوة للعمل مع Supabase، مما يسمح لك بالتحكم الكامل في عدد مرات استخدام كل كود عبر جميع المتصفحات والأجهزة.

## المميزات الجديدة
- ✅ التحكم بعدد مرات استخدام كل كود (1، 5، 10، أو أي عدد)
- ✅ يعمل عبر جميع المتصفحات والأجهزة
- ✅ سجلات كاملة لجميع الاستخدامات
- ✅ إحصائيات مفصلة
- ✅ إدارة سهلة من Supabase Dashboard

---

## خطوات الإعداد

### 1. إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل الدخول أو أنشئ حساب جديد
3. انقر على "New Project"
4. املأ المعلومات:
   - **Project Name**: اختر اسماً لمشروعك
   - **Database Password**: اختر كلمة مرور قوية
   - **Region**: اختر أقرب منطقة لك
5. انقر على "Create new project"
6. انتظر حتى يتم إنشاء المشروع (قد يستغرق دقيقة أو دقيقتين)

### 2. الحصول على معلومات الاتصال

1. في Supabase Dashboard، اذهب إلى **Settings** → **API**
2. ستجد:
   - **Project URL**: مثال `https://xxxxx.supabase.co`
   - **anon/public key**: المفتاح العام

### 3. إعداد التكوين في المشروع

1. افتح ملف `js/supabase-config.js`
2. استبدل القيم التالية:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co', // Project URL من Supabase
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // anon key من Supabase
};
```

### 4. إنشاء الجداول في Supabase

1. في Supabase Dashboard، اذهب إلى **SQL Editor**
2. انقر على **New Query**
3. انسخ محتوى ملف `supabase-schema.sql`
4. الصق في محرر SQL
5. انقر على **Run** أو اضغط `Ctrl+Enter`
6. يجب أن ترى رسالة نجاح

### 5. إضافة أكواد دعوة

#### الطريقة الأولى: من Supabase Dashboard

1. اذهب إلى **Table Editor**
2. اختر جدول `invite_codes`
3. انقر على **Insert** → **Insert row**
4. املأ البيانات:
   - **code**: كود الدعوة (مثل: `INVITE001`)
   - **max_uses**: عدد المرات المسموح بها (1 = مرة واحدة فقط)
   - **is_active**: `true` (تفعيل الكود)
   - **notes**: ملاحظات (اختياري)

#### الطريقة الثانية: من SQL Editor

```sql
INSERT INTO invite_codes (code, max_uses, is_active, notes) VALUES
('MYCODE001', 1, true, 'كود دعوة خاص'),
('MYCODE002', 5, true, 'كود يمكن استخدامه 5 مرات'),
('MYCODE003', 10, true, 'كود يمكن استخدامه 10 مرات');
```

---

## إدارة الأكواد

### عرض جميع الأكواد

في Supabase Dashboard → **Table Editor** → `invite_codes`

### عرض الأكواد المستخدمة

```sql
SELECT * FROM invite_codes WHERE used_count >= max_uses;
```

### عرض سجلات الاستخدام

في Supabase Dashboard → **Table Editor** → `code_usage_logs`

### إلغاء تفعيل كود

```sql
UPDATE invite_codes 
SET is_active = false 
WHERE code = 'INVITE001';
```

### إعادة تعيين كود (حذف الاستخدامات)

```sql
UPDATE invite_codes 
SET used_count = 0, last_used_at = NULL 
WHERE code = 'INVITE001';

-- حذف السجلات أيضاً
DELETE FROM code_usage_logs WHERE code = 'INVITE001';
```

---

## أنواع الأكواد

### كود لمرة واحدة فقط
```sql
INSERT INTO invite_codes (code, max_uses, is_active) VALUES('SINGLE001', 1, true);
```

### كود لعدة استخدامات
```sql
INSERT INTO invite_codes (code, max_uses, is_active) VALUES
('MULTI001', 5, true);  -- يمكن استخدامه 5 مرات
```

### كود غير محدود (استخدم عدد كبير)
```sql
INSERT INTO invite_codes (code, max_uses, is_active) VALUES
('UNLIMITED001', 999999, true);  -- عملياً غير محدود
```

---

## الأمان

### Row Level Security (RLS)

تم تفعيل RLS على الجداول مع سياسات تسمح بـ:
- قراءة الأكواد للجميع (للتحقق)
- إدراج سجلات الاستخدام للجميع
- تحديث عدد الاستخدامات للجميع

### حماية إضافية (اختياري)

إذا أردت حماية أكثر، يمكنك:
1. إنشاء Service Role Key (في Settings → API)
2. استخدامه في Backend API بدلاً من Client-side
3. هذا يتطلب إنشاء API endpoint

---

## استكشاف الأخطاء

### الخطأ: "خطأ في الاتصال بالخادم"

- تأكد من أن `SUPABASE_CONFIG` في `js/supabase-config.js` صحيح
- تأكد من أن Project URL و anon key صحيحان
- تحقق من اتصال الإنترنت

### الخطأ: "كود الدعوة غير صحيح"

- تأكد من أن الكود موجود في جدول `invite_codes`
- تأكد من أن `is_active = true`
- تأكد من أن الكود مكتوب بالأحرف الصحيحة (case-sensitive)

### الخطأ: "تم الوصول إلى الحد الأقصى"

- الكود تم استخدامه بالعدد المسموح به
- يمكنك زيادة `max_uses` أو إعادة تعيين `used_count`

---

## استعلامات مفيدة

### إحصائيات شاملة

```sql
SELECT 
    code,
    max_uses,
    used_count,
    (max_uses - used_count) as remaining_uses,
    is_active,
    created_at,
    last_used_at
FROM invite_codes
ORDER BY created_at DESC;
```

### أكثر الأكواد استخداماً

```sql
SELECT 
    code,
    used_count,
    max_uses,
    last_used_at
FROM invite_codes
WHERE used_count > 0
ORDER BY used_count DESC;
```

### سجلات الاستخدام لليوم

```sql
SELECT * FROM code_usage_logs 
WHERE DATE(used_at) = CURRENT_DATE
ORDER BY used_at DESC;
```
---

```sql
-- أولاً احذف سجلات الاستخدام المرتبطة (إن وجدت)
DELETE FROM code_usage_logs;

-- ثم احذف كل الأكواد من الجدول
DELETE FROM invite_codes;

-- (اختياري) إعادة ضبط العدّادات التسلسلية
-- ALTER SEQUENCE invite_codes_id_seq RESTART WITH 1;
-- ALTER SEQUENCE code_usage_logs_id_seq RESTART WITH 1;
```
---

## الملفات المعدلة

1. `js/supabase-config.js` - تكوين Supabase
2. `js/invite-code-system.js` - النظام المعدل للعمل مع Supabase
3. `supabase-schema.sql` - هيكل قاعدة البيانات
4. `index.html` - إضافة مكتبة Supabase

---

## ملاحظات مهمة

- ⚠️ المفتاح `anon key` مرئي في الكود، وهذا طبيعي لـ Supabase
- ✅ RLS يحمي البيانات من التعديل غير المصرح به
- ✅ يمكنك مراقبة جميع الاستخدامات من Supabase Dashboard
- ✅ يمكنك إدارة الأكواد بسهولة من Supabase Dashboard

---

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من Console المتصفح (F12) للأخطاء
2. تحقق من Supabase Dashboard → Logs
3. تأكد من أن جميع الخطوات تم تنفيذها بشكل صحيح

ByQHGxc3iwRKDCzx