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
    'nav.dark': 'داكن', 'nav.light': 'فاتح',
    'nav.toDark': 'حوّل للثيم الداكن', 'nav.toLight': 'حوّل للثيم الفاتح',
    // hero
    'hero.eyebrow': 'طريقك للأمن السيبراني، مرسوم إلك',
    'hero.title.a': 'بطّل تخمين.', 'hero.title.b': 'خلّي عندك ', 'hero.title.c': 'خارطة حقيقية.',
    'hero.lede': 'جاوب على شوية أسئلة سريعة، وإحنا نبنيلك خطة مرحلة مرحلة، بمدد زمنية واقعية، والشهادات اللي تستاهل تركض وراها، ومصادر تناسب ميزانيتك — مجانية أو مدفوعة. وبعدها نزّلها.',
    'hero.cta': 'ابنيلي خارطتي', 'hero.browse': 'شوف المسارات',
    'hero.noscript': 'المُخطِّط التفاعلي يحتاج جافاسكربت. بدونه تكدر تشوف المسارات الستة ومساراتها للشهادات تحت.',
    'hero.stat.tracks': 'مسارات مهنية', 'hero.stat.certs': 'شهادة مُوثّقة', 'hero.stat.res': 'مصادر مجانية ومدفوعة',
    'hero.price.old': 'تطبيقات خرائط مدفوعة', 'hero.price.new': '$0 · للأبد',
    'hero.sys': 'بلا حساب · يشتغل بدون نت · بلا تتبّع',
    'hero.stack.label': 'المسارات',
    'hero.trk.offensive': 'اخترق — قرصنة أخلاقية وفريق أحمر', 'hero.trk.defensive': 'اكتشف واستجب — SOC وصيد وحوادث',
    'hero.trk.grc': 'الأمن كوظيفة عمل', 'hero.trk.cloud': 'أمّن AWS وAzure وGCP',
    'hero.trk.appsec': 'كود آمن وخطوط CI/CD', 'hero.trk.dfir': 'حقّق بالاختراقات والبرمجيات الخبيثة',
    'badge.offensive': 'هجومي', 'badge.defensive': 'فريق أزرق', 'badge.grc': 'GRC',
    'badge.cloud': 'سحابة', 'badge.appsec': 'أمن تطبيقات', 'badge.dfir': 'DFIR',
    'celebrate.25': 'ربع الطريق — أساسياتك بدت تتكوّن.', 'celebrate.50': 'نص الطريق. الزخم صار حقيقي.',
    'celebrate.75': 'ثلاثة أرباع خلصت — خط النهاية قريب.', 'celebrate.100': 'الخارطة خلصت. هسّه روح دبّر شغل.',
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
    'plan.download': 'نزّل PDF', 'plan.md': 'ماركداون', 'plan.copy': 'انسخ الرابط',
    'plan.restart': 'ابدأ من جديد', 'plan.adjust': 'عدّل خطتك', 'plan.copied': 'تم النسخ!',
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
    // pricing / tiers / demand
    // Prices kept in English (USD + IQD) in both languages — cleaner and unambiguous.
    'price.free': 'مجانًا', 'price.low': '≈ $100–300 · 130k–390k IQD',
    'price.mid': '≈ $300–800 · 390k–1.05m IQD', 'price.high': '≈ $800+ · 1.05m+ IQD',
    'plan.costEst': 'رسوم الامتحانات التقديرية لهذا السُّلّم',
    'plan.costNote': 'نطاق تقريبي من الفئات، مو سعر نهائي. دائمًا تأكّد من الأسعار الحالية.',
    'plan.exploreTitle': 'استكشف واختر مسارك', 'plan.studyPrefix': 'شلون تدرس هذا',
    'demand.Very high': 'عالي جدًا', 'demand.High': 'عالي',
    'tierlabel.foundation': 'الأساس', 'tierlabel.core': 'المهارات الأساسية', 'tierlabel.specialization': 'التخصّص',
    'tierlabel.certification': 'الشهادة', 'tierlabel.career': 'انطلاق مهني',
    // tracks
    'trk.roles': 'الأدوار', 'trk.certs': 'الشهادات',
    'trk.offensive.name': 'الأمن الهجومي / اختبار الاختراق', 'trk.offensive.tag': 'اخترق بأخلاق. لاكِ الثغرات قبل المهاجمين.', 'trk.offensive.roles': 'مختبِر اختراق · فريق أحمر · صائد مكافآت الثغرات · مستشار أمني',
    'trk.defensive.name': 'الأمن الدفاعي / الفريق الأزرق', 'trk.defensive.tag': 'اكتشف، استجب، واصطاد. كون السبب اللي يفشّل الهجوم.', 'trk.defensive.roles': 'محلل SOC · مستجيب حوادث · صائد تهديدات · مهندس كشف',
    'trk.grc.name': 'الحوكمة والمخاطر والامتثال (GRC)', 'trk.grc.tag': 'الأمن كوظيفة عمل: سياسات ومخاطر وتدقيق وأُطُر.', 'trk.grc.roles': 'محلل GRC · مدقّق تقنية معلومات · محلل مخاطر · مدير امتثال',
    'trk.cloud.name': 'أمن السحابة', 'trk.cloud.tag': 'أمّن المنصّات اللي يشتغل عليها كلشي: AWS وAzure وGCP.', 'trk.cloud.roles': 'مهندس أمن سحابة · محلل أمن سحابة · مهندس DevSecOps',
    'trk.appsec.name': 'أمن التطبيقات / DevSecOps', 'trk.appsec.tag': 'أمّن الكود والـpipeline. وين يلتقي المطوّرين بالأمن.', 'trk.appsec.roles': 'مهندس أمن تطبيقات · مهندس DevSecOps · صائد مكافآت الثغرات',
    'trk.dfir.name': 'التحقيق الجنائي الرقمي والاستجابة (DFIR)', 'trk.dfir.tag': 'اتبع الأدلة. أعِد بناء الهجوم، قرص قرص، سجل سجل.', 'trk.dfir.roles': 'محلل أدلة جنائية رقمية · مستجيب حوادث · محلل برمجيات خبيثة',
    // phase names
    'ph.net.name': 'أساسيات الشبكات', 'ph.linux.name': 'لينكس وسطر الأوامر', 'ph.fund.name': 'أساسيات الأمن', 'ph.prog.name': 'البرمجة بـPython',
    'ph.off-core.name': 'أساس الهجوم: الاستطلاع وهجمات الويب والشبكة', 'ph.off-spec.name': 'الاستغلال وActive Directory', 'ph.off-cert.name': 'سباق الشهادة', 'ph.off-career.name': 'المعرض والتقارير والبحث عن وظيفة',
    'ph.def-core.name': 'أساس الفريق الأزرق: السجلات وSIEM والكشف', 'ph.def-spec.name': 'الاستجابة للحوادث وصيد التهديدات', 'ph.def-cert.name': 'الشهادة', 'ph.def-career.name': 'مختبر SOC منزلي والبحث عن وظيفة',
    'ph.grc-core.name': 'الحوكمة والمخاطر والأُطُر', 'ph.grc-spec.name': 'التدقيق والامتثال وإدارة المخاطر', 'ph.grc-cert.name': 'الشهادة', 'ph.grc-career.name': 'معرض الوثائق والبحث عن وظيفة',
    'ph.cloud-core.name': 'أساسيات السحابة (AWS / Azure)', 'ph.cloud-spec.name': 'أمن السحابة وتقوية IAM', 'ph.cloud-cert.name': 'الشهادة', 'ph.cloud-career.name': 'مختبر سحابي والبحث عن وظيفة',
    'ph.appsec-core.name': 'أساسيات أمن الويب (OWASP Top 10)', 'ph.appsec-spec.name': 'الكود الآمن وDevSecOps', 'ph.appsec-cert.name': 'الشهادة', 'ph.appsec-career.name': 'صيد المكافآت والمعرض',
    'ph.dfir-core.name': 'أساسيات الأدلة الجنائية (القرص، الذاكرة، السجلات)', 'ph.dfir-spec.name': 'الاستجابة للحوادث وفرز البرمجيات الخبيثة', 'ph.dfir-cert.name': 'الشهادة', 'ph.dfir-career.name': 'معرض القضايا والبحث عن وظيفة',
    'ph.explore.name': 'جرّب كل مسار، وبعدين اختر',
    // milestones
    'ms.Home lab built': 'بنيت مختبر منزلي', 'ms.Home lab built.b': 'مضيّف أجهزة وهمية + هدف مصاب + جهاز مهاجم بلينكس — ساحة تدريبك الدائمة.',
    'ms.First box rooted': 'أول جهاز مخترَق (root)', 'ms.First box rooted.b': 'اخترق جهاز من الاستطلاع للـroot بدون walkthrough.',
    'ms.First pentest report': 'أول تقرير اختبار اختراق', 'ms.First pentest report.b': 'تقرير احترافي: النتائج وتصنيف المخاطر والمعالجة.',
    'ms.First alert triaged': 'أول تنبيه تم فرزه', 'ms.First alert triaged.b': 'خُذ تنبيه SIEM من السجل الخام إلى حكم إيجابي/سلبي.',
    'ms.First incident handled': 'أول حادث تمت معالجته', 'ms.First incident handled.b': 'مرّر تنبيه عبر دورة الاستجابة الكاملة (NIST) حتى الاحتواء.',
    'ms.First case solved': 'أول قضية تم حلها', 'ms.First case solved.b': 'أعِد بناء خط زمني لهجوم من القرص/الذاكرة ودافع عنه كتابةً.',
    'ms.First audit completed': 'أول تدقيق مكتمل', 'ms.First audit completed.b': 'اربط الضوابط بإطار وأنتج نتيجة تدقيق مدعومة بالأدلة.',
    'ms.First secured deployment': 'أول نشر مؤمَّن', 'ms.First secured deployment.b': 'انشر نشرة مرجعية مقوّاة (IaC) مع تسجيل وتنبيهات.',
    'ms.First CVE / disclosure': 'أول CVE / إفصاح', 'ms.First CVE / disclosure.b': 'تقرير مكافأة ثغرات صالح ضمن النطاق أو CVE مُفصح عنه بمسؤولية.',
    'ms.First write-up published': 'أول كتابة منشورة', 'ms.First write-up published.b': 'منشور عام يثبت طريقة تفكيرك، مو بس شنو سويت.',
    // budget callouts
    'bud.free': '<strong>المسار المجاني.</strong> كل مرحلة فوك تعرض مصادر بلا تكلفة تكدر تبدي بيها هسّه. أغلب الشهادات بعدها تاخذ رسوم امتحان — الخيار المجاني الأوضح هو ISC2 Certified in Cybersecurity (CC). تكدر تبني مهارة حقيقية بدون ما تدفع؛ اعتبر الشهادات المدفوعة استثمار لاحق اختياري.',
    'bud.mixed': '<strong>المسار المتوازن.</strong> تعلّم على المنصّات المجانية، وبعدين اصرف وين يفرق: شهادة أو اثنتين معروفة يبحث عنها المسؤولين عن التوظيف.',
    'bud.paid': '<strong>المسار الكامل.</strong> راح تشوف أقوى الخيارات بضمنها المختبرات والشهادات المدفوعة. اصرف بحكمة — المصادر المجانية بعدها أفضل مكان تبني بيه الأساسيات أول.',
    // study tips
    'tip.hands': 'إنت تتعلّم بالممارسة، فعيش بالمختبرات: لكل مفهوم، مباشرة اخترق أو دافع عن شي. ابدأ بالمنصّات العملية بكل مرحلة (TryHackMe وHack The Box وPortSwigger وCyberDefenders) وما تقرا النظرية إلا لمن توكف بمشكلة.',
    'tip.structured': 'إنت أحسن مع مسار موجَّه، فاربط كل مرحلة بكورس واحد منظّم وخلّصه قبل ما تنتقل. استخدم مصادر الفيديو/الكورسات كعمود فقري والمختبرات لترسيخ كل وحدة.',
    'tip.reading': 'إنت تفضّل القراءة، فابنِ كل مرحلة حول الوثائق والكتب المذكورة، وبعدين أثبت فهمك بمختبر أو اثنين. احتفظ بدفتر مكتوب — الشرح لنفسك أسرع طريقة للتغذية الراجعة.',
    'tip.balanced': 'إنت تحب التنوّع، فبدّل: شوف أو اقرا حتى تفهم الموضوع، وبعدها مباشرة طبّقه بمختبر، وبعدين اكتب ملاحظة قصيرة. حلقة (شوف ← سوِّ ← اشرح) هي أضمن طريقة لتثبيت مهارات الأمن.',

    // wizard questions (legends + help + option labels; main descs)
    'q.goal.legend': 'أي مجال بالأمن السيبراني يشدّك أكثر؟',
    'q.goal.help': 'اختر الشغل اللي يبيّن أكثر إثارة إلك. مو متأكد؟ اختر آخر خيار وإحنا نساعدك تستكشف.',
    'q.goal.opt.offensive': 'الاختراق (هجومي / اختبار اختراق)', 'q.goal.opt.offensive.d': 'قرصنة أخلاقية، فريق أحمر، إيجاد الثغرات.',
    'q.goal.opt.defensive': 'الدفاع (فريق أزرق / SOC)', 'q.goal.opt.defensive.d': 'كشف الهجمات، الاستجابة للحوادث، صيد التهديدات.',
    'q.goal.opt.grc': 'الحوكمة والمخاطر (GRC)', 'q.goal.opt.grc.d': 'سياسات، تدقيق، امتثال، إدارة مخاطر.',
    'q.goal.opt.cloud': 'أمن السحابة', 'q.goal.opt.cloud.d': 'تأمين بيئات AWS وAzure وGCP.',
    'q.goal.opt.appsec': 'أمن التطبيقات', 'q.goal.opt.appsec.d': 'تأمين الكود وتطبيقات الويب والـCI/CD.',
    'q.goal.opt.dfir': 'الأدلة الجنائية والاستجابة (DFIR)', 'q.goal.opt.dfir.d': 'التحقيق بالاختراقات والأدلة والبرمجيات الخبيثة.',
    'q.goal.opt.unsure': 'لسّه مو متأكد', 'q.goal.opt.unsure.d': 'جاوب على شوية أسئلة استعداد وإحنا نلاكيلك المسار.',
    'q.experience.legend': 'منين بادي اليوم؟',
    'q.experience.help': 'كون صادق — هذا يحدّد شكد أساسيات نضيف وشكد بسرعة تمشي الخطة.',
    'q.experience.opt.none': 'مبتدئ تمامًا', 'q.experience.opt.none.d': 'جديد على التقنية والأمن.',
    'q.experience.opt.it': 'خلفية تقنية بسيطة', 'q.experience.opt.it.d': 'مرتاح بالحاسبات، يمكن دعم فني أو برمجة.',
    'q.experience.opt.some-sec': 'شوية خبرة أمنية', 'q.experience.opt.some-sec.d': 'سويت كورس أو CTF أو شوية أمن بالشغل.',
    'q.experience.opt.pro': 'أشتغل بالتقنية/الأمن', 'q.experience.opt.pro.d': 'أحوّل مساري أو أطوّر نفسي بالمجال.',
    'q.background.legend': 'أي وحدة من هذي تعرفها أصلاً؟ (اختر أي شي)',
    'q.background.help': 'راح نتخطّى الأساسيات اللي تعرفها حتى ما تطول الخطة. اختياري — إذا ماكو شي ينطبق، بس اضغط التالي.',
    'q.background.opt.networking': 'الشبكات', 'q.background.opt.networking.d': 'TCP/IP، DNS، subnetting.',
    'q.background.opt.linux': 'لينكس / سطر الأوامر', 'q.background.opt.linux.d': 'مرتاح بالطرفية.',
    'q.background.opt.programming': 'البرمجة / السكربتات', 'q.background.opt.programming.d': 'Python أو شبهه.',
    'q.background.opt.sysadmin': 'إدارة الأنظمة', 'q.background.opt.sysadmin.d': 'إدارة أنظمة ويندوز/لينكس.',
    'q.hours.legend': 'شكد وقت تكدر تدرس بالأسبوع بشكل واقعي؟',
    'q.hours.help': 'الاستمرارية أهم من الكثافة. اختر اللي تكدر تلتزم بيه فعلاً.',
    'q.hours.opt.3': 'شوية ساعات (1–5س)', 'q.hours.opt.3.d': 'مسيات/عطل بين الالتزامات.',
    'q.hours.opt.8': 'دوام جزئي (5–10س)', 'q.hours.opt.8.d': 'إيقاع أسبوعي ثابت.',
    'q.hours.opt.15': 'جدّي (10–20س)', 'q.hours.opt.15.d': 'الدراسة أولوية كبيرة.',
    'q.hours.opt.25': 'دوام كامل (+20س)', 'q.hours.opt.25.d': 'هاي تركيزك الأساسي هسّه.',
    'q.deadline.legend': 'عندك تاريخ مستهدف حتى تصير جاهز للوظيفة؟',
    'q.deadline.help': 'راح نتحقّق من خطتك مقابله ونكلك إذا ساعاتك بالأسبوع تكفي.',
    'q.deadline.opt.3': 'خلال 3 أشهر', 'q.deadline.opt.3.d': 'طموح — عادةً يحتاج دراسة بدوام كامل.',
    'q.deadline.opt.6': 'خلال 6 أشهر', 'q.deadline.opt.6.d': 'مركّز ومكثّف.',
    'q.deadline.opt.12': 'خلال سنة', 'q.deadline.opt.12.d': 'إيقاع ثابت ومستدام.',
    'q.deadline.opt.0': 'بلا موعد محدّد', 'q.deadline.opt.0.d': 'أمشي على راحتي.',
    'q.budget.legend': 'شكد ميزانيتك للتعلّم والشهادات؟',
    'q.budget.help': 'تكدر تبني مهارات حقيقية بلا صرف؛ الشهادات هي وين عادةً يروح الفلوس.',
    'q.budget.opt.free': 'مجاني بس', 'q.budget.opt.free.d': 'ورّيني أفضل مسار بلا تكلفة.',
    'q.budget.opt.mixed': 'أغلبه مجاني، وشوية صرف', 'q.budget.opt.mixed.d': 'تعلّم مجاني، وادفع للشهادات المهمة.',
    'q.budget.opt.paid': 'أكدر أستثمر', 'q.budget.opt.paid.d': 'ورّيني أفضل الخيارات، بضمنها المدفوعة.',
    'q.style.legend': 'شلون تتعلّم أحسن؟',
    'q.style.help': 'راح نظبّط طريقة الدراسة وأي نوع مصادر نبدأ بيها.',
    'q.style.opt.hands': 'مختبرات وتحدّيات عملية', 'q.style.opt.hands.d': 'تعلّم بالممارسة — CTF، أجهزة، تكسير الأشياء.',
    'q.style.opt.structured': 'كورسات وفيديو منظّمة', 'q.style.opt.structured.d': 'مناهج موجّهة خطوة بخطوة.',
    'q.style.opt.reading': 'قراءة ووثائق', 'q.style.opt.reading.d': 'كتب ووثائق وكتابات على راحتي.',
    'q.style.opt.balanced': 'مزيج من كلشي', 'q.style.opt.balanced.d': 'أخلط مختبرات وفيديو وقراءة.',
    'q.appetite.legend': 'شنو هدفك من هذا المسار؟',
    'q.appetite.help': 'هذا يحدّد لوين يوصل سُلّم الشهادات بخطتك.',
    'q.appetite.opt.hobby': 'أتعلّم للاهتمام / هواية', 'q.appetite.opt.hobby.d': 'المهارات أهم من الشهادات.',
    'q.appetite.opt.entry': 'أحصل على أول وظيفة أمنية', 'q.appetite.opt.entry.d': 'مدخلي + شهادة أساسية قوية وحدة.',
    'q.appetite.opt.advanced': 'أتقدّم / أتخصّص بعمق', 'q.appetite.opt.advanced.d': 'روح للنهاية لشهادات الخبراء.',
    'q.apt_drive.legend': 'أي جزء من دورة حياة الأمن راح تكون أسعد بيه؟',
    'q.apt_drive.opt.break': 'إيجاد طريق الدخول', 'q.apt_drive.opt.watch': 'ضبط الهجمات وهي تصير', 'q.apt_drive.opt.build': 'بناء أنظمة تقاوم', 'q.apt_drive.opt.investigate': 'إعادة بناء اللي صار', 'q.apt_drive.opt.govern': 'وضع القواعد',
    'q.apt_mindset.legend': 'أي وحدة تشبه طريقة تفكير عقلك فعلاً؟',
    'q.apt_mindset.opt.adversarial': 'أدوّر على الخلل', 'q.apt_mindset.opt.layered': 'أفكّر بالدفاعات', 'q.apt_mindset.opt.evidence': 'أتبع الأدلة', 'q.apt_mindset.opt.systems': 'أشوف الأنظمة كلها', 'q.apt_mindset.opt.rules': 'أفكّر بالقواعد',
    'q.apt_medium.legend': 'أي حرفة تحب تتقنها أكثر؟',
    'q.apt_medium.opt.code': 'الكود والـdebugger', 'q.apt_medium.opt.exploit': 'أدوات الاستغلال والـshells', 'q.apt_medium.opt.cloudiac': 'واجهات السحابة والـIaC', 'q.apt_medium.opt.siem': 'SIEM ولغة استعلامه', 'q.apt_medium.opt.forensics': 'أدلة القرص والذاكرة', 'q.apt_medium.opt.frameworks': 'أُطُر المخاطر والضوابط',
    'q.apt_social.legend': 'وين تشتغل أحسن؟',
    'q.apt_social.opt.solo': 'لحالي وبتركيز', 'q.apt_social.opt.ops-team': 'بفريق متفاعل ومتماسك', 'q.apt_social.opt.with-devs': 'جنب المطوّرين', 'q.apt_social.opt.stakeholders': 'ويا جهة العمل',
    'q.apt_report.legend': 'بصدق، شلون تشعر تجاه كتابة التقارير؟',
    'q.apt_report.opt.energizes': 'أستمتع بيها', 'q.apt_report.opt.professional': 'جزء من الشغل', 'q.apt_report.opt.minimal': 'خلّيني عملي',

    'plan.reminder': 'تذكير',
    // step-by-step help sentence
    'plan.hint1': 'المدد تفترض حوالي', 'plan.hint2': 'وتتأقلم مع خبرتك — تقريبًا',
    'plan.hoursWord': 'ساعة', 'plan.hint3': 'دراسة إجمالًا. الحياة تصير: اعتبرها بوصلة مو موعد نهائي.',
    // build loader
    'load.ready': 'الخارطة جاهزة.',

    // duration/time units
    'unit.week': ' أسبوع', 'unit.weeks': ' أسابيع', 'unit.month': ' شهر', 'unit.months': ' أشهر',
    'unit.wks': ' أسبوع', 'unit.h': 'ساعة', 'unit.iqd': 'IQD',

    // deadline verdict (fragments concatenated around dynamic numbers)
    'dl.ok.head': 'على المسار الصحيح.',
    'dl.ok.a': ' بـ', 'dl.ok.b': ' ساعة بالأسبوع، خطتك تنتهي حوالي ',
    'dl.ok.c': ' — ضمن هدفك ', 'dl.ok.d': ' أشهر. حافظ على الإيقاع وراح توصل.',
    'dl.warn.head': 'انتبه لموعدك النهائي.',
    'dl.warn.a': ' خطتك تقدّر حوالي ', 'dl.warn.b': ' بـ',
    'dl.warn.c': ' ساعة/أسبوع، وهذا أطول من هدفك ', 'dl.warn.d': ' أشهر. ',
    'dl.a1.a': 'حتى توصل ', 'dl.a1.b': ' أشهر تحتاج تقريبًا ',
    'dl.a1.c': ' ساعة بالأسبوع', 'dl.a1.d': '. إذا هذا مو واقعي، إمّا مدّد هدفك أو ضيّق النطاق (مثلاً استهدف شهادة مدخلية وحدة أول).',
    'dl.a2.a': 'الوصول لـ', 'dl.a2.b': ' أشهر من هنا يحتاج ~',
    'dl.a2.c': ' ساعة بالأسبوع وهذا مو واقعي. هدف ', 'dl.a2.d': ' أشهر طموح جدًا لنقطة انطلاقك — فكّر تمدّده لـ',
    'dl.a2.e': ' أشهر، أو ركّز على شهادة ودور بمستوى مبتدئ أول.'
  };

  var lang = 'en';
  try { lang = localStorage.getItem(LANG_KEY) || 'en'; } catch (e) {}
  try { var p = new URLSearchParams(location.search).get('lang'); if (p === 'ar' || p === 'en') lang = p; } catch (e) {}

  function t(key, en) {
    if (lang === 'ar' && AR[key] != null) return AR[key];
    return en != null ? en : (AR[key] != null ? AR[key] : key);
  }
  // Phrase translation: look up the EXACT English string in the content map (graceful).
  function tr(s) {
    if (lang === 'ar' && window.CYBERPATH_PHRASES && window.CYBERPATH_PHRASES[s] != null) return window.CYBERPATH_PHRASES[s];
    return s;
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
    label.setAttribute('dir', 'auto');
    // lang is still the CURRENT language here; we're switching to the other one.
    var finalWord = lang === 'ar' ? 'ENGLISH' : 'العربية';
    var chars = '01ABCDEF#%&*<>/\\|=+-01';
    ov.hidden = false; requestAnimationFrame(function () { ov.classList.add('is-on'); });
    // Size the matrix rain to the actual viewport so it fills the whole screen on any
    // display (phone to 2560px), not a fixed block. ~9.2px per mono glyph, ~19px per line.
    var COLS = Math.ceil(window.innerWidth / 9.2) + 2;
    var ROWS = Math.ceil(window.innerHeight / 19) + 2;
    var ticks = 0, maxTicks = 14;
    var iv = setInterval(function () {
      ticks++;
      var rows = [];
      for (var r = 0; r < ROWS; r++) {
        var s = '';
        for (var c = 0; c < COLS; c++) s += chars[(ticks * 7 + r * 13 + c * 3) % chars.length];
        rows.push(s);
      }
      rain.textContent = rows.join('\n');
      // Latin-only scramble (no bidi jumps), then reveal the clean language name at the end.
      if (ticks < maxTicks - 2) {
        var out = '';
        for (var i = 0; i < 11; i++) out += chars[(ticks * 5 + i * 3) % chars.length];
        label.textContent = out;
      } else {
        label.textContent = finalWord;
      }
      if (ticks >= maxTicks) {
        clearInterval(iv);
        done();
        setTimeout(function () { ov.classList.remove('is-on'); setTimeout(function () { ov.hidden = true; }, 220); }, 200);
      }
    }, 55);
  }

  window.CYBERPATH_I18N = {
    t: t,
    tr: tr,
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
