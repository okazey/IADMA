param(
  [string]$BlenderPath = "",
  [string]$BlendFile = ""
)
$ErrorActionPreference = "Stop"

# Répertoires
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projDir   = Split-Path -Parent $scriptDir
$pyScript  = Join-Path $projDir "scripts\blender\karbonfix_logo_setup.py"
$renders   = Join-Path $projDir "renders"
New-Item -ItemType Directory -Force -Path $renders | Out-Null

if (!(Test-Path $pyScript)) { throw "Script Blender introuvable: $pyScript" }

# Trouver Blender si non fourni
if (-not $BlenderPath) {
  # 1) Essayer de récupérer depuis un Blender déjà ouvert
  try {
    $p = Get-Process -Name "blender" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($p) {
      $procPath = $null
      try { $procPath = $p.Path } catch {}
      if (-not $procPath) { try { $procPath = $p.MainModule.FileName } catch {} }
      if ($procPath -and (Test-Path $procPath)) { $BlenderPath = $procPath }
    }
  } catch {}

  # 2) Fallback sur chemins connus + variable d'environnement
  if (-not $BlenderPath) {
    $candidates = @(
      "$env:ProgramFiles\Blender Foundation\Blender 4.1\blender.exe",
      "$env:ProgramFiles\Blender Foundation\Blender 4.0\blender.exe",
      "$env:ProgramFiles\Blender Foundation\Blender 3.6\blender.exe",
      "$env:ProgramFiles\Blender Foundation\Blender 3.5\blender.exe",
      "$env:LOCALAPPDATA\Microsoft\WindowsApps\blender.exe"
    )
    if ($env:BLENDER_PATH) { $candidates = @($env:BLENDER_PATH) + $candidates }
    $BlenderPath = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  }
}
if (-not $BlenderPath) { throw "Blender introuvable. Définissez BLENDER_PATH ou passez -BlenderPath." }

Write-Host "[KarbonFix] Utilisation Blender:" $BlenderPath
Write-Host "[KarbonFix] Script:" $pyScript

$argList = @("-b")
if ($BlendFile) { $argList += @($BlendFile) }
$argList += @("-noaudio", "-P", $pyScript)

# Lancer Blender en attente (console intégrée)
Start-Process -FilePath $BlenderPath -ArgumentList $argList -Wait -NoNewWindow

$still = Join-Path $renders "logo3d_still.png"
if (Test-Path $still) {
  Write-Host "[KarbonFix] OK: $still"
  exit 0
} else {
  Write-Warning "[KarbonFix] Rendu non trouvé dans $renders. Voir la console Blender pour les logs."
  exit 1
}
