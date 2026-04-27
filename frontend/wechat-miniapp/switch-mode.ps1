# Switch between Admin and User mode for wechatDemo
# Usage: Run in PowerShell or right-click -> Run with PowerShell

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$appJson = Join-Path $root "app.json"
$adminJson = Join-Path $root "app-admin.json"
$customerJson = Join-Path $root "app-customer.json"

$current = Get-Content $appJson -Raw -Encoding UTF8

if ($current -match "customerLogin") {
    $currentMode = "user"
} else {
    $currentMode = "admin"
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Sky Take-out - Mode Switcher"
Write-Host "========================================"
Write-Host ""

if ($currentMode -eq "user") {
    Write-Host "  Current Mode: [User / Customer]" -ForegroundColor Green
} else {
    Write-Host "  Current Mode: [Admin / Merchant]" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Select target mode:"
Write-Host "  [1] Admin (Merchant)"
Write-Host "  [2] User  (Customer)"
Write-Host "  [Q] Quit"
Write-Host ""

$choice = Read-Host "  Enter choice"

switch ($choice.ToUpper()) {
    "1" {
        if ($currentMode -eq "user") {
            Copy-Item $appJson $customerJson -Force
        }
        if (Test-Path $adminJson) {
            Copy-Item $adminJson $appJson -Force
            Write-Host ""
            Write-Host "  [OK] Switched to Admin mode." -ForegroundColor Yellow
            Write-Host "  Press Ctrl+R in WeChat DevTools to refresh."
        } else {
            Write-Host ""
            Write-Host "  [ERROR] app-admin.json not found." -ForegroundColor Red
        }
    }
    "2" {
        if ($currentMode -eq "admin") {
            Copy-Item $appJson $adminJson -Force
        }
        if (Test-Path $customerJson) {
            Copy-Item $customerJson $appJson -Force
            Write-Host ""
            Write-Host "  [OK] Switched to User mode." -ForegroundColor Green
            Write-Host "  Press Ctrl+R in WeChat DevTools to refresh."
        } else {
            Write-Host ""
            Write-Host "  [ERROR] app-customer.json not found." -ForegroundColor Red
        }
    }
    "Q" {
        Write-Host ""
        Write-Host "  Quit." -ForegroundColor Gray
    }
    default {
        Write-Host ""
        Write-Host "  Invalid option. Quit." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host ""
Read-Host "Press Enter to close"
