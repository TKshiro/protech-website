// ========================================
// 移动菜单切换功能 (增强型)
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        const toggleMenu = (show) => {
            const shouldActive = show !== undefined ? show : !mobileMenu.classList.contains('active');
            mobileMenu.classList.toggle('active', shouldActive);
            menuBtn.classList.toggle('active', shouldActive);
            // 锁定滚动，防止打开菜单时背景滑动
            document.body.style.overflow = shouldActive ? 'hidden' : '';
        };

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止冒泡到 window
            toggleMenu();
        });

        // 点击菜单项关闭
        mobileMenu.querySelectorAll('a').forEach(item => {
            item.addEventListener('click', () => toggleMenu(false));
        });

        // 点击页面任何地方关闭菜单
        window.addEventListener('click', () => toggleMenu(false));
        mobileMenu.addEventListener('click', (e) => e.stopPropagation());
    }
});

// ========================================
// Services 页面的展开功能 (带滚动回正)
// ========================================
function toggleExpand(id, btn) {
    const content = document.getElementById(id);
    if (!content) return;

    const isActive = content.classList.contains('active');
    
    if (isActive) {
        // 如果是收起操作，先滚动到元素顶部再收起
        content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        content.classList.remove('active');
        btn.innerText = 'VIEW MORE';
    } else {
        content.classList.add('active');
        btn.innerText = 'CLOSE';
    }
    
    if (typeof AOS !== 'undefined') {
        setTimeout(() => { AOS.refresh(); }, 600);
    }
}

// ========================================
// 社交分享 (性能优化)
// ========================================
function shareOnSocial(platform) {
    const data = {
        url: window.location.href,
        title: document.title
    };
    
    const configs = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
        line: `https://line.me/R/msg/text/${encodeURIComponent(data.title + ' ' + data.url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`
    };
    
    const targetUrl = configs[platform];
    if (targetUrl) {
        window.open(targetUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    }
}