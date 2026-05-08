$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$presentationsDir = Join-Path $projectRoot "presentations"

if (!(Test-Path $presentationsDir)) {
  throw "presentations directory not found."
}

$latest = Get-ChildItem -Path $presentationsDir -Filter "CafeFlow-Full-Presentation-*.pptx" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($null -eq $latest) {
  throw "No CafeFlow presentation found to style."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$outputPath = Join-Path $presentationsDir "CafeFlow-Full-Presentation-Styled-$timestamp.pptx"

$theme = @{
  Background = 0xFAF8F8  # #F8FAFC
  Foreground = 0x2A170F  # #0F172A
  Primary    = 0x577804  # #047857
  Accent     = 0x0B9EF5  # #F59E0B
}

function Add-Decor {
  param(
    [Parameter(Mandatory = $true)] $Slide,
    [Parameter(Mandatory = $true)] [double] $SlideWidth,
    [Parameter(Mandatory = $true)] [double] $SlideHeight
  )

  $topBar = $Slide.Shapes.AddShape(1, 0, 0, $SlideWidth, 18)
  $topBar.Fill.Solid()
  $topBar.Fill.ForeColor.RGB = $theme.Primary
  $topBar.Line.Visible = 0

  $accentBar = $Slide.Shapes.AddShape(1, 0, 18, $SlideWidth, 4)
  $accentBar.Fill.Solid()
  $accentBar.Fill.ForeColor.RGB = $theme.Accent
  $accentBar.Line.Visible = 0

  $badge = $Slide.Shapes.AddShape(9, $SlideWidth - 58, 28, 32, 32)
  $badge.Fill.Solid()
  $badge.Fill.ForeColor.RGB = $theme.Primary
  $badge.Line.Visible = 0

  $icon = $Slide.Shapes.AddTextbox(1, $SlideWidth - 51, 33, 20, 20)
  $icon.TextFrame.TextRange.Text = "☕"
  $icon.TextFrame.TextRange.Font.Name = "Segoe UI Emoji"
  $icon.TextFrame.TextRange.Font.Size = 13
  $icon.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF

  $footer = $Slide.Shapes.AddTextbox(1, 20, $SlideHeight - 24, 360, 16)
  $footer.TextFrame.TextRange.Text = "CafeFlow  |  Coffee Operations OS"
  $footer.TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
  $footer.TextFrame.TextRange.Font.Size = 10
  $footer.TextFrame.TextRange.Font.Color.RGB = $theme.Primary
}

$pp = $null
$presentation = $null

try {
  $pp = New-Object -ComObject PowerPoint.Application
  $pp.Visible = -1
  $presentation = $pp.Presentations.Open($latest.FullName, $false, $false, $false)

  $slideWidth = $presentation.PageSetup.SlideWidth
  $slideHeight = $presentation.PageSetup.SlideHeight

  foreach ($slide in $presentation.Slides) {
    $slide.Background.Fill.Solid()
    $slide.Background.Fill.ForeColor.RGB = $theme.Background

    # Typography pass
    foreach ($shape in $slide.Shapes) {
      if ($shape.HasTextFrame -eq -1) {
        if ($shape.TextFrame.HasText -eq -1) {
          $text = $shape.TextFrame.TextRange.Text
          $shape.TextFrame.TextRange.Font.Name = "IBM Plex Sans Arabic"
          $shape.TextFrame.TextRange.Font.Color.RGB = $theme.Foreground
          if ($text.Length -lt 85) {
            $shape.TextFrame.TextRange.Font.Bold = -1
            $shape.TextFrame.TextRange.Font.Size = 34
            $shape.TextFrame.TextRange.Font.Color.RGB = $theme.Primary
          } else {
            $shape.TextFrame.TextRange.Font.Bold = 0
            if ($shape.TextFrame.TextRange.Font.Size -lt 22) {
              $shape.TextFrame.TextRange.Font.Size = 24
            }
          }
        }
      }
    }

    Add-Decor -Slide $slide -SlideWidth $slideWidth -SlideHeight $slideHeight

    try {
      $slide.SlideShowTransition.EntryEffect = 3849
    } catch {}
  }

  $presentation.SaveAs($outputPath, 24)
  Write-Output "Styled presentation created: $outputPath"
}
finally {
  if ($presentation -ne $null) { $presentation.Close() }
  if ($pp -ne $null) { $pp.Quit() }
  if ($presentation -ne $null) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null }
  if ($pp -ne $null) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
