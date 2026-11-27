<#
.SYNOPSIS
  Copies your local kolbot setup (D2Bot profiles and keys, d2bs.ini, character
  and system configs, bot data) from the main checkout into another worktree.

.DESCRIPTION
  The file set is derived from git: every gitignored file in the source tree is
  sorted into a category, so new gitignored configs are picked up without
  editing this script. Logs, crash dumps, *.bak and node_modules are never
  copied. Files the target already has are left alone unless -Overwrite (or the
  interactive prompt) says otherwise; overwritten files are backed up first.

  Run with no arguments for the interactive picker, or pass -Target and -Yes
  for a scripted run. Re-running is safe: only missing files are copied.

.PARAMETER Target
  Worktree to initialise. Omit to pick from `git worktree list` or browse.

.PARAMETER Source
  Tree to copy from. Defaults to the repository's main worktree.

.PARAMETER Include
  Categories to copy, replacing the defaults:
  profiles, ini, configs, data, mules, private.

.PARAMETER Overwrite
  Replace target files whose content differs from the source (each replaced
  file is kept as <name>.<timestamp>.bak).

.PARAMETER InitSoloPlay
  If the target's SoloPlay submodule is not checked out, initialise it first
  (git submodule update --init) so its settings and character data can be copied.

.PARAMETER DryRun
  List what would be copied and exit without writing anything.

.PARAMETER Yes
  Do not prompt; use the parameters as given.

.EXAMPLE
  tools\init-worktree.bat

.EXAMPLE
  powershell -File tools\init-worktree.ps1 -Target C:\ProjectRepos\worktrees\kolbot\my-fix -Yes
#>
[CmdletBinding()]
param(
	[string] $Target,
	[string] $Source,
	[ValidateSet("profiles", "ini", "configs", "data", "mules", "private")]
	[string[]] $Include,
	[switch] $Overwrite,
	[switch] $InitSoloPlay,
	[switch] $DryRun,
	[switch] $Yes
)

Set-StrictMode -Version 2
$ErrorActionPreference = "Stop"

# This file stays pure ASCII: Windows PowerShell 5.1 reads a BOM-less .ps1 as
# cp1252, so a non-ASCII character inside a string can break parsing.

$SoloPlayRel = "d2bs/kolbot/libs/SoloPlay"

$Categories = @(
	[pscustomobject]@{ Key = "profiles"; On = $true;  Label = "D2Bot profiles, CD keys, schedules (data/*.json)" }
	[pscustomobject]@{ Key = "ini";      On = $true;  Label = "d2bs.ini" }
	[pscustomobject]@{ Key = "configs";  On = $true;  Label = "Character + system configs (libs, SoloPlay settings)" }
	[pscustomobject]@{ Key = "data";     On = $true;  Label = "Bot data (kolbot/data, SoloPlay .soloplay)" }
	[pscustomobject]@{ Key = "mules";    On = $false; Label = "MuleLogger output (kolbot/mules)" }
	[pscustomobject]@{ Key = "private";  On = $false; Label = "Private dev files (__* scripts, Overrides, probes)" }
)

function Write-Note([string] $Text, [string] $Color = "Gray") {
	Write-Host $Text -ForegroundColor $Color
}

function Normalize-Path([string] $Path) {
	return [IO.Path]::GetFullPath($Path).TrimEnd([char]'\', [char]'/')
}

function Test-SamePath([string] $A, [string] $B) {
	return [string]::Equals((Normalize-Path $A), (Normalize-Path $B), [StringComparison]::OrdinalIgnoreCase)
}

function Starts([string] $Path, [string] $Prefix) {
	return $Path.StartsWith($Prefix, [StringComparison]::OrdinalIgnoreCase)
}

# Runs git and returns stdout; -z output is split on NUL, anything else on lines.
function Invoke-Git([string] $Repo, [string[]] $GitArgs, [switch] $Nul) {
	$prev = $null
	try {
		$prev = [Console]::OutputEncoding
		[Console]::OutputEncoding = New-Object Text.UTF8Encoding $false
	} catch { $prev = $null }
	try {
		$out = & git -C $Repo @GitArgs
		$code = $LASTEXITCODE
	} finally {
		if ($null -ne $prev) { try { [Console]::OutputEncoding = $prev } catch { } }
	}
	if ($code -ne 0) { throw "git $($GitArgs -join ' ') failed in $Repo (exit $code)" }
	if ($null -eq $out) { return @() }
	if ($Nul) {
		return @((@($out) -join "`n").Split([char]0) | Where-Object { $_ -ne "" })
	}
	return @($out)
}

function Get-Worktrees([string] $Repo) {
	$list = @()
	$cur = $null
	foreach ($line in (Invoke-Git $Repo @("worktree", "list", "--porcelain"))) {
		if ($line -like "worktree *") {
			if ($null -ne $cur) { $list += $cur }
			$cur = [pscustomobject]@{ Path = (Normalize-Path $line.Substring(9)); Branch = "(detached)"; Bare = $false; Prunable = $false }
		} elseif ($null -ne $cur) {
			if ($line -like "branch *") { $cur.Branch = $line.Substring(7) -replace "^refs/heads/", "" }
			elseif ($line -eq "bare") { $cur.Bare = $true }
			elseif ($line -like "prunable*") { $cur.Prunable = $true }
		}
	}
	if ($null -ne $cur) { $list += $cur }
	return $list
}

function Test-KolbotTree([string] $Path) {
	return (Test-Path -LiteralPath (Join-Path $Path "d2bs\kolbot\default.dbj") -PathType Leaf)
}

function Test-SoloPlayReady([string] $Root) {
	return (Test-Path -LiteralPath (Join-Path $Root "d2bs\kolbot\libs\SoloPlay\.git"))
}

# Maps a gitignored repo-relative path (forward slashes) to a category key, or
# $null for files that must never be copied (logs, dumps, backups, tooling).
function Get-Category([string] $P) {
	if ($P -match "\.bak$") { return $null }
	if ((Starts $P "data/") -and $P.IndexOf("/", 5) -lt 0) { return "profiles" }
	if ($P -eq "d2bs/d2bs.ini") { return "ini" }
	if (-not (Starts $P "d2bs/kolbot/")) { return $null }
	if (Starts $P "d2bs/kolbot/logs/") { return $null }
	if (Starts $P "d2bs/kolbot/mules/") { return "mules" }
	if (Starts $P "d2bs/kolbot/data/") { return "data" }
	if (Starts $P "$SoloPlayRel/") {
		$r = $P.Substring($SoloPlayRel.Length + 1)
		if (Starts $r ".soloplay/") { return "data" }
		if ((Starts $r "Config/") -or (Starts $r "Settings/") -or (Starts $r "OOG/")) { return "configs" }
		return "private"
	}
	if ($P -eq "d2bs/kolbot/.env.json") { return "configs" }
	foreach ($dir in @("libs/config/", "libs/manualplay/config/", "libs/starter/", "libs/systems/")) {
		if (Starts $P "d2bs/kolbot/$dir") { return "configs" }
	}
	return "private"
}

function Get-SourceFiles([string] $Root) {
	$rels = @(Invoke-Git $Root @("ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--",
		"data", "d2bs/d2bs.ini", "d2bs/kolbot", ":(exclude)d2bs/kolbot/logs") -Nul)
	# A submodule is its own repository, so the superproject listing never enters it.
	if (Test-SoloPlayReady $Root) {
		$sp = Join-Path $Root ($SoloPlayRel -replace "/", "\")
		$rels += @(Invoke-Git $sp @("ls-files", "-z", "--others", "--ignored", "--exclude-standard") -Nul |
			ForEach-Object { "$SoloPlayRel/$_" })
	}
	$files = @()
	foreach ($rel in $rels) {
		$cat = Get-Category $rel
		if ($null -eq $cat) { continue }
		$files += [pscustomobject]@{ Rel = $rel; Category = $cat; Status = "" }
	}
	return $files
}

function Get-FileStatus([string] $Src, [string] $Dst) {
	if (-not (Test-Path -LiteralPath $Dst -PathType Leaf)) { return "new" }
	if ((Get-Item -LiteralPath $Src).Length -ne (Get-Item -LiteralPath $Dst).Length) { return "differs" }
	$a = (Get-FileHash -LiteralPath $Src -Algorithm SHA256).Hash
	$b = (Get-FileHash -LiteralPath $Dst -Algorithm SHA256).Hash
	if ($a -eq $b) { return "same" }
	return "differs"
}

function To-Native([string] $Root, [string] $Rel) {
	return (Join-Path $Root ($Rel -replace "/", "\"))
}

function Read-Choice([string] $Prompt, [bool] $Default) {
	$hint = "[y/N]"
	if ($Default) { $hint = "[Y/n]" }
	$a = (Read-Host "$Prompt $hint").Trim()
	if ($a -eq "") { return $Default }
	return ($a -match "^(y|yes)$")
}

function Select-FolderDialog([string] $Start) {
	Add-Type -AssemblyName System.Windows.Forms
	$dlg = New-Object System.Windows.Forms.FolderBrowserDialog
	$dlg.Description = "Pick the kolbot worktree to initialise"
	$dlg.ShowNewFolderButton = $false
	if ($Start -and (Test-Path -LiteralPath $Start)) { $dlg.SelectedPath = $Start }
	if ($dlg.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { return $dlg.SelectedPath }
	return $null
}

function Select-Target([string] $Src, [object[]] $Trees) {
	$choices = @($Trees | Where-Object { -not $_.Bare -and -not $_.Prunable -and -not (Test-SamePath $_.Path $Src) })
	while ($true) {
		Write-Host ""
		Write-Note "Worktrees of this repository:" "Cyan"
		for ($i = 0; $i -lt $choices.Count; $i++) {
			$t = $choices[$i]
			$state = "not set up"
			if (Test-Path -LiteralPath (Join-Path $t.Path "data\profile.json") -PathType Leaf) { $state = "has profiles" }
			Write-Host ("  {0,2}) {1}  [{2}]  {3}" -f ($i + 1), $t.Path, $t.Branch, $state)
		}
		Write-Host "   B) Browse for a folder"
		Write-Host "   Q) Quit"
		$a = (Read-Host "Target (number, B, Q, or paste a path)").Trim().Trim('"')
		if ($a -eq "") { continue }
		if ($a -match "^[qQ]$") { return $null }
		if ($a -match "^[bB]$") {
			$picked = Select-FolderDialog (Split-Path $Src -Parent)
			if ($picked) { return $picked }
			continue
		}
		$n = 0
		if ([int]::TryParse($a, [ref] $n)) {
			if ($n -ge 1 -and $n -le $choices.Count) { return $choices[$n - 1].Path }
			Write-Note "No worktree numbered $n." "Yellow"
			continue
		}
		if (Test-Path -LiteralPath $a -PathType Container) { return $a }
		Write-Note "Not a folder: $a" "Yellow"
	}
}

function Show-Plan([object[]] $Files) {
	Write-Host ""
	Write-Host ("  #  Copy  {0,-54} {1,5} {2,5} {3,5} {4,7} {5,7}" -f "Category", "Files", "New", "Same", "Differs", "Skipped")
	for ($i = 0; $i -lt $Categories.Count; $i++) {
		$c = $Categories[$i]
		$mine = @($Files | Where-Object { $_.Category -eq $c.Key })
		$mark = "[ ]"
		if ($c.On) { $mark = "[x]" }
		Write-Host ("  {0}  {1}   {2,-54} {3,5} {4,5} {5,5} {6,7} {7,7}" -f ($i + 1), $mark, $c.Label, $mine.Count,
			@($mine | Where-Object { $_.Status -eq "new" }).Count,
			@($mine | Where-Object { $_.Status -eq "same" }).Count,
			@($mine | Where-Object { $_.Status -eq "differs" }).Count,
			@($mine | Where-Object { $_.Status -eq "no-submodule" }).Count)
	}
}

# ---------------------------------------------------------------------------

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git is not on PATH." }

$trees = @(Get-Worktrees $PSScriptRoot)
if (-not $Source) { $Source = $trees[0].Path }
$Source = Normalize-Path $Source
if (-not (Test-KolbotTree $Source)) { throw "Source is not a kolbot tree: $Source" }

Write-Note "Source: $Source" "Cyan"

if (-not $Target) {
	if ($Yes) { throw "-Yes needs -Target." }
	$Target = Select-Target $Source $trees
	if (-not $Target) { Write-Note "Cancelled."; exit 0 }
}
if (-not (Test-Path -LiteralPath $Target -PathType Container)) { throw "Target folder does not exist: $Target" }

# A browsed or pasted subfolder resolves to its worktree root.
try { $top = @(Invoke-Git (Normalize-Path $Target) @("rev-parse", "--show-toplevel")) }
catch { throw "Target is not inside a git worktree: $Target" }
$Target = Normalize-Path $top[0]
if (Test-SamePath $Target $Source) { throw "Target is the source tree itself: $Target" }
if (-not (Test-KolbotTree $Target)) { throw "Target is not a kolbot tree (no d2bs\kolbot\default.dbj): $Target" }

$srcCommon = Normalize-Path (@(Invoke-Git $Source @("rev-parse", "--path-format=absolute", "--git-common-dir"))[0])
$dstCommon = Normalize-Path (@(Invoke-Git $Target @("rev-parse", "--path-format=absolute", "--git-common-dir"))[0])
if (-not (Test-SamePath $srcCommon $dstCommon)) {
	Write-Note "Warning: the target is a separate clone, not a worktree of the source repository." "Yellow"
	if (-not $Yes -and -not (Read-Choice "Continue anyway?" $false)) { Write-Note "Cancelled."; exit 0 }
}

Write-Note "Target: $Target" "Cyan"

if ($Include) {
	foreach ($c in $Categories) { $c.On = ($Include -contains $c.Key) }
}

$files = @(Get-SourceFiles $Source)

$spPending = @($files | Where-Object { Starts $_.Rel "$SoloPlayRel/" })
if ($spPending.Count -gt 0 -and -not (Test-SoloPlayReady $Target)) {
	$doInit = [bool] $InitSoloPlay
	if (-not $doInit -and -not $Yes -and -not $DryRun) {
		Write-Note "The target's SoloPlay submodule is not checked out, so its $($spPending.Count) settings/data files cannot be copied yet." "Yellow"
		$doInit = Read-Choice "Check it out now (git submodule update --init $SoloPlayRel)?" $false
	}
	if ($doInit -and -not $DryRun) {
		& git -C $Target submodule update --init -- $SoloPlayRel
		if ($LASTEXITCODE -ne 0) { throw "git submodule update failed (exit $LASTEXITCODE)" }
	}
}
$spReady = Test-SoloPlayReady $Target

foreach ($f in $files) {
	if ((Starts $f.Rel "$SoloPlayRel/") -and -not $spReady) { $f.Status = "no-submodule"; continue }
	$f.Status = Get-FileStatus (To-Native $Source $f.Rel) (To-Native $Target $f.Rel)
}

Show-Plan $files
if (-not $spReady -and $spPending.Count -gt 0) {
	Write-Note "  Skipped = SoloPlay files; re-run with -InitSoloPlay or after 'git submodule update --init'." "DarkGray"
}

if (-not $Yes) {
	while ($true) {
		$a = (Read-Host "Toggle categories by number (e.g. 5 6), or press Enter to continue").Trim()
		if ($a -eq "") { break }
		foreach ($tok in ($a -split "[\s,]+")) {
			$n = 0
			if ([int]::TryParse($tok, [ref] $n) -and $n -ge 1 -and $n -le $Categories.Count) {
				$Categories[$n - 1].On = -not $Categories[$n - 1].On
			}
		}
		Show-Plan $files
	}
}

$onKeys = @($Categories | Where-Object { $_.On } | ForEach-Object { $_.Key })
$selected = @($files | Where-Object { $onKeys -contains $_.Category })
$toCopy = @($selected | Where-Object { $_.Status -eq "new" })
$differs = @($selected | Where-Object { $_.Status -eq "differs" })

if ($differs.Count -gt 0) {
	Write-Host ""
	Write-Note "$($differs.Count) file(s) already exist in the target with different content:" "Yellow"
	$differs | ForEach-Object { Write-Host "    $($_.Rel)" }
	$replace = [bool] $Overwrite
	if (-not $replace -and -not $Yes -and -not $DryRun) {
		$replace = Read-Choice "Overwrite them with the source version (target copies kept as .bak)?" $false
	}
	if ($replace) { $toCopy += $differs }
	else { Write-Note "  Keeping the target's versions." "DarkGray" }
}

if ($DryRun) {
	Write-Host ""
	Write-Note "Dry run - would copy $($toCopy.Count) file(s):" "Cyan"
	$toCopy | Sort-Object Category, Rel | ForEach-Object { Write-Host ("    {0,-8} {1,-8} {2}" -f $_.Category, $_.Status, $_.Rel) }
	exit 0
}

if ($toCopy.Count -eq 0) {
	Write-Host ""
	$kept = ""
	if ($differs.Count -gt 0) { $kept = " ($($differs.Count) differing file(s) left as they are)" }
	Write-Note "Nothing to copy: the target already has the selected files$kept." "Green"
	exit 0
}

if (-not $Yes) {
	if (-not (Read-Choice "Copy $($toCopy.Count) file(s) into $Target ?" $true)) { Write-Note "Cancelled."; exit 0 }
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$copied = 0
$backedUp = 0
foreach ($f in $toCopy) {
	$src = To-Native $Source $f.Rel
	$dst = To-Native $Target $f.Rel
	[void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($dst))
	if ($f.Status -eq "differs") {
		[IO.File]::Copy($dst, "$dst.$stamp.bak", $false)
		$backedUp++
	}
	[IO.File]::Copy($src, $dst, $true)
	$copied++
}

Write-Host ""
$msg = "Copied $copied file(s) into $Target."
if ($backedUp -gt 0) { $msg += " $backedUp replaced file(s) kept as *.$stamp.bak." }
Write-Note $msg "Green"
if (-not (Test-Path -LiteralPath (Join-Path $Target "node_modules") -PathType Container)) {
	Write-Note "Tip: run 'npm install' in the target for lint/type tooling." "DarkGray"
}
