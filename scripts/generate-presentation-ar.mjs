import fs from "node:fs";
import path from "node:path";
import PptxGenJS from "pptxgenjs";

const outDir = path.resolve("docs", "presentations");
const outFile = path.join(outDir, "CafeFlow_Graduation_Presentation_AR.pptx");

fs.mkdirSync(outDir, { recursive: true });

const slides = [
  {
    title: "CafeFlow",
    bullets: [
      "نظام إدارة وتشغيل المقاهي متعدد الفروع",
      "إعداد الطالب: عمر حسن الأبيض",
      "تحت إشراف: أبوبكر شتوان",
      "جامعة السلام الدولية | 2025 - 2026",
    ],
  },
  {
    title: "محتوى العرض (10 دقائق)",
    bullets: [
      "خلفية المشكلة وأهداف المشروع",
      "الفكرة العامة والحل المقترح",
      "المعمارية والتقنيات المستخدمة",
      "الوحدات الأساسية داخل النظام",
      "الأمان والعزل بين المنشآت",
      "نموذج العمل والباقات",
      "سيناريو تشغيل فعلي",
      "النتائج، القيود، وخطة التطوير",
    ],
  },
  {
    title: "المشكلة التي يعالجها المشروع",
    bullets: [
      "تشتت إدارة المقهى بين أنظمة منفصلة (طلبات، مخزون، تقارير).",
      "ضعف الربط بين المبيعات واستهلاك المواد الخام يسبب فاقدا وصعوبة متابعة الربحية.",
      "غياب صلاحيات دقيقة حسب دور كل موظف.",
      "الحاجة إلى إدارة متعددة الفروع مع حماية قوية للبيانات.",
    ],
  },
  {
    title: "الحل المقترح: CafeFlow",
    bullets: [
      "منصة SaaS موحدة لإدارة التشغيل اليومي للمقهى.",
      "ربط متكامل بين المنتجات والوصفات والمخزون والطلبات.",
      "نظام أدوار وصلاحيات مرن حسب الدور ونطاق الفرع.",
      "بنية Multi-Tenant لدعم عدة منشآت داخل منصة واحدة بأمان.",
    ],
  },
  {
    title: "المعمارية والتقنيات",
    bullets: [
      "التطبيق: Next.js + React + TypeScript.",
      "قاعدة البيانات: PostgreSQL عبر Prisma ORM.",
      "المصادقة وإدارة الجلسات: NextAuth.",
      "واجهة المستخدم: Tailwind CSS مع مكونات تفاعلية.",
      "التدويل: دعم العربية والإنجليزية.",
    ],
  },
  {
    title: "الوحدات الأساسية في النظام",
    bullets: [
      "المنتجات، التصنيفات، والإضافات.",
      "الوصفات، المواد الخام، وحدات القياس، والموردون.",
      "المخزون، حركات المخزون، واستهلاك المنتجات.",
      "نقطة البيع (POS) وإدارة الطلبات.",
      "إدارة الفروع، الطاقم، والتقارير.",
    ],
  },
  {
    title: "الأدوار والصلاحيات",
    bullets: [
      "أدوار متعددة: مالك، مدير، محاسب، كاشير، باريستا، مخزن، مشتريات.",
      "مصفوفة صلاحيات واضحة لكل دور (Role Permission Matrix).",
      "نطاق وصول مرن: كل الفروع أو فرع محدد أو نطاق محدود.",
      "التحقق الأمني يتم على مستوى الخادم وليس الواجهة فقط.",
    ],
  },
  {
    title: "أمان المنصة وعزل البيانات",
    bullets: [
      "كل عملية قراءة/تعديل مرتبطة بسياق منشأة موثوق (businessId).",
      "عدم الثقة في businessId القادم من العميل بدون تحقق عضوية.",
      "فصل كامل بين مسارات مشغل المنصة ومسارات مستخدمي المنشآت.",
      "الحماية عبر route guards و server actions وليس إخفاء الواجهة فقط.",
    ],
  },
  {
    title: "نموذج العمل: الباقات والاشتراكات",
    bullets: [
      "باقات: Basic و Pro و Business.",
      "حدود مختلفة لعدد الفروع والموظفين حسب الباقة.",
      "حالات اشتراك واضحة: Trialing و Active و Pending Payment و Expired.",
      "مرونة نمو من مقهى صغير إلى سلسلة فروع.",
    ],
  },
  {
    title: "سيناريو تشغيل مختصر",
    bullets: [
      "1) إنشاء منشأة وفرع وربط الطاقم بالأدوار.",
      "2) تعريف المنتجات والوصفات والمواد الخام.",
      "3) تسجيل طلب عبر POS أو شاشة الطلبات.",
      "4) عند إكمال الطلب يتم تحديث الاستهلاك والمخزون تلقائيا.",
      "5) متابعة الأداء عبر التقارير التشغيلية.",
    ],
  },
  {
    title: "النتائج الحالية والقيمة المضافة",
    bullets: [
      "توحيد دورة العمل التشغيلية في نظام واحد.",
      "تحسين وضوح الصلاحيات والمسؤوليات داخل الفريق.",
      "رفع دقة تتبع المواد الخام وتقليل الفاقد.",
      "أساس قوي للتوسع مع أمان متعدد المستأجرين.",
    ],
  },
  {
    title: "القيود الحالية وخطة التطوير",
    bullets: [
      "الطلبات والمخزون حاليا متمركزة غالبا على مستوى المنشأة.",
      "المرحلة القادمة: دعم أدق للتتبع على مستوى كل فرع.",
      "إضافة مؤشرات KPI وتحليلات أعمق للقرار الإداري.",
      "توسيع الأتمتة والتنبيهات وربط خيارات دفع إضافية.",
    ],
  },
  {
    title: "الخاتمة",
    bullets: [
      "CafeFlow يوفر أساسا متينا لإدارة المقاهي بشكل حديث وآمن.",
      "المشروع يجمع التشغيل اليومي والتحكم الإداري في منصة واحدة.",
      "شكرا لحسن الاستماع.",
      "الأسئلة والملاحظات مرحب بها.",
    ],
  },
];

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Omar Hassan Al-Abyad";
pptx.company = "Al-Salam International University";
pptx.subject = "CafeFlow Graduation Project";
pptx.title = "CafeFlow Graduation Presentation (Arabic)";
pptx.lang = "ar-SA";

for (const { title, bullets } of slides) {
  const slide = pptx.addSlide();
  slide.background = { color: "F8FAFC" };

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.3,
    y: 0.2,
    w: 12.7,
    h: 0.9,
    line: { color: "2E75B6", pt: 1 },
    fill: { color: "EAF2FB" },
    radius: 0.08,
  });

  slide.addText(title, {
    x: 0.6,
    y: 0.35,
    w: 12.1,
    h: 0.5,
    fontSize: 28,
    bold: true,
    color: "1F3A5F",
    align: "right",
    rtlMode: true,
    fontFace: "Arial",
  });

  const lines = bullets.map((b) => `• ${b}`).join("\n");
  slide.addText(lines, {
    x: 0.8,
    y: 1.4,
    w: 11.8,
    h: 5.4,
    fontSize: 20,
    color: "1F2937",
    align: "right",
    valign: "top",
    rtlMode: true,
    breakLine: true,
    fontFace: "Arial",
    margin: 3,
    paraSpaceAfterPt: 12,
    lineSpacingMultiple: 1.15,
  });
}

await pptx.writeFile({ fileName: outFile });
console.log(`Presentation generated at: ${outFile}`);
