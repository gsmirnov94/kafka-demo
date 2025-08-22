@echo off
chcp 65001 >nul
echo 🚀 Starting Kafka Demo with Docker (Full Stack)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start all services
echo 🔨 Building and starting all services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service status
echo 📊 Service Status:
docker-compose ps

echo.
echo ✅ All services are now running!
echo.
echo 🌐 Access your applications:
echo    Frontend:     http://localhost:3002
echo    Producer:     http://localhost:3000
echo    Consumer:     http://localhost:3001
echo    Kafka UI:     http://localhost:8080
echo    Schema Registry UI: http://localhost:8082
echo.
echo 📝 To view logs: docker-compose logs -f [service-name]
echo 🛑 To stop: docker-compose down
pause
