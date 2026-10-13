/* طبقة البيانات المحلية: كل قراءة وكتابة داخل try/catch.
   إذا فشلت الكتابة نبلّغ المستخدم بصراحة (حدث hafidni:save-error). */
(function () {
  var KEY = 'hafidni:v1';
  var DEFAULTS = {
    name: '', levelId: '', streamId: '',
    subjectId: '', lastLessonId: '',
    points: 0, streak: 0,
    completedLessons: [], cardStatus: {},
    activity: [], quizHistory: []
  };
  var cache = null;

  function readRaw() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return {};
      var obj = JSON.parse(raw);
      return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {};
    } catch (e) { return {}; }
  }
  function writeRaw() {
    try { window.localStorage.setItem(KEY, JSON.stringify(cache)); return true; }
    catch (e) { return false; }
  }
  function state() {
    if (!cache) cache = Object.assign({}, DEFAULTS, readRaw());
    return cache;
  }
  function fail() {
    try { window.dispatchEvent(new CustomEvent('hafidni:save-error')); } catch (e) {}
  }

  window.Store = {
    get: function (key) { return state()[key]; },
    /* يحفظ مجموعة حقول؛ يعيد true عند النجاح و false عند فشل الحفظ على الجهاز.
       القيم تبقى متاحة في الذاكرة طوال الجلسة حتى لو فشل الحفظ. */
    set: function (patch) {
      Object.assign(state(), patch);
      var ok = writeRaw();
      if (!ok) fail();
      return ok;
    },
    reset: function () {
      cache = Object.assign({}, DEFAULTS);
      var ok = false;
      try { window.localStorage.removeItem(KEY); ok = true; } catch (e) { fail(); }
      return ok;
    }
  };

  /* محتوى التطبيق: يُقرأ من content.json */
  var content = { levels: [], streams: [], subjects: [], lessons: [] };
  window.Content = {
    error: false,
    load: function () {
      return fetch('content.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
        .then(function (d) {
          ['levels', 'streams', 'subjects', 'lessons'].forEach(function (k) {
            content[k] = d && Array.isArray(d[k]) ? d[k] : [];
          });
          Content.error = false;
        })
        .catch(function () { Content.error = true; });
    },
    levels: function () { return content.levels.length ? content.levels : HAFIDNI_CONFIG.defaultLevels; },
    streams: function () { return content.streams.length ? content.streams : HAFIDNI_CONFIG.defaultStreams; },
    subjects: function () { return content.subjects; },
    lessons: function () { return content.lessons; },
    subject: function (id) { return content.subjects.filter(function (s) { return s.id === id; })[0]; },
    lesson: function (id) { return content.lessons.filter(function (l) { return l.id === id; })[0]; },
    lessonsOf: function (subjectId) { return content.lessons.filter(function (l) { return l.subjectId === subjectId; }); },
    levelTitle: function (id) { var x = Content.levels().filter(function (l) { return l.id === id; })[0]; return x ? x.title : ''; },
    streamTitle: function (id) { var x = Content.streams().filter(function (l) { return l.id === id; })[0]; return x ? x.title : ''; }
  };
})();
