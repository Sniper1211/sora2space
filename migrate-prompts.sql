-- 提示词数据迁移脚本
-- 将现有的提示词数据插入到Supabase数据库中

-- 插入英文提示词
INSERT INTO prompts (title, content, language, category, is_featured, is_active) VALUES
-- 科幻类
('Futuristic Cityscape', 'A futuristic cityscape with flying cars and neon lights', 'en', 'sci-fi', true, true),
('Cyberpunk Street', 'Cyberpunk street scene with holographic advertisements', 'en', 'sci-fi', false, true),
('Space Station', 'Space station orbiting a distant planet', 'en', 'sci-fi', false, true),
('Post-Apocalyptic Robot', 'Robot walking through a post-apocalyptic wasteland', 'en', 'sci-fi', false, true),
('Steampunk Time Traveler', 'Time traveler in a steampunk laboratory', 'en', 'sci-fi', false, true),

-- 奇幻类
('Magical Forest', 'Magical forest with glowing mushrooms and fairy lights', 'en', 'fantasy', true, true),
('Dragon Castle', 'Dragon soaring over a medieval castle', 'en', 'fantasy', false, true),
('Wizard Library', 'Wizard casting spells in an ancient library', 'en', 'fantasy', false, true),
('Enchanted Garden', 'Enchanted garden with talking animals', 'en', 'fantasy', false, true),
('Crystal Cave', 'Crystal cave with mystical creatures', 'en', 'fantasy', false, true),

-- 自然类
('Mountain Lake Sunrise', 'Serene mountain lake at sunrise', 'en', 'nature', true, true),
('Rainforest Wildlife', 'Dense rainforest with exotic wildlife', 'en', 'nature', false, true),
('Desert Oasis Night', 'Desert oasis under starry night sky', 'en', 'nature', false, true),
('Coral Reef Life', 'Underwater coral reef teeming with life', 'en', 'nature', false, true),
('Arctic Aurora', 'Arctic landscape with aurora borealis', 'en', 'nature', false, true),

-- 艺术类
('Abstract Geometric', 'Abstract painting with vibrant colors and geometric shapes', 'en', 'art', false, true),
('Renaissance Portrait', 'Renaissance-style portrait in oil painting', 'en', 'art', false, true),
('Modern Sculpture', 'Modern sculpture in a contemporary gallery', 'en', 'art', false, true),
('Street Art Mural', 'Street art mural on urban wall', 'en', 'art', false, true),
('Minimalist Design', 'Minimalist design with clean lines', 'en', 'art', false, true),

-- 动物类
('African Lion', 'Majestic lion in African savanna', 'en', 'animals', false, true),
('Ocean Dolphins', 'Playful dolphins jumping in ocean waves', 'en', 'animals', false, true),
('Tropical Birds', 'Colorful tropical birds in jungle canopy', 'en', 'animals', false, true),
('Bamboo Pandas', 'Peaceful pandas in bamboo forest', 'en', 'animals', false, true),
('Wild Horses', 'Wild horses running across open plains', 'en', 'animals', false, true),

-- 建筑类
('Gothic Cathedral', 'Gothic cathedral with intricate stonework', 'en', 'architecture', false, true),
('Modern Skyscraper', 'Modern skyscraper with glass facade', 'en', 'architecture', false, true),
('Japanese Temple', 'Traditional Japanese temple in cherry blossom season', 'en', 'architecture', false, true),
('Roman Amphitheater', 'Ancient Roman amphitheater ruins', 'en', 'architecture', false, true),
('English Cottage', 'Cozy cottage in English countryside', 'en', 'architecture', false, true);

-- 插入中文提示词
INSERT INTO prompts (title, content, language, category, is_featured, is_active) VALUES
-- 科幻类
('未来城市景观', '未来城市景观，飞行汽车和霓虹灯', 'zh', 'sci-fi', true, true),
('赛博朋克街景', '赛博朋克街景，全息广告牌', 'zh', 'sci-fi', false, true),
('太空站', '环绕遥远星球的空间站', 'zh', 'sci-fi', false, true),
('末日机器人', '机器人穿越后末日荒地', 'zh', 'sci-fi', false, true),
('蒸汽朋克时间旅行者', '蒸汽朋克实验室中的时间旅行者', 'zh', 'sci-fi', false, true),

-- 奇幻类
('魔法森林', '发光蘑菇和仙女灯的魔法森林', 'zh', 'fantasy', true, true),
('巨龙城堡', '巨龙翱翔在中世纪城堡上空', 'zh', 'fantasy', false, true),
('巫师图书馆', '巫师在古老图书馆施法', 'zh', 'fantasy', false, true),
('魔法花园', '会说话动物的魔法花园', 'zh', 'fantasy', false, true),
('水晶洞穴', '神秘生物的水晶洞穴', 'zh', 'fantasy', false, true),

-- 自然类
('山湖日出', '日出时宁静的山湖', 'zh', 'nature', true, true),
('雨林野生动物', '异域野生动物的茂密雨林', 'zh', 'nature', false, true),
('沙漠绿洲夜景', '星空下的沙漠绿洲', 'zh', 'nature', false, true),
('珊瑚礁生态', '生机勃勃的水下珊瑚礁', 'zh', 'nature', false, true),
('北极极光', '北极光下的北极景观', 'zh', 'nature', false, true),

-- 艺术类
('抽象几何画', '鲜艳色彩和几何形状的抽象画', 'zh', 'art', false, true),
('文艺复兴肖像', '文艺复兴风格的油画肖像', 'zh', 'art', false, true),
('现代雕塑', '当代画廊中的现代雕塑', 'zh', 'art', false, true),
('街头艺术壁画', '城市墙面的街头艺术壁画', 'zh', 'art', false, true),
('极简设计', '简洁线条的极简设计', 'zh', 'art', false, true),

-- 动物类
('非洲狮子', '非洲草原上威严的狮子', 'zh', 'animals', false, true),
('海洋海豚', '海浪中跳跃的顽皮海豚', 'zh', 'animals', false, true),
('热带鸟类', '丛林树冠中的彩色热带鸟类', 'zh', 'animals', false, true),
('竹林熊猫', '竹林中安详的熊猫', 'zh', 'animals', false, true),
('野马奔腾', '奔跑在开阔平原上的野马', 'zh', 'animals', false, true),

-- 建筑类
('哥特式大教堂', '精美石雕的哥特式大教堂', 'zh', 'architecture', false, true),
('现代摩天大楼', '玻璃幕墙的现代摩天大楼', 'zh', 'architecture', false, true),
('日式寺庙', '樱花季节的传统日式寺庙', 'zh', 'architecture', false, true),
('古罗马剧场', '古罗马圆形剧场遗址', 'zh', 'architecture', false, true),
('英式乡村小屋', '英式乡村的舒适小屋', 'zh', 'architecture', false, true);