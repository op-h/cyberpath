/*
 * CYBERPATH — i18n (English ⇄ Arabic, RTL)
 * ----------------------------------------
 * Professional bilingual layer. UI chrome, the wizard prompts, and the plan's
 * structural labels translate; deep technical content (track/cert/resource names,
 * skills, focus text) intentionally stays in English — standard for security
 * material and what keeps the Arabic reading clean rather than machine-mangled.
 *
 * Static markup carries data-i18n="key"; dynamic (JS-built) strings call t(key, en).
 */
(function () {
  'use strict';
  var LANG_KEY = 'cyberpath-lang';

  // Arabic strings (Iraqi-flavoured for the conversational/marketing/FAQ copy; section
  // labels stay clean). Missing key → English fallback (so nothing ever breaks).
  var AR = {
    // header / controls
    'nav.theme': 'الثيم', 'nav.lang': 'العربية', 'nav.lang.other': 'English',
    'nav.skip': 'روح للمحتوى',
    // hero
    'hero.eyebrow': 'طريقك للأمن السيبراني، مرسوم إلك',
    'hero.title.a': 'بطّل تخمين.', 'hero.title.b': 'خلّي عندك ', 'hero.title.c': 'خارطة حقيقية.',
    'hero.lede': 'جاوب على شوية أسئلة سريعة، وإحنا نبنيلك خطة مرحلة مرحلة، بمدد زمنية واقعية، والشهادات اللي تستاهل تركض وراها، ومصادر تناسب ميزانيتك — مجانية أو مدفوعة. وبعدها نزّلها.',
    'hero.cta': 'ابنيلي خارطتي', 'hero.browse': 'شوف المسارات',
    'hero.noscript': 'المُخطِّط التفاعلي يحتاج جافاسكربت. بدونه تكدر تشوف المسارات الستة ومساراتها للشهادات تحت.',
    'hero.stat.tracks': 'مسارات مهنية', 'hero.stat.certs': 'شهادة مُوثّقة', 'hero.stat.res': 'مصادر مجانية ومدفوعة',
    // browse / static
    'static.note': 'تحب تشوف الأول؟ هاي المسارات الستة. استخدم «ابنيلي خارطتي» حتى تطلع خطة مفصّلة إلك.',
    'static.heading': 'أو شوف المسارات الستة',
    // wizard
    'wiz.heading': 'ابنِ خارطتك', 'wiz.step': 'الخطوة', 'wiz.of': 'من',
    'wiz.back': 'رجوع', 'wiz.next': 'التالي', 'wiz.generate': 'سوّي خطتي',
    'wiz.error': 'اختر خيار واحد حتى تكمّل.',
    'wiz.lean': 'الأقرب إلك', 'wiz.fit': 'ملاءمة',
    // plan — headings & actions
    'plan.eyebrow': 'خارطتك بـ CYBERPATH', 'plan.roles': 'الأدوار اللي يوصّلك إلها هذا المسار:',
    'plan.download': 'نزّل PDF', 'plan.md': 'ماركداون', 'plan.copy': 'انسخ الرابط', 'plan.copied': 'اننسخ!',
    'plan.restart': 'ابدأ من جديد', 'plan.adjust': 'عدّل خطتك',
    'plan.progressHint': 'أشّر على المراحل لمن تخلّصها — تقدّمك محفوظ على هذا الجهاز.',
    'plan.complete.a': 'من', 'plan.complete.b': 'مرحلة مكتملة',
    'plan.steps': 'خطتك خطوة بخطوة', 'plan.network': 'شبكة مسارك',
    'plan.networkHint': 'نفس الرحلة بس كشبكة — الأساسيات تغذّي مسارك، وتخصّصك يتفرّع لمسارات اختيارية، والعلامات تبيّن الإنجازات اللي تثبت تقدّمك.',
    'plan.bridges': 'وين يكدر يوصّلك هذا المسار بعد', 'plan.hiring': 'المجتمع والحصول على شغل',
    'plan.ladder': 'سُلّم شهاداتك', 'plan.demand': 'الطلب',
    'plan.communities': 'المجتمعات', 'plan.jobs': 'مواقع الوظائف', 'plan.interview': 'التحضير للمقابلات',
    // phase / labels
    'ph.phase': 'المرحلة', 'ph.learn': 'شنو راح تتعلّم', 'ph.res': 'المصادر', 'ph.resFree': 'مصادر مجانية',
    'ph.certs': 'الشهادة المستهدفة', 'ph.builds': 'يعتمد على:', 'ph.done': 'خلص',
    // stat labels
    'st.jobready': 'تقدير حتى تصير جاهز للوظيفة', 'st.explore': 'حتى تستكشف وتختار', 'st.hobby': 'من التعلّم المركّز',
    'st.phase': 'مرحلة', 'st.phases': 'مراحل', 'st.hours': 'إجمالي وقت الدراسة',
    'st.certsMapped': 'شهادات مخطّطة', 'st.skillsFirst': 'المهارات أول (بدون شهادات)',
    // tweak labels
    'tw.Track': 'المسار', 'tw.Level': 'المستوى', 'tw.Time': 'الوقت', 'tw.Target': 'الهدف الزمني',
    'tw.Budget': 'الميزانية', 'tw.Style': 'الأسلوب', 'tw.Depth': 'العمق',
    // chips
    'chip.Level': 'المستوى', 'chip.Time': 'الوقت', 'chip.Budget': 'الميزانية', 'chip.Style': 'الأسلوب',
    'chip.Goal': 'الهدف', 'chip.Target': 'الهدف الزمني', 'chip.Demand': 'الطلب',
    // footer
    'foot.about': 'CYBERPATH — مُخطِّط مسارات مجاني ومفتوح. تكاليف الشهادات وتوفّر البرامج تتغيّر؛ دائمًا تأكّد من موقع المزوّد قبل ما تدفع. اختبر بس الأنظمة المسموح إلك تختبرها.',
    'foot.meta.a': 'موقع ثابت', 'foot.meta.b': 'يشتغل بدون نت', 'foot.meta.c': 'بلا تتبّع', 'foot.meta.d': 'بلا حساب', 'foot.meta.e': 'المحتوى مراجَع',
    'foot.by': 'تصميم', 'foot.inspired': '· الفكرة مستوحاة من',
    // faq
    'faq.h': 'أسئلة شائعة',
    'faq.q1': 'أحتاج شهادة جامعية حتى أدخل الأمن السيبراني؟',
    'faq.a1': 'لأغلب الأدوار التقنية، لا — المهارة العملية ومشاريع المختبر البيتي والكتابات والشهادات المعترف بيها إلها وزن حقيقي. بعض جهات الشغل والمناطق بعدها تفضّل الشهادة الجامعية، بس المهارات والشهادات هي الأهم.',
    'faq.q2': 'المصادر المجانية تكفي فعلاً حتى أنتوظّف؟',
    'faq.a2': 'حتى تبني مهارة حقيقية تأهّلك للشغل، إي. منصّات مثل TryHackMe وPortSwigger وBlue Team Labs وCyberDefenders توصّلك بعيد مجانًا؛ الشهادات عادةً هي التكلفة الأساسية، وحتى بيها غالبًا شهادة وحدة مختارة زين تكفي لأول وظيفة.',
    'faq.q3': 'شكد معلومات الشهادات محدّثة؟',
    'faq.a3': 'أسماء الشهادات ومساراتها تنراجع بين فترة وفترة (شوف تاريخ المراجعة بالتذييل). الأسعار تتغيّر هواية، فالتكلفة معروضة كنطاق تقريبي، ولازم تتأكّد من السعر الحالي بموقع المزوّد قبل ما تدفع.',
    'faq.q4': 'شكد راح ياخذ وقت مني فعلاً؟',
    'faq.a4': 'يعتمد على ساعاتك بالأسبوع ومن وين بادي. المُخطِّط يظبط كل مرحلة حسب وقتك ويعطيك نطاق واقعي وتقدير لإجمالي ساعات الدراسة.',
    'faq.q5': 'CYBERPATH تابع لـ Hack The Box أو TryHackMe أو INE؟',
    'faq.a5': 'لا. CYBERPATH مُخطِّط مستقل ومجاني، يربط بهذي المنصّات كمصادر تعلّم بس، ومو مدعوم أو تابع لأي وحدة منها.',
    'faq.q6': 'تجمعون بياناتي؟',
    'faq.a6': 'لا. ماكو تتبّع ولا حساب ولا خادم. إجاباتك تبقى بمتصفّحك (وبرابط المشاركة إذا نسخته)، وتقدّمك محفوظ على جهازك بس.',
    // build loader
    'load.ready': 'الخارطة جاهزة.'
  };

  var lang = 'en';
  try { lang = localStorage.getItem(LANG_KEY) || 'en'; } catch (e) {}
  try { var p = new URLSearchParams(location.search).get('lang'); if (p === 'ar' || p === 'en') lang = p; } catch (e) {}

  function t(key, en) {
    if (lang === 'ar' && AR[key] != null) return AR[key];
    return en != null ? en : (AR[key] != null ? AR[key] : key);
  }

  // Capture the original English for every [data-i18n] node once, so 'en' can restore it.
  var origin = null;
  function swapStatic() {
    var nodes = document.querySelectorAll('[data-i18n]');
    if (!origin) { origin = {}; }
    Array.prototype.forEach.call(nodes, function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in origin)) origin[k] = el.textContent;
      el.textContent = (lang === 'ar' && AR[k] != null) ? AR[k] : origin[k];
    });
  }

  var subscribers = [];
  function onChange(fn) { subscribers.push(fn); }

  function applyLang(next, animate) {
    var run = function () {
      lang = next;
      try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
      var html = document.documentElement;
      html.setAttribute('lang', next === 'ar' ? 'ar' : 'en');
      html.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
      swapStatic();
      subscribers.forEach(function (fn) { try { fn(next); } catch (e) {} });
      var btn = document.getElementById('lang-toggle');
      if (btn) { var lbl = btn.querySelector('.lang-toggle__label'); if (lbl) lbl.textContent = next === 'ar' ? 'EN' : 'العربية'; }
    };
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate && !reduce) glitch(run); else run();
  }

  // Brief "hacker" scramble overlay, then apply.
  function glitch(done) {
    var ov = document.getElementById('lang-glitch');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'lang-glitch'; ov.className = 'lang-glitch'; ov.setAttribute('aria-hidden', 'true');
      ov.innerHTML = '<pre class="lang-glitch__rain"></pre><div class="lang-glitch__label"></div>';
      document.body.appendChild(ov);
    }
    var rain = ov.querySelector('.lang-glitch__rain');
    var label = ov.querySelector('.lang-glitch__label');
    var target = lang === 'ar' ? 'ENGLISH' : 'ﺗﺮﺟﻤﺔ';
    var chars = '01ﷲabcdefﺣﺮﻮﻒﺏﺕﻥ<>#$%&*+=/\\|';
    ov.hidden = false; requestAnimationFrame(function () { ov.classList.add('is-on'); });
    var ticks = 0, maxTicks = 11;
    var iv = setInterval(function () {
      ticks++;
      var rows = [];
      for (var r = 0; r < 9; r++) {
        var s = '';
        for (var c = 0; c < 48; c++) s += chars[(Math.floor((ticks * 7 + r * 13 + c * 3) % chars.length))];
        rows.push(s);
      }
      rain.textContent = rows.join('\n');
      // scramble the label toward the target word
      var out = '';
      for (var i = 0; i < target.length; i++) out += (ticks / maxTicks) * target.length > i ? target[i] : chars[(ticks + i) % chars.length];
      label.textContent = out;
      if (ticks >= maxTicks) {
        clearInterval(iv);
        done();
        setTimeout(function () { ov.classList.remove('is-on'); setTimeout(function () { ov.hidden = true; }, 200); }, 180);
      }
    }, 55);
  }

  window.CYBERPATH_I18N = {
    t: t,
    get lang() { return lang; },
    apply: applyLang,
    onChange: onChange,
    swapStatic: swapStatic
  };

  // Apply the saved/initial language (sets dir + swaps static text), and wire the toggle.
  applyLang(lang, false);
  var lt = document.getElementById('lang-toggle');
  if (lt) lt.addEventListener('click', function () { applyLang(lang === 'ar' ? 'en' : 'ar', true); });
})();
