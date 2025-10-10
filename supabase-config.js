// Supabase配置文件
// 初始化Supabase客户端

// 从CDN加载Supabase客户端
const SUPABASE_URL = 'https://tktidtusplvsacpayepr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdGlkdHVzcGx2c2FjcGF5ZXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTcxNDEsImV4cCI6MjA3NTUzMzE0MX0.L5Bc7_cLCTQ7IinmmfBsvcQlAhDzWneNasWEVh_GfwQ';

// 全局Supabase客户端实例
let supabase = null;

// 初始化Supabase客户端
function initSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase客户端初始化成功');
        return supabase;
    } else {
        console.error('❌ Supabase SDK未加载');
        return null;
    }
}

// 获取当前用户
async function getCurrentUser() {
    if (!supabase) {
        console.error('Supabase未初始化');
        return null;
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('获取用户信息失败:', error);
        return null;
    }
    return user;
}

// 用户注册
async function signUpUser(email, password, userData = {}) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: userData
        }
    });
    
    if (error) {
        throw error;
    }
    
    return data;
}

// 用户登录
async function signInUser(email, password) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        throw error;
    }
    
    return data;
}

// 用户登出
async function signOutUser() {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
}

// 监听认证状态变化
function onAuthStateChange(callback) {
    if (!supabase) {
        console.error('Supabase未初始化');
        return;
    }
    
    return supabase.auth.onAuthStateChange((event, session) => {
        console.log('认证状态变化:', event, session?.user?.email);
        callback(event, session);
    });
}

// 获取用户资料
async function getUserProfile(userId) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
    }
    
    return data;
}

// 创建或更新用户资料
async function upsertUserProfile(userId, profileData) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
            id: userId,
            ...profileData,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) {
        throw error;
    }
    
    return data;
}

// 获取提示词列表
async function getPrompts(options = {}) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const {
        language = 'en',
        category = null,
        featured = null,
        limit = 30,
        offset = 0
    } = options;
    
    let query = supabase
        .from('prompts')
        .select('*')
        .eq('is_active', true)
        .eq('language', language)
        .order('created_at', { ascending: false });
    
    if (category) {
        query = query.eq('category', category);
    }
    
    if (featured !== null) {
        query = query.eq('is_featured', featured);
    }
    
    if (limit > 0) {
        query = query.range(offset, offset + limit - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error('获取提示词失败:', error);
        throw error;
    }
    
    return data || [];
}

// 获取随机提示词
async function getRandomPrompts(language = 'en', count = 30) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const { data, error } = await supabase
        .rpc('get_random_prompts', {
            lang: language,
            prompt_count: count
        });
    
    if (error) {
        console.error('获取随机提示词失败:', error);
        // 如果RPC函数不存在，回退到普通查询
        return getPrompts({ language, limit: count });
    }
    
    return data || [];
}

// 增加提示词使用次数
async function incrementPromptUsage(promptId) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const { error } = await supabase
        .rpc('increment_prompt_usage', { prompt_id: promptId });
    
    if (error) {
        console.error('更新提示词使用次数失败:', error);
        // 如果RPC函数不存在，使用普通更新
        const { data: prompt } = await supabase
            .from('prompts')
            .select('usage_count')
            .eq('id', promptId)
            .single();
        
        if (prompt) {
            await supabase
                .from('prompts')
                .update({ usage_count: (prompt.usage_count || 0) + 1 })
                .eq('id', promptId);
        }
    }
}

// 创建新提示词
async function createPrompt(promptData) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('用户未登录');
    }
    
    const { data, error } = await supabase
        .from('prompts')
        .insert({
            ...promptData,
            created_by: user.id
        })
        .select()
        .single();
    
    if (error) {
        console.error('创建提示词失败:', error);
        throw error;
    }
    
    return data;
}

// 获取提示词分类
async function getPromptCategories(language = 'en') {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const { data, error } = await supabase
        .from('prompts')
        .select('category')
        .eq('language', language)
        .eq('is_active', true)
        .not('category', 'is', null);
    
    if (error) {
        console.error('获取提示词分类失败:', error);
        throw error;
    }
    
    // 去重并返回分类列表
    const categories = [...new Set(data.map(item => item.category))];
    return categories.filter(cat => cat);
}

// 获取用户收藏的提示词
async function getUserFavoritePrompts(userId) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    const { data, error } = await supabase
        .from('user_prompt_favorites')
        .select(`
            prompts(
                *,
                prompt_categories(name, icon),
                user_profiles(username, display_name)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) {
        throw error;
    }
    
    return data.map(item => item.prompts);
}

// 收藏/取消收藏提示词
async function togglePromptFavorite(userId, promptId) {
    if (!supabase) {
        throw new Error('Supabase未初始化');
    }
    
    // 检查是否已收藏
    const { data: existing } = await supabase
        .from('user_prompt_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', promptId)
        .single();
    
    if (existing) {
        // 取消收藏
        const { error } = await supabase
            .from('user_prompt_favorites')
            .delete()
            .eq('user_id', userId)
            .eq('prompt_id', promptId);
        
        if (error) throw error;
        return false; // 已取消收藏
    } else {
        // 添加收藏
        const { error } = await supabase
            .from('user_prompt_favorites')
            .insert({
                user_id: userId,
                prompt_id: promptId
            });
        
        if (error) throw error;
        return true; // 已收藏
    }
}

// 导出API到全局对象
window.SupabaseAPI = {
    initSupabase,
    getCurrentUser,
    signUpUser,
    signInUser,
    signOutUser,
    onAuthStateChange,
    getUserProfile,
    upsertUserProfile,
    getPrompts,
    getRandomPrompts,
    incrementPromptUsage,
    createPrompt,
    getPromptCategories,
    getUserFavoritePrompts,
    togglePromptFavorite
};