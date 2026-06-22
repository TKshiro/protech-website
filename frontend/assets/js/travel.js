(() => {
  'use strict';

  const CONTACTS_KEY = 'protech_contacts';
  const forms = document.querySelectorAll('[data-travel-inquiry]');

  const labels = {
    saved: {
      zh: '已收到你的旅行需求，内容已经保存到后台咨询列表。',
      zht: '已收到你的旅行需求，內容已經保存到後台諮詢列表。',
      en: 'Your travel request has been saved to the inquiry dashboard.',
      ja: '旅行相談の内容を管理画面に保存しました。'
    },
    failed: {
      zh: '提交失败，请稍后重试，或直接联系 support@pro-tech.jp。',
      zht: '提交失敗，請稍後重試，或直接聯絡 support@pro-tech.jp。',
      en: 'Could not save the request. Please try again or contact support@pro-tech.jp.',
      ja: '保存できませんでした。時間をおいて再度お試しください。'
    }
  };

  function getPageLanguage() {
    const lang = document.documentElement.lang || '';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.toLowerCase().startsWith('zh-hant')) return 'zht';
    return 'zh';
  }

  function getContacts() {
    try {
      return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
    } catch (_) {
      return [];
    }
  }

  function setContacts(items) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(items));
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `travel-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function showStatus(form, type, text) {
    let status = form.querySelector('[data-travel-form-status]');
    if (!status) {
      status = document.createElement('p');
      status.setAttribute('data-travel-form-status', '');
      status.className = 'travel-form-status';
      form.appendChild(status);
    }
    status.textContent = text;
    status.dataset.status = type;
  }

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const lang = getPageLanguage();
      const params = new URLSearchParams(window.location.search);
      const travel = {
        travel_date: data.get('date')?.toString().trim() || '',
        people: data.get('people')?.toString().trim() || '',
        language: data.get('language')?.toString().trim() || '',
        budget: data.get('budget')?.toString().trim() || '',
        service: data.get('service')?.toString().trim() || '',
        source: params.get('source') || document.body.dataset.travelSource || 'travel_page',
        page_url: window.location.href
      };
      const message = [
        `出行日期：${travel.travel_date || '未填写'}`,
        `人数：${travel.people || '未填写'}`,
        `服务语言：${travel.language || '未填写'}`,
        `预算：${travel.budget || '未填写'}`,
        `需要的服务：${travel.service || '未填写'}`,
        `来源页面：${travel.source}`,
        '',
        data.get('message')?.toString().trim() || ''
      ].join('\n');

      const contact = {
        id: makeId(),
        status: '未対応',
        date: new Date().toISOString(),
        inquiry_type: 'travel_custom',
        referral_source: 'travel_page',
        name: data.get('name')?.toString().trim() || '',
        company: 'PROTECH Travel Concierge',
        email: data.get('contact')?.toString().trim() || '',
        phone: '',
        budget: travel.budget,
        message,
        travel
      };

      try {
        const contacts = getContacts();
        contacts.unshift(contact);
        setContacts(contacts);
        showStatus(form, 'success', labels.saved[lang]);
        form.reset();
      } catch (_) {
        showStatus(form, 'error', labels.failed[lang]);
      }
    });
  });
})();
