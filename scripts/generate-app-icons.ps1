Add-Type -AssemblyName System.Drawing
$riderIconDirectory = Join-Path (Get-Location) 'public/icons'
New-Item -ItemType Directory -Path $riderIconDirectory -Force | Out-Null
foreach ($riderIcon in @(@('app-192.png',192), @('app-512.png',512), @('app-maskable-512.png',512), @('apple-touch-icon.png',180))) {
  $riderBitmap = [System.Drawing.Bitmap]::new([int]$riderIcon[1],[int]$riderIcon[1])
  $riderGraphic = [System.Drawing.Graphics]::FromImage($riderBitmap)
  $riderGraphic.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $riderGraphic.Clear([System.Drawing.ColorTranslator]::FromHtml('#d8006c'))
  $riderScale = [single]($riderIcon[1] / 512)
  $riderGraphic.ScaleTransform($riderScale,$riderScale)
  $riderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::White,15)
  $riderPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $riderPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $riderGraphic.DrawEllipse($riderPen,94,280,104,104)
  $riderGraphic.DrawEllipse($riderPen,300,280,104,104)
  $riderGraphic.DrawLine($riderPen,146,332,210,222)
  $riderGraphic.DrawLine($riderPen,210,222,279,332)
  $riderGraphic.DrawLine($riderPen,279,332,146,332)
  $riderGraphic.DrawLine($riderPen,279,332,337,235)
  $riderGraphic.DrawLine($riderPen,352,332,326,194)
  $riderGraphic.DrawLine($riderPen,326,194,367,194)
  $riderGraphic.DrawLine($riderPen,192,205,230,205)
  $riderGraphic.DrawEllipse($riderPen,239,121,39,39)
  $riderBitmap.Save((Join-Path $riderIconDirectory $riderIcon[0]),[System.Drawing.Imaging.ImageFormat]::Png)
  $riderPen.Dispose(); $riderGraphic.Dispose(); $riderBitmap.Dispose()
}
