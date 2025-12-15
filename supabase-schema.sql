CREATE TABLE IF NOT EXISTS invite_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    max_uses INTEGER DEFAULT 1 NOT NULL,
    used_count INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by VARCHAR(255)
);

-- جدول سجلات استخدام الأكواد
CREATE TABLE IF NOT EXISTS code_usage_logs (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_info JSONB,
    FOREIGN KEY (code) REFERENCES invite_codes(code) ON DELETE CASCADE
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON invite_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_code_usage_logs_code ON code_usage_logs(code);
CREATE INDEX IF NOT EXISTS idx_code_usage_logs_used_at ON code_usage_logs(used_at);

-- تفعيل Row Level Security (RLS)
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_usage_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان: السماح بالقراءة للجميع (لأن المفتاح العام يسمح بذلك)
CREATE POLICY "Allow public read access to invite_codes"
    ON invite_codes FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert to code_usage_logs"
    ON code_usage_logs FOR INSERT
    WITH CHECK (true);

-- سياسة لتحديث عدد الاستخدامات (للعمليات من التطبيق)
CREATE POLICY "Allow public update invite_codes usage count"
    ON invite_codes FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ============================================
-- إدراج أكواد دعوة مثال
-- ============================================
-- يمكنك إضافة أكواد دعوة هنا أو من خلال Supabase Dashboard

INSERT INTO invite_codes (code, max_uses, is_active, notes) VALUES
('INVITE001', 1, true, 'كود دعوة تجريبي'),
('INVITE002', 1, true, 'كود دعوة تجريبي'),
('INVITE003', 1, true, 'كود دعوة تجريبي'),
('INVITE004', 1, true, 'كود دعوة تجريبي'),
('INVITE005', 1, true, 'كود دعوة تجريبي'),
('INVITE006', 1, true, 'كود دعوة تجريبي'),
('INVITE007', 1, true, 'كود دعوة تجريبي'),
('INVITE008', 1, true, 'كود دعوة تجريبي'),
('INVITE009', 1, true, 'كود دعوة تجريبي'),
('INVITE010', 1, true, 'كود دعوة تجريبي')
ON CONFLICT (code) DO NOTHING;