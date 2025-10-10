-- Supabase数据库表结构设置脚本
-- 请在Supabase Dashboard的SQL Editor中执行此脚本

-- ===== 用户管理系统表 =====

-- 用户配置表 (扩展Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, pro, enterprise
  credits_remaining INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户使用统计表
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(50), -- 'video_generation', 'prompt_save', etc.
  credits_used INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 提示词管理系统表 =====

-- 提示词分类表
CREATE TABLE IF NOT EXISTS prompt_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 提示词表
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,                    -- 提示词内容
  language VARCHAR(10) NOT NULL DEFAULT 'en', -- 语言代码 (en, zh, etc.)
  category VARCHAR(50),                     -- 分类 (sci-fi, fantasy, nature, etc.)
  tags TEXT[],                             -- 标签数组
  is_featured BOOLEAN DEFAULT false,        -- 是否为精选提示词
  is_active BOOLEAN DEFAULT true,           -- 是否激活显示
  created_by UUID REFERENCES auth.users(id), -- 创建者 (可为空，系统提示词)
  usage_count INTEGER DEFAULT 0,           -- 使用次数统计
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户收藏的提示词
CREATE TABLE IF NOT EXISTS user_prompt_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prompt_id UUID REFERENCES prompts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 提示词点赞记录
CREATE TABLE IF NOT EXISTS prompt_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prompt_id UUID REFERENCES prompts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 删除重复的提示词表定义（已在上面定义过）
-- 如果需要修改表结构，请使用 ALTER TABLE 语句

-- 创建索引以提高查询性能 (使用 IF NOT EXISTS 避免重复创建)
CREATE INDEX IF NOT EXISTS idx_prompts_language ON prompts(language);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_is_active ON prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_prompts_is_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);

-- ===== Row Level Security (RLS) 策略 =====

-- 启用RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧 RLS 策略
DROP POLICY IF EXISTS "用户可以查看所有用户资料" ON user_profiles;
DROP POLICY IF EXISTS "用户只能插入自己的资料" ON user_profiles;
DROP POLICY IF EXISTS "用户只能更新自己的资料" ON user_profiles;
DROP POLICY IF EXISTS "用户只能查看自己的收藏" ON user_prompt_favorites;
DROP POLICY IF EXISTS "用户只能插入自己的收藏" ON user_prompt_favorites;
DROP POLICY IF EXISTS "用户只能删除自己的收藏" ON user_prompt_favorites;
DROP POLICY IF EXISTS "所有人可以查看激活的提示词" ON prompts;
DROP POLICY IF EXISTS "认证用户可以创建提示词" ON prompts;
DROP POLICY IF EXISTS "用户只能更新自己创建的提示词" ON prompts;
DROP POLICY IF EXISTS "用户只能删除自己创建的提示词" ON prompts;

-- 用户资料的RLS策略
CREATE POLICY "用户可以查看所有用户资料" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "用户只能插入自己的资料" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "用户只能更新自己的资料" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- 用户收藏的RLS策略
CREATE POLICY "用户只能查看自己的收藏" ON user_prompt_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能插入自己的收藏" ON user_prompt_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户只能删除自己的收藏" ON user_prompt_favorites FOR DELETE USING (auth.uid() = user_id);

-- 提示词的RLS策略
CREATE POLICY "所有人可以查看激活的提示词" ON prompts FOR SELECT USING (is_active = true);
CREATE POLICY "认证用户可以创建提示词" ON prompts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "用户只能更新自己创建的提示词" ON prompts FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "用户只能删除自己创建的提示词" ON prompts FOR DELETE USING (auth.uid() = created_by);

-- ===== 数据库函数 =====

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

-- 分类表公开可读
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON prompt_categories;
CREATE POLICY "Categories are viewable by everyone" ON prompt_categories FOR SELECT USING (true);

-- ===== 初始数据插入 =====

-- 插入默认提示词分类
INSERT INTO prompt_categories (name, description, icon, sort_order) VALUES
('Video Creation', 'AI video generation prompts', '🎬', 1),
('Animation', 'Animation and motion graphics', '🎭', 2),
('Nature & Landscape', 'Natural scenes and landscapes', '🌿', 3),
('Characters & People', 'Human characters and portraits', '👥', 4),
('Abstract & Artistic', 'Abstract and artistic concepts', '🎨', 5),
('Technology & Sci-Fi', 'Futuristic and tech themes', '🚀', 6)
ON CONFLICT DO NOTHING;

-- 示例提示词数据将通过 migrate-prompts.sql 脚本单独导入

-- ===== 触发器和函数 =====

-- 自动更新updated_at字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 注意：点赞计数功能已移除，因为当前表结构中没有 like_count 字段
-- 如果需要点赞功能，可以通过查询 prompt_likes 表来统计
-- 或者添加 like_count 字段到 prompts 表中

-- ===== 索引优化 =====

-- 为常用查询添加索引 (移除重复的索引定义，使用正确的字段名)
-- 注意：基础索引已在上面创建，这里只添加额外的优化索引
CREATE INDEX IF NOT EXISTS idx_prompts_active_featured ON prompts(is_active, is_featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_prompts_category_active ON prompts(category, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_prompts_created_by ON prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_prompts_usage_count ON prompts(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_prompt_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_prompt ON user_prompt_favorites(prompt_id);

-- 完成提示
SELECT 'Supabase数据库设置完成！' as message;