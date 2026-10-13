/* الشاشات 4 إلى 6: الرئيسية، المواد الدراسية، لائحة الدروس */
(function () {
  var h = UI.h;

  function subjectRow(s) {
    var lessons = Content.lessonsOf(s.id).length;
    return h('li', null, [h('a', { class: 'row', href: '#/lessons?subject=' + encodeURIComponent(s.id) }, [
      h('span', { class: 'row-ico' }, [UI.icon('book')]),
      h('span', { class: 'row-body' }, [
        h('p', { class: 'row-title', text: s.title || '' }),
        h('p', { class: 'row-sub', text: lessons + ' درس' })
      ]),
      h('span', { class: 'row-end' }, [UI.icon('forward')])
    ])]);
  }
  function lessonRow(l, i) {
    var done = Store.get('completedLessons').indexOf(l.id) !== -1;
    return h('li', null, [h('a', { class: 'row', href: '#/lesson?id=' + encodeURIComponent(l.id) }, [
      h('span', { class: 'row-ico', text: String(i + 1) }),
      h('span', { class: 'row-body' }, [
        h('p', { class: 'row-title', text: l.title || '' }),
        l.minutes ? h('p', { class: 'row-sub', text: l.minutes + ' دقيقة' }) : null
      ]),
      done ? h('span', { class: 'badge ok', text: 'تمّت المراجعة' }) : null,
      h('span', { class: 'row-end' }, [UI.icon('forward')])
    ])]);
  }

  /* 4. الرئيسية */
  App.register('/home', function () {
    var name = Store.get('name');
    var level = Content.levelTitle(Store.get('levelId'));
    var stream = Content.streamTitle(Store.get('streamId'));

    var last = Content.lesson(Store.get('lastLessonId'));
    var resume = h('div', { class: 'resume-card' }, [
      h('h2', { text: 'كمّل منين وقفتي' }),
      last
        ? h('a', { class: 'row', href: '#/lesson?id=' + encodeURIComponent(last.id) }, [
            h('span', { class: 'row-ico' }, [UI.icon('book')]),
            h('span', { class: 'row-body' }, [h('p', { class: 'row-title', text: last.title || '' })]),
            h('span', { class: 'row-end' }, [UI.icon('forward')])
          ])
        : UI.emptyState('ماكاينش درس بدأتي فيه دابا', 'غادي يبان هنا آخر درس وقفتي فيه.', 'book')
    ]);

    /* راجع اليوم: الدروس التي فيها بطاقات علّمها المستخدم بـ"خاصني نراجعها" أو "ما حفظتهاش" */
    var status = Store.get('cardStatus') || {};
    var dueIds = {};
    Object.keys(status).forEach(function (k) {
      if (status[k] === 'again' || status[k] === 'review') dueIds[k.split('::')[0]] = true;
    });
    var due = Content.lessons().filter(function (l) { return dueIds[l.id]; });
    var dueBlock = due.length
      ? h('ul', { class: 'rows' }, due.map(function (l, i) { return lessonRow(l, i); }))
      : UI.emptyState('ماكاينش حاجة للمراجعة اليوم');

    var mine = Content.subjects();
    var lid = Store.get('levelId'), sid = Store.get('streamId');
    var filtered = mine.filter(function (s) { return (!s.levelId || s.levelId === lid) && (!s.streamId || s.streamId === sid); });
    var mineBlock = filtered.length
      ? h('ul', { class: 'rows' }, filtered.map(subjectRow))
      : UI.emptyState('ماكاينش مواد دابا');

    return {
      title: 'الرئيسية', header: false, nav: 'home',
      content: h('div', null, [
        h('div', { class: 'greet' }, [
          h('div', null, [
            h('h1', { text: name ? 'مرحباً بك، ' + name : 'مرحباً بك' }),
            (level || stream) ? h('p', { text: [level, stream].filter(Boolean).join(' · ') }) : null
          ]),
          h('span', { class: 'avatar' }, [UI.icon('user')])
        ]),
        h('div', { class: 'section' }, [resume]),
        UI.section('راجع اليوم', dueBlock),
        UI.section('المواد ديالي', mineBlock)
      ])
    };
  });

  /* 5. المواد الدراسية */
  App.register('/subjects', function () {
    var subjects = Content.subjects();
    return {
      title: 'المواد الدراسية', nav: 'subjects',
      content: subjects.length
        ? h('ul', { class: 'rows' }, subjects.map(subjectRow))
        : UI.emptyState('ماكاينش مواد دابا', null, 'book')
    };
  });

  /* 6. لائحة الدروس */
  App.register('/lessons', function (ctx) {
    var id = ctx.params.subject || Store.get('subjectId');
    if (ctx.params.subject && ctx.params.subject !== Store.get('subjectId')) Store.set({ subjectId: ctx.params.subject });
    var subject = id ? Content.subject(id) : null;
    var lessons = subject ? Content.lessonsOf(subject.id) : [];
    var has = lessons.length > 0;
    var query = '', filter = 'all';

    var list = h('div');
    var input = h('input', { type: 'search', id: 'lesson-search', 'aria-label': 'ابحث عن درس', placeholder: 'ابحث عن درس...', disabled: !has });
    var chipDefs = [['all', 'الكل'], ['todo', 'غير مكتمل'], ['done', 'تمّت المراجعة']];
    var chipEls = chipDefs.map(function (c) {
      return h('button', { type: 'button', class: 'chip', 'data-f': c[0], 'aria-pressed': c[0] === 'all' ? 'true' : 'false', disabled: !has, onclick: function () {
        filter = c[0];
        chipEls.forEach(function (el) { el.setAttribute('aria-pressed', el.getAttribute('data-f') === filter ? 'true' : 'false'); });
        draw();
      } }, [c[1]]);
    });
    input.addEventListener('input', function () { query = input.value.trim(); draw(); });

    function draw() {
      list.textContent = '';
      if (!has) { list.appendChild(UI.emptyState('ماكاينش دروس دابا', null, 'book')); return; }
      var done = Store.get('completedLessons');
      var shown = lessons.filter(function (l) {
        var isDone = done.indexOf(l.id) !== -1;
        if (filter === 'done' && !isDone) return false;
        if (filter === 'todo' && isDone) return false;
        return !query || (l.title || '').indexOf(query) !== -1;
      });
      if (!shown.length) { list.appendChild(UI.emptyState('ماكاينش دروس مطابقة', null, 'search')); return; }
      list.appendChild(h('ul', { class: 'rows' }, shown.map(function (l) { return lessonRow(l, lessons.indexOf(l)); })));
    }
    draw();

    return {
      title: subject && subject.title ? subject.title : 'لائحة الدروس', back: '#/subjects', nav: 'subjects',
      content: h('div', null, [
        h('div', { class: 'search' }, [input, UI.icon('search')]),
        h('div', { class: 'chips' }, chipEls),
        list
      ])
    };
  });
})();
