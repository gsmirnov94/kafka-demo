@echo off
chcp 65001 >nul
echo 🧪 Testing Kafka Demo Services
echo ================================

REM Test Producer
echo Testing Producer (http://localhost:3000)...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Producer is running
    
    REM Test topics endpoint
    echo Testing topics endpoint...
    for /f "delims=" %%i in ('curl -s http://localhost:3000/topics') do set TOPICS_RESPONSE=%%i
    echo Topics response: %TOPICS_RESPONSE%
) else (
    echo ❌ Producer is not responding
)

echo.

REM Test Consumer
echo Testing Consumer (http://localhost:3001)...
curl -s http://localhost:3001/status >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Consumer is running
    
    REM Test status endpoint
    echo Testing status endpoint...
    for /f "delims=" %%i in ('curl -s http://localhost:3001/status') do set STATUS_RESPONSE=%%i
    echo Status response: %STATUS_RESPONSE%
) else (
    echo ❌ Consumer is not responding
)

echo.

REM Test Frontend
echo Testing Frontend (http://localhost:3002)...
curl -s http://localhost:3002 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running
) else (
    echo ❌ Frontend is not responding
)

echo.
echo 🎯 Test completed!
pause
