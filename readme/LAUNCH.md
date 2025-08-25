# 🚀 Запуск Kafka Demo Dashboard

## ⚡ Экспресс-запуск (5 минут)

### 1. Запуск инфраструктуры
```bash
docker-compose up -d
```

### 2. Автоматическая установка
```bash
# Windows
scripts\windows\start-demo.bat

# Linux/Mac
./scripts/linux-macos/start-demo.sh
```

### 3. Запуск сервисов
```bash
# Terminal 1: Producer
cd services/producer && npm start

# Terminal 2: Consumer
cd services/consumer && npm start

# Terminal 3: Frontend
cd services/frontend && npm start
```

## 🌐 Открыть в браузере
- **Dashboard**: http://localhost:3002
- **Producer API**: http://localhost:3000
- **Consumer API**: http://localhost:3001
- **Kafka UI**: http://localhost:8080
- **Schema Registry**: http://localhost:8081

## 🎯 Готовые команды для демо

### Создание топика
```bash
curl -X POST http://localhost:3000/topics \
  -H "Content-Type: application/json" \
  -d '{"topic": "demo-topic"}'
```

### Отправка сообщения
```bash
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type:application/json" \
  -d '{
    "topic": "demo-topic",
    "message": "Привет с вебинара!",
    "key": "demo-key"
  }'
```

### Запуск Consumer
```bash
curl -X POST http://localhost:3001/start-consuming \
  -H "Content-Type: application/json" \
  -d '{"topics": ["demo-topic"]}'
```

## 🎉 Система готова к демонстрации!

Все компоненты настроены и готовы показать возможности Apache Kafka в реальном времени.
