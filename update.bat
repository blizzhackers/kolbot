@echo off
echo Updating repository and submodules...

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not available in PATH
    echo Please install Git and ensure it's in your PATH before running this script
    echo.
    pause
    exit /b 1
)

echo Git detected, checking for local changes...

REM Check if there are any local changes
git diff --quiet
set has_changes=%errorlevel%

git diff --cached --quiet
set has_staged_changes=%errorlevel%

if %has_changes% neq 0 (
    echo Local changes detected, stashing them...
    git stash push -m "Auto-stash before update"
    if %errorlevel% neq 0 (
        echo ERROR: Failed to stash local changes
        echo Please manually resolve any conflicts and try again
        echo.
        pause
        exit /b 1
    )
    set stashed=1
) else if %has_staged_changes% neq 0 (
    echo Staged changes detected, stashing them...
    git stash push -m "Auto-stash before update"
    if %errorlevel% neq 0 (
        echo ERROR: Failed to stash staged changes
        echo Please manually resolve any conflicts and try again
        echo.
        pause
        exit /b 1
    )
    set stashed=1
) else (
    echo No local changes detected
    set stashed=0
)

echo.
echo Updating repository...

REM Pull latest changes from remote
git pull
if %errorlevel% neq 0 (
    echo ERROR: Failed to pull updates from remote repository
    echo Please check your Git configuration and network connection
    echo.
    pause
    exit /b 1
)

echo Repository updated successfully!
echo.

REM Update all submodules to latest commits
echo Updating submodules...
git submodule update --init --remote --recursive
if %errorlevel% neq 0 (
    echo WARNING: Failed to update submodules
    echo Please check your Git configuration and try again
    echo.
) else (
    echo Submodules updated successfully!
    echo.
)

REM Restore stashed changes if any were stashed
if %stashed% equ 1 (
    echo Restoring your local changes...
    git stash pop
    if %errorlevel% neq 0 (
        echo WARNING: Failed to restore stashed changes automatically
        echo Your changes are saved in the stash. You can restore them manually with:
        echo git stash pop
        echo.
    ) else (
        echo Local changes restored successfully!
        echo.
    )
)

echo Update complete!
pause