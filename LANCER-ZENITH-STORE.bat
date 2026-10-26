@echo off
title Zenith Store - Serveur & Admin
echo ======================================================
echo   Demarrage de Zenith Store Backend...
echo ======================================================
cd /d "C:\Users\deksa\Desktop\siteweb"
start "" "http://localhost:3000/admin.html"
node server.js
pause
