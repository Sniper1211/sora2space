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
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES prompt_categories(id),
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[], -- 标签数组
  use_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
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

-- ===== Row Level Security (RLS) 策略 =====

-- 启用RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_likes ENABLE ROW LEVEL SECURITY;

-- 用户资料策略
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 用户使用统计策略
CREATE POLICY "Users can view own usage" ON user_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON user_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 提示词策略
CREATE POLICY "Public prompts are viewable by everyone" ON prompts FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own prompts" ON prompts FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create prompts" ON prompts FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own prompts" ON prompts FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own prompts" ON prompts FOR DELETE USING (auth.uid() = created_by);

-- 收藏策略
CREATE POLICY "Users can view own favorites" ON user_prompt_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON user_prompt_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON user_prompt_favorites FOR DELETE USING (auth.uid() = user_id);

-- 点赞策略
CREATE POLICY "Users can view all likes" ON prompt_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON prompt_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON prompt_likes FOR DELETE USING (auth.uid() = user_id);

-- 分类表公开可读
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;
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

-- 插入示例提示词
INSERT INTO prompts (title, content, description, category_id, is_public, is_featured, tags) 
SELECT 
  'Cinematic Ocean Waves',
  'A cinematic shot of powerful ocean waves crashing against rocky cliffs during golden hour, with dramatic lighting and slow motion effect',
  'Perfect for creating dramatic ocean scenes with cinematic quality',
  (SELECT id FROM prompt_categories WHERE name = 'Nature & Landscape' LIMIT 1),
  true,
  true,
  ARRAY['ocean', 'cinematic', 'nature', 'dramatic']
WHERE NOT EXISTS (SELECT 1 FROM prompts WHERE title = 'Cinematic Ocean Waves');

INSERT INTO prompts (title, content, description, category_id, is_public, is_featured, tags) 
SELECT 
  'Futuristic City Flythrough',
  'A smooth aerial flythrough of a futuristic cyberpunk city at night, with neon lights, flying cars, and towering skyscrapers',
  'Great for sci-fi and futuristic video content',
  (SELECT id FROM prompt_categories WHERE name = 'Technology & Sci-Fi' LIMIT 1),
  true,
  true,
  ARRAY['cyberpunk', 'futuristic', 'city', 'aerial']
WHERE NOT EXISTS (SELECT 1 FROM prompts WHERE title = 'Futuristic City Flythrough');

INSERT INTO prompts (title, content, description, category_id, is_public, is_featured, tags) 
SELECT 
  'Character Walking Animation',
  'A 3D character walking cycle animation with natural movement, realistic lighting, and smooth transitions',
  'Basic character animation for storytelling',
  (SELECT id FROM prompt_categories WHERE name = 'Characters & People' LIMIT 1),
  true,
  false,
  ARRAY['character', 'animation', 'walking', '3d']
WHERE NOT EXISTS (SELECT 1 FROM prompts WHERE title = 'Character Walking Animation');

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

-- 提示词点赞计数更新函数
CREATE OR REPLACE FUNCTION update_prompt_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE prompts SET like_count = like_count + 1 WHERE id = NEW.prompt_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE prompts SET like_count = like_count - 1 WHERE id = OLD.prompt_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 点赞计数触发器
DROP TRIGGER IF EXISTS prompt_like_count_trigger ON prompt_likes;
CREATE TRIGGER prompt_like_count_trigger
    AFTER INSERT OR DELETE ON prompt_likes
    FOR EACH ROW EXECUTE FUNCTION update_prompt_like_count();

-- ===== 索引优化 =====

-- 为常用查询添加索引
CREATE INDEX IF NOT EXISTS idx_prompts_public ON prompts(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON prompts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_by ON prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_prompt_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_prompt ON user_prompt_favorites(prompt_id);

-- 完成提示
SELECT 'Supabase数据库设置完成！' as message;