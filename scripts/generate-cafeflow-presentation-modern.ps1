$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $projectRoot "presentations"
if (!(Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$outputPath = Join-Path $outputDir "CafeFlow-Modern-UIUX-$timestamp.pptx"

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = -1
$presentation = $pp.Presentations.Add()
$presentation.PageSetup.SlideSize = 16

function HexToRgb([string]$hex) {
  return [convert]::ToInt32($hex.Substring(4, 2) + $hex.Substring(2, 2) + $hex.Substring(0, 2), 16)
}

function AddText {
  param(
    [object]$slide,
    [string]$text,
    [double]$x,
    [double]$y,
    [double]$w,
    [double]$h,
    [int]$size = 22,
    [bool]$bold = $false,
    [string]$color = "0F172A",
    [bool]$rtl = $true
  )
  $shape = $slide.Shapes.AddTextbox(1, $x, $y, $w, $h)
  $shape.TextFrame.TextRange.Text = $text
  $shape.TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
  $shape.TextFrame.TextRange.Font.Size = $size
  $shape.TextFrame.TextRange.Font.Bold = [int]$bold
  $shape.TextFrame.TextRange.Font.Color.RGB = HexToRgb $color
  $shape.TextFrame.TextRange.ParagraphFormat.Alignment = $(if ($rtl) { 3 } else { 1 })
  return $shape
}

function ThemeFrame([object]$slide) {
  $bg = $slide.Shapes.AddShape(1, 0, 0, 960, 540)
  $bg.Fill.ForeColor.RGB = HexToRgb "F8FAFC"
  $bg.Line.Visible = 0
  $bg.ZOrder(5) | Out-Null

  $top = $slide.Shapes.AddShape(1, 0, 0, 960, 12)
  $top.Fill.ForeColor.RGB = HexToRgb "047857"
  $top.Line.Visible = 0

  $bottom = $slide.Shapes.AddShape(1, 0, 528, 960, 12)
  $bottom.Fill.ForeColor.RGB = HexToRgb "F59E0B"
  $bottom.Line.Visible = 0
}

function Transition([object]$slide) {
  try {
    $slide.SlideShowTransition.EntryEffect = 1793
    $slide.SlideShowTransition.Duration = 0.55
  } catch {}
}

function SlideTitle([string]$title, [string]$subtitle) {
  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
  ThemeFrame $slide
  $card = $slide.Shapes.AddShape(1, 55, 70, 850, 390)
  $card.Fill.ForeColor.RGB = HexToRgb "FFFFFF"
  $card.Line.ForeColor.RGB = HexToRgb "E4E4E7"
  $card.Shadow.Visible = -1
  $card.Shadow.Blur = 11
  $card.Shadow.Transparency = 0.78
  AddText -slide $slide -text "☕ $title" -x 90 -y 140 -w 780 -h 70 -size 48 -bold $true -color "047857" | Out-Null
  AddText -slide $slide -text $subtitle -x 90 -y 230 -w 780 -h 70 -size 24 -color "0F172A" | Out-Null
  AddText -slide $slide -text "إعداد الطالب: عمر حسن الأبيض  |  تحت إشراف: أبوبكر شتوان  |  جامعة السلام الدولية 2025 - 2026" -x 95 -y 330 -w 770 -h 40 -size 14 -color "71717A" | Out-Null
  Transition $slide
}

function SlideContent([string]$title, [string]$icon, [string[]]$bullets) {
  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
  ThemeFrame $slide

  $card = $slide.Shapes.AddShape(1, 32, 36, 896, 468)
  $card.Fill.ForeColor.RGB = HexToRgb "FFFFFF"
  $card.Line.ForeColor.RGB = HexToRgb "E4E4E7"
  $card.Shadow.Visible = -1
  $card.Shadow.Blur = 8
  $card.Shadow.Transparency = 0.80

  $titleBg = $slide.Shapes.AddShape(1, 48, 52, 864, 66)
  $titleBg.Fill.ForeColor.RGB = HexToRgb "ECFDF5"
  $titleBg.Line.Visible = 0

  AddText -slide $slide -text "$icon  $title" -x 64 -y 68 -w 832 -h 35 -size 28 -bold $true -color "047857" | Out-Null
  $txt = ($bullets | ForEach-Object { "• $_" }) -join "`r"
  AddText -slide $slide -text $txt -x 72 -y 138 -w 816 -h 330 -size 21 -color "0F172A" | Out-Null
  AddText -slide $slide -text "CafeFlow | Smart Coffee Operations Platform" -x 54 -y 498 -w 840 -h 20 -size 11 -color "71717A" -rtl $false | Out-Null
  Transition $slide
}

SlideTitle "CafeFlow" "عرض مشروع التخرج: منصة SaaS لإدارة المقاهي متعددة الفروع"

$slides = @(
  @{ t = "1) مقدمة"; i = "🚀"; b = @("CafeFlow نظام SaaS سحابي لإدارة وتشغيل المقاهي بشكل احترافي.", "يجمع إدارة الفروع، الطاقم، المنتجات، المخزون، الطلبات، والتقارير في منصة واحدة.", "تم تصميمه ليتوافق مع احتياجات السوق الليبي وقابلية التوسع.") },
  @{ t = "2) مشكلة البحث"; i = "🔍"; b = @("لا يوجد في ليبيا نظام SaaS اشتراكي متكامل للمقاهي متعددة الفروع.", "الحلول المتاحة غالبا محلية أو غير مصممة لعزل بيانات كل عميل بشكل آمن.", "غياب نموذج Multi-Tenant (Tenant Isolation) يسبب مخاطر على الخصوصية والأمان.", "المطلوب منصة موحدة تدعم النمو، وتوفر أداء واستقرارا عاليين.") },
  @{ t = "3) أهداف المشروع"; i = "🎯"; b = @("بناء منصة SaaS اشتراكية حديثة للمقاهي في ليبيا.", "تطبيق Multi-Tenant لعزل بيانات كل كوفي شوب عن الكوفي شوبز الأخرى.", "دعم إدارة عدد كبير من الفروع ضمن نفس النشاط التجاري.", "تحقيق أداء قوي واستقرار تشغيلي مع قابلية التوسع.") },
  @{ t = "4) المنهجية (Methodology)"; i = "🧭"; b = @("دراسة التقنيات المناسبة: Frameworks وقاعدة البيانات والأمان وأنماط SaaS.", "دراسة السوق المحلي واحتياج المقاهي في ليبيا إلى نظام اشتراكات متعدد الفروع.", "تصميم نظام يحل المشكلة الأساسية: غياب نظام SaaS محلي بهذه المواصفات.", "تنفيذ واختبار النظام مع ضمان الأداء والاستقرار.") },
  @{ t = "5) منهجية التطوير (Iterative Model)"; i = "🔁"; b = @("تطوير النظام على مراحل متتالية (Iteration by Iteration).", "اختبار كل مرحلة بشكل مستقل قبل الانتقال للمرحلة التالية.", "تحسين الأداء تدريجيا بعد كل دورة تطوير.", "تقليل الأخطاء والمخاطر عبر التسليم المرحلي.") },
  @{ t = "6) التقنيات الأساسية المستخدمة"; i = "⚙️"; b = @("Next.js 16 + React 19 لبناء تطبيق Full-Stack حديث.", "TypeScript لرفع جودة الكود وتقليل أخطاء وقت التشغيل.", "Prisma ORM + PostgreSQL لإدارة البيانات والعلاقات المعقدة.", "Tailwind CSS لبناء واجهة سريعة ومرنة.") },
  @{ t = "7) شرح التقنيات ولماذا استخدمناها"; i = "🧠"; b = @("Next.js: يجمع الواجهة والخادم في مشروع واحد ويقلل تعقيد البنية.", "Prisma: يوفر Type Safety وعمليات ORM واضحة وسهلة الصيانة.", "PostgreSQL: قوي في العلاقات والمعاملات ومناسب لتطبيقات SaaS.", "TypeScript: يقلل أخطاء وقت التشغيل ويرفع موثوقية الكود.") },
  @{ t = "8) أدوات التطوير والمحرر"; i = "🛠️"; b = @("المحرر المستخدم: Visual Studio Code (VSCode).", "VSCode: خفيف، سريع، يدعم TypeScript وNext.js وعمليات Debugging بمرونة.", "ESLint: لاكتشاف المشاكل مبكرا والحفاظ على جودة الكود.", "Prisma CLI: لإدارة Schema وMigrations والتحقق من صحة النموذج.") },
  @{ t = "9) لماذا هذه الأدوات تحديدا؟ (خلاصة)"; i = "✅"; b = @("تسريع التطوير مع الحفاظ على جودة هندسية عالية.", "سهولة الصيانة والتوسعة في المراحل المستقبلية.", "تكامل ممتاز بين الأدوات ضمن بيئة عمل واحدة.", "ملاءمة قوية لمتطلبات مشروع SaaS متعدد المستأجرين.") },
  @{ t = "10) Multi-Tenant وتعدد الفروع"; i = "🏢"; b = @("كل كوفي شوب له مساحة بيانات مستقلة تماما عن الآخرين.", "تطبيق مبدأ Tenant Isolation في القراءة والكتابة والصلاحيات.", "دعم إدارة عدة فروع داخل نفس النشاط التجاري.", "إدارة المستخدمين والأدوار حسب الفرع أو على مستوى النشاط بالكامل.") },
  @{ t = "11) ضمان الأداء والاستقرار"; i = "📈"; b = @("تنفيذ اختبارات وظيفية لكل مرحلة تطوير.", "تقليل أخطاء العزل والصلاحيات عبر التحقق الخادمي.", "تحسين الاستعلامات وتدفق العمليات تدريجيا.", "الاعتماد على PostgreSQL + Prisma للثبات في العمليات الحرجة.") },
  @{ t = "12) النتائج المتوقعة"; i = "🌟"; b = @("توفير نموذج عملي قوي لنظام SaaS مقاهي في السوق الليبي.", "إدارة موحدة للفروع والموظفين والطلبات والمخزون.", "رفع كفاءة التشغيل وتقليل الهدر والأخطاء الإدارية.", "قاعدة تقنية جاهزة للتوسع التجاري وربط خدمات إضافية مستقبلا.") },
  @{ t = "13) خاتمة"; i = "🙏"; b = @("CafeFlow ليس مجرد تطبيق إدارة، بل أساس منصة SaaS قابلة للتوسع.", "المشروع يعالج مشكلة حقيقية في السوق المحلي بمنهجية هندسية واضحة.", "تم التصميم والتنفيذ والاختبار على مراحل لضمان الجودة.", "شكرا لكم - أسئلة واستفسارات.") }
)

foreach ($s in $slides) {
  SlideContent $s.t $s.i $s.b
}

$presentation.SaveAs($outputPath)
$presentation.Close()
$pp.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null
[GC]::Collect()
[GC]::WaitForPendingFinalizers()
Write-Output "Presentation created: $outputPath"
