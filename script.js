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
    document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
}

// 切换语言
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
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
    
    // 更新语言切换按钮文本
    const toggleBtn = document.getElementById('language-toggle');
    if (toggleBtn && translations[lang] && translations[lang]['language-switch']) {
        toggleBtn.textContent = translations[lang]['language-switch'];
    }
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