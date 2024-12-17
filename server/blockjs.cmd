@echo off
REM This CMD script will pass any arguments to node cli.js

REM Check if node is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install it to run this script.
    exit /b 1
)

REM Pass all arguments to node cli.js
node cli.js %*

REM End of script
