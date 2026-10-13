/* الشاشات 1 إلى 3: البداية، إنشاء حساب، اختيار المستوى والشعبة */
(function () {
  var h = UI.h;

  /* 1. البداية والترحيب */
  App.register('/welcome', function () {
    return {
      header: false, nav: null,
      content: h('div', { class: 'welcome' }, [
        UI.icon('cap', 'welcome-icon'),
        h('h1', { class: 'logo', text: 'حفظني' }),
        h('h2', { text: 'حفظ دروسك بطريقة أسهل وأذكى' }),
        h('p', { text: 'راجع دروسك، اختبر معلوماتك، واكتشف شنو خاصك تراجع من جديد.' }),
        h('div', { class: 'stack' }, [
          UI.button('ابدأ الآن', { href: '#/signup' }),
          UI.button('عندي حساب', { href: '#/signup', variant: 'outline' })
        ])
      ])
    };
  });

  /* 2. إنشاء حساب (تجريبي: لا يُنشأ أي حساب حقيقي) */
  App.register('/signup', function () {
    var errs = {};
    function field(id, label, type, extra) {
      var p = h('p', { class: 'field-error', id: id + '-err', hidden: true });
      var input = h('input', Object.assign({ id: id, name: id, type: type, 'aria-describedby': id + '-err' }, extra || {}));
      return { box: h('div', { class: 'field' }, [h('label', { for: id, text: label }), input, p]), input: input, err: p };
    }
    var name = field('fullname', 'الاسم الكامل', 'text', { autocomplete: 'name' });
    var email = field('email', 'البريد الإلكتروني', 'email', { autocomplete: 'email', dir: 'ltr', inputmode: 'email' });
    var pass = field('password', 'كلمة المرور', 'password', { autocomplete: 'new-password', dir: 'ltr' });
    var conf = field('confirm', 'تأكيد كلمة المرور', 'password', { autocomplete: 'new-password', dir: 'ltr' });
    var terms = h('input', { type: 'checkbox', id: 'terms', 'aria-describedby': 'terms-err' });
    var termsErr = h('p', { class: 'field-error', id: 'terms-err', hidden: true });

    function setErr(f, msg) {
      f.err.hidden = !msg;
      f.err.textContent = msg || '';
      if (msg) f.input.setAttribute('aria-invalid', 'true'); else f.input.removeAttribute('aria-invalid');
    }

    function validate() {
      var bad = [];
      var n = name.input.value.trim();
      var m = email.input.value.trim();
      var p = pass.input.value;
      var c = conf.input.value;
      var e;
      e = n.length < 2 ? 'المرجو إدخال الاسم الكامل.' : ''; setErr(name, e); if (e) bad.push(name.input);
      e = !m ? 'المرجو إدخال البريد الإلكتروني.' : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m) ? 'البريد الإلكتروني غير صالح.' : ''); setErr(email, e); if (e) bad.push(email.input);
      e = !p ? 'المرجو إدخال كلمة المرور.' : (p.length < 8 ? 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل.' : ''); setErr(pass, e); if (e) bad.push(pass.input);
      e = !c ? 'المرجو تأكيد كلمة المرور.' : (c !== p ? 'كلمتا المرور غير متطابقتين.' : ''); setErr(conf, e); if (e) bad.push(conf.input);
      termsErr.hidden = terms.checked; termsErr.textContent = terms.checked ? '' : 'يجب الموافقة على الشروط وسياسة الخصوصية للمتابعة.';
      if (terms.checked) terms.removeAttribute('aria-invalid'); else { terms.setAttribute('aria-invalid', 'true'); bad.push(terms); }
      return { bad: bad, name: n };
    }

    var form = h('form', { class: 'form', novalidate: true, onsubmit: function (ev) {
      ev.preventDefault();
      var r = validate();
      if (r.bad.length) { r.bad[0].focus(); return; }
      /* لا حساب حقيقي: نحفظ الاسم فقط محلياً لتحية المستخدم. البريد وكلمة المرور لا تُحفظ. */
      Store.set({ name: r.name });
      App.go('#/level');
    } }, [
      name.box, email.box, pass.box, conf.box,
      h('div', null, [
        h('label', { class: 'checkbox', for: 'terms' }, [terms, h('span', { text: 'أوافق على الشروط وسياسة الخصوصية' })]),
        termsErr
      ]),
      UI.button('إنشاء الحساب', { type: 'submit' }),
      h('div', { class: 'divider', text: 'أو' }),
      h('div', null, [
        UI.button('التسجيل عبر Google', { variant: 'outline', disabled: true }),
        h('p', { class: 'mini-note', text: 'غير مفعّل بعد' })
      ]),
      h('p', { class: 'note', text: 'نسخة تجريبية، لا يتم إنشاء حساب حقيقي' })
    ]);

    return { title: 'إنشاء حساب جديد', back: '#/welcome', nav: null, content: form };
  });

  /* 3. اختيار المستوى والشعبة */
  App.register('/level', function (ctx) {
    var level = Store.get('levelId');
    var stream = Store.get('streamId');
    var next = UI.button('التالي', { id: 'next-btn', disabled: true });

    function sync() {
      var ok = !!(level && stream);
      next.disabled = !ok;
      if (ok) next.removeAttribute('aria-disabled'); else next.setAttribute('aria-disabled', 'true');
    }
    function group(legend, name, items, current, onPick) {
      return h('fieldset', { class: 'opt-group' }, [
        h('legend', { text: legend })
      ].concat(items.map(function (it) {
        return h('label', { class: 'option' }, [
          h('input', { type: 'radio', name: name, value: it.id, checked: it.id === current, onchange: function () { onPick(it.id); sync(); } }),
          h('span', { class: 'opt-body' }, [h('span', { text: it.title }), UI.icon('check', 'tick')])
        ]);
      })));
    }

    next.addEventListener('click', function () {
      if (!(level && stream)) return;
      Store.set({ levelId: level, streamId: stream });
      App.go('#/home');
    });

    var content = h('div', null, [
      group('المستوى الدراسي', 'level', Content.levels(), level, function (v) { level = v; }),
      group('الشعبة', 'stream', Content.streams(), stream, function (v) { stream = v; }),
      h('div', { class: 'section' }, [next])
    ]);
    sync();
    return { title: 'اختر المستوى والشعبة', back: ctx.params.from === 'settings' ? '#/settings' : '#/signup', nav: null, content: content };
  });
})();
