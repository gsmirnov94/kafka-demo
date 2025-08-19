# 🚀 Быстрый запуск Kafka Demo

## ⚡ 5 минут до запуска

### 1. Запуск инфраструктуры
```bash
docker-compose up -d
```

**⚠️ Docker не запущен?** → [START_DOCKER.md](START_DOCKER.md) (быстрое решение)  
**⚠️ Ошибка прав доступа?** → Запустите терминал от имени администратора  
**⚠️ Проблемы с Docker?** → [DOCKER_SETUP.md](DOCKER_SETUP.md) (полное руководство)  
**⚠️ Без Docker?** → [NO_DOCKER_SETUP.md](NO_DOCKER_SETUP.md) (альтернатива)

### 2. Установка зависимостей (автоматически)
```bash
# Windows
start-demo.bat

# Linux/Mac
./start-demo.sh
```

### 3. Запуск сервисов (в разных терминалах)
```bash
# Terminal 1: Producer
cd producer && npm start

# Terminal 2: Consumer  
cd consumer && npm start

# Terminal 3: Frontend
cd frontend && npm start
```

## 🌐 Открыть в браузере
- **Dashboard**: http://localhost:3000
- **Kafka UI**: http://localhost:8080
- **Schema Registry**: http://localhost:8081

## 🎯 Что демонстрировать

### Producer
1. Создать топик "demo-topic"
2. Отправить сообщение "Hello Kafka!"
3. Показать создание топиков через API

### Consumer
1. Подписаться на топик "demo-topic"
2. Показать получение сообщений в реальном времени
3. Продемонстрировать WebSocket соединение

### Schema Registry
1. Открыть http://localhost:8081
2. Показать регистрацию схем
3. Объяснить валидацию сообщений

### Kafka UI
1. Открыть http://localhost:8080
2. Показать топики, партиции, сообщения
3. Продемонстрировать мониторинг

## 📱 Готовые примеры для демо

### Создание топика
```bash
curl -X POST http://localhost:3001/topics \
  -H "Content-Type: application/json" \
  -d '{"topic": "demo-topic"}'
```

### Отправка сообщения
```bash
curl -X POST http://localhost:3001/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "demo-topic",
    "message": "Привет с вебинара!",
    "key": "demo-key"
  }'
```

### Запуск Consumer
```bash
curl -X POST http://localhost:3002/start-consuming \
  -H "Content-Type: application/json" \
  -d '{"topics": ["demo-topic"]}'
```

## 🎉 Готово к вебинару!

Система полностью настроена и готова к демонстрации всех возможностей Apache Kafka.
