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
    
    if (!prompt) {
        alert('请输入视频描述');
        return;
    }
    
    // 模拟生成过程
    const demoPreview = document.querySelector('.demo-preview');
    demoPreview.innerHTML = `
        <div class="generating-animation">
            <div class="spinner"></div>
            <p>正在生成视频...</p>
            <p>描述: "${prompt}"</p>
        </div>
    `;
    
    // 模拟处理时间
    setTimeout(() => {
        demoPreview.innerHTML = `
            <div class="demo-result">
                <div class="success-icon">✅</div>
                <h3>视频生成完成！</h3>
                <p>基于您的描述: "${prompt}"</p>
                <p>这是一个演示版本，实际产品将显示生成的视频</p>
                <button class="btn-primary" onclick="resetDemo()">重新生成</button>
            </div>
        `;
    }, 2000);
}

// 重置演示
function resetDemo() {
    const demoPreview = document.querySelector('.demo-preview');
    demoPreview.innerHTML = `
        <div class="video-placeholder">
            <p>视频预览区域</p>
            <p>输入描述后点击生成查看效果</p>
        </div>
    `;
    
    document.getElementById('prompt-input').value = '';
}

// 表单提交处理
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // 模拟提交成功
                this.innerHTML = `
                    <div class="success-message">
                        <h3>感谢您的注册！</h3>
                        <p>我们已向 ${email} 发送了访问权限信息</p>
                    </div>
                `;
            }
        });
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
`;
document.head.appendChild(style);