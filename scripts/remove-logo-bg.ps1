param([Parameter(Mandatory=$true)][string]$InputPath,[Parameter(Mandatory=$true)][string]$OutputPath)
Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Bitmap]::FromFile($InputPath)
$canvas = New-Object System.Drawing.Bitmap($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.DrawImageUnscaled($source, 0, 0)
$graphics.Dispose(); $source.Dispose()

$minX = $canvas.Width; $minY = $canvas.Height; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $canvas.Height; $y++) {
  for ($x = 0; $x -lt $canvas.Width; $x++) {
    $p = $canvas.GetPixel($x, $y)
    $dominance = $p.G - [Math]::Max($p.R, $p.B)
    if ($dominance -ge 90) { $alpha = 0 }
    elseif ($dominance -gt 25) { $alpha = [int](255 * (90 - $dominance) / 65) }
    else { $alpha = 255 }
    if ($alpha -gt 0) {
      $green = [Math]::Min($p.G, [Math]::Max($p.R, $p.B))
      if ($p.R -lt 125 -and $green -lt 125 -and $p.B -lt 125) {
        $canvas.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 238, 233, 223))
      } else {
        $canvas.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $green, $p.B))
      }
      if ($alpha -gt 12) { $minX=[Math]::Min($minX,$x); $minY=[Math]::Min($minY,$y); $maxX=[Math]::Max($maxX,$x); $maxY=[Math]::Max($maxY,$y) }
    } else { $canvas.SetPixel($x, $y, [System.Drawing.Color]::Transparent) }
  }
}

$pad = 18
$left = [Math]::Max(0, $minX - $pad); $top = [Math]::Max(0, $minY - $pad)
$width = [Math]::Min($canvas.Width - $left, $maxX - $minX + 1 + 2*$pad)
$height = [Math]::Min($canvas.Height - $top, $maxY - $minY + 1 + 2*$pad)
$result = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$draw = [System.Drawing.Graphics]::FromImage($result)
$draw.Clear([System.Drawing.Color]::Transparent)
$draw.DrawImage($canvas, (New-Object System.Drawing.Rectangle(0,0,$width,$height)), (New-Object System.Drawing.Rectangle($left,$top,$width,$height)), [System.Drawing.GraphicsUnit]::Pixel)
$draw.Dispose(); $canvas.Dispose()
$result.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$result.Dispose()
