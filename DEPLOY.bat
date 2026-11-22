@echo off
title Deploy Claudy
cd /d "%~dp0"
echo Mengunggah website Claudy ke https://claudy-fb679.web.app ...
echo.
call firebase.cmd deploy --only hosting --project claudy-fb679
echo.
echo Selesai. Kalau di atas ada tulisan "Deploy complete!", website sudah tayang.
pause
