/* الشاشات 10 إلى 12: الألعاب، الملف الشخصي، شاشة التحفيز + صفحات فرعية (إعدادات، سجلات) */
(function () {
  var h = UI.h;

  /* 10. الألعاب: كلها معطّلة */
  App.register('/games', function () {
    var games = [
      ['تحدي الذاكرة', 'cards'], ['اختبر بسرعة', 'timer'], ['ربط المصطلحات', 'link'],
      ['أكمل الجملة', 'pencil'], ['صح ولا خطأ', 'check'], ['تحدي الأسئلة المختلطة', 'trophy']
    ];
    return {
      title: 'الألعاب', nav: 'games',
      content: h('ul', { class: 'grid' }, games.map(function (g) {
        return h('li', null, [h('div', { class: 'game', 'aria-disabled': 'true' }, [
          UI.icon(g[1]),
          h('p', { class: 'game-title', text: g[0] }),
          h('span', { class: 'badge soon', text: 'قريباً' })
        ])]);
      }))
    };
  });

  function wipe() {
    if (!window.confirm('سيتم مسح كل بياناتك المحفوظة على هذا الجهاز. هل أنت متأكد؟')) return;
    var ok = Store.reset();
    if (ok) App.go('#/welcome');
  }

  /* 11. الملف الشخصي: كل الأرقام تُقرأ من التخزين وتبدأ من 0 */
  App.register('/profile', function () {
    var name = Store.get('name');
    var level = Content.levelTitle(Store.get('levelId'));
    var stream = Content.streamTitle(Store.get('streamId'));
    var completed = Store.get('completedLessons').length;
    var total = Content.lessons().length;
    var pct = total ? Math.round((completed / total) * 100) : 0;

    function stat(iconName, num, label) {
      return h('div', { class: 'stat' }, [UI.icon(iconName), h('span', { class: 'stat-num', text: String(num) }), h('span', { class: 'stat-label', text: label })]);
    }
    function link(iconName, label, href) {
      return h('li', null, [h('a', { class: 'row', href: href }, [
        h('span', { class: 'row-ico' }, [UI.icon(iconName)]),
        h('span', { class: 'row-body' }, [h('p', { class: 'row-title', text: label })]),
        h('span', { class: 'row-end' }, [UI.icon('forward')])
      ])]);
    }
    return {
      title: 'الملف الشخصي', nav: 'profile',
      content: h('div', null, [
        h('div', { class: 'profile-head' }, [
          h('span', { class: 'avatar' }, [UI.icon('user')]),
          h('h2', { text: name || 'بدون اسم' }),
          (level || stream) ? h('p', { text: [level, stream].filter(Boolean).join(' · ') }) : h('p', { text: 'لم يتم اختيار المستوى والشعبة' })
        ]),
        h('div', { class: 'stats' }, [
          stat('star', Store.get('points'), 'النقاط'),
          stat('flame', Store.get('streak'), 'أيام متتالية'),
          stat('check', completed, 'دروس مكتملة')
        ]),
        h('div', null, [
          h('div', { class: 'prog-line' }, [h('span', { text: 'نسبة التقدم' }), h('span', { text: pct + '%' })]),
          UI.progress(pct, 'نسبة التقدم')
        ]),
        h('ul', { class: 'rows section' }, [
          link('bulb', 'توصيات المراجعة', '#/recommendations'),
          link('list', 'سجل الاختبارات', '#/quiz-history'),
          link('clock', 'سجل الأنشطة', '#/activity'),
          link('gear', 'الإعدادات', '#/settings'),
          h('li', null, [h('button', { type: 'button', class: 'row row-btn', onclick: wipe }, [
            h('span', { class: 'row-ico' }, [UI.icon('logout')]),
            h('span', { class: 'row-body' }, [h('p', { class: 'row-title', text: 'تسجيل الخروج' }), h('p', { class: 'row-sub', text: 'يمسح بياناتك من هذا الجهاز' })]),
            h('span', { class: 'row-end' }, [UI.icon('forward')])
          ])])
        ])
      ])
    };
  });

  /* صفحات فرعية بسيطة بحالات فارغة */
  [
    ['/recommendations', 'توصيات المراجعة', 'ماكاينش توصيات دابا', 'bulb'],
    ['/quiz-history', 'سجل الاختبارات', 'ماكاينش اختبارات دابا', 'list'],
    ['/activity', 'سجل الأنشطة', 'ماكاينش أنشطة دابا', 'clock']
  ].forEach(function (p) {
    App.register(p[0], function () {
      return { title: p[1], back: '#/profile', nav: 'profile', content: UI.emptyState(p[2], null, p[3]) };
    });
  });

  /* الإعدادات (فيها زر التطوير المخفي لشاشة التحفيز) */
  App.register('/settings', function () {
    return {
      title: 'الإعدادات', back: '#/profile', nav: 'profile',
      content: h('div', null, [
        h('div', { class: 'stack' }, [
          UI.button('تغيير المستوى والشعبة', { href: '#/level?from=settings', variant: 'outline' }),
          UI.button('مسح بيانات التطبيق', { variant: 'danger', onclick: wipe })
        ]),
        h('details', { class: 'dev-tools' }, [
          h('summary', { text: 'أدوات المطوّر (للتطوير فقط)' }),
          h('div', { class: 'inner' }, [UI.button('اختبار شاشة التحفيز', { href: '#/motivation', variant: 'outline' })])
        ])
      ])
    };
  });

  /* 12. شاشة التحفيز: غير مفعّلة تلقائياً، تُفتح فقط من أدوات المطوّر */
  App.register('/motivation', function () {
    return {
      title: 'ممتاز!', header: false, nav: 'profile',
      content: h('div', { class: 'motivation' }, [
        UI.icon('flag', 'big-icon'),
        h('h1', { text: 'ممتاز!' }),
        h('p', { text: 'أنت على الطريق الصحيح' }),
        UI.button('استمر', { href: '#/home' })
      ])
    };
  });
})();
