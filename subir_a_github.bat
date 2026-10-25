@echo off
echo =======================================================
echo   SUBIENDO PROYECTO KENDRA NAILS A GITHUB
echo =======================================================
echo.
echo Repositorio destino:
echo https://github.com/beltrekelvinariel-ai/catalogo-kendra-nails.git
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo =======================================================
    echo   [EXITO] Proyecto subido exitosamente a GitHub!
    echo   Ver en: https://github.com/beltrekelvinariel-ai/catalogo-kendra-nails
    echo =======================================================
) else (
    echo [ERROR] No se pudo completar la subida. Verifica tu sesion o token de GitHub.
)
echo.
pause
