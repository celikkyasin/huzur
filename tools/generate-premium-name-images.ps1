Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression.FileSystem

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$dataPath = Join-Path $root "src\data\namesOfAllah.ts"
$templatePath = "C:\Users\USER\.codex\generated_images\019e1dd3-dbc4-7d70-b2ff-b56ac01e61ef\ig_0e6abed09dfd77d5016a062937477c8191b8b13b50bbdb37ef.png"
$outDir = Join-Path $root "exports\names-of-allah-premium-images"
$zipPath = Join-Path $root "exports\names-of-allah-premium-images.zip"
$templateCopy = Join-Path $root "exports\names-of-allah-premium-template.png"

if (!(Test-Path $templatePath)) {
  throw "Template image was not found: $templatePath"
}

if (Test-Path $outDir) {
  Remove-Item -LiteralPath $outDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
try {
  Copy-Item -LiteralPath $templatePath -Destination $templateCopy -Force
} catch {
  Write-Host "Template copy skipped: $($_.Exception.Message)"
}

function Repair-Text([string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) {
    return ""
  }
  return $value
}

function Slugify([string]$value) {
  $text = (Repair-Text $value).ToLowerInvariant()
  $text = $text.Replace([char]0x0131, "i").Replace([char]0x011F, "g").Replace([char]0x00FC, "u").Replace([char]0x015F, "s").Replace([char]0x00F6, "o").Replace([char]0x00E7, "c")
  $text = $text.Replace("'", "")
  $text = $text -replace "[^a-z0-9]+", "-"
  $text = $text.Trim("-")
  if ($text.Length -eq 0) {
    return "isim"
  }
  return $text
}
function Add-RoundedRectangle($path, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path.AddArc($x, $y, $r, $r, 180, 90)
  $path.AddArc($x + $w - $r, $y, $r, $r, 270, 90)
  $path.AddArc($x + $w - $r, $y + $h - $r, $r, $r, 0, 90)
  $path.AddArc($x, $y + $h - $r, $r, $r, 90, 90)
  $path.CloseFigure()
}

function Draw-CenteredText($graphics, [string]$text, $font, $brush, [float]$x, [float]$y, [float]$w, [float]$h, $format) {
  $graphics.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $format)
}

$raw = Get-Content -LiteralPath $dataPath -Raw -Encoding UTF8
$matches = [regex]::Matches($raw, '\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]')
$items = @()
$order = 1
foreach ($match in $matches) {
  $items += [pscustomobject]@{
    Order = $order
    Arabic = Repair-Text $match.Groups[1].Value
    Name = Repair-Text $match.Groups[2].Value
    Meaning = Repair-Text $match.Groups[3].Value
  }
  $order += 1
}

if ($items.Count -ne 99) {
  throw "Expected 99 names, found $($items.Count)."
}

$width = 1080
$height = 1920

$privateFonts = New-Object System.Drawing.Text.PrivateFontCollection
$privateFonts.AddFontFile("C:\Windows\Fonts\AdobeArabic-Bold.otf")
$privateFonts.AddFontFile("C:\Windows\Fonts\times.ttf")
$privateFonts.AddFontFile("C:\Windows\Fonts\NotoSerif-Bold.ttf")
$privateFonts.AddFontFile("C:\Windows\Fonts\NotoSans-Bold.ttf")

$arabicFamily = $privateFonts.Families[0]
$serifFamily = $privateFonts.Families[1]
$boldSerifFamily = $privateFonts.Families[2]
$sansFamily = $privateFonts.Families[3]

$center = New-Object System.Drawing.StringFormat
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center

$nearCenter = New-Object System.Drawing.StringFormat
$nearCenter.Alignment = [System.Drawing.StringAlignment]::Center
$nearCenter.LineAlignment = [System.Drawing.StringAlignment]::Near

foreach ($item in $items) {
  $source = [System.Drawing.Image]::FromFile($templatePath)
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $graphics.DrawImage($source, 0, 0, $width, $height)

  $darkGreen = [System.Drawing.Color]::FromArgb(0, 63, 48)
  $gold = [System.Drawing.Color]::FromArgb(195, 145, 45)
  $shadowGold = [System.Drawing.Color]::FromArgb(170, 155, 104, 24)

  $goldBrush = New-Object System.Drawing.SolidBrush $gold
  $greenBrush = New-Object System.Drawing.SolidBrush $darkGreen
  $goldShadowBrush = New-Object System.Drawing.SolidBrush $shadowGold

  $arabicSize = if ($item.Arabic.Length -gt 22) { 140 } elseif ($item.Arabic.Length -gt 14) { 158 } else { 194 }
  $nameSize = if ($item.Name.Length -gt 24) { 60 } elseif ($item.Name.Length -gt 18) { 74 } else { 92 }
  $meaningSize = if ($item.Meaning.Length -gt 56) { 34 } elseif ($item.Meaning.Length -gt 42) { 40 } else { 46 }

  $arabicFont = New-Object System.Drawing.Font $arabicFamily, $arabicSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $nameFont = New-Object System.Drawing.Font $serifFamily, $nameSize, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $meaningFont = New-Object System.Drawing.Font $boldSerifFamily, $meaningSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $footerFont = New-Object System.Drawing.Font $boldSerifFamily, 22, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)

  Draw-CenteredText $graphics $item.Arabic $arabicFont $goldShadowBrush 83 568 910 330 $center
  Draw-CenteredText $graphics $item.Arabic $arabicFont $greenBrush 75 558 910 330 $center

  Draw-CenteredText $graphics $item.Name $nameFont $greenBrush 120 1160 840 124 $center
  Draw-CenteredText $graphics $item.Meaning $meaningFont $greenBrush 170 1398 740 228 $nearCenter
  Draw-CenteredText $graphics "huzur.app" $footerFont $goldBrush 300 1870 480 36 $center

  $fileName = "{0:00}-{1}.png" -f $item.Order, (Slugify $item.Name)
  $filePath = Join-Path $outDir $fileName
  $bitmap.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)

  $source.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}
[System.IO.Compression.ZipFile]::CreateFromDirectory($outDir, $zipPath)

Write-Host "Generated $($items.Count) premium PNG images"
Write-Host $outDir
Write-Host $zipPath
