@echo off
echo === Deep AI Chat Dependency Installer ===
echo.
echo This script will install all required dependencies for the application.
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

REM Show Node.js version
echo Using Node.js:
node --version
echo.

REM Show npm version
echo Using npm:
npm --version
echo.

REM Run the installer script
echo Starting dependency installation...
echo.
node install-dependencies.js

REM Check if installation was successful
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installation failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo === Installation completed successfully ===
echo.
echo You can now run the application with:
echo   npm start
echo.
echo Or build the application with:
echo   npm run build
echo.

pause 