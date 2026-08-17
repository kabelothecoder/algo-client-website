# Paste your Gemini API key straight into .env.local.
#
#   Run it from the project folder:   .\scripts\set-key.ps1
#   Or right-click the file  ->  Run with PowerShell
#
# The key goes from your clipboard into the file. It is not echoed to the
# screen, not written to your command history, and not sent anywhere except
# Google when the app calls the API.

$ErrorActionPreference = 'Stop'

$envPath = Join-Path $PSScriptRoot '..\.env.local'
$envPath = [System.IO.Path]::GetFullPath($envPath)

if (-not (Test-Path $envPath)) {
    Write-Host "`n  Could not find .env.local at $envPath" -ForegroundColor Red
    Write-Host "  Copy .env.local.example to .env.local first.`n"
    exit 1
}

Write-Host ""
Write-Host "  Get your free key at https://aistudio.google.com/apikey" -ForegroundColor Cyan
Write-Host "  Copy it, then right-click here to paste and press Enter."
Write-Host ""

$secure = Read-Host -Prompt "  Gemini API key" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr).Trim()
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

# Strip quotes people often copy along with the key.
$key = $key -replace '^["'']|["'']$', ''

if ([string]::IsNullOrWhiteSpace($key)) {
    Write-Host "`n  Nothing entered. Nothing changed.`n" -ForegroundColor Yellow
    exit 1
}

if ($key -match '\s') {
    Write-Host "`n  That key contains a space, which means it was copied wrong." -ForegroundColor Red
    Write-Host "  Copy it again from AI Studio and re-run this.`n"
    exit 1
}

if ($key.Length -lt 20) {
    Write-Host "`n  That looks too short to be a real key ($($key.Length) chars)." -ForegroundColor Red
    Write-Host "  Nothing was changed.`n"
    exit 1
}

if (-not $key.StartsWith('AIza')) {
    Write-Host "`n  Warning: Gemini keys normally start with 'AIza'." -ForegroundColor Yellow
    Write-Host "  Saving it anyway - run 'npm run check:ai' to see if it works."
}

# Read and write without a BOM; a BOM on line 1 breaks .env parsing.
$utf8 = New-Object System.Text.UTF8Encoding($false)
$text = [System.IO.File]::ReadAllText($envPath, $utf8)

$replaced = $false
$lines = $text -split "`r?`n" | ForEach-Object {
    if ($_ -match '^\s*LLM_API_KEY\s*=') { $script:replaced = $true; "LLM_API_KEY=$key" }
    else { $_ }
}

if (-not $replaced) { $lines += "LLM_API_KEY=$key" }

[System.IO.File]::WriteAllText($envPath, ($lines -join "`r`n"), $utf8)

$masked = $key.Substring(0, 6) + ('*' * 8) + $key.Substring($key.Length - 4)
Write-Host ""
Write-Host "  Saved to .env.local  ->  $masked ($($key.Length) chars)" -ForegroundColor Green
Write-Host ""
Write-Host "  Now run:  npm run check:ai"
Write-Host ""
