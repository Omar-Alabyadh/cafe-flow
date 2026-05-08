$ErrorActionPreference = "Stop"

$outputDir = Join-Path $PSScriptRoot "..\docs\presentations"
$outputDir = [System.IO.Path]::GetFullPath($outputDir)
$outputFile = Join-Path $outputDir "CafeFlow_Graduation_Presentation_AR.pptx"

if (-not (Test-Path -Path $outputDir)) {
  New-Item -Path $outputDir -ItemType Directory | Out-Null
}

$slidesData = @(
  @{
    Title = "CafeFlow"
    Subtitle = "نظام إدارة وتشغيل المقاهي متعدد الفروع"
    Footer = "إعداد الطالب: عمر حسن الأبيض`nإشراف: أبوبكر شتوان`nجامعة السلام الدولية | 2025 - 2026"
  },
  @{
    Title = "محتوى العرض (10 دقائق)"
    Bullets = @(
      "1) خلفية المشكلة وأهداف المشروع",
      "2) الفكرة العامة والحل المقترح",
      "3) المعمارية والتقنيات المستخدمة",
      "4) الوحدات الأساسية داخل النظام",
      "5) الأمان والعزل بين المنشآت (Multi-Tenant)",
      "6) نموذج العمل: الاشتراكات والباقات",
      "7) تجربة المستخدم وسيناريو تشغيل فعلي",
      "8) النتائج، القيود الحالية، وخطة التطوير"
    )
  },
  @{
    Title = "المشكلة التي يعالجها المشروع"
    Bullets = @(
      "إدارة المقهى غالبا موزعة بين أدوات منفصلة (طلبات، مخزون، تقارير).",
      "ضعف الربط بين المبيعات واستهلاك المواد الخام يسبب هدر وصعوبة متابعة الربحية.",
      "الصلاحيات بين العاملين غير واضحة في كثير من الأنظمة التقليدية.",
      "المقاهي متعددة الفروع تحتاج لوحة موحدة مع عزل بيانات آمن لكل منشأة."
    )
  },
  @{
    Title = "الحل المقترح: CafeFlow"
    Bullets = @(
      "منصة SaaS لإدارة التشغيل اليومي للمقهى من نقطة بيع حتى التقارير.",
      "ترابط مباشر بين المنتجات والوصفات والمخزون وحركات الاستهلاك.",
      "نظام أدوار وصلاحيات مرن حسب الوظيفة ونطاق الفرع.",
      "بنية متعددة المستأجرين (Multi-Tenant) لدعم عدة منشآت داخل نفس المنصة."
    )
  },
  @{
    Title = "المعمارية والتقنيات"
    Bullets = @(
      "الواجهة والتطبيق: Next.js + React + TypeScript.",
      "البيانات: PostgreSQL عبر Prisma ORM.",
      "المصادقة: NextAuth مع إدارة جلسات المستخدمين.",
      "التصميم وتجربة الاستخدام: Tailwind CSS + مكونات تفاعلية.",
      "التدويل (i18n): دعم العربية والإنجليزية داخل النظام."
    )
  },
  @{
    Title = "الوحدات الأساسية في النظام"
    Bullets = @(
      "المنتجات والتصنيفات والإضافات (Catalog).",
      "الوصفات والمواد الخام ووحدات القياس والموردون.",
      "المخزون، حركات المخزون، واستهلاك المنتجات.",
      "نقطة البيع (POS) وإدارة الطلبات.",
      "إدارة الطاقم والفروع والتقارير التشغيلية."
    )
  },
  @{
    Title = "الأدوار والصلاحيات"
    Bullets = @(
      "أدوار متعددة مثل: مالك، مدير، محاسب، كاشير، باريستا، مخزن، مشتريات.",
      "مصفوفة صلاحيات لكل دور (Role Permission Matrix).",
      "نطاق وصول مرن: كل الفروع / فرع محدد / نطاق محدود.",
      "التحقق يتم على مستوى الخادم وليس فقط من الواجهة."
    )
  },
  @{
    Title = "أمان المنصة وعزل البيانات (Tenant Isolation)"
    Bullets = @(
      "كل عملية قراءة/تعديل تربط بالسياق الموثوق للمنشأة (businessId).",
      "عدم الوثوق بأي businessId قادم من العميل بدون تحقق عضوية فعلي.",
      "فصل واضح بين مسارات منصة المشغل ومسارات مستخدمي المنشآت.",
      "الحماية تعتمد على route guards + server actions وليس إخفاء عناصر الواجهة فقط."
    )
  },
  @{
    Title = "نموذج العمل: الباقات والاشتراكات"
    Bullets = @(
      "ثلاث باقات تشغيلية: Basic / Pro / Business.",
      "حدود قابلة للضبط لعدد الفروع وعدد الموظفين حسب الباقة.",
      "حالات اشتراك واضحة: Trialing / Active / Pending Payment / Expired.",
      "قابلية التوسع من مقهى صغير إلى سلسلة فروع."
    )
  },
  @{
    Title = "سيناريو تشغيل مختصر داخل النظام"
    Bullets = @(
      "1) إنشاء منشأة وفرع وربط الطاقم بالأدوار.",
      "2) تعريف المنتجات والمواد الخام والوصفات.",
      "3) تنفيذ طلب عبر POS أو شاشة الطلبات.",
      "4) عند إكمال الطلب يتم احتساب الاستهلاك وتحديث المخزون.",
      "5) متابعة الأداء عبر التقارير (المبيعات، الأكثر مبيعا، ونقاط النقص)."
    )
  },
  @{
    Title = "النتائج الحالية والقيمة المضافة"
    Bullets = @(
      "توحيد دورة العمل التشغيلية في نظام واحد بدلا من أدوات متفرقة.",
      "تحسين وضوح المسؤوليات والصلاحيات داخل فريق العمل.",
      "رفع دقة متابعة المواد الخام وتقليل الفاقد المتوقع.",
      "تهيئة المشروع لمرحلة إنتاجية بتركيز واضح على الأمان متعدد المستأجرين."
    )
  },
  @{
    Title = "القيود الحالية وخطة التطوير"
    Bullets = @(
      "المخزون والطلبات حاليا على مستوى business بشكل أساسي.",
      "التطوير القادم: دعم أدق لتفصيل المبيعات والمخزون لكل فرع.",
      "إضافة لوحات تحليل أعمق ومؤشرات أداء KPI أكثر تفصيلا.",
      "التوسع في الأتمتة والتنبيهات وربط وسائل دفع إضافية."
    )
  },
  @{
    Title = "الخاتمة"
    Bullets = @(
      "CafeFlow يقدم أساسا قويا لإدارة المقاهي الحديثة بشكل آمن وقابل للتوسع.",
      "المشروع يجمع بين التشغيل اليومي والتحكم الإداري ضمن منصة واحدة.",
      "شكرا لحسن الاستماع.",
      "الأسئلة والملاحظات مرحب بها."
    )
  }
)

function Add-RightAlignedTextBox {
  param(
    [Parameter(Mandatory = $true)] $Slide,
    [Parameter(Mandatory = $true)] [string] $Text,
    [double] $Left = 50,
    [double] $Top = 140,
    [double] $Width = 860,
    [double] $Height = 360,
    [int] $FontSize = 26,
    [bool] $Bold = $false
  )

  # 1 = msoTextOrientationHorizontal
  $shape = $Slide.Shapes.AddTextbox(1, $Left, $Top, $Width, $Height)
  $shape.TextFrame.TextRange.Text = $Text
  $shape.TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
  $shape.TextFrame.TextRange.Font.Size = $FontSize
  $shape.TextFrame.TextRange.Font.Bold = [int]$Bold
  # 3 = ppAlignRight
  $shape.TextFrame.TextRange.ParagraphFormat.Alignment = 3
  return $shape
}

$theme = @{
  Background = 0xFAF8F8  # #F8FAFC
  Foreground = 0x2A170F  # #0F172A
  Primary    = 0x577804  # #047857
  Accent     = 0x0B9EF5  # #F59E0B
  Muted      = 0xF5F4F4  # #F4F4F5
}

function Apply-CafeFlowVisualStyle {
  param([Parameter(Mandatory = $true)] $Slide)

  $slideW = $presentation.PageSetup.SlideWidth
  $slideH = $presentation.PageSetup.SlideHeight

  $Slide.Background.Fill.Solid()
  $Slide.Background.Fill.ForeColor.RGB = $theme.Background

  $topBar = $Slide.Shapes.AddShape(1, 0, 0, $slideW, 18)
  $topBar.Fill.Solid()
  $topBar.Fill.ForeColor.RGB = $theme.Primary
  $topBar.Line.Visible = 0

  $accent = $Slide.Shapes.AddShape(1, 0, 18, $slideW, 4)
  $accent.Fill.Solid()
  $accent.Fill.ForeColor.RGB = $theme.Accent
  $accent.Line.Visible = 0

  $decor = $Slide.Shapes.AddShape(9, $slideW - 64, 30, 34, 34)
  $decor.Fill.Solid()
  $decor.Fill.ForeColor.RGB = $theme.Primary
  $decor.Line.Visible = 0

  $coffeeIcon = $Slide.Shapes.AddTextbox(1, $slideW - 57, 35, 20, 20)
  $coffeeIcon.TextFrame.TextRange.Text = "☕"
  $coffeeIcon.TextFrame.TextRange.Font.Name = "Segoe UI Emoji"
  $coffeeIcon.TextFrame.TextRange.Font.Size = 13
  $coffeeIcon.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF

  $footer = $Slide.Shapes.AddTextbox(1, 22, $slideH - 23, 320, 14)
  $footer.TextFrame.TextRange.Text = "CafeFlow  |  Coffee Operations OS"
  $footer.TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
  $footer.TextFrame.TextRange.Font.Size = 9
  $footer.TextFrame.TextRange.Font.Color.RGB = $theme.Primary

  try {
    # Soft fade transition on slide show
    $Slide.SlideShowTransition.EntryEffect = 3849
  } catch {}
}

$powerPoint = $null
$presentation = $null

try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $powerPoint.Visible = $true

  $presentation = $powerPoint.Presentations.Add()

  foreach ($slideInfo in $slidesData) {
    # 12 = ppLayoutBlank
    $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
    Apply-CafeFlowVisualStyle -Slide $slide

    $titleShape = Add-RightAlignedTextBox -Slide $slide -Text $slideInfo.Title -Top 35 -Height 80 -FontSize 38 -Bold $true
    $titleShape.TextFrame.TextRange.Font.Color.RGB = $theme.Primary

    if ($slideInfo.ContainsKey("Subtitle")) {
      Add-RightAlignedTextBox -Slide $slide -Text $slideInfo.Subtitle -Top 140 -Height 90 -FontSize 28 | Out-Null
    }

    if ($slideInfo.ContainsKey("Bullets")) {
      $bulletText = ($slideInfo.Bullets | ForEach-Object { "• $_" }) -join "`r`n"
      $bulletShape = Add-RightAlignedTextBox -Slide $slide -Text $bulletText -Top 130 -Height 380 -FontSize 24
      $bulletShape.TextFrame.TextRange.Font.Color.RGB = $theme.Foreground
    }

    if ($slideInfo.ContainsKey("Footer")) {
      $footer = Add-RightAlignedTextBox -Slide $slide -Text $slideInfo.Footer -Top 300 -Height 180 -FontSize 22
      $footer.TextFrame.TextRange.Font.Color.RGB = $theme.Foreground
    }
  }

  # 24 = ppSaveAsOpenXMLPresentation
  $presentation.SaveAs($outputFile, 24)
  Write-Output "Presentation generated at: $outputFile"
}
finally {
  if ($presentation -ne $null) {
    $presentation.Close()
  }
  if ($powerPoint -ne $null) {
    $powerPoint.Quit()
  }
}
