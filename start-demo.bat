@echo off
chcp 65001 >nul
echo 🚀 Запуск Kafka Demo Dashboard...

REM Проверка наличия Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker не установлен. Пожалуйста, установите Docker Desktop.
    pause
    exit /b 1
)

REM Проверка наличия Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose.
    pause
    exit /b 1
)

REM Проверка наличия Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен. Пожалуйста, установите Node.js.
    pause
    exit /b 1
)

REM Проверка наличия npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm не установлен. Пожалуйста, установите npm.
    pause
    exit /b 1
)

echo ✅ Все необходимые инструменты установлены

REM Запуск Docker инфраструктуры
echo 🐳 Запуск Kafka, Zookeeper и Schema Registry...
docker-compose up -d

REM Ожидание запуска Kafka
echo ⏳ Ожидание запуска Kafka...
timeout /t 30 /nobreak >nul

REM Установка зависимостей Producer
echo 📦 Установка зависимостей Producer сервиса...
cd producer
call npm install
cd ..

REM Установка зависимостей Consumer
echo 📦 Установка зависимостей Consumer сервиса...
cd consumer
call npm install
cd ..

REM Установка зависимостей Frontend
echo 📦 Установка зависимостей React фронтенда...
cd frontend
call npm install
cd ..

echo.
echo 🎉 Установка завершена!
echo.
echo 📋 Для запуска демо-системы выполните следующие команды в разных терминалах:
echo.
echo Terminal 1 (Producer):
echo   cd producer ^&^& npm start
echo.
echo Terminal 2 (Consumer):
echo   cd consumer ^&^& npm start
echo.
echo Terminal 3 (Frontend):
echo   cd frontend ^&^& npm start
echo.
echo 🌐 Доступные сервисы:
echo   - React Dashboard: http://localhost:3000
echo   - Producer API: http://localhost:3001
echo   - Consumer API: http://localhost:3002
echo   - Kafka UI: http://localhost:8080
echo   - Schema Registry: http://localhost:8081
echo.
echo 📚 Подробная документация в README.md
echo.
echo 🚀 Удачного вебинара по Kafka!
pause
