# 🔧 Запуск без Docker (альтернативный способ)

## 📝 Когда использовать

Если у вас проблемы с Docker Desktop или его невозможно установить, можно запустить демо-систему с локальной установкой Kafka.

## 🚀 Быстрый способ (только Node.js сервисы)

Для демонстрации основных возможностей Producer/Consumer можно обойтись без Kafka:

### 1. Запуск сервисов

```bash
# Terminal 1: Producer (эмуляция)
cd producer
npm install
# Закомментируйте Kafka подключение в server.js для тестирования
npm start

# Terminal 2: Consumer (эмуляция)  
cd consumer
npm install
# Закомментируйте Kafka подключение в server.js для тестирования
npm start

# Terminal 3: Frontend
cd frontend
npm install
npm start
```

### 2. Тестирование API

```bash
# Проверка Producer
curl http://localhost:3001/health

# Проверка Consumer
curl http://localhost:3002/health
```

## 🐧 Локальная установка Kafka

### Windows (с WSL или Git Bash)

```bash
# 1. Скачать Kafka
curl -O https://downloads.apache.org/kafka/2.13-3.6.0/kafka_2.13-3.6.0.tgz
tar -xzf kafka_2.13-3.6.0.tgz
cd kafka_2.13-3.6.0

# 2. Запуск Zookeeper (Terminal 1)
bin/zookeeper-server-start.sh config/zookeeper.properties

# 3. Запуск Kafka (Terminal 2)
bin/kafka-server-start.sh config/server.properties

# 4. Создание тестового топика (Terminal 3)
bin/kafka-topics.sh --create --topic demo-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

### Linux/Mac

```bash
# 1. Установка через Homebrew (Mac)
brew install kafka

# Или скачать архив
wget https://downloads.apache.org/kafka/2.13-3.6.0/kafka_2.13-3.6.0.tgz
tar -xzf kafka_2.13-3.6.0.tgz
cd kafka_2.13-3.6.0

# 2. Запуск Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# 3. Запуск Kafka
bin/kafka-server-start.sh config/server.properties
```

## 🎯 Тестирование локальной Kafka

### Создание топика

```bash
bin/kafka-topics.sh --create --topic demo-topic --bootstrap-server localhost:9092
```

### Отправка сообщения

```bash
bin/kafka-console-producer.sh --topic demo-topic --bootstrap-server localhost:9092
# Введите сообщения и нажмите Enter
```

### Получение сообщений

```bash
bin/kafka-console-consumer.sh --topic demo-topic --from-beginning --bootstrap-server localhost:9092
```

## 🌐 Запуск Node.js сервисов с локальной Kafka

После запуска локальной Kafka:

```bash
# Terminal 4: Producer
cd services/producer
npm install
npm start

# Terminal 5: Consumer
cd services/consumer  
npm install
npm start

# Terminal 6: Frontend
cd services/frontend
npm install
npm start
```

## 📱 Доступные сервисы

- **React Dashboard**: http://localhost:3002
- **Producer API**: http://localhost:3000
- **Consumer API**: http://localhost:3001
- **Kafka Broker**: localhost:9092

## 🔧 Конфигурация без Schema Registry

Если Schema Registry недоступен, можно работать с простыми JSON сообщениями:

```javascript
// В producer/server.js и consumer/server.js
// Уберите зависимости от Schema Registry
// Работайте с обычными JSON объектами
```

## 🚨 Ограничения без Docker

- ❌ Нет Kafka UI для мониторинга
- ❌ Нет Schema Registry для валидации
- ❌ Нет автоматического управления volumes
- ✅ Основные функции Producer/Consumer работают
- ✅ React интерфейс полностью функционален
- ✅ WebSocket соединения работают

## 🎉 Готово к демонстрации

Даже без полной Docker инфраструктуры можно продемонстрировать:

1. **Producer API** - отправка сообщений
2. **Consumer API** - получение сообщений  
3. **React UI** - управление сервисами
4. **WebSocket** - real-time обновления
5. **Kafka CLI** - работа с топиками

## 🔄 Возврат к Docker

Когда Docker будет настроен, просто выполните:

```bash
docker-compose up -d
```

И получите полную функциональность системы!

---

**Рекомендация**: Все же стоит настроить Docker для полноценной демонстрации. См. [DOCKER_SETUP.md](DOCKER_SETUP.md)
