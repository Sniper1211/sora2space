-- Supabase数据库表结构修复脚本
-- 用于处理表已存在的情况

-- 检查并创建缺失的列（如果prompts表已存在但结构不完整）
DO $$ 
BEGIN
    -- 检查prompts表是否存在，如果不存在则创建
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prompts') THEN
        CREATE TABLE prompts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            content TEXT NOT NULL,
            language VARCHAR(10) NOT NULL DEFAULT 'en',
            category VARCHAR(50),
            tags TEXT[],
            is_featured BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            created_by UUID REFERENCES auth.users(id),
            usage_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- 添加缺失的列（如果表存在但列不完整）
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'language') THEN
        ALTER TABLE prompts ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT 'en';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'category') THEN
        ALTER TABLE prompts ADD COLUMN category VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'tags') THEN
        ALTER TABLE prompts ADD COLUMN tags TEXT[];
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'is_featured') THEN
        ALTER TABLE prompts ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'is_active') THEN
        ALTER TABLE prompts ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'created_by') THEN
        ALTER TABLE prompts ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'usage_count') THEN
        ALTER TABLE prompts ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'created_at') THEN
        ALTER TABLE prompts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'updated_at') THEN
        ALTER TABLE prompts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_prompts_language ON prompts(language);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_is_active ON prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_prompts_is_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);

-- 启用RLS（如果未启用）
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "所有人可以查看激活的提示词" ON prompts;
DROP POLICY IF EXISTS "认证用户可以创建提示词" ON prompts;
DROP POLICY IF EXISTS "用户只能更新自己创建的提示词" ON prompts;
DROP POLICY IF EXISTS "用户只能删除自己创建的提示词" ON prompts;

-- 创建RLS策略
CREATE POLICY "所有人可以查看激活的提示词" ON prompts FOR SELECT USING (is_active = true);
CREATE POLICY "认证用户可以创建提示词" ON prompts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "用户只能更新自己创建的提示词" ON prompts FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "用户只能删除自己创建的提示词" ON prompts FOR DELETE USING (auth.uid() = created_by);

-- 创建或替换数据库函数
CREATE OR REPLACE FUNCTION get_random_prompts(lang TEXT DEFAULT 'en', prompt_count INTEGER DEFAULT 30)
RETURNS TABLE (
    id UUID,
    content TEXT,
    language VARCHAR(10),
    category VARCHAR(50),
    tags TEXT[],
    is_featured BOOLEAN,
    is_active BOOLEAN,
    created_by UUID,
    usage_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT p.id, p.content, p.language, p.category, p.tags, p.is_featured, 
           p.is_active, p.created_by, p.usage_count, p.created_at, p.updated_at
    FROM prompts p
    WHERE p.language = lang AND p.is_active = true
    ORDER BY RANDOM()
    LIMIT prompt_count;
$$;

-- 创建或替换增加使用次数函数
CREATE OR REPLACE FUNCTION increment_prompt_usage(prompt_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE prompts 
    SET usage_count = COALESCE(usage_count, 0) + 1,
        updated_at = NOW()
    WHERE id = prompt_id AND is_active = true;
$$;

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 删除可能存在的旧触发器
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;

-- 创建更新触发器
CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成提示
SELECT 'Prompts表结构修复完成！' as message;