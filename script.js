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

// 演示生成功能
function generateDemo() {
    const promptInput = document.getElementById('prompt-input');
    const prompt = promptInput.value.trim();
    const lang = currentLanguage;
    
    if (!prompt) {
        alert(lang === 'en' ? 'Please enter video description' : '请输入视频描述');
        return;
    }
    
    // 模拟生成过程
    const demoPreview = document.querySelector('.demo-preview');
    demoPreview.innerHTML = `
        <div class="generating-animation">
            <div class="spinner"></div>
            <p>${translations[lang]['demo-generating']}</p>
            <p>${lang === 'en' ? 'Description' : '描述'}: "${prompt}"</p>
        </div>
    `;
    
    // 模拟处理时间
    setTimeout(() => {
        demoPreview.innerHTML = `
            <div class="demo-result">
                <div class="success-icon">✅</div>
                <h3>${translations[lang]['demo-complete']}</h3>
                <p>${lang === 'en' ? 'Based on your description' : '基于您的描述'}: "${prompt}"</p>
                <p>${translations[lang]['demo-demo-version']}</p>
                <button class="btn-primary" onclick="resetDemo()">${translations[lang]['demo-reset']}</button>
            </div>
        `;
    }, 2000);
}

// 重置演示
function resetDemo() {
    const demoPreview = document.querySelector('.demo-preview');
    const lang = currentLanguage;
    
    demoPreview.innerHTML = `
        <div class="video-placeholder">
            <p>${translations[lang]['demo-preview-text1']}</p>
            <p>${translations[lang]['demo-preview-text2']}</p>
        </div>
    `;
    
    document.getElementById('prompt-input').value = '';
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
        // 初始化语言系统
        initLanguage();
        
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
const style = document.createElement('style');
style.textContent = `
    .generating-animation {
        text-align: center;
        padding: 2rem;
    }
    
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #2563eb;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 2s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .demo-result {
        text-align: center;
        padding: 2rem;
    }
    
    .success-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .success-message {
        text-align: center;
        padding: 2rem;
    }
    
    .success-message h3 {
        color: #10b981;
        margin-bottom: 1rem;
    }
    
    /* 语言切换按钮响应式 */
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