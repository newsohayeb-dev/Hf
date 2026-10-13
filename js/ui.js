/* مكوّنات واجهة قابلة لإعادة الاستخدام. لا نستعمل innerHTML أبداً (النصوص تُدرج كنص). */
(function () {
  var SVGNS = 'http://www.w3.org/2000/svg';

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === false || v === null || v === undefined) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'disabled' || k === 'checked' || k === 'hidden') { if (v) el[k] = true; }
      else el.setAttribute(k, v === true ? '' : v);
    });
    [].concat(children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  var ICONS = {
    home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    games: 'M6 8h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5.2 2L15 15H9l-1.8 2A3 3 0 0 1 2 15v-3a4 4 0 0 1 4-4zM8 10.5v3M6.5 12h3M16 11.5h.01M18 13.5h.01',
    book: 'M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    back: 'M9 6l6 6-6 6',
    forward: 'M15 6l-6 6 6 6',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',
    mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
    lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
    cap: 'M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6',
    bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
    list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-1.9.2 1.7 1.7 0 0 0-.9 1.5V22h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8-.2l-.2.1-2-3.4.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H2v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1 2-3.4.2.1a1.7 1.7 0 0 0 1.9-.2A1.7 1.7 0 0 0 8 2.1V2h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8.2l.2-.1 2 3.4-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1z',
    logout: 'M9 21H5V3h4M16 17l5-5-5-5M21 12H9',
    cards: 'M3 7h13v13H3zM8 7V4h13v13h-5',
    timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4M9 2h6',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    pencil: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
    check: 'M5 12l5 5 9-10',
    trophy: 'M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 14v4M8 21h8',
    shuffle: 'M3 6h4l10 12h4M3 18h4l3-3.5M14 9.5L17 6h4M18 3l3 3-3 3M18 15l3 3-3 3',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
    flame: 'M12 22c4 0 7-2.6 7-6.5 0-3-2-5-3.5-6.5C15 11 14 12 13 12c0-4-2-7-4-9-.5 4-4 6-4 12 0 4 3 7 7 7z',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
    flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
    chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2'
  };

  function icon(name, cls) {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    var p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', ICONS[name] || ICONS.book);
    svg.appendChild(p);
    return svg;
  }

  /* حالة فارغة واضحة بدون عناصر وهمية */
  function emptyState(message, hint, iconName) {
    return h('div', { class: 'empty', role: 'note' }, [
      icon(iconName || 'layers', 'empty-icon'),
      h('p', { class: 'empty-msg', text: message }),
      hint ? h('p', { class: 'empty-hint', text: hint }) : null
    ]);
  }

  function button(label, opts) {
    opts = opts || {};
    var attrs = {
      type: opts.type || 'button',
      class: 'btn ' + (opts.variant ? 'btn-' + opts.variant : 'btn-primary') + (opts.block === false ? '' : ' btn-block'),
      disabled: !!opts.disabled,
      onclick: opts.onclick
    };
    if (opts.href) {
      attrs = { href: opts.href, class: attrs.class };
      return h('a', attrs, [opts.icon ? icon(opts.icon) : null, label]);
    }
    if (opts.id) attrs.id = opts.id;
    if (opts.disabled) attrs['aria-disabled'] = 'true';
    return h('button', attrs, [opts.icon ? icon(opts.icon) : null, label]);
  }

  function section(title, children, extra) {
    return h('section', { class: 'section' }, [
      h('div', { class: 'section-head' }, [h('h2', { class: 'section-title', text: title }), extra || null]),
      children
    ]);
  }

  function toast(msg, kind) {
    var host = document.getElementById('toasts');
    var t = h('div', { class: 'toast ' + (kind || 'error'), text: msg });
    host.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 7000);
  }

  function progress(pct, label) {
    return h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': label || 'التقدم' }, [
      h('div', { class: 'progress-bar', style: 'width:' + pct + '%' })
    ]);
  }

  window.UI = { h: h, icon: icon, emptyState: emptyState, button: button, section: section, toast: toast, progress: progress };

  window.addEventListener('hafidni:save-error', function () { toast(HAFIDNI_CONFIG.messages.saveFailed); });
})();
