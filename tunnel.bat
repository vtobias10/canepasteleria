@echo off
title Cane Pasteleria - Tunnel publico
cd /d C:\Users\tobiv\Desktop\canepasteleria

echo.
echo  ✿ Cane Pasteleria - Tunnel publico
echo  =====================================
echo.

echo [1/3] Construyendo el proyecto...
call npm run build
if errorlevel 1 (
  echo ERROR: Fallo el build. Revisa los errores arriba.
  pause
  exit /b 1
)

echo.
echo [2/3] Iniciando servidor de archivos...
start "Cane - Servidor" cmd /k "cd /d C:\Users\tobiv\Desktop\canepasteleria && npm run preview -- --host --port 4173"
timeout /t 6 /nobreak > nul

echo.
echo [3/3] Iniciando tunnel con Cloudflare...
echo         (aguarda unos segundos para ver el enlace)
echo.

cloudflared tunnel --url http://localhost:4173 --protocol http2

pause
