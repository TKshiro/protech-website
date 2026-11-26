(function () {
    var PAGE_SIZE = 12;

    function initMenu() {
        var menuBtn = document.getElementById('menu-btn');
        var mobileMenu = document.getElementById('mobile-menu');
        if (!menuBtn || !mobileMenu) return;

        menuBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            menuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('translate-x-full');
        });

        document.addEventListener('click', function (event) {
            if (!mobileMenu.contains(event.target) && !menuBtn.contains(event.target)) {
                menuBtn.classList.remove('active');
                mobileMenu.classList.add('translate-x-full');
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768) {
                menuBtn.classList.remove('active');
                mobileMenu.classList.add('translate-x-full');
            }
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function initBlogIndex() {
        var grid = document.getElementById('blog-grid');
        if (!grid) return;

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.blog-card'));
        var search = document.getElementById('blog-search');
        var more = document.getElementById('blog-more');
        var empty = document.getElementById('blog-empty');
        var summary = document.getElementById('blog-summary');
        var tabs = document.getElementById('category-tabs');
        var drawer = document.getElementById('tag-drawer');
        var drawerToggle = document.getElementById('tag-drawer-toggle');
        var state = { category: 'all', tag: '', q: '', shown: PAGE_SIZE };

        function readUrl() {
            var params = new URLSearchParams(window.location.search);
            state.category = params.get('category') || 'all';
            state.tag = params.get('tag') || '';
        }

        function writeUrl() {
            var params = new URLSearchParams();
            if (state.category && state.category !== 'all') params.set('category', state.category);
            if (state.tag) params.set('tag', state.tag);
            var query = params.toString();
            var next = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
            window.history.replaceState(null, '', next);
        }

        function filtered() {
            var query = normalize(state.q);
            return cards.filter(function (card) {
                if (state.category !== 'all' && card.getAttribute('data-category') !== state.category) return false;
                if (state.tag) {
                    var tags = (card.getAttribute('data-tags') || '').split(/\s+/);
                    if (tags.indexOf(state.tag) === -1) return false;
                }
                if (query && normalize(card.getAttribute('data-search')).indexOf(query) === -1) return false;
                return true;
            });
        }

        function setPressed(nodes, attr, value) {
            Array.prototype.forEach.call(nodes, function (node) {
                var active = node.getAttribute(attr) === value && value !== '';
                node.classList.toggle('is-active', active);
                if (attr === 'data-category') {
                    if (active) node.setAttribute('aria-current', 'page');
                    else node.removeAttribute('aria-current');
                } else if (active) {
                    node.setAttribute('aria-pressed', 'true');
                } else {
                    node.setAttribute('aria-pressed', 'false');
                }
            });
        }

        function render() {
            var list = filtered();
            var visible = {};
            list.slice(0, state.shown).forEach(function (card) {
                visible[card.getAttribute('data-slug')] = true;
            });
            cards.forEach(function (card) {
                card.classList.toggle('is-extra', !visible[card.getAttribute('data-slug')]);
            });

            if (tabs) setPressed(tabs.querySelectorAll('[data-category]'), 'data-category', state.category);
            setPressed(document.querySelectorAll('[data-filter-tag]'), 'data-filter-tag', state.tag);

            var total = list.length;
            var end = Math.min(state.shown, total);
            if (summary) {
                summary.textContent = total ? total + '件中 ' + end + '件を表示' : '該当する記事はありません';
            }
            if (empty) empty.hidden = total !== 0;
            if (more) {
                var remaining = Math.max(total - end, 0);
                more.hidden = remaining === 0;
                more.textContent = remaining ? 'もっと見る（残り' + remaining + '件）' : 'もっと見る';
            }
        }

        function scrollActiveTab() {
            if (!tabs) return;
            var active = tabs.querySelector('.is-active');
            if (!active) return;
            var left = active.offsetLeft - (tabs.clientWidth - active.offsetWidth) / 2;
            tabs.scrollLeft = Math.max(0, left);
        }

        if (tabs) {
            tabs.addEventListener('click', function (event) {
                var origin = event.target.closest ? event.target : event.target.parentElement;
                var link = origin && origin.closest('[data-category]');
                if (!link) return;
                event.preventDefault();
                state.category = link.getAttribute('data-category') || 'all';
                state.shown = PAGE_SIZE;
                writeUrl();
                render();
                scrollActiveTab();
            });
        }

        document.addEventListener('click', function (event) {
            var origin = event.target.closest ? event.target : event.target.parentElement;
            var link = origin && origin.closest('[data-filter-tag]');
            if (!link || !document.getElementById('blog-grid')) return;
            if (link.closest('#blog-grid')) return;
            event.preventDefault();
            var tag = link.getAttribute('data-filter-tag') || '';
            state.tag = state.tag === tag ? '' : tag;
            state.shown = PAGE_SIZE;
            writeUrl();
            render();
        });

        if (search) {
            search.addEventListener('input', function () {
                state.q = search.value;
                state.shown = PAGE_SIZE;
                render();
            });
        }

        if (more) {
            more.addEventListener('click', function () {
                state.shown += PAGE_SIZE;
                render();
            });
        }

        if (drawer && drawerToggle) {
            drawerToggle.addEventListener('click', function () {
                var open = drawer.hasAttribute('hidden');
                if (open) drawer.removeAttribute('hidden');
                else drawer.setAttribute('hidden', '');
                drawerToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                drawerToggle.textContent = open ? 'タグを閉じる' : 'すべてのタグを見る';
            });
        }

        readUrl();
        render();
        scrollActiveTab();
    }

    function initHubPagination() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-hub-card]'));
        var more = document.getElementById('hub-more');
        if (!cards.length || !more) return;
        var shown = PAGE_SIZE;

        function paint() {
            cards.forEach(function (card, index) {
                card.classList.toggle('is-extra', index >= shown);
            });
            var remaining = Math.max(cards.length - shown, 0);
            more.hidden = remaining === 0;
            more.textContent = remaining ? 'もっと見る（残り' + remaining + '件）' : 'もっと見る';
        }

        more.addEventListener('click', function () {
            shown += PAGE_SIZE;
            paint();
        });
        paint();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initBlogIndex();
        initHubPagination();
    });
})();
