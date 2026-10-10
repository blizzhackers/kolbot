# Points each submodule's shared core.worktree back at the main checkout.
#
# Run it after every `git submodule update`. When this repo is a linked git worktree and one
# of its submodules is itself a git worktree of the shared module repo, `git submodule update`
# rewrites the shared core.worktree relative to the worktree's gitdir, and every git command
# in the main checkout then fails with "cannot chdir". Git ignores that shared value inside
# linked worktrees, so restoring it never affects the worktree. Already-correct values are
# left untouched.
param([string]$RepoRoot = (Split-Path -Parent $PSScriptRoot))

$common = git -C $RepoRoot rev-parse --path-format=absolute --git-common-dir 2>$null
if ($LASTEXITCODE -ne 0 -or -not $common) { return }
$common = $common -replace '\\', '/'
# A bare repo or a separate git dir has no main checkout at <common>/.. to point back to.
if ((Split-Path -Leaf $common) -ne '.git') { return }
$mainRoot = (Split-Path -Parent $common) -replace '\\', '/'

$entries = git -C $RepoRoot config --file .gitmodules --get-regexp '^submodule\..*\.path$' 2>$null
foreach ($line in $entries) {
    $key, $path = $line -split ' ', 2
    # "submodule.<name>.path": the module's git dir is keyed by name, its checkout by path.
    $name = $key.Substring(10, $key.Length - 15)
    $moduleConfig = "$common/modules/$name/config"
    if (-not (Test-Path -LiteralPath $moduleConfig)) { continue }
    $current = git config --file $moduleConfig --get core.worktree
    if ($LASTEXITCODE -ne 0) { continue }
    # From <main>/.git/modules/<name> back up to <main>: one level per name segment, plus
    # "modules" and ".git".
    $expected = ('../' * (($name -split '/').Count + 2)) + $path
    if ($current -ne $expected) {
        git config --file $moduleConfig core.worktree $expected
        Write-Host "Repaired the main checkout's link to submodule $path"
    }
}
