/* إعدادات بنيوية فقط: خيارات المستوى والشعبة الظاهرة في الواجهة.
   هذه ليست محتوى دراسياً. إذا ملأتَ levels / streams في content.json فإنها تحلّ محلها. */
window.HAFIDNI_CONFIG = {
  defaultLevels: [
    { id: 'bac1', title: 'الأولى باكالوريا' },
    { id: 'bac2', title: 'الثانية باكالوريا' },
    { id: 'prep3', title: 'الثالثة إعدادي' }
  ],
  defaultStreams: [
    { id: 'physics', title: 'علوم فيزيائية' },
    { id: 'life-earth', title: 'علوم الحياة والأرض' },
    { id: 'humanities', title: 'الآداب والعلوم الإنسانية' }
  ],
  messages: {
    saveFailed: 'تعذّر حفظ بياناتك على هذا الجهاز (ربما التخزين ممتلئ أو معطّل في المتصفح). ستضيع التغييرات عند إغلاق الصفحة.',
    contentFailed: 'تعذّر تحميل ملف content.json. شغّل التطبيق عبر خادم محلي (انظر README) ثم أعد المحاولة.'
  }
};
