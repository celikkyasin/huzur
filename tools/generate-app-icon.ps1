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
  $gold = [System.Drawing.Color]::FromArgb(213, 170, 82)
  $goldLight = [System.Drawing.Color]::FromArgb(245, 222, 154)
  $cream = [System.Drawing.Color]::FromArgb(249, 244, 229)

  $rect = [System.Drawing.RectangleF]::new(0, 0, $size, $size)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $emerald, $emeraldDark, 45
  $graphics.FillRectangle($bgBrush, $rect)

  $unit = $size / 1024.0
  $center = $size / 2.0

  $borderPen = New-Object System.Drawing.Pen $gold, ([Math]::Max(4, 18 * $unit))
  $innerPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, $goldLight)), ([Math]::Max(2, 6 * $unit))
  $graphics.DrawEllipse($borderPen, 92 * $unit, 92 * $unit, 840 * $unit, 840 * $unit)
  $graphics.DrawEllipse($innerPen, 132 * $unit, 132 * $unit, 760 * $unit, 760 * $unit)

  $archPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $archPath.StartFigure()
  $archPath.AddBezier(294 * $unit, 720 * $unit, 258 * $unit, 500 * $unit, 332 * $unit, 332 * $unit, $center, 210 * $unit)
  $archPath.AddBezier($center, 210 * $unit, 692 * $unit, 332 * $unit, 766 * $unit, 500 * $unit, 730 * $unit, 720 * $unit)
  $archPath.AddLine(730 * $unit, 784 * $unit, 294 * $unit, 784 * $unit)
  $archPath.CloseFigure()

  $archBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush ([System.Drawing.RectangleF]::new(260 * $unit, 190 * $unit, 500 * $unit, 620 * $unit)), $cream, ([System.Drawing.Color]::FromArgb(235, 210, 140)), 90
  $graphics.FillPath($archBrush, $archPath)
  $graphics.DrawPath((New-Object System.Drawing.Pen $gold, ([Math]::Max(5, 16 * $unit))), $archPath)

  $crescentPen = New-Object System.Drawing.Pen $gold, ([Math]::Max(12, 58 * $unit))
  $crescentPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $crescentPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawArc($crescentPen, 360 * $unit, 340 * $unit, 290 * $unit, 290 * $unit, 112, 232)

  $starPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $starPoints = @(
    [System.Drawing.PointF]::new(650 * $unit, 352 * $unit),
    [System.Drawing.PointF]::new(670 * $unit, 408 * $unit),
    [System.Drawing.PointF]::new(730 * $unit, 408 * $unit),
    [System.Drawing.PointF]::new(682 * $unit, 442 * $unit),
    [System.Drawing.PointF]::new(700 * $unit, 500 * $unit),
    [System.Drawing.PointF]::new(650 * $unit, 466 * $unit),
    [System.Drawing.PointF]::new(600 * $unit, 500 * $unit),
    [System.Drawing.PointF]::new(618 * $unit, 442 * $unit),
    [System.Drawing.PointF]::new(570 * $unit, 408 * $unit),
    [System.Drawing.PointF]::new(630 * $unit, 408 * $unit)
  )
  $starPath.AddPolygon($starPoints)
  $graphics.FillPath((New-Object System.Drawing.SolidBrush $goldLight), $starPath)

  $graphics.DrawLine((New-Object System.Drawing.Pen $gold, ([Math]::Max(4, 12 * $unit))), 360 * $unit, 704 * $unit, 664 * $unit, 704 * $unit)
  $graphics.DrawLine((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(150, $goldLight)), ([Math]::Max(2, 5 * $unit))), 410 * $unit, 742 * $unit, 614 * $unit, 742 * $unit)

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

Write-Host "Generated app icon assets"
