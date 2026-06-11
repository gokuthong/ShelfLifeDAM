# Run this AFTER closing the Claude Code session (the session holds the folder lock).
# From any PowerShell window: powershell -ExecutionPolicy Bypass -File C:\Users\ASUS\Downloads\rename_to_08.ps1
$ErrorActionPreference = "Stop"

Rename-Item "C:\Users\ASUS\Downloads\07_Team_Handoff\07_Team_Handoff" "08_Team_Handoff"
Rename-Item "C:\Users\ASUS\Downloads\07_Team_Handoff" "08_Team_Handoff"
Write-Host "Folders renamed to 08_Team_Handoff."

# Patch hard-coded paths in scripts/docs so the generators stay re-runnable
$root = "C:\Users\ASUS\Downloads\08_Team_Handoff"
$patched = 0
Get-ChildItem $root -Recurse -Include *.py, *.md -File | Where-Object { $_.FullName -notmatch '\\\.venv\\' } | ForEach-Object {
    $c = Get-Content $_.FullName -Raw -Encoding UTF8
    if ($c -match '07_Team_Handoff') {
        ($c -replace '07_Team_Handoff', '08_Team_Handoff') | Set-Content $_.FullName -Encoding utf8 -NoNewline
        $patched++
    }
}
Write-Host "Patched $patched files that referenced the old path."
Write-Host "Done. Final deliverables: $root\08_Team_Handoff\08_Final_Submission\"
Remove-Item $MyInvocation.MyCommand.Path -Force
