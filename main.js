// ========================================
// 移动菜单切换功能
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // 处理菜单按钮点击
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }
    
    // 点击菜单项后关闭菜单
    const menuItems = document.querySelectorAll('#mobile-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            menuBtn.classList.remove('active');
        });
    });
});

// ========================================
// Services 页面的展开功能
// ========================================
function toggleExpand(id, btn) {
    const content = document.getElementById(id);
    const isActive = content.classList.contains('active');
    
    content.classList.toggle('active');
    
    // 更新按钮文本
    btn.innerText = isActive ? 'VIEW MORE' : 'CLOSE';
    
    // 刷新动画库
    if (typeof AOS !== 'undefined') {
        setTimeout(() => { AOS.refresh(); }, 600);
    }
}

// ========================================
// News 详情页面 - 社交分享功能
// ========================================
function shareOnSocial(platform) {
    const pageUrl = window.location.href;
    const pageTitle = document.title;
    let shareUrl = '';
    
    switch(platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
            break;
        case 'line':
            shareUrl = `https://line.me/R/msg/text/${encodeURIComponent(pageTitle + ' ' + pageUrl)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}