/* الموجّه (hash router) + الهيكل + شريط التنقل السفلي */
(function () {
  var h = UI.h;
  var routes = {};

  /* ترتيب الشريط كما في التصميم (من اليسار إلى اليمين): الملف الشخصي، المواد، الألعاب، الرئيسية.
     في صفحة RTL أول عنصر في الـDOM يظهر في أقصى اليمين، لذلك الترتيب في المصفوفة معكوس. */
  var NAV = [
    { key: 'home', label: 'الرئيسية', icon: 'home', href: '#/home' },
    { key: 'games', label: 'الألعاب', icon: 'games', href: '#/games' },
    { key: 'subjects', label: 'المواد', icon: 'book', href: '#/subjects' },
    { key: 'profile', label: 'الملف الشخصي', icon: 'user', href: '#/profile' }
  ];

  function parseHash() {
    var raw = (location.hash || '').replace(/^#/, '');
    var parts = raw.split('?');
    var path = parts[0] || '/';
    var params = {};
    (parts[1] || '').split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      try { params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); } catch (e) {}
    });
    return { path: path, params: params };
  }

  function renderHeader(def) {
    var hdr = document.getElementById('hdr');
    hdr.textContent = '';
    if (def.header === false) { hdr.hidden = true; return; }
    hdr.hidden = false;
    var kids = [];
    if (def.back) kids.push(h('a', { class: 'back-btn', href: def.back, 'aria-label': 'رجوع' }, [UI.icon('back')]));
    kids.push(h('h1', { class: 'page-title', id: 'page-title', text: def.title || '' }));
    if (def.back) kids.push(h('span', { class: 'back-spacer', 'aria-hidden': 'true' }));
    hdr.className = 'app-header' + (def.back ? ' has-back' : '');
    kids.forEach(function (k) { hdr.appendChild(k); });
  }

  function renderNav(active) {
    var nav = document.getElementById('nav');
    nav.textContent = '';
    if (!active) { nav.hidden = true; document.body.classList.remove('has-nav'); return; }
    nav.hidden = false;
    document.body.classList.add('has-nav');
    NAV.forEach(function (it) {
      var on = it.key === active;
      nav.appendChild(h('a', { href: it.href, class: 'nav-item' + (on ? ' active' : ''), 'aria-current': on ? 'page' : false }, [
        UI.icon(it.icon), h('span', { text: it.label })
      ]));
    });
  }

  function render() {
    var r = parseHash();
    if (r.path === '/' || r.path === '') {
      location.replace(Store.get('name') && Store.get('levelId') ? '#/home' : '#/welcome');
      return;
    }
    var fn = routes[r.path];
    var def;
    try {
      def = fn ? fn({ params: r.params }) : {
        title: 'الصفحة غير موجودة', back: '#/home', nav: 'home',
        content: UI.emptyState('هذه الصفحة غير موجودة.', null, 'flag')
      };
    } catch (e) {
      def = { title: 'حدث خطأ', back: '#/home', nav: 'home', content: UI.emptyState('وقع خطأ غير متوقع أثناء عرض الصفحة.', null, 'flag') };
      if (window.console) console.error(e);
    }
    renderHeader(def);
    renderNav(def.nav || null);
    var main = document.getElementById('main');
    main.textContent = '';
    main.className = 'app-main' + (def.header === false ? ' no-header' : '');
    if (Content.error && def.nav) main.appendChild(h('div', { class: 'banner error', role: 'alert', text: HAFIDNI_CONFIG.messages.contentFailed }));
    main.appendChild(def.content);
    if (def.mount) def.mount(main);
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  window.App = {
    register: function (path, fn) { routes[path] = fn; },
    go: function (hash) { if (location.hash === hash) render(); else location.hash = hash; },
    start: function () {
      window.addEventListener('hashchange', render);
      Content.load().then(render);
    }
  };
})();
