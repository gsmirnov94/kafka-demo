# 🚀 Kafka Demo Dashboard

Полноценная демо-система для вебинара по Apache Kafka с React фронтендом для управления Producer и Consumer сервисами.

## 🏗️ Архитектура

Система состоит из следующих компонентов:

- **Kafka Broker** - Apache Kafka 7.4.0
- **Zookeeper** - Координация кластера Kafka
- **Schema Registry** - Валидация схем сообщений
- **Producer Service** - Node.js сервис для отправки сообщений
- **Consumer Service** - Node.js сервис для потребления сообщений
- **React Frontend** - Веб-интерфейс для управления
- **Kafka UI** - Веб-интерфейс для мониторинга Kafka

## 🚀 Быстрый старт

### 1. Запуск инфраструктуры

```bash
# Запуск Kafka, Zookeeper, Schema Registry и Kafka UI
docker-compose up -d
```

**⚠️ Проблемы с Docker?** См. [DOCKER_SETUP.md](DOCKER_SETUP.md) для решения проблем с Docker Desktop.

### 2. Установка зависимостей

```bash
# Producer сервис
cd services/producer
npm install

# Consumer сервис
cd ../services/consumer
npm install

# React фронтенд
cd ../services/frontend
npm install
```

### 3. Запуск сервисов

```bash
# Terminal 1: Producer сервис
cd services/producer
npm start

# Terminal 2: Consumer сервис
cd services/consumer
npm start

# Terminal 3: React фронтенд
cd services/frontend
npm start
```

## 🌐 Доступные сервисы

- **React Dashboard**: http://localhost:3000
- **Producer API**: http://localhost:3001
- **Consumer API**: http://localhost:3002
- **Kafka UI**: http://localhost:8080
- **Schema Registry**: http://localhost:8081
- **Schema Registry UI**: http://localhost:8082
- **Kafka Broker**: localhost:9092

## 📖 Использование

### 1. Создание топиков
- Откройте React Dashboard
- В разделе "Producer Service" нажмите "Create New Topic"
- Введите название топика

### 2. Отправка сообщений
- Выберите топик из списка или введите новый
- Введите сообщение
- Опционально укажите ключ сообщения
- Нажмите "Send Message"

### 3. Потребление сообщений
- В разделе "Consumer Service" введите названия топиков через запятую
- Нажмите "Start Consumer"
- Сообщения будут отображаться в реальном времени в разделе "Received Messages"

### 4. Schema Registry и валидация схем
- **Создание схемы**: Используйте Schema Registry API для регистрации Avro схем
- **Валидация**: Настройте Producer для автоматической валидации сообщений по схеме
- **Совместимость**: Проверяйте совместимость версий схем при обновлении
- **Мониторинг**: Используйте Schema Registry UI для управления схемами

Подробные инструкции см. в [SCHEMA_REGISTRY.md](schemas/SCHEMA_REGISTRY.md)

#### Быстрое тестирование Schema Registry

```bash
# Переход в папку schemas
cd schemas

# Простой тест создания Avro схемы
./test-avro-schema.sh

# Создание полного набора схем
./create-schemas.sh
```

**⚠️ Требования**: Установите [jq](schemas/INSTALL_JQ.md) для работы со скриптами

### 5. Мониторинг
- Используйте Kafka UI для просмотра топиков, партиций и сообщений
- Schema Registry для управления схемами
- **Schema Registry UI** для удобного веб-интерфейса управления схемами

## 🔧 Конфигурация

### Producer Service
- Порт: 3001
- Kafka brokers: localhost:9092
- Автоматическое создание топиков включено

### Consumer Service
- Порт: 3002
- Kafka brokers: localhost:9092
- Group ID: demo-consumer-group
- WebSocket для real-time обновлений

### Kafka Configuration
- Брокер ID: 1
- Партиции: 1 (для демо)
- Replication Factor: 1 (для демо)
- Автосоздание топиков включено

## 📁 Структура проекта

```
kafka-demo/
├── docker-compose.yml          # Docker инфраструктура
├── producer/                   # Producer сервис
│   ├── package.json
│   └── server.js
├── consumer/                   # Consumer сервис
│   ├── package.json
│   └── server.js
├── frontend/                   # React приложение
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── schemas/                    # Schema Registry документация и скрипты
│   ├── README.md              # Обзор Schema Registry
│   ├── QUICKSTART.md          # Быстрый старт
│   ├── SCHEMA_REGISTRY.md     # Полное руководство
│   ├── create-schemas.sh      # Скрипт создания схем
│   ├── test-avro-schema.sh    # Тест Avro схемы
│   └── INSTALL_JQ.md          # Установка jq
└── README.md
```

## 🛠️ Разработка

### Запуск в режиме разработки

```bash
# Producer с автоперезагрузкой
cd producer
npm run dev

# Consumer с автоперезагрузкой
cd consumer
npm run dev

# React с hot reload
cd frontend
npm start
```

### Логи

```bash
# Просмотр логов Docker контейнеров
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f kafka
docker-compose logs -f schema-registry
```

## 🧪 Тестирование

### Проверка здоровья сервисов

```bash
# Producer
curl http://localhost:3001/health

# Consumer
curl http://localhost:3002/health

# Schema Registry
curl http://localhost:8081/subjects
```

### Отправка тестового сообщения

```bash
curl -X POST http://localhost:3001/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test-topic",
    "message": "Hello Kafka!",
    "key": "test-key"
  }'
```

## 🚨 Устранение неполадок

### Проблемы с подключением к Kafka
1. Убедитесь, что Docker контейнеры запущены
2. Проверьте логи: `docker-compose logs kafka`
3. Убедитесь, что порт 9092 доступен

### Producer не может отправить сообщения
1. Проверьте подключение к Kafka
2. Убедитесь, что топик существует
3. Проверьте логи Producer сервиса

### Consumer не получает сообщения
1. Убедитесь, что Consumer запущен
2. Проверьте подписку на правильные топики
3. Проверьте Group ID

### React приложение не подключается
1. Убедитесь, что Producer и Consumer сервисы запущены
2. Проверьте CORS настройки
3. Проверьте консоль браузера на ошибки

## 🔒 Безопасность

⚠️ **Внимание**: Данная демо-система предназначена только для локальной разработки и демонстрации. Не используйте в продакшене без дополнительной настройки безопасности.

## 📚 Дополнительные ресурсы

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Platform](https://docs.confluent.io/)
- [KafkaJS Documentation](https://kafka.js.org/)
- [React Documentation](https://reactjs.org/docs/)

## 🤝 Поддержка

Для вопросов по демо-системе обращайтесь к автору вебинара.

---

**Удачного изучения Apache Kafka! 🎉**
