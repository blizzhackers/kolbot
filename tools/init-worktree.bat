@echo off
rem Copies your local kolbot setup (profiles, keys, configs, data) into another worktree.
rem Run with no arguments for the interactive picker; arguments pass through to the .ps1.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0init-worktree.ps1" %*
set rc=%errorlevel%
if "%~1"=="" pause
exit /b %rc%
