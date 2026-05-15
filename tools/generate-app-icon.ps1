Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$assetIcon = Join-Path $root "assets\icon.png"
$assetAdaptive = Join-Path $root "assets\adaptive-icon.png"
$assetSplash = Join-Path $root "assets\splash-icon.png"

function New-IconBitmap([int]$size, [bool]$round) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $emerald = [System.Drawing.Color]::FromArgb(4, 70, 54)
  $emeraldDark = [System.Drawing.Color]::FromArgb(2, 45, 38)
  $emeraldLight = [System.Drawing.Color]::FromArgb(16, 118, 89)
  $gold = [System.Drawing.Color]::FromArgb(213, 170, 82)
  $goldLight = [System.Drawing.Color]::FromArgb(245, 222, 154)
  $cream = [System.Drawing.Color]::FromArgb(249, 244, 229)

  $unit = $size / 1024.0
  $rect = [System.Drawing.RectangleF]::new(0, 0, $size, $size)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $emeraldLight, $emeraldDark, 45
  $graphics.FillRectangle($bgBrush, $rect)

  $outerPen = New-Object System.Drawing.Pen $gold, ([Math]::Max(4, 18 * $unit))
  $innerPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(125, $goldLight)), ([Math]::Max(2, 6 * $unit))
  $graphics.DrawEllipse($outerPen, 92 * $unit, 92 * $unit, 840 * $unit, 840 * $unit)
  $graphics.DrawEllipse($innerPen, 135 * $unit, 135 * $unit, 754 * $unit, 754 * $unit)

  $glowPoints = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(512 * $unit, 235 * $unit),
    [System.Drawing.PointF]::new(785 * $unit, 512 * $unit),
    [System.Drawing.PointF]::new(512 * $unit, 810 * $unit),
    [System.Drawing.PointF]::new(240 * $unit, 512 * $unit)
  )
  $glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush -ArgumentList (, $glowPoints)
  $glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(74, $goldLight)
  $glowBrush.SurroundColors = [System.Drawing.Color[]]@([System.Drawing.Color]::FromArgb(0, $goldLight))
  $graphics.FillEllipse($glowBrush, 220 * $unit, 210 * $unit, 584 * $unit, 610 * $unit)

  $mosqueBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
    [System.Drawing.RectangleF]::new(245 * $unit, 270 * $unit, 534 * $unit, 500 * $unit),
    $cream,
    [System.Drawing.Color]::FromArgb(230, 206, 135),
    90
  )
  $mosquePen = New-Object System.Drawing.Pen $gold, ([Math]::Max(4, 12 * $unit))
  $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(85, 0, 0, 0))

  $graphics.FillRectangle($shadowBrush, 274 * $unit, 656 * $unit, 476 * $unit, 88 * $unit)

  $dome = New-Object System.Drawing.Drawing2D.GraphicsPath
  $dome.StartFigure()
  $dome.AddBezier(285 * $unit, 590 * $unit, 300 * $unit, 390 * $unit, 430 * $unit, 342 * $unit, 512 * $unit, 245 * $unit)
  $dome.AddBezier(512 * $unit, 245 * $unit, 594 * $unit, 342 * $unit, 724 * $unit, 390 * $unit, 739 * $unit, 590 * $unit)
  $dome.AddLine(739 * $unit, 665 * $unit, 285 * $unit, 665 * $unit)
  $dome.CloseFigure()
  $graphics.FillPath($mosqueBrush, $dome)
  $graphics.DrawPath($mosquePen, $dome)

  $baseRect = [System.Drawing.RectangleF]::new(250 * $unit, 640 * $unit, 524 * $unit, 124 * $unit)
  $graphics.FillRectangle($mosqueBrush, $baseRect)
  $graphics.DrawRectangle($mosquePen, $baseRect.X, $baseRect.Y, $baseRect.Width, $baseRect.Height)

  foreach ($x in @(322, 432, 542, 652)) {
    $door = New-Object System.Drawing.Drawing2D.GraphicsPath
    $door.StartFigure()
    $door.AddBezier($x * $unit, 748 * $unit, $x * $unit, 690 * $unit, ($x + 72) * $unit, 690 * $unit, ($x + 72) * $unit, 748 * $unit)
    $door.AddLine(($x + 72) * $unit, 764 * $unit, $x * $unit, 764 * $unit)
    $door.CloseFigure()
    $graphics.FillPath((New-Object System.Drawing.SolidBrush $emerald), $door)
  }

  foreach ($x in @(206, 784)) {
    $graphics.FillRectangle($shadowBrush, ($x + 12) * $unit, 335 * $unit, 82 * $unit, 430 * $unit)
    $graphics.FillRectangle($mosqueBrush, $x * $unit, 320 * $unit, 74 * $unit, 444 * $unit)
    $graphics.DrawRectangle($mosquePen, $x * $unit, 320 * $unit, 74 * $unit, 444 * $unit)

    $spire = New-Object System.Drawing.Drawing2D.GraphicsPath
    $spire.AddPolygon([System.Drawing.PointF[]]@(
      [System.Drawing.PointF]::new(($x - 12) * $unit, 320 * $unit),
      [System.Drawing.PointF]::new(($x + 37) * $unit, 218 * $unit),
      [System.Drawing.PointF]::new(($x + 86) * $unit, 320 * $unit)
    ))
    $graphics.FillPath($mosqueBrush, $spire)
    $graphics.DrawPath($mosquePen, $spire)

    $graphics.FillEllipse((New-Object System.Drawing.SolidBrush $emerald), ($x + 18) * $unit, 455 * $unit, 38 * $unit, 64 * $unit)
    $graphics.FillEllipse((New-Object System.Drawing.SolidBrush $emerald), ($x + 18) * $unit, 565 * $unit, 38 * $unit, 64 * $unit)
  }

  $crescentPen = New-Object System.Drawing.Pen $goldLight, ([Math]::Max(3, 14 * $unit))
  $crescentPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $crescentPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawLine((New-Object System.Drawing.Pen $gold, ([Math]::Max(3, 8 * $unit))), 512 * $unit, 250 * $unit, 512 * $unit, 185 * $unit)
  $graphics.DrawArc($crescentPen, 493 * $unit, 146 * $unit, 54 * $unit, 54 * $unit, 92, 244)
  $graphics.DrawLine((New-Object System.Drawing.Pen $gold, ([Math]::Max(4, 12 * $unit))), 345 * $unit, 798 * $unit, 679 * $unit, 798 * $unit)

  $graphics.Dispose()
  return $bitmap
}

$launcherSizes = @{
  "mipmap-mdpi" = 48
  "mipmap-hdpi" = 72
  "mipmap-xhdpi" = 96
  "mipmap-xxhdpi" = 144
  "mipmap-xxxhdpi" = 192
}

$full = New-IconBitmap 1024 $false
$full.Save($assetIcon, [System.Drawing.Imaging.ImageFormat]::Png)
$full.Save($assetAdaptive, [System.Drawing.Imaging.ImageFormat]::Png)
$full.Save($assetSplash, [System.Drawing.Imaging.ImageFormat]::Png)
$full.Dispose()

foreach ($density in $launcherSizes.Keys) {
  $dir = Join-Path $root "android\app\src\main\res\$density"
  Remove-Item -LiteralPath (Join-Path $dir "ic_launcher.webp") -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath (Join-Path $dir "ic_launcher_round.webp") -Force -ErrorAction SilentlyContinue

  $size = $launcherSizes[$density]
  $icon = New-IconBitmap $size $false
  $icon.Save((Join-Path $dir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $icon.Dispose()

  $roundIcon = New-IconBitmap $size $true
  $roundIcon.Save((Join-Path $dir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $roundIcon.Dispose()
}

Write-Host "Generated mosque app icon assets"
