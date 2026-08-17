@echo off
REM Double-click this file to paste your Gemini API key into .env.local.
title AlgoKabs - set Gemini API key
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0set-key.ps1"
echo.
pause
