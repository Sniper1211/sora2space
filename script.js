// 语言管理
let currentLanguage = 'en';

// 初始化语言
function initLanguage() {
    // 检查本地存储的语言设置
    const savedLang = localStorage.getItem('sora2-language');
    if (savedLang) {
        currentLanguage = savedLang;
    }
    
    // 设置页面语言属性
    document.documentElement.lang = currentLanguage;
    
    // 应用当前语言
    applyLanguage(currentLanguage);
    
    // 添加语言切换事件监听
    setupLanguageDropdown();
}

// 设置语言下拉菜单
function setupLanguageDropdown() {
    // 延迟执行确保DOM完全渲染
    setTimeout(() => {
        const dropdown = document.querySelector('.language-dropdown');
        const toggle = document.querySelector('.language-toggle');
        const menu = document.querySelector('.language-menu');
        const options = document.querySelectorAll('.language-option');
        
        if (!dropdown || !toggle || !menu) {
            console.warn('Language dropdown elements not found, retrying...');
            setTimeout(setupLanguageDropdown, 100);
            return;
        }
        
        // 切换下拉菜单显示/隐藏
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // 点击选项切换语言
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.getAttribute('data-lang');
                switchLanguage(lang);
                dropdown.classList.remove('active');
            });
        });
        
        // 点击页面其他区域关闭下拉菜单
        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
        
        // 阻止下拉菜单内的点击事件冒泡
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }, 50);
}

// 切换语言
function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('sora2-language', currentLanguage);
    document.documentElement.lang = currentLanguage;
    applyLanguage(currentLanguage);
}

// 应用语言到页面
function applyLanguage(lang) {
    // 更新所有带有data-lang属性的元素
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // 更新占位符文本
    const placeholderElements = document.querySelectorAll('[data-lang-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-lang-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    
    // 更新当前语言显示
    const currentLangText = document.querySelector('.language-text');
    if (currentLangText) {
        currentLangText.textContent = lang === 'en' ? 'English' : '简体中文';
        currentLangText.setAttribute('data-lang', 'current-language');
    }
    
    // 更新选项激活状态
    const options = document.querySelectorAll('.language-option');
    options.forEach(option => {
        if (option.getAttribute('data-lang') === lang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // 更新SEO meta标签
    updateSEOMetaTags(lang);
    
    // 重新初始化提示词云
    initPromptCloud();
}

// 更新SEO meta标签
function updateSEOMetaTags(lang) {
    if (!translations[lang]) return;
    
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    const pageName = getPageName(currentPath);
    
    // 根据页面类型设置特定的SEO内容
    let pageTitle = 'Sora2 - AI Video Generation Technology';
    let pageDescription = translations[lang]['meta-description'];
    let pageKeywords = translations[lang]['meta-keywords'];
    
    // 根据页面类型设置特定的SEO内容
    if (pageName === 'features') {
        pageTitle = translations[lang]['page-features'];
        pageDescription = translations[lang]['meta-features-description'];
    } else if (pageName === 'pricing') {
        pageTitle = translations[lang]['page-pricing'];
        pageDescription = translations[lang]['meta-pricing-description'];
    } else if (pageName === 'tutorials') {
        pageTitle = translations[lang]['page-tutorials'];
        pageDescription = translations[lang]['meta-tutorials-description'];
    } else if (pageName === 'cases') {
        pageTitle = translations[lang]['page-cases'];
        pageDescription = translations[lang]['meta-cases-description'];
    } else if (pageName === 'about') {
        pageTitle = translations[lang]['page-about'];
        pageDescription = translations[lang]['meta-about-description'];
    } else if (pageName === 'blog') {
        pageTitle = translations[lang]['page-blog'];
        pageDescription = translations[lang]['meta-blog-description'];
    }
    
    // 更新description meta标签
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
        descriptionMeta.setAttribute('content', pageDescription);
    }
    
    // 更新keywords meta标签
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
        keywordsMeta.setAttribute('content', pageKeywords);
    }
    
    // 更新Open Graph meta标签
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
        ogTitleMeta.setAttribute('content', pageTitle);
    }
    
    const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescriptionMeta) {
        ogDescriptionMeta.setAttribute('content', pageDescription);
    }
    
    // 更新Twitter meta标签
    const twitterTitleMeta = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitleMeta) {
        twitterTitleMeta.setAttribute('content', pageTitle);
    }
    
    const twitterDescriptionMeta = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescriptionMeta) {
        twitterDescriptionMeta.setAttribute('content', pageDescription);
    }
    
    // 更新页面标题
    const titleElement = document.querySelector('title');
    if (titleElement) {
        titleElement.textContent = pageTitle;
    }
}

// 获取页面名称
function getPageName(path) {
    if (path === '/' || path.endsWith('index.html')) return 'home';
    if (path.includes('features')) return 'features';
    if (path.includes('pricing')) return 'pricing';
    if (path.includes('tutorials')) return 'tutorials';
    if (path.includes('cases')) return 'cases';
    if (path.includes('about')) return 'about';
    if (path.includes('blog')) return 'blog';
    return 'home';
}

// 平滑滚动到指定区域
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 提示词推荐功能
async function initPromptCloud() {
    const promptCloud = document.getElementById('prompt-cloud');
    if (!promptCloud) return;

    let prompts = [];
    try {
        prompts = await window.SupabaseAPI.getRandomPrompts(currentLanguage, 30);
        if (!prompts || prompts.length === 0) {
            prompts = promptsData[currentLanguage] || [];
        }
    } catch (error) {
        console.error('Error fetching prompts:', error);
        prompts = promptsData[currentLanguage] || [];
    }

    promptCloud.innerHTML = ''; // 清空现有内容

    const rows = [document.createElement('div'), document.createElement('div'), document.createElement('div')];
    rows.forEach(row => {
        row.className = 'prompt-row';
        promptCloud.appendChild(row);
    });

    prompts.forEach((prompt, index) => {
        const row = rows[index % 3];
        const card = document.createElement('div');
        card.className = 'prompt-card';
        
        const video = document.createElement('video');
        video.className = 'card-video';
        video.src = prompt.video_url || 'https://videos.openai.com/vg-assets/assets%2Ftask_01k7772d18f7ftxkqvaw29m60r%2Ftask_01k7772d18f7ftxkqvaw29m60r_genid_fc740713-4a0a-41c3-89cc-a55991947634_25_10_10_14_07_611929%2Fvideos%2F00000_wm%2Fmd.mp4?st=2025-10-10T13%3A34%3A13Z&se=2025-10-16T14%3A34%3A13Z&sks=b&skt=2025-10-10T13%3A34%3A13Z&ske=2025-10-16T14%3A34%3A13Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=Mk8Y6MH7haaxwlbb6HMfwrRLTH2iO%2BBxBuMMkXW9aqA%3D&az=oaivgprodscus'; // 使用数据库中的 video_url，如果不存在则使用默认值
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;

        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        overlay.textContent = prompt.title;

        card.appendChild(video);
        card.appendChild(overlay);
        row.appendChild(card);
    });

    rows.forEach(row => {
        const cards = Array.from(row.children);
        cards.forEach(card => {
            row.appendChild(card.cloneNode(true));
        });
    });
}

// 渲染本地提示词（回退方案）
function renderLocalPrompts(cloudContainer, prompts) {
    cloudContainer.innerHTML = '';
    const shuffledPrompts = [...prompts].sort(() => Math.random() - 0.5);
    
    for (let row = 0; row < 3; row++) {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'prompt-row';
        
        for (let i = 0; i < 40; i++) {
            const promptIndex = (row * 40 + i) % shuffledPrompts.length;
            const prompt = shuffledPrompts[promptIndex];
            
            const promptItem = document.createElement('div');
            promptItem.className = 'prompt-item';
            promptItem.textContent = prompt;
            promptItem.addEventListener('click', () => {
                promptItem.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    promptItem.style.transform = '';
                }, 200);
                
                navigator.clipboard.writeText(prompt).then(() => {
                    showTooltip(promptItem, currentLanguage === 'zh' ? '已复制!' : 'Copied!');
                }).catch(() => {
                    console.log('Selected prompt:', prompt);
                });
            });
            rowContainer.appendChild(promptItem);
        }
        
        cloudContainer.appendChild(rowContainer);
    }
}

// 显示提示信息
function showTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
        transform: translateY(-30px);
    `;
    element.style.position = 'relative';
    element.appendChild(tooltip);
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    }, 1000);
}

// 处理提示词收藏
async function handlePromptFavorite(favoriteBtn, promptText) {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    try {
        // 这里需要根据提示词文本找到对应的数据库记录
        // 为简化，我们先显示一个提示
        const isFavorited = favoriteBtn.textContent === '♥';
        
        if (isFavorited) {
            favoriteBtn.textContent = '♡';
            favoriteBtn.style.color = '';
            showTooltip(favoriteBtn.parentElement, currentLanguage === 'zh' ? '已取消收藏' : 'Unfavorited');
        } else {
            favoriteBtn.textContent = '♥';
            favoriteBtn.style.color = '#ff6b6b';
            showTooltip(favoriteBtn.parentElement, currentLanguage === 'zh' ? '已收藏' : 'Favorited');
        }
    } catch (error) {
        console.error('收藏操作失败:', error);
        showTooltip(favoriteBtn.parentElement, currentLanguage === 'zh' ? '操作失败' : 'Failed');
    }
}

// 表单提交处理
function handleFormSubmit(e) {
    e.preventDefault();
    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    const lang = currentLanguage;
    
    if (email) {
        // 模拟提交成功
        this.innerHTML = `
            <div class="success-message">
                <h3>${translations[lang]['contact-success-title']}</h3>
                <p>${translations[lang]['contact-success-message']} ${email} ${lang === 'zh' ? translations[lang]['contact-success-message2'] : ''}</p>
            </div>
        `;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待CSS完全加载后再初始化
    setTimeout(() => {
        // 初始化Supabase
        initSupabase();
        
        // 初始化用户认证状态
        initUserAuth();
        
        // 初始化语言系统
        initLanguage();
        
        // 初始化提示词云
        initPromptCloud();
        
        // 表单提交处理
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }
        
        // 添加滚动效果
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = '#fff';
                navbar.style.backdropFilter = 'none';
            }
        });
    }, 100);
});

// 添加生成动画样式
// 动态样式
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .language-switcher {
            margin-left: 0;
            margin-top: 1rem;
        }
        
        .nav-menu {
            flex-direction: column;
            gap: 1rem;
        }
    }
`;
document.head.appendChild(style);

// ===== 用户认证相关函数 =====

// 当前用户状态
let currentUser = null;

// 初始化用户认证状态
async function initUserAuth() {
    if (!window.SupabaseAPI) {
        console.error('SupabaseAPI未加载');
        return;
    }
    
    // 获取当前用户
    currentUser = await window.SupabaseAPI.getCurrentUser();
    
    // 如果用户已经登录，确保用户资料存在
    if (currentUser) {
        await ensureUserProfile(currentUser);
    }
    
    // 监听认证状态变化
    window.SupabaseAPI.onAuthStateChange(async (event, session) => {
        currentUser = session?.user || null;
        
        // 如果用户登录，先创建或更新用户资料
        if (event === 'SIGNED_IN' && currentUser) {
            await ensureUserProfile(currentUser);
        }
        
        // 然后更新UI
        await updateUIForAuthState();
    });
    
    // 更新UI
    await updateUIForAuthState();
}

// 确保用户资料存在
async function ensureUserProfile(user) {
    try {
        let profile = await window.SupabaseAPI.getUserProfile(user.id);
        
        if (!profile) {
            // 创建新的用户资料
            profile = await window.SupabaseAPI.upsertUserProfile(user.id, {
                username: user.email.split('@')[0],
                display_name: user.user_metadata?.full_name || user.email.split('@')[0],
                preferred_language: currentLanguage
            });
            console.log('✅ 用户资料创建成功:', profile);
        }
    } catch (error) {
        console.error('❌ 用户资料处理失败:', error);
    }
}

// 根据认证状态更新UI
async function updateUIForAuthState() {
    const authButton = document.getElementById('auth-button');
    const userMenu = document.getElementById('user-menu');
    
    if (currentUser) {
        // 用户已登录
        if (authButton) {
            // 获取用户资料以显示display name
            try {
                const profile = await window.SupabaseAPI.getUserProfile(currentUser.id);
                const displayName = profile?.display_name || currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
                authButton.textContent = displayName;
            } catch (error) {
                console.error('获取用户资料失败:', error);
                authButton.textContent = currentUser.email.split('@')[0];
            }
            authButton.onclick = toggleUserMenu;
        }
        
        // 显示用户菜单
        if (userMenu) {
            userMenu.style.display = 'block';
        }
        
        // 重新初始化提示词云以显示收藏按钮
        initPromptCloud();
    } else {
        // 用户未登录
        if (authButton) {
            authButton.textContent = 'Login';
            authButton.onclick = showAuthModal;
        }
        
        // 隐藏用户菜单
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        // 重新初始化提示词云以隐藏收藏按钮
        initPromptCloud();
    }
}

// 显示认证模态框
function showAuthModal() {
    // 创建模态框HTML
    const modalHTML = `
        <div id="auth-modal" class="auth-modal">
            <div class="auth-modal-content">
                <span class="auth-close">&times;</span>
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">Login</button>
                    <button class="auth-tab" data-tab="signup">Sign Up</button>
                </div>
                
                <div id="login-form" class="auth-form active">
                    <h3>Welcome Back</h3>
                    <form onsubmit="handleLogin(event)">
                        <input type="email" placeholder="Email" required>
                        <input type="password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                </div>
                
                <div id="signup-form" class="auth-form">
                    <h3>Create Account</h3>
                    <form onsubmit="handleSignup(event)">
                        <input type="text" placeholder="Display Name" required>
                        <input type="email" placeholder="Email" required>
                        <input type="password" placeholder="Password (min 6 chars)" required minlength="6">
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
                
                <div id="auth-message" class="auth-message"></div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加事件监听
    setupAuthModal();
}

// 设置认证模态框事件
function setupAuthModal() {
    const modal = document.getElementById('auth-modal');
    const closeBtn = document.querySelector('.auth-close');
    const tabs = document.querySelectorAll('.auth-tab');
    
    // 关闭模态框
    closeBtn.onclick = () => modal.remove();
    window.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    // 切换标签
    tabs.forEach(tab => {
        tab.onclick = () => {
            const tabName = tab.dataset.tab;
            
            // 更新标签状态
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 更新表单显示
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(`${tabName}-form`).classList.add('active');
        };
    });
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const messageEl = document.getElementById('auth-message');
    
    try {
        messageEl.textContent = 'Logging in...';
        messageEl.className = 'auth-message info';
        
        await window.SupabaseAPI.signInUser(email, password);
        
        messageEl.textContent = 'Login successful!';
        messageEl.className = 'auth-message success';
        
        setTimeout(() => {
            document.getElementById('auth-modal').remove();
        }, 1000);
        
    } catch (error) {
        messageEl.textContent = error.message;
        messageEl.className = 'auth-message error';
    }
}

// 处理注册
async function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const displayName = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const messageEl = document.getElementById('auth-message');
    
    try {
        messageEl.textContent = 'Creating account...';
        messageEl.className = 'auth-message info';
        
        await window.SupabaseAPI.signUpUser(email, password, {
            full_name: displayName
        });
        
        messageEl.textContent = 'Account created! Please check your email to verify.';
        messageEl.className = 'auth-message success';
        
    } catch (error) {
        messageEl.textContent = error.message;
        messageEl.className = 'auth-message error';
    }
}

// 切换用户菜单
function toggleUserMenu() {
    // 这里可以添加用户菜单的显示逻辑
    const userMenuHTML = `
        <div id="user-dropdown" class="user-dropdown">
            <div class="user-info">
                <strong>${currentUser.email}</strong>
            </div>
            <button onclick="showUserProfile()">Profile</button>
            <button onclick="showFavorites()">My Favorites</button>
            <button onclick="handleLogout()">Logout</button>
        </div>
    `;
    
    // 移除现有的下拉菜单
    const existing = document.getElementById('user-dropdown');
    if (existing) {
        existing.remove();
        return;
    }
    
    // 添加新的下拉菜单
    document.body.insertAdjacentHTML('beforeend', userMenuHTML);
    
    // 点击外部关闭
    setTimeout(() => {
        document.addEventListener('click', function closeUserMenu(e) {
            if (!e.target.closest('#user-dropdown') && !e.target.closest('#auth-button')) {
                const dropdown = document.getElementById('user-dropdown');
                if (dropdown) dropdown.remove();
                document.removeEventListener('click', closeUserMenu);
            }
        });
    }, 100);
}

// 处理登出
async function handleLogout() {
    try {
        await window.SupabaseAPI.signOutUser();
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.remove();
    } catch (error) {
        console.error('登出失败:', error);
    }
}

// 显示用户资料
function showUserProfile() {
    alert('用户资料功能开发中...');
}

// 显示收藏夹
async function showFavorites() {
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    try {
        const favorites = await window.SupabaseAPI.getUserFavoritePrompts(currentUser.id);
        
        // 创建收藏夹模态框
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2>${currentLanguage === 'zh' ? '我的收藏' : 'My Favorites'}</h2>
                    <span class="auth-modal-close">&times;</span>
                </div>
                <div class="favorites-content">
                    ${favorites.length === 0 ? 
                        `<p class="no-favorites">${currentLanguage === 'zh' ? '暂无收藏的提示词' : 'No favorite prompts yet'}</p>` :
                        favorites.map(prompt => `
                            <div class="favorite-item">
                                <div class="favorite-content">
                                    <h4>${prompt.title}</h4>
                                    <p>${prompt.description || prompt.content}</p>
                                    <div class="favorite-tags">
                                        ${prompt.tags ? prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                                    </div>
                                </div>
                                <div class="favorite-actions">
                                    <button class="copy-btn" onclick="copyToClipboard('${prompt.content}')">${currentLanguage === 'zh' ? '复制' : 'Copy'}</button>
                                    <button class="unfavorite-btn" onclick="unfavoritePrompt('${prompt.id}')">${currentLanguage === 'zh' ? '取消收藏' : 'Unfavorite'}</button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加关闭事件
        const closeBtn = modal.querySelector('.auth-modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
    } catch (error) {
        console.error('加载收藏夹失败:', error);
        alert(currentLanguage === 'zh' ? '加载收藏夹失败' : 'Failed to load favorites');
    }
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert(currentLanguage === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard');
    }).catch(() => {
        console.log('Copy failed');
    });
}

// 取消收藏提示词
async function unfavoritePrompt(promptId) {
    try {
        await window.SupabaseAPI.togglePromptFavorite(promptId);
        // 重新加载收藏夹
        showFavorites();
    } catch (error) {
        console.error('取消收藏失败:', error);
        alert(currentLanguage === 'zh' ? '操作失败' : 'Operation failed');
    }
}