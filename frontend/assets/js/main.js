/*
 * PROTECH shared scripts
 * - mobile menu hamburger toggle (with aria-expanded sync)
 * - close on outside click
 * - close on resize to desktop
 * - subtle nav shadow on scroll
 *
 * Loaded with `defer`, so DOM is ready when this runs.
 */
(() => {
  'use strict';

  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  let mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');

  if (menuBtn && mobileMenu) {
    if (!mobileMenuBackdrop) {
      mobileMenuBackdrop = document.createElement('div');
      mobileMenuBackdrop.id = 'mobile-menu-backdrop';
      mobileMenuBackdrop.className = 'fixed inset-0 z-30 hidden bg-tech-blue/35 md:hidden';
      mobileMenuBackdrop.setAttribute('aria-hidden', 'true');
      mobileMenu.before(mobileMenuBackdrop);
    }

    if (!menuBtn.hasAttribute('type')) {
      menuBtn.setAttribute('type', 'button');
    }
    if (!menuBtn.hasAttribute('aria-label')) {
      menuBtn.setAttribute('aria-label', 'メニュー');
    }
    menuBtn.setAttribute('aria-controls', mobileMenu.id);
    mobileMenu.setAttribute('aria-hidden', 'true');

    const setMenuOpen = (open) => {
      menuBtn.classList.toggle('active', open);
      mobileMenu.classList.toggle('translate-x-full', !open);
      if (mobileMenuBackdrop) {
        mobileMenuBackdrop.classList.toggle('hidden', !open);
      }
      menuBtn.setAttribute('aria-expanded', String(open));
      mobileMenu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('mobile-menu-open', open);
    };

    setMenuOpen(false);

    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const willOpen = !menuBtn.classList.contains('active');
      setMenuOpen(willOpen);
    }, true);

    mobileMenuBackdrop.addEventListener('click', () => {
      setMenuOpen(false);
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    });

    // Close menu on Escape for keyboard users
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.classList.contains('active')) {
        setMenuOpen(false);
        menuBtn.focus();
      }
    });
  }

  // Nav shadow on scroll
  const nav = document.querySelector('nav');
  if (nav) {
    const onScroll = () => {
      nav.style.boxShadow = window.scrollY > 50 ? '0 2px 20px rgba(0,0,0,0.06)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
