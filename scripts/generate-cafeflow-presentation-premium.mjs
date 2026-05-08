import fs from "node:fs";
import path from "node:path";
import PptxGenJS from "pptxgenjs";

const outDir = path.resolve("presentations");
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace("T", "-")
  .slice(0, 13);

const themes = {
  light: {
    bg: "F8FAFC",
    surface: "FFFFFF",
    text: "0F172A",
    muted: "71717A",
    border: "E4E4E7",
    primary: "047857",
    accent: "F59E0B",
    soft: "ECFDF5",
    file: `CafeFlow-Premium-Light-${stamp}.pptx`,
  },
  dark: {
    bg: "0C0C0F",
    surface: "141417",
    text: "F4F4F5",
    muted: "B0B0BA",
    border: "45454E",
    primary: "10B981",
    accent: "FBBF24",
    soft: "1E1E22",
    file: `CafeFlow-Premium-Dark-${stamp}.pptx`,
  },
};

const sections = [
  {
    title: "1) مقدمة",
    icon: "🚀",
    bullets: [
      "CafeFlow نظام SaaS سحابي لإدارة وتشغيل المقاهي بشكل احترافي.",
      "يجمع إدارة الفروع، الطاقم، المنتجات، المخزون، الطلبات، والتقارير في منصة واحدة.",
      "تم تصميمه ليتوافق مع احتياجات السوق الليبي وقابلية التوسع.",
    ],
  },
  {
    title: "2) مشكلة البحث",
    icon: "🔍",
    bullets: [
      "لا يوجد في ليبيا نظام SaaS اشتراكي متكامل للمقاهي متعددة الفروع.",
      "الحلول المتاحة غالبا محلية أو غير مصممة لعزل بيانات كل عميل بشكل آمن.",
      "غياب نموذج Multi-Tenant (Tenant Isolation) يسبب مخاطر على الخصوصية والأمان.",
      "المطلوب منصة موحدة تدعم النمو وتوفر أداء واستقرارا عاليين.",
    ],
  },
  {
    title: "3) أهداف المشروع",
    icon: "🎯",
    bullets: [
      "بناء منصة SaaS اشتراكية حديثة للمقاهي في ليبيا.",
      "تطبيق Multi-Tenant لعزل بيانات كل كوفي شوب عن غيره.",
      "دعم إدارة عدد كبير من الفروع ضمن نفس النشاط التجاري.",
      "تحقيق أداء قوي واستقرار تشغيلي مع قابلية التوسع.",
    ],
  },
  {
    title: "4) المنهجية (Methodology)",
    icon: "🧭",
    bullets: [
      "دراسة التقنيات المناسبة: Frameworks وقاعدة البيانات والأمان وأنماط SaaS.",
      "دراسة السوق المحلي واحتياج المقاهي في ليبيا إلى نظام اشتراكات متعدد الفروع.",
      "تصميم نظام يحل المشكلة الأساسية: غياب نظام SaaS محلي بهذه المواصفات.",
      "تنفيذ واختبار النظام مع ضمان الأداء والاستقرار.",
    ],
  },
  {
    title: "5) منهجية التطوير (Iterative Model)",
    icon: "🔁",
    bullets: [
      "تطوير النظام على مراحل متتالية.",
      "اختبار كل مرحلة بشكل مستقل قبل الانتقال للمرحلة التالية.",
      "تحسين الأداء تدريجيا بعد كل دورة تطوير.",
      "تقليل الأخطاء والمخاطر عبر التسليم المرحلي.",
    ],
  },
  {
    title: "6) التقنيات والأدوات",
    icon: "⚙️",
    bullets: [
      "Next.js + React + TypeScript لبناء تطبيق Full-Stack حديث.",
      "Prisma ORM + PostgreSQL لإدارة البيانات والعلاقات.",
      "Tailwind CSS + VSCode + ESLint + Prisma CLI.",
      "اختيار الأدوات ركز على السرعة والجودة وقابلية الصيانة.",
    ],
  },
  {
    title: "7) النتائج المتوقعة",
    icon: "🌟",
    bullets: [
      "نموذج SaaS عملي يخدم سوق المقاهي الليبي.",
      "إدارة موحدة للفروع والموظفين والطلبات والمخزون.",
      "تحسين الكفاءة وتقليل الهدر والأخطاء التشغيلية.",
      "جاهزية للتوسع التجاري وربط خدمات إضافية مستقبلا.",
    ],
  },
  {
    title: "8) خاتمة",
    icon: "🙏",
    bullets: [
      "CafeFlow أساس منصة SaaS قابلة للتوسع.",
      "المشروع يعالج مشكلة حقيقية بمنهجية هندسية واضحة.",
      "تم التصميم والتنفيذ والاختبار على مراحل لضمان الجودة.",
      "شكرا لكم - أسئلة واستفسارات.",
    ],
  },
];

function addMasterFrame(pptx, slide, palette, slideIndex, totalSlides) {
  slide.background = { color: palette.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.1,
    line: { color: palette.primary, pt: 0 },
    fill: { color: palette.primary },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 7.4,
    w: 13.333,
    h: 0.1,
    line: { color: palette.accent, pt: 0 },
    fill: { color: palette.accent },
  });
  slide.addText("CafeFlow Premium", {
    x: 0.6,
    y: 7.05,
    w: 3.6,
    h: 0.2,
    fontFace: "Inter",
    fontSize: 9,
    color: palette.muted,
    align: "left",
  });
  slide.addText(`${slideIndex}/${totalSlides}`, {
    x: 11.8,
    y: 7.05,
    w: 1.0,
    h: 0.2,
    fontFace: "Inter",
    fontSize: 9,
    color: palette.muted,
    align: "right",
  });
}

function addCover(pptx, palette, totalSlides) {
  const slide = pptx.addSlide();
  addMasterFrame(pptx, slide, palette, 1, totalSlides);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.9, y: 1.1, w: 11.5, h: 4.7, radius: 0.08,
    line: { color: palette.border, pt: 1 },
    fill: { color: palette.surface },
    shadow: { type: "outer", color: "000000", blur: 4, angle: 45, distance: 2, opacity: 0.18 },
  });
  slide.addText("☕ CafeFlow", {
    x: 1.3, y: 2.0, w: 10.7, h: 0.8, fontFace: "IBM Plex Sans Arabic",
    fontSize: 44, bold: true, color: palette.primary, align: "right", rtlMode: true,
  });
  slide.addText("عرض مشروع التخرج - النسخة Premium", {
    x: 1.3, y: 2.95, w: 10.7, h: 0.6, fontFace: "IBM Plex Sans Arabic",
    fontSize: 22, color: palette.text, align: "right", rtlMode: true,
  });
  slide.addText("إعداد الطالب: عمر حسن الأبيض | تحت إشراف: أبوبكر شتوان | جامعة السلام الدولية 2025 - 2026", {
    x: 1.35, y: 4.05, w: 10.6, h: 0.45, fontFace: "IBM Plex Sans Arabic",
    fontSize: 12.5, color: palette.muted, align: "right", rtlMode: true,
  });
}

function addAgendaTimeline(pptx, palette, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  addMasterFrame(pptx, slide, palette, slideNumber, totalSlides);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.6, y: 0.55, w: 12.1, h: 6.5, radius: 0.06,
    line: { color: palette.border, pt: 1 },
    fill: { color: palette.surface },
  });
  slide.addText("🗺️ Agenda - مخطط العرض", {
    x: 0.95, y: 0.85, w: 11.4, h: 0.5, fontFace: "IBM Plex Sans Arabic",
    fontSize: 26, bold: true, color: palette.primary, align: "right", rtlMode: true,
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 1.3, y: 2.0, w: 10.7, h: 0,
    line: { color: palette.border, pt: 2, beginArrowType: "none", endArrowType: "triangle" },
  });

  const timelineItems = [
    "المشكلة",
    "الأهداف",
    "المنهجية",
    "التطوير التكراري",
    "التقنيات",
    "النتائج",
  ];

  timelineItems.forEach((item, idx) => {
    const x = 1.3 + idx * 1.75;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x - 0.09, y: 1.91, w: 0.18, h: 0.18,
      line: { color: palette.primary, pt: 1 },
      fill: { color: idx % 2 === 0 ? palette.primary : palette.accent },
    });
    slide.addText(item, {
      x: x - 0.55, y: 2.2, w: 1.1, h: 0.35,
      fontFace: "IBM Plex Sans Arabic",
      fontSize: 12,
      color: palette.text,
      align: "center",
      rtlMode: true,
    });
  });

  slide.addText("المدة: 10 دقائق - عرض سريع ومركز", {
    x: 0.95, y: 5.9, w: 11.2, h: 0.35,
    fontFace: "IBM Plex Sans Arabic", fontSize: 13, color: palette.muted, align: "right", rtlMode: true,
  });
}

function addContentSlide(pptx, palette, section, slideNumber, totalSlides) {
  const slide = pptx.addSlide();
  addMasterFrame(pptx, slide, palette, slideNumber, totalSlides);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55, y: 0.5, w: 12.2, h: 6.6, radius: 0.06,
    line: { color: palette.border, pt: 1 },
    fill: { color: palette.surface },
    shadow: { type: "outer", color: "000000", blur: 3, angle: 45, distance: 2, opacity: 0.12 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.85, y: 0.75, w: 11.6, h: 0.75, radius: 0.05,
    line: { color: palette.soft, pt: 0.5 },
    fill: { color: palette.soft },
  });

  slide.addText(`${section.icon}  ${section.title}`, {
    x: 1.05, y: 0.98, w: 11.2, h: 0.38,
    fontFace: "IBM Plex Sans Arabic", fontSize: 25, bold: true,
    color: palette.primary, align: "right", rtlMode: true,
  });

  slide.addText(section.bullets.map((b) => `• ${b}`).join("\n"), {
    x: 1.1, y: 1.8, w: 11.1, h: 4.9,
    fontFace: "IBM Plex Sans Arabic", fontSize: 20, color: palette.text,
    align: "right", valign: "top", rtlMode: true, breakLine: true, paraSpaceAfterPt: 11,
  });
}

async function buildDeck(mode, palette) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Omar Hassan Al-Abyad";
  pptx.company = "Al-Salam International University";
  pptx.subject = `CafeFlow Premium ${mode}`;
  pptx.title = `CafeFlow Premium ${mode}`;
  pptx.lang = "ar-SA";

  const totalSlides = 1 + 1 + sections.length;
  addCover(pptx, palette, totalSlides);
  addAgendaTimeline(pptx, palette, 2, totalSlides);
  sections.forEach((section, idx) => addContentSlide(pptx, palette, section, idx + 3, totalSlides));

  const filePath = path.join(outDir, palette.file);
  await pptx.writeFile({ fileName: filePath });
  return filePath;
}

const lightFile = await buildDeck("Light", themes.light);
const darkFile = await buildDeck("Dark", themes.dark);
console.log(`Created: ${lightFile}`);
console.log(`Created: ${darkFile}`);
