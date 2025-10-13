-- 修复现有 prompts 表结构的脚本
-- 此脚本用于处理已存在的 prompts 表缺少必要字段的情况
-- 请在 Supabase SQL Editor 中执行此脚本

-- ===== 检查并修复 prompts 表结构 =====

-- 添加缺失的字段（如果不存在）
DO $$
BEGIN
    -- 添加 language 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'language') THEN
        ALTER TABLE prompts ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT 'en';
        RAISE NOTICE 'Added language column to prompts table';
    END IF;

    -- 添加 category 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'category') THEN
        ALTER TABLE prompts ADD COLUMN category VARCHAR(50);
        RAISE NOTICE 'Added category column to prompts table';
    END IF;

    -- 添加 tags 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'tags') THEN
        ALTER TABLE prompts ADD COLUMN tags TEXT[];
        RAISE NOTICE 'Added tags column to prompts table';
    END IF;

    -- 添加 is_featured 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'is_featured') THEN
        ALTER TABLE prompts ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_featured column to prompts table';
    END IF;

    -- 添加 is_active 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'is_active') THEN
        ALTER TABLE prompts ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to prompts table';
    END IF;

    -- 添加 created_by 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'created_by') THEN
        ALTER TABLE prompts ADD COLUMN created_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added created_by column to prompts table';
    END IF;

    -- 添加 usage_count 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'usage_count') THEN
        ALTER TABLE prompts ADD COLUMN usage_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added usage_count column to prompts table';
    END IF;

    -- 添加 updated_at 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'updated_at') THEN
        ALTER TABLE prompts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to prompts table';
    END IF;

    -- 检查 content 字段是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'content') THEN
        ALTER TABLE prompts ADD COLUMN content TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Added content column to prompts table';
    END IF;

    -- 检查 created_at 字段是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'prompts' AND column_name = 'created_at') THEN
        ALTER TABLE prompts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to prompts table';
    END IF;

END $$;

-- ===== 创建安全的索引 =====

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_prompts_language ON prompts(language);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_is_active ON prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_prompts_is_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_prompts_usage_count ON prompts(usage_count DESC);

-- ===== 启用 RLS（如果尚未启用）=====

-- 启用 RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "所有人可以查看激活的提示词" ON prompts;
DROP POLICY IF EXISTS "认证用户可以创建提示词" ON prompts;
DROP POLICY IF EXISTS "用户只能更新自己创建的提示词" ON prompts;
DROP POLICY IF EXISTS "用户只能删除自己创建的提示词" ON prompts;

-- 创建 RLS 策略
CREATE POLICY "所有人可以查看激活的提示词" ON prompts FOR SELECT USING (is_active = true);
CREATE POLICY "认证用户可以创建提示词" ON prompts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "用户只能更新自己创建的提示词" ON prompts FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "用户只能删除自己创建的提示词" ON prompts FOR DELETE USING (auth.uid() = created_by);

-- ===== 创建或更新函数 =====

-- 获取随机提示词函数
CREATE OR REPLACE FUNCTION get_random_prompts(lang TEXT DEFAULT 'en', prompt_count INTEGER DEFAULT 30)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    language VARCHAR(10),
    category VARCHAR(50),
    tags TEXT[],
    is_featured BOOLEAN,
    is_active BOOLEAN,
    created_by UUID,
    usage_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    video_url TEXT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT p.id, p.title, p.content, p.language, p.category, p.tags, p.is_featured, 
           p.is_active, p.created_by, p.usage_count, p.created_at, p.updated_at, p.video_url
    FROM prompts p
    WHERE p.language = lang AND p.is_active = true
    ORDER BY RANDOM()
    LIMIT prompt_count;
$$;

-- 增加提示词使用次数函数
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

-- 自动更新updated_at字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 prompts 表添加更新触发器
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成提示
SELECT 'prompts 表结构修复完成！现在可以执行完整的 supabase-setup.sql 脚本了。' as message;