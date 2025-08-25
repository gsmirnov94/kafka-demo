# 🧪 Тестирование Kafka Demo Dashboard

## ✅ Предварительные проверки

### 1. Проверка Docker
```bash
docker --version
docker-compose --version
```

### 2. Проверка Node.js
```bash
node --version
npm --version
```

### 3. Проверка портов
```bash
# Проверка свободных портов
netstat -an | findstr "3000\|3001\|3002\|8080\|8081\|9092"

# Проверка занятых портов
netstat -an | findstr ":3000\|:3001\|:3002\|:8080\|:8081\|:9092"
```

## 🚀 Пошаговое тестирование

### Этап 1: Запуск инфраструктуры

```bash
# Запуск Docker контейнеров
docker-compose up -d

# Проверка статуса
docker-compose ps

# Проверка логов
docker-compose logs kafka
docker-compose logs schema-registry
```

**Ожидаемый результат**: Все контейнеры в статусе "Up"

### Этап 2: Проверка доступности сервисов

```bash
# Schema Registry
curl http://localhost:8081/subjects

# Kafka UI (может быть еще не готов)
curl http://localhost:8080
```

**Ожидаемый результат**: HTTP 200 OK

### Этап 3: Установка зависимостей

```bash
# Producer
cd services/producer
npm install
cd ../..

# Consumer  
cd services/consumer
npm install
cd ../..

# Frontend
cd services/frontend
npm install
cd ../..
```

**Ожидаемый результат**: Успешная установка без ошибок

### Этап 4: Запуск Producer

```bash
cd services/producer
npm start
```

**Ожидаемый результат**: 
```
Producer service running on port 3000
Producer connected to Kafka
```

### Этап 5: Тестирование Producer API

```bash
# Проверка здоровья
curl http://localhost:3000/health

# Создание топика
curl -X POST http://localhost:3000/topics \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic"}'

# Отправка сообщения
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test-topic",
    "message": "Test message",
    "key": "test-key"
  }'
```

**Ожидаемый результат**: JSON ответы с успешными статусами

### Этап 6: Запуск Consumer

```bash
cd services/consumer
npm start
```

**Ожидаемый результат**: 
```
Consumer service running on port 3001
Consumer connected to Kafka
```

### Этап 7: Тестирование Consumer API

```bash
# Проверка здоровья
curl http://localhost:3002/health

# Запуск Consumer
curl -X POST http://localhost:3002/start-consuming \
  -H "Content-Type: application/json" \
  -d '{"topics": ["test-topic"]}'

# Проверка статуса
curl http://localhost:3002/status
```

**Ожидаемый результат**: Consumer запущен и подписан на топик

### Этап 8: Тестирование end-to-end

```bash
# Отправка нового сообщения
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test-topic",
    "message": "End-to-end test",
    "key": "e2e-key"
  }'
```

**Ожидаемый результат**: Сообщение получено Consumer'ом

### Этап 9: Запуск Frontend

```bash
cd services/frontend
npm start
```

**Ожидаемый результат**: React приложение запущено на http://localhost:3002

### Этап 10: Тестирование UI

1. Открыть http://localhost:3002
2. Создать топик через интерфейс
3. Отправить сообщение
4. Запустить Consumer
5. Проверить получение сообщений

**Ожидаемый результат**: Все функции работают корректно

## 🔍 Проверка логов

### Producer логи
```bash
# В терминале Producer
# Должны быть сообщения о подключении и отправке
```

### Consumer логи
```bash
# В терминале Consumer
# Должны быть сообщения о подключении и получении
```

### Docker логи
```bash
docker-compose logs -f
```

## 🚨 Устранение проблем

### Проблема: Kafka не запускается
```bash
# Проверка ресурсов
docker stats

# Перезапуск
docker-compose down
docker-compose up -d
```

### Проблема: Producer не подключается
```bash
# Проверка доступности Kafka
telnet localhost 9092

# Проверка логов
docker-compose logs kafka
```

### Проблема: Consumer не получает сообщения
```bash
# Проверка подписки
curl http://localhost:3002/status

# Перезапуск Consumer
curl -X POST http://localhost:3002/stop-consuming
curl -X POST http://localhost:3002/start-consuming \
  -H "Content-Type: application/json" \
  -d '{"topics": ["test-topic"]}'
```

### Проблема: Frontend не подключается
```bash
# Проверка CORS
# Проверка консоли браузера
# Проверка доступности API
curl http://localhost:3000/health
curl http://localhost:3001/health
```

## 📊 Метрики производительности

### Latency тест
```bash
# Измерение времени отправки
time curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "message": "test"}'
```

### Throughput тест
```bash
# Отправка множества сообщений
for i in {1..100}; do
  curl -X POST http://localhost:3000/send-message \
    -H "Content-Type: application/json" \
    -d "{\"topic\": \"test-topic\", \"message\": \"message-$i\"}" &
done
wait
```

## ✅ Критерии успешного тестирования

- [ ] Docker контейнеры запущены
- [ ] Producer подключается к Kafka
- [ ] Consumer подключается к Kafka
- [ ] API endpoints отвечают корректно
- [ ] Сообщения отправляются и получаются
- [ ] Frontend отображает данные
- [ ] WebSocket соединение работает
- [ ] Schema Registry доступен
- [ ] Kafka UI доступен

## 🎯 Готовность к демонстрации

Система готова к демонстрации, если все критерии тестирования выполнены успешно.

**Время полного тестирования**: ~10-15 минут
**Уровень сложности**: Начальный
**Требования**: Docker, Node.js, npm
