/* الشاشات 7 إلى 9: شرح الدرس، بطاقات الحفظ، الاختبارات */
(function () {
  var h = UI.h;

  function lessonText(l) {
    var kids = [];
    if (Array.isArray(l.objectives) && l.objectives.length) {
      kids.push(h('div', { class: 'lesson-block' }, [h('h3', { text: 'أهداف الدرس' }), h('ul', null, l.objectives.map(function (o) { return h('li', { text: String(o) }); }))]));
    }
    if (l.intro) kids.push(h('div', { class: 'lesson-block' }, [h('h3', { text: 'مقدمة' }), h('p', { text: String(l.intro) })]));
    if (l.summary) kids.push(h('div', { class: 'lesson-block' }, [h('h3', { text: 'الخلاصة' }), h('p', { text: String(l.summary) })]));
    return kids;
  }

  /* 7. شرح الدرس */
  App.register('/lesson', function (ctx) {
    var lesson = ctx.params.id ? Content.lesson(ctx.params.id) : null;
    if (lesson && Store.get('lastLessonId') !== lesson.id) Store.set({ lastLessonId: lesson.id });
    var cards = lesson && Array.isArray(lesson.cards) ? lesson.cards : [];
    var quizzes = lesson && Array.isArray(lesson.quizzes) ? lesson.quizzes : [];
    var back = lesson && lesson.subjectId ? '#/lessons?subject=' + encodeURIComponent(lesson.subjectId) : '#/subjects';

    var panels = [
      h('div', null, lesson && lessonText(lesson).length
        ? [h('h2', { class: 'lesson-title', text: lesson.title || '' })].concat(lessonText(lesson))
        : [UI.emptyState(lesson ? 'ماكاينش شرح لهاد الدرس دابا' : 'ماكاينش درس دابا', null, 'book')]),
      h('div', null, cards.length
        ? [UI.button('ابدأ مراجعة البطاقات (' + cards.length + ')', { href: '#/cards?lesson=' + encodeURIComponent(lesson.id), icon: 'cards' })]
        : [UI.emptyState('ماكاينش بطاقات حفظ دابا', null, 'cards')]),
      h('div', null, [quizzes.length
        ? UI.button('الاختبارات', { href: '#/quizzes' })
        : UI.emptyState('ماكاينش اختبارات دابا', null, 'pencil')])
    ];
    var labels = ['الدرس', 'بطاقات الحفظ', 'الاختبارات'];
    var tabs = labels.map(function (t, i) {
      return h('button', { type: 'button', role: 'tab', class: 'tab', id: 'tab-' + i, 'aria-controls': 'panel-' + i, 'aria-selected': 'false', tabindex: '-1' }, [t]);
    });
    var wrapped = panels.map(function (p, i) {
      return h('div', { role: 'tabpanel', class: 'panel', id: 'panel-' + i, 'aria-labelledby': 'tab-' + i, hidden: true }, [p]);
    });
    function select(i, focus) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-selected', j === i ? 'true' : 'false');
        t.tabIndex = j === i ? 0 : -1;
        wrapped[j].hidden = j !== i;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        /* في RTL السهم الأيسر = التالي */
        var d = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        select((i + d + tabs.length) % tabs.length, true);
      });
    });
    select(0);

    return {
      title: 'شرح الدرس', back: back, nav: 'subjects',
      content: h('div', null, [h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'أقسام الدرس' }, tabs)].concat(wrapped))
    };
  });

  /* 8. بطاقات الحفظ */
  App.register('/cards', function (ctx) {
    var lesson = ctx.params.lesson ? Content.lesson(ctx.params.lesson) : null;
    var cards = lesson && Array.isArray(lesson.cards) ? lesson.cards.filter(function (c) { return c && c.front; }) : [];
    var back = lesson ? '#/lesson?id=' + encodeURIComponent(lesson.id) : '#/subjects';
    var base = { title: 'بطاقات الحفظ', back: back, nav: 'subjects' };

    if (!cards.length) {
      base.content = UI.emptyState('ماكاينش بطاقات حفظ دابا', null, 'cards');
      return base;
    }

    var order = cards.map(function (_, i) { return i; });
    var pos = 0, revealed = false, shuffled = false;
    var root = h('div');

    function key(i) { return lesson.id + '::' + i; }
    function setOrder() {
      order = cards.map(function (_, i) { return i; });
      if (shuffled) for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
      pos = 0; revealed = false;
    }
    function rate(v) {
      var s = Object.assign({}, Store.get('cardStatus')); s[key(order[pos])] = v;
      Store.set({ cardStatus: s });
      if (pos < order.length - 1) { pos++; revealed = false; draw(); }
      else { draw(true); }
    }
    function draw(finished) {
      root.textContent = '';
      if (finished) {
        root.appendChild(UI.emptyState('سالات البطاقات ديال هاد الدرس', 'نتائجك تسجّلات على هاد الجهاز.', 'check'));
        root.appendChild(h('div', { class: 'section stack' }, [
          UI.button('رجوع للدرس', { href: back, variant: 'outline' }),
          UI.button('عاود من البداية', { onclick: function () { setOrder(); draw(); } })
        ]));
        return;
      }
      var c = cards[order[pos]];
      root.appendChild(h('div', { class: 'card-count' }, [
        h('span', { text: (pos + 1) + '/' + order.length }),
        UI.progress(Math.round(((pos + 1) / order.length) * 100), 'تقدم البطاقات')
      ]));
      root.appendChild(h('div', { class: 'flashcard', 'aria-live': 'polite' }, [String(c.front)]));
      if (revealed) {
        root.appendChild(h('div', { class: 'flashcard answer' }, [String(c.back || '')]));
      } else {
        root.appendChild(UI.button('إظهار الجواب', { id: 'reveal-btn', variant: 'outline', onclick: function () { revealed = true; draw(); var a = document.getElementById('rate-known'); if (a) a.focus(); } }));
      }
      root.appendChild(h('div', { class: 'assess' }, [
        h('button', { type: 'button', class: 'btn btn-again', disabled: !revealed, onclick: function () { rate('again'); } }, ['ما حفظتهاش']),
        h('button', { type: 'button', class: 'btn btn-review', disabled: !revealed, onclick: function () { rate('review'); } }, ['خاصني نراجعها']),
        h('button', { type: 'button', id: 'rate-known', class: 'btn btn-known', disabled: !revealed, onclick: function () { rate('known'); } }, ['حفظتها'])
      ]));
      root.appendChild(h('div', { class: 'card-nav' }, [
        h('button', { type: 'button', class: 'round-btn', 'aria-label': 'البطاقة السابقة', disabled: pos === 0, onclick: function () { pos--; revealed = false; draw(); } }, [UI.icon('back')]),
        h('button', { type: 'button', class: 'round-btn', 'aria-label': 'ترتيب عشوائي', 'aria-pressed': shuffled ? 'true' : 'false', onclick: function () { shuffled = !shuffled; setOrder(); draw(); } }, [UI.icon('shuffle')]),
        h('button', { type: 'button', class: 'round-btn', 'aria-label': 'البطاقة التالية', disabled: pos === order.length - 1, onclick: function () { pos++; revealed = false; draw(); } }, [UI.icon('forward')])
      ]));
    }
    draw();
    base.content = root;
    return base;
  });

  /* 9. الاختبارات: بنية فقط، بدون أي منطق أسئلة */
  App.register('/quizzes', function () {
    var modes = [
      ['اختيار من متعدد', 'list'], ['صح أو خطأ', 'check'], ['أكمل الفراغ', 'pencil'],
      ['ربط المصطلحات', 'link'], ['تحدي السرعة', 'timer']
    ];
    return {
      title: 'الاختبارات', back: '#/subjects', nav: 'subjects',
      content: h('div', null, [
        h('ul', { class: 'rows' }, modes.map(function (m) {
          return h('li', null, [h('div', { class: 'row disabled', 'aria-disabled': 'true' }, [
            h('span', { class: 'row-ico' }, [UI.icon(m[1])]),
            h('span', { class: 'row-body' }, [h('p', { class: 'row-title', text: m[0] }), h('p', { class: 'row-sub', text: 'ماكاينش أسئلة دابا' })])
          ])]);
        })),
        h('div', { class: 'section' }, [UI.button('ابدأ الاختبار', { disabled: true })])
      ])
    };
  });
})();
