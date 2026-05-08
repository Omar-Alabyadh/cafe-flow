import fs from "node:fs";
import path from "node:path";
import PptxGenJS from "pptxgenjs";

const outDir = path.resolve("presentations");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "CafeFlow-Modern-UIUX-20260424-2006.pptx");

const palette = {
  bg: "F8FAFC",
  text: "0F172A",
  muted: "71717A",
  border: "E4E4E7",
  primary: "047857",
  accent: "F59E0B",
  softPrimary: "ECFDF5",
};

const slides = [
  {
    title: "مقدمة المشروع",
    icon: "📌",
    bullets: [
      "شهد قطاع المقاهي نموًا كبيرًا، مما أدى إلى الحاجة إلى أنظمة حديثة لإدارة:",
      "الطلبات، المخزون، الموظفين، الفروع، المبيعات.",
      "لكن السوق الليبي يفتقر إلى نظام سحابي متكامل يعمل بنظام الاشتراكات ويدعم تعدد الفروع.",
      "لذلك تم تطوير نظام CafeFlow كحل رقمي حديث.",
    ],
  },
  {
    title: "مشكلة البحث",
    icon: "🔍",
    bullets: [
      "عدم وجود نظام SaaS محلي لإدارة المقاهي.",
      "صعوبة إدارة الفروع المتعددة.",
      "غياب أنظمة اشتراك حديثة.",
      "ضعف دعم اللغة العربية.",
      "عدم دعم وسائل الدفع المحلية.",
      "غياب نظام صلاحيات مرن للموظفين.",
    ],
  },
  {
    title: "أهداف المشروع",
    icon: "🎯",
    bullets: [
      "تطوير منصة SaaS لإدارة المقاهي.",
      "دعم تعدد الفروع داخل نظام واحد.",
      "توفير باقات اشتراك (Basic – Pro – Business).",
      "دعم اللغة العربية والإنجليزية.",
      "دعم وسائل الدفع المحلية والعالمية.",
      "توفير نظام تقارير متكامل.",
      "توفير نظام صلاحيات ديناميكي.",
    ],
  },
  {
    title: "أهمية المشروع",
    icon: "⭐",
    bullets: [
      "دعم التحول الرقمي في ليبيا.",
      "توفير نظام محلي حديث.",
      "تقليل الأخطاء اليدوية.",
      "تحسين كفاءة إدارة المقاهي.",
      "إمكانية التوسع عالميًا.",
    ],
  },
  {
    title: "منهجية العمل",
    icon: "🧭",
    bullets: [
      "تم استخدام المنهجية التكرارية (Iterative Model).",
      "تحليل المتطلبات.",
      "تصميم النظام.",
      "تطوير النظام.",
      "اختبار النظام.",
      "تحسين الأداء.",
      "بشكل متكرر حتى الوصول لنظام مستقر.",
    ],
  },
  {
    title: "فكرة النظام",
    icon: "💡",
    bullets: [
      "CafeFlow هو نظام سحابي يتيح لمالك المقهى إدارة:",
      "الفروع، الموظفين، المنتجات، الطلبات، المخزون، التقارير.",
      "وذلك من خلال لوحة تحكم واحدة.",
    ],
  },
  {
    title: "نظام الاشتراكات",
    icon: "💳",
    bullets: [
      "يعتمد النظام على ثلاث باقات:",
      "Basic: إدارة الطلبات + POS + المنتجات.",
      "Pro: إدارة الفروع + المخزون + الموظفين + الوصفات.",
      "Business: تقارير متقدمة + تحليلات + إدارة شاملة.",
    ],
  },
  {
    title: "دعم اللغات ووسائل الدفع",
    icon: "🌐",
    bullets: [
      "يدعم النظام: العربية والإنجليزية.",
      "وسائل الدفع المحلية: إدفع لي، موبي كاش، تداول، يسر باي، ون باي، لي باي، الدفع النقدي.",
      "وسائل الدفع العالمية: Stripe (Visa / MasterCard).",
    ],
  },
  {
    title: "لوحة تحكم مالك المنصة",
    icon: "🖥️",
    bullets: [
      "يوفر النظام لوحة خاصة تسمى Platform Dashboard.",
      "تمكن من متابعة: عدد المقاهي، عدد الفروع، حالة الاشتراكات، إجمالي الأرباح.",
      "ومحمية عبر: Email + Password و Google Authenticator (كود متغير).",
    ],
  },
  {
    title: "تسجيل المستخدم وإدارة الفروع",
    icon: "🧑‍💼",
    bullets: [
      "يقوم المالك بإنشاء حساب وإضافة بيانات المقهى.",
      "ثم يمكنه إضافة عدة فروع مثل:",
      "الفرع الرئيسي، فرع الجامعة، فرع شارع البيبسي، فرع شارع فينيسيا.",
    ],
  },
  {
    title: "لوحة التحكم الرئيسية",
    icon: "📊",
    bullets: [
      "تتضمن: الداشبورد، الفروع، المنتجات، POS، الطلبات، الوصفات، الطاقم، المخزون، التقارير.",
      "مع صلاحيات كاملة للمالك.",
    ],
  },
  {
    title: "نظام الطلبات والمخزون",
    icon: "📦",
    bullets: [
      "عند إنشاء طلب: يتم تسجيل المبيعات تلقائيًا.",
      "يتم خصم المكونات من المخزون بناءً على نظام الوصفات.",
      "مما يضمن دقة عالية وتقليل الأخطاء.",
    ],
  },
  {
    title: "نظام التقارير",
    icon: "📈",
    bullets: [
      "يوفر النظام: تقارير المبيعات، تقارير المخزون، تقارير الموظفين، التقارير المالية.",
      "وذلك لدعم اتخاذ القرار الإداري.",
    ],
  },
  {
    title: "نظام الموظفين والصلاحيات",
    icon: "👥",
    bullets: [
      "يوفر النظام: دعوة موظف عبر رابط، تحديد الدور الوظيفي، تحديد الصلاحيات.",
      "توليد Username تلقائي مثل:",
      "yousif.hassan.cashier@lavaza.cafeflow.local",
      "مع إمكانية تعديل الصلاحيات ديناميكيًا.",
    ],
  },
  {
    title: "التقنيات والأدوات",
    icon: "🛠️",
    bullets: [
      "التقنيات: Next.js، React، TypeScript، Node.js، PostgreSQL، Prisma، Auth.js، bcrypt، next-intl.",
      "الأدوات: Visual Studio Code.",
      "أسباب الاختيار: تقليل التعقيد، سرعة التطوير، أداء عالي، دعم أنظمة SaaS.",
    ],
  },
  {
    title: "الخاتمة",
    icon: "🙏",
    bullets: [
      "يمثل نظام CafeFlow حلًا رقميًا متكاملًا لإدارة المقاهي في ليبيا من خلال:",
      "نظام SaaS حديث، دعم تعدد الفروع، نظام اشتراكات، دعم اللغات، دعم وسائل الدفع.",
      "ويمكن تطويره مستقبلًا ليصبح منصة عالمية متكاملة.",
    ],
  },
];

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "CafeFlow Team";
pptx.title = "CafeFlow - Graduation Presentation";
pptx.subject = "SaaS for multi-branch coffee shops";
pptx.company = "Al-Salam International University";
pptx.lang = "ar-SA";

function addFrame(slide, index, total) {
  slide.background = { color: palette.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.12,
    line: { color: palette.primary, pt: 0 },
    fill: { color: palette.primary },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 7.38,
    w: 13.333,
    h: 0.12,
    line: { color: palette.accent, pt: 0 },
    fill: { color: palette.accent },
  });
  slide.addText(`CafeFlow | ${index}/${total}`, {
    x: 10.5,
    y: 7.05,
    w: 2.3,
    h: 0.2,
    fontSize: 9.5,
    color: palette.muted,
    fontFace: "Inter",
    align: "right",
  });
}

function addTitleSlide(totalSlides) {
  const slide = pptx.addSlide();
  addFrame(slide, 1, totalSlides);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.85,
    y: 0.9,
    w: 11.7,
    h: 5.45,
    radius: 0.08,
    line: { color: palette.border, pt: 1 },
    fill: { color: "FFFFFF" },
    shadow: { type: "outer", color: "B6BCC6", blur: 4, angle: 45, distance: 3, opacity: 0.2 },
  });
  slide.addText("🎓 عرض مشروع التخرج", {
    x: 1.2,
    y: 1.35,
    w: 11,
    h: 0.5,
    bold: true,
    fontSize: 24,
    color: palette.accent,
    fontFace: "IBM Plex Sans Arabic",
    align: "right",
    rtlMode: true,
  });
  slide.addText("CafeFlow", {
    x: 1.2,
    y: 2.0,
    w: 11,
    h: 0.8,
    bold: true,
    fontSize: 48,
    color: palette.primary,
    fontFace: "IBM Plex Sans Arabic",
    align: "right",
    rtlMode: true,
  });
  slide.addText("نظام سحابي (SaaS) لإدارة المقاهي متعددة الفروع بنظام الاشتراكات", {
    x: 1.2,
    y: 2.85,
    w: 11,
    h: 0.6,
    fontSize: 21,
    color: palette.text,
    fontFace: "IBM Plex Sans Arabic",
    align: "right",
    rtlMode: true,
  });
  slide.addText(
    "إعداد:\nعمر الأبيض\nمحمد أطلوبة\nسراج العدولي\nمحمد الرملي\nرجب الورفلي",
    {
      x: 1.2,
      y: 3.7,
      w: 4.8,
      h: 2.1,
      fontSize: 15,
      color: palette.text,
      fontFace: "IBM Plex Sans Arabic",
      align: "right",
      rtlMode: true,
      breakLine: true,
      paraSpaceAfterPt: 6,
    },
  );
  slide.addText("إشراف:\nد. المهدي المسماري", {
    x: 6.2,
    y: 4.15,
    w: 2.9,
    h: 1.1,
    fontSize: 15,
    color: palette.text,
    fontFace: "IBM Plex Sans Arabic",
    align: "right",
    rtlMode: true,
    breakLine: true,
  });
  slide.addText("جامعة السلام الدولية\n2025 — 2026", {
    x: 9.2,
    y: 4.15,
    w: 3,
    h: 1.1,
    fontSize: 15,
    color: palette.muted,
    fontFace: "IBM Plex Sans Arabic",
    align: "right",
    rtlMode: true,
    breakLine: true,
  });
}

function addContentSlide({ title, icon, bullets }, index, totalSlides) {
  const slide = pptx.addSlide();
  addFrame(slide, index, totalSlides);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.45,
    y: 0.55,
    w: 12.45,
    h: 6.6,
    radius: 0.08,
    line: { color: palette.border, pt: 1 },
    fill: { color: "FFFFFF" },
    shadow: { type: "outer", color: "B6BCC6", blur: 4, angle: 45, distance: 2, opacity: 0.18 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 0.8,
    w: 11.95,
    h: 0.82,
    radius: 0.05,
    line: { color: palette.softPrimary, pt: 0.5 },
    fill: { color: palette.softPrimary },
  });
  slide.addText(`${icon}  ${title}`, {
    x: 0.95,
    y: 1.03,
    w: 11.45,
    h: 0.4,
    bold: true,
    fontSize: 26,
    color: palette.primary,
    fontFace: "IBM Plex Sans Arabic",
    align: "right",
    rtlMode: true,
  });
  slide.addText(bullets.map((b) => `• ${b}`).join("\n"), {
    x: 1.05,
    y: 1.75,
    w: 11.25,
    h: 5,
    fontSize: 19,
    color: palette.text,
    fontFace: "IBM Plex Sans Arabic",
    align: "right",
    valign: "top",
    rtlMode: true,
    breakLine: true,
    paraSpaceAfterPt: 9,
  });
}

const totalSlides = 17;
addTitleSlide(totalSlides);
slides.forEach((slideData, idx) => addContentSlide(slideData, idx + 2, totalSlides));

await pptx.writeFile({ fileName: outFile });
console.log(`Presentation updated: ${outFile}`);
