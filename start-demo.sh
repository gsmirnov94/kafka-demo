#!/bin/bash

echo "🚀 Запуск Kafka Demo Dashboard..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker Desktop."
    exit 1
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Пожалуйста, установите Node.js."
    exit 1
fi

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен. Пожалуйста, установите npm."
    exit 1
fi

echo "✅ Все необходимые инструменты установлены"

# Запуск Docker инфраструктуры
echo "🐳 Запуск Kafka, Zookeeper и Schema Registry..."
docker-compose up -d

# Ожидание запуска Kafka
echo "⏳ Ожидание запуска Kafka..."
sleep 30

# Проверка статуса Kafka
echo "🔍 Проверка статуса Kafka..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Kafka UI доступен"
else
    echo "⚠️ Kafka UI еще не готов, продолжаем..."
fi

# Установка зависимостей Producer
echo "📦 Установка зависимостей Producer сервиса..."
cd producer
npm install
cd ..

# Установка зависимостей Consumer
echo "📦 Установка зависимостей Consumer сервиса..."
cd consumer
npm install
cd ..

# Установка зависимостей Frontend
echo "📦 Установка зависимостей React фронтенда..."
cd frontend
npm install
cd ..

echo ""
echo "🎉 Установка завершена!"
echo ""
echo "📋 Для запуска демо-системы выполните следующие команды в разных терминалах:"
echo ""
echo "Terminal 1 (Producer):"
echo "  cd producer && npm start"
echo ""
echo "Terminal 2 (Consumer):"
echo "  cd consumer && npm start"
echo ""
echo "Terminal 3 (Frontend):"
echo "  cd frontend && npm start"
echo ""
echo "🌐 Доступные сервисы:"
echo "  - React Dashboard: http://localhost:3000"
echo "  - Producer API: http://localhost:3001"
echo "  - Consumer API: http://localhost:3002"
echo "  - Kafka UI: http://localhost:8080"
echo "  - Schema Registry: http://localhost:8081"
echo ""
echo "📚 Подробная документация в README.md"
echo ""
echo "🚀 Удачного вебинара по Kafka!"
