$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $projectRoot "presentations"
if (!(Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$outputPath = Join-Path $outputDir "CafeFlow-Full-Presentation-$timestamp.pptx"

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = -1
$presentation = $pp.Presentations.Add()
$presentation.PageSetup.SlideSize = 16

function Convert-HexToRgbInt {
  param([string]$Hex)
  return [convert]::ToInt32($Hex.Substring(4, 2) + $Hex.Substring(2, 2) + $Hex.Substring(0, 2), 16)
}

function Add-StyledText {
  param(
    [object]$Slide,
    [string]$Text,
    [double]$Left,
    [double]$Top,
    [double]$Width,
    [double]$Height,
    [int]$Size = 22,
    [bool]$Bold = $false,
    [string]$ColorHex = "0F172A",
    [bool]$RightAlign = $true
  )
  $shape = $Slide.Shapes.AddTextbox(1, $Left, $Top, $Width, $Height)
  $shape.TextFrame.TextRange.Text = $Text
  $shape.TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
  $shape.TextFrame.TextRange.Font.Size = $Size
  $shape.TextFrame.TextRange.Font.Bold = [int]$Bold
  $shape.TextFrame.TextRange.Font.Color.RGB = Convert-HexToRgbInt $ColorHex
  if ($RightAlign) {
    $shape.TextFrame.TextRange.ParagraphFormat.Alignment = 3
  } else {
    $shape.TextFrame.TextRange.ParagraphFormat.Alignment = 1
  }
  return $shape
}

function Apply-ThemeFrame {
  param([object]$Slide)

  $bg = $Slide.Shapes.AddShape(1, 0, 0, 960, 540)
  $bg.Fill.ForeColor.RGB = Convert-HexToRgbInt "F8FAFC"
  $bg.Line.Visible = 0
  $bg.ZOrder(5) | Out-Null

  $top = $Slide.Shapes.AddShape(1, 0, 0, 960, 12)
  $top.Fill.ForeColor.RGB = Convert-HexToRgbInt "047857"
  $top.Line.Visible = 0

  $bottom = $Slide.Shapes.AddShape(1, 0, 528, 960, 12)
  $bottom.Fill.ForeColor.RGB = Convert-HexToRgbInt "F59E0B"
  $bottom.Line.Visible = 0
}

function Set-SlideTransition {
  param([object]$Slide)
  try {
    $Slide.SlideShowTransition.EntryEffect = 1793
    $Slide.SlideShowTransition.Duration = 0.55
  } catch {}
}

function Add-TitleSlide {
  param([string]$Title, [string]$Subtitle)

  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
  Apply-ThemeFrame -Slide $slide

  $hero = $slide.Shapes.AddShape(1, 55, 70, 850, 390)
  $hero.Fill.ForeColor.RGB = Convert-HexToRgbInt "FFFFFF"
  $hero.Line.ForeColor.RGB = Convert-HexToRgbInt "E4E4E7"
  $hero.Shadow.Visible = -1
  $hero.Shadow.Blur = 11
  $hero.Shadow.Transparency = 0.78

  Add-StyledText -Slide $slide -Text "☕ $Title" -Left 90 -Top 140 -Width 780 -Height 70 -Size 48 -Bold $true -ColorHex "047857" | Out-Null
  Add-StyledText -Slide $slide -Text $Subtitle -Left 90 -Top 230 -Width 780 -Height 70 -Size 24 -ColorHex "0F172A" | Out-Null
  Add-StyledText -Slide $slide -Text "إعداد الطالب: عمر حسن الأبيض  |  تحت إشراف: أبوبكر شتوان  |  جامعة السلام الدولية 2025 - 2026" -Left 95 -Top 330 -Width 770 -Height 40 -Size 14 -ColorHex "71717A" | Out-Null
  Set-SlideTransition -Slide $slide
}

function Add-ContentSlide {
  param([string]$Title, [string]$Icon, [string[]]$Bullets)

  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
  Apply-ThemeFrame -Slide $slide

  $card = $slide.Shapes.AddShape(1, 32, 36, 896, 468)
  $card.Fill.ForeColor.RGB = Convert-HexToRgbInt "FFFFFF"
  $card.Line.ForeColor.RGB = Convert-HexToRgbInt "E4E4E7"
  $card.Shadow.Visible = -1
  $card.Shadow.Blur = 8
  $card.Shadow.Transparency = 0.80

  $titleBg = $slide.Shapes.AddShape(1, 48, 52, 864, 66)
  $titleBg.Fill.ForeColor.RGB = Convert-HexToRgbInt "ECFDF5"
  $titleBg.Line.Visible = 0

  Add-StyledText -Slide $slide -Text "$Icon  $Title" -Left 64 -Top 68 -Width 832 -Height 35 -Size 28 -Bold $true -ColorHex "047857" | Out-Null

  $bulletText = ($Bullets | ForEach-Object { "• $_" }) -join "`r"
  Add-StyledText -Slide $slide -Text $bulletText -Left 72 -Top 138 -Width 816 -Height 330 -Size 21 -ColorHex "0F172A" | Out-Null

  Add-StyledText -Slide $slide -Text "CafeFlow | Smart Coffee Operations Platform" -Left 54 -Top 498 -Width 840 -Height 20 -Size 11 -ColorHex "71717A" -RightAlign $false | Out-Null
  Set-SlideTransition -Slide $slide
}

Add-TitleSlide -Title "CafeFlow" -Subtitle "عرض مشروع التخرج: منصة SaaS لإدارة المقاهي متعددة الفروع"

$slides = @(
  @{ Title = "1) مقدمة"; Icon = "🚀"; Bullets = @(
      "CafeFlow نظام SaaS سحابي لإدارة وتشغيل المقاهي بشكل احترافي.",
      "يجمع إدارة الفروع، الطاقم، المنتجات، المخزون، الطلبات، والتقارير في منصة واحدة.",
      "تم تصميمه ليتوافق مع احتياجات السوق الليبي وقابلية التوسع."
    )
  },
  @{ Title = "2) مشكلة البحث"; Icon = "🔍"; Bullets = @(
      "لا يوجد في ليبيا نظام SaaS اشتراكي متكامل للمقاهي متعددة الفروع.",
      "الحلول المتاحة غالبا محلية أو غير مصممة لعزل بيانات كل عميل بشكل آمن.",
      "غياب نموذج Multi-Tenant (Tenant Isolation) يسبب مخاطر على الخصوصية والأمان.",
      "المطلوب منصة موحدة تدعم النمو، وتوفر أداء واستقرارا عاليين."
    )
  },
  @{ Title = "3) أهداف المشروع"; Icon = "🎯"; Bullets = @(
      "بناء منصة SaaS اشتراكية حديثة للمقاهي في ليبيا.",
      "تطبيق Multi-Tenant لعزل بيانات كل كوفي شوب عن الكوفي شوبز الأخرى.",
      "دعم إدارة عدد كبير من الفروع ضمن نفس النشاط التجاري.",
      "تحقيق أداء قوي واستقرار تشغيلي مع قابلية التوسع."
    )
  },
  @{ Title = "4) المنهجية (Methodology)"; Icon = "🧭"; Bullets = @(
      "دراسة التقنيات المناسبة: Frameworks وقاعدة البيانات والأمان وأنماط SaaS.",
      "دراسة السوق المحلي واحتياج المقاهي في ليبيا إلى نظام اشتراكات متعدد الفروع.",
      "تصميم نظام يحل المشكلة الأساسية: غياب نظام SaaS محلي بهذه المواصفات.",
      "تنفيذ واختبار النظام مع ضمان الأداء والاستقرار."
    )
  },
  @{ Title = "5) منهجية التطوير (Iterative Model)"; Icon = "🔁"; Bullets = @(
      "تطوير النظام على مراحل متتالية (Iteration by Iteration).",
      "اختبار كل مرحلة بشكل مستقل قبل الانتقال للمرحلة التالية.",
      "تحسين الأداء تدريجيا بعد كل دورة تطوير.",
      "تقليل الأخطاء والمخاطر عبر التسليم المرحلي."
    )
  },
  @{ Title = "6) التقنيات الأساسية المستخدمة"; Icon = "⚙️"; Bullets = @(
      "Next.js 16 + React 19 لبناء تطبيق Full-Stack حديث.",
      "TypeScript لرفع جودة الكود وتقليل أخطاء وقت التشغيل.",
      "Prisma ORM + PostgreSQL لإدارة البيانات والعلاقات المعقدة.",
      "Tailwind CSS لبناء واجهة سريعة ومرنة."
    )
  },
  @{ Title = "7) شرح التقنيات ولماذا استخدمناها"; Icon = "🧠"; Bullets = @(
      "Next.js: يجمع الواجهة والخادم في مشروع واحد ويقلل تعقيد البنية.",
      "Prisma: يوفر Type Safety وعمليات ORM واضحة وسهلة الصيانة.",
      "PostgreSQL: قوي في العلاقات والمعاملات ومناسب لتطبيقات SaaS.",
      "TypeScript: يقلل أخطاء وقت التشغيل ويرفع موثوقية الكود."
    )
  },
  @{ Title = "8) أدوات التطوير والمحرر"; Icon = "🛠️"; Bullets = @(
      "المحرر المستخدم: Visual Studio Code (VSCode).",
      "VSCode: خفيف، سريع، يدعم TypeScript وNext.js وعمليات Debugging بمرونة.",
      "ESLint: لاكتشاف المشاكل مبكرا والحفاظ على جودة الكود.",
      "Prisma CLI: لإدارة Schema وMigrations والتحقق من صحة النموذج."
    )
  },
  @{ Title = "9) لماذا هذه الأدوات تحديدا؟ (خلاصة)"; Icon = "✅"; Bullets = @(
      "تسريع التطوير مع الحفاظ على جودة هندسية عالية.",
      "سهولة الصيانة والتوسعة في المراحل المستقبلية.",
      "تكامل ممتاز بين الأدوات ضمن بيئة عمل واحدة.",
      "ملاءمة قوية لمتطلبات مشروع SaaS متعدد المستأجرين."
    )
  },
  @{ Title = "10) Multi-Tenant وتعدد الفروع"; Icon = "🏢"; Bullets = @(
      "كل كوفي شوب له مساحة بيانات مستقلة تماما عن الآخرين.",
      "تطبيق مبدأ Tenant Isolation في القراءة والكتابة والصلاحيات.",
      "دعم إدارة عدة فروع داخل نفس النشاط التجاري.",
      "إدارة المستخدمين والأدوار حسب الفرع أو على مستوى النشاط بالكامل."
    )
  },
  @{ Title = "11) ضمان الأداء والاستقرار"; Icon = "📈"; Bullets = @(
      "تنفيذ اختبارات وظيفية لكل مرحلة تطوير.",
      "تقليل أخطاء العزل والصلاحيات عبر التحقق الخادمي.",
      "تحسين الاستعلامات وتدفق العمليات تدريجيا.",
      "الاعتماد على PostgreSQL + Prisma للثبات في العمليات الحرجة."
    )
  },
  @{ Title = "12) النتائج المتوقعة"; Icon = "🌟"; Bullets = @(
      "توفير نموذج عملي قوي لنظام SaaS مقاهي في السوق الليبي.",
      "إدارة موحدة للفروع والموظفين والطلبات والمخزون.",
      "رفع كفاءة التشغيل وتقليل الهدر والأخطاء الإدارية.",
      "قاعدة تقنية جاهزة للتوسع التجاري وربط خدمات إضافية مستقبلا."
    )
  },
  @{ Title = "13) خاتمة"; Icon = "🙏"; Bullets = @(
      "CafeFlow ليس مجرد تطبيق إدارة، بل أساس منصة SaaS قابلة للتوسع.",
      "المشروع يعالج مشكلة حقيقية في السوق المحلي بمنهجية هندسية واضحة.",
      "تم التصميم والتنفيذ والاختبار على مراحل لضمان الجودة.",
      "شكرا لكم - أسئلة واستفسارات."
    )
  }
)

foreach ($item in $slides) {
  Add-ContentSlide -Title $item.Title -Icon $item.Icon -Bullets $item.Bullets
}

$presentation.SaveAs($outputPath)
$presentation.Close()
$pp.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null
[GC]::Collect()
[GC]::WaitForPendingFinalizers()
Write-Output "Presentation created: $outputPath"
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $projectRoot "presentations"
if (!(Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$outputPath = Join-Path $outputDir "CafeFlow-Full-Presentation-$timestamp.pptx"

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = -1
$presentation = $pp.Presentations.Add()

$theme = @{
  Background = 0xFAF8F8  # #F8FAFC
  Foreground = 0x2A170F  # #0F172A
  Primary    = 0x577804  # #047857
  Accent     = 0x0B9EF5  # #F59E0B
  Muted      = 0xF5F4F4  # #F4F4F5
}

function Apply-SlideTheme {
  param(
    [object]$Slide,
    [bool]$IsTitleSlide = $false
  )

  # Background
  $Slide.Background.Fill.Solid()
  $Slide.Background.Fill.ForeColor.RGB = $theme.Background

  # Top brand bar
  $topBar = $Slide.Shapes.AddShape(1, 0, 0, $presentation.PageSetup.SlideWidth, 18)
  $topBar.Fill.Solid()
  $topBar.Fill.ForeColor.RGB = $theme.Primary
  $topBar.Line.Visible = 0

  # Accent line under top bar
  $accentBar = $Slide.Shapes.AddShape(1, 0, 18, $presentation.PageSetup.SlideWidth, 4)
  $accentBar.Fill.Solid()
  $accentBar.Fill.ForeColor.RGB = $theme.Accent
  $accentBar.Line.Visible = 0

  # Footer lockup
  $footer = $Slide.Shapes.AddTextbox(1, 18, $presentation.PageSetup.SlideHeight - 24, 300, 16)
  $footer.TextFrame.TextRange.Text = "CafeFlow  |  Coffee Operations OS"
  $footer.TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
  $footer.TextFrame.TextRange.Font.Size = 10
  $footer.TextFrame.TextRange.Font.Color.RGB = $theme.Primary

  # Coffee icon badge
  $badge = $Slide.Shapes.AddShape(9, $presentation.PageSetup.SlideWidth - 56, 28, 30, 30)
  $badge.Fill.Solid()
  $badge.Fill.ForeColor.RGB = $theme.Primary
  $badge.Line.Visible = 0
  $icon = $Slide.Shapes.AddTextbox(1, $presentation.PageSetup.SlideWidth - 50, 32, 20, 20)
  $icon.TextFrame.TextRange.Text = "☕"
  $icon.TextFrame.TextRange.Font.Name = "Segoe UI Emoji"
  $icon.TextFrame.TextRange.Font.Size = 13
  $icon.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF

  # Smooth transition effect (best effort)
  try {
    $Slide.SlideShowTransition.EntryEffect = 3849
  } catch {
    # Keep default if this Office build does not support the value.
  }
}

function Add-TitleSlide {
  param(
    [string]$Title,
    [string]$Subtitle
  )
  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 1)
  Apply-SlideTheme -Slide $slide -IsTitleSlide $true
  $slide.Shapes.Title.TextFrame.TextRange.Text = $Title
  $slide.Shapes.Title.TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
  $slide.Shapes.Title.TextFrame.TextRange.Font.Size = 44
  $slide.Shapes.Title.TextFrame.TextRange.Font.Bold = $true
  $slide.Shapes.Title.TextFrame.TextRange.Font.Color.RGB = $theme.Primary
  $slide.Shapes.Item(2).TextFrame.TextRange.Text = $Subtitle
  $slide.Shapes.Item(2).TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
  $slide.Shapes.Item(2).TextFrame.TextRange.Font.Size = 21
  $slide.Shapes.Item(2).TextFrame.TextRange.Font.Color.RGB = $theme.Foreground
}

function Add-BulletSlide {
  param(
    [string]$Title,
    [string[]]$Bullets
  )
  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 2)
  Apply-SlideTheme -Slide $slide
  $slide.Shapes.Title.TextFrame.TextRange.Text = $Title
  $slide.Shapes.Title.TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
  $slide.Shapes.Title.TextFrame.TextRange.Font.Size = 33
  $slide.Shapes.Title.TextFrame.TextRange.Font.Bold = $true
  $slide.Shapes.Title.TextFrame.TextRange.Font.Color.RGB = $theme.Primary
  $body = $slide.Shapes.Item(2).TextFrame.TextRange
  $body.Text = ($Bullets -join "`r")
  $body.Font.Name = "IBM Plex Sans Arabic"
  $body.Font.Size = 23
  $body.Font.Color.RGB = $theme.Foreground
  for ($i = 1; $i -le $body.Paragraphs().Count; $i++) {
    $body.Paragraphs($i).ParagraphFormat.Bullet.Visible = $true
    $body.Paragraphs($i).ParagraphFormat.Bullet.Character = 8226
    $body.Paragraphs($i).ParagraphFormat.Bullet.Font.Color.RGB = $theme.Accent
    $body.Paragraphs($i).ParagraphFormat.SpaceAfter = 6
  }
}

Add-TitleSlide `
  -Title "CafeFlow" `
  -Subtitle "عرض مشروع التخرج: منصة SaaS لإدارة المقاهي متعددة الفروع"

Add-BulletSlide `
  -Title "1) مقدمة" `
  -Bullets @(
    "CafeFlow نظام SaaS سحابي لإدارة وتشغيل المقاهي بشكل احترافي."
    "يجمع إدارة الفروع، الطاقم، المنتجات، المخزون، الطلبات، والتقارير في منصة واحدة."
    "تم تصميمه ليتوافق مع احتياجات السوق الليبي وقابلية التوسع."
  )

Add-BulletSlide `
  -Title "2) مشكلة البحث" `
  -Bullets @(
    "لا يوجد في ليبيا نظام SaaS اشتراكي متكامل للمقاهي متعددة الفروع."
    "الحلول المتاحة غالبًا محلية أو غير مصممة لعزل بيانات كل عميل بشكل آمن."
    "غياب نموذج Multi-Tenant (Tenant Isolation) يسبب مخاطر على الخصوصية والأمان."
    "المطلوب منصة موحدة تدعم النمو، وتوفر أداءً واستقرارًا عاليين."
  )

Add-BulletSlide `
  -Title "3) أهداف المشروع" `
  -Bullets @(
    "بناء منصة SaaS اشتراكية حديثة للمقاهي في ليبيا."
    "تطبيق Multi-Tenant لعزل بيانات كل كوفي شوب عن الكوفي شوبز الأخرى."
    "دعم إدارة عدد كبير من الفروع ضمن نفس النشاط التجاري."
    "تحقيق أداء قوي واستقرار تشغيلي مع قابلية التوسع."
  )

Add-BulletSlide `
  -Title "4) المنهجية (Methodology)" `
  -Bullets @(
    "دراسة التقنيات المناسبة: Frameworks وقاعدة البيانات والأمان وأنماط SaaS."
    "دراسة السوق المحلي واحتياج المقاهي في ليبيا إلى نظام اشتراكات متعدد الفروع."
    "تصميم نظام يحل المشكلة الأساسية: غياب نظام SaaS محلي بهذه المواصفات."
    "تنفيذ واختبار النظام مع ضمان الأداء والاستقرار."
  )

Add-BulletSlide `
  -Title "5) منهجية التطوير (Iterative Model)" `
  -Bullets @(
    "تطوير النظام على مراحل متتالية (Iteration by Iteration)."
    "اختبار كل مرحلة بشكل مستقل قبل الانتقال للمرحلة التالية."
    "تحسين الأداء تدريجيًا بعد كل دورة تطوير."
    "تقليل الأخطاء والمخاطر عبر التسليم المرحلي."
  )

Add-BulletSlide `
  -Title "6) التقنيات الأساسية المستخدمة" `
  -Bullets @(
    "Next.js 16 + React 19 لبناء تطبيق Full-Stack حديث."
    "TypeScript لرفع جودة الكود وتقليل أخطاء وقت التشغيل."
    "Prisma ORM + PostgreSQL لإدارة البيانات والعلاقات المعقدة."
    "Tailwind CSS لبناء واجهة سريعة ومرنة."
  )

Add-BulletSlide `
  -Title "7) شرح التقنيات ولماذا استخدمناها" `
  -Bullets @(
    "Next.js: يجمع الواجهة والخادم في مشروع واحد ويقلل تعقيد البنية."
    "Prisma: يوفر Type Safety وعمليات ORM واضحة وسهلة الصيانة."
    "PostgreSQL: قوي في العلاقات والمعاملات ومناسب لتطبيقات SaaS."
    "TypeScript: يقلل أخطاء وقت التشغيل ويرفع موثوقية الكود."
  )

Add-BulletSlide `
  -Title "8) أدوات التطوير والمحرر" `
  -Bullets @(
    "المحرر المستخدم: Visual Studio Code (VSCode)."
    "VSCode: خفيف، سريع، يدعم TypeScript وNext.js وعمليات Debugging بمرونة."
    "ESLint: لاكتشاف المشاكل مبكرًا والحفاظ على جودة الكود."
    "Prisma CLI: لإدارة Schema وMigrations والتحقق من صحة النموذج."
  )

Add-BulletSlide `
  -Title "9) لماذا هذه الأدوات تحديدًا؟ (خلاصة)" `
  -Bullets @(
    "تسريع التطوير مع الحفاظ على جودة هندسية عالية."
    "سهولة الصيانة والتوسعة في المراحل المستقبلية."
    "تكامل ممتاز بين الأدوات ضمن بيئة عمل واحدة."
    "ملاءمة قوية لمتطلبات مشروع SaaS متعدد المستأجرين."
  )

Add-BulletSlide `
  -Title "10) Multi-Tenant وتعدد الفروع" `
  -Bullets @(
    "كل كوفي شوب له مساحة بيانات مستقلة تمامًا عن الآخرين."
    "تطبيق مبدأ Tenant Isolation في القراءة والكتابة والصلاحيات."
    "دعم إدارة عدة فروع داخل نفس النشاط التجاري."
    "إدارة المستخدمين والأدوار حسب الفرع أو على مستوى النشاط بالكامل."
  )

Add-BulletSlide `
  -Title "11) ضمان الأداء والاستقرار" `
  -Bullets @(
    "تنفيذ اختبارات وظيفية لكل مرحلة تطوير."
    "تقليل أخطاء العزل والصلاحيات عبر التحقق الخادمي."
    "تحسين الاستعلامات وتدفق العمليات تدريجيًا."
    "الاعتماد على PostgreSQL + Prisma للثبات في العمليات الحرجة."
  )

Add-BulletSlide `
  -Title "12) النتائج المتوقعة" `
  -Bullets @(
    "توفير نموذج عملي قوي لنظام SaaS مقاهي في السوق الليبي."
    "إدارة موحدة للفروع والموظفين والطلبات والمخزون."
    "رفع كفاءة التشغيل وتقليل الهدر والأخطاء الإدارية."
    "قاعدة تقنية جاهزة للتوسع التجاري وربط خدمات إضافية مستقبلًا."
  )

Add-BulletSlide `
  -Title "13) خاتمة" `
  -Bullets @(
    "CafeFlow ليس مجرد تطبيق إدارة، بل أساس منصة SaaS قابلة للتوسع."
    "المشروع يعالج مشكلة حقيقية في السوق المحلي بمنهجية هندسية واضحة."
    "تم التصميم والتنفيذ والاختبار على مراحل لضمان الجودة."
    "شكراً لكم — أسئلة واستفسارات."
  )

$presentation.SaveAs($outputPath)
$presentation.Close()
$pp.Quit()

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null
[GC]::Collect()
[GC]::WaitForPendingFinalizers()

Write-Output "Presentation created: $outputPath"
�ق المحلي بمنهجية هندسية واضحة."
    "تم التصميم والتنفيذ والاختبار على مراحل لضمان الجودة."
    "شكراً لكم — أسئلة واستفسارات."
  )

$presentation.SaveAs($outputPath)
$presentation.Close()
$pp.Quit()

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null
[GC]::Collect()
[GC]::WaitForPendingFinalizers()

Write-Output "Presentation created: $outputPath"
