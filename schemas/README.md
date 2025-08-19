# 📋 Schema Registry - Примеры использования

Этот раздел содержит примеры схем для валидации сообщений в Kafka с использованием Schema Registry.

## 🚀 Быстрый старт

### 1. Проверка доступности Schema Registry

```bash
# Проверка здоровья сервиса
curl http://localhost:8081/subjects

# Получение списка схем
curl http://localhost:8081/subjects
```

### 2. Регистрация схемы

```bash
# Создание JSON схемы для пользователя
curl -X POST http://localhost:8081/subjects/users-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{
    "schema": "{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\"},\"name\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"}},\"required\":[\"id\",\"name\",\"email\"]}"
  }'
```

### 3. Получение схемы

```bash
# Получение последней версии схемы
curl http://localhost:8081/subjects/users-value/versions/latest

# Получение конкретной версии схемы
curl http://localhost:8081/subjects/users-value/versions/1
```

## 📝 Примеры схем

### Пользователь (User)

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "Уникальный идентификатор пользователя"
    },
    "name": {
      "type": "string",
      "description": "Имя пользователя"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Email адрес пользователя"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Дата создания пользователя"
    }
  },
  "required": ["id", "name", "email"],
  "additionalProperties": false
}
```

### Заказ (Order)

```json
{
  "type": "object",
  "properties": {
    "orderId": {
      "type": "string",
      "description": "Уникальный идентификатор заказа"
    },
    "userId": {
      "type": "integer",
      "description": "ID пользователя, сделавшего заказ"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "productId": {
            "type": "string"
          },
          "quantity": {
            "type": "integer",
            "minimum": 1
          },
          "price": {
            "type": "number",
            "minimum": 0
          }
        },
        "required": ["productId", "quantity", "price"]
      }
    },
    "totalAmount": {
      "type": "number",
      "minimum": 0
    },
    "status": {
      "type": "string",
      "enum": ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    }
  },
  "required": ["orderId", "userId", "items", "totalAmount", "status"]
}
```

### Лог событий (Event Log)

```json
{
  "type": "object",
  "properties": {
    "eventId": {
      "type": "string",
      "description": "Уникальный идентификатор события"
    },
    "eventType": {
      "type": "string",
      "enum": ["user_created", "user_updated", "order_placed", "order_cancelled"]
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "userId": {
      "type": "integer"
    },
    "metadata": {
      "type": "object",
      "additionalProperties": true
    }
  },
  "required": ["eventId", "eventType", "timestamp"]
}
```

## 🔧 Интеграция с Producer/Consumer

### Producer с валидацией схемы

```javascript
const { SchemaRegistry } = require('@kafkajs/confluent-schema-registry');

const schemaRegistry = new SchemaRegistry({
  host: 'http://localhost:8081'
});

// Регистрация схемы
const schema = await schemaRegistry.register({
  type: 'JSON',
  schema: JSON.stringify(userSchema)
});

// Отправка сообщения с валидацией
await producer.send({
  topic: 'users',
  messages: [{
    key: 'user-123',
    value: await schemaRegistry.encode(schema.id, userData)
  }]
});
```

### Consumer с десериализацией

```javascript
// Получение схемы
const schema = await schemaRegistry.getSchema(schemaId);

// Десериализация сообщения
const decodedMessage = await schemaRegistry.decode(message.value);
```

## 🧪 Тестирование схем

### Проверка совместимости

```bash
# Проверка совместимости новой версии схемы
curl -X POST http://localhost:8081/compatibility/subjects/users-value/versions/latest \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{
    "schema": "{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"integer\"},\"name\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"age\":{\"type\":\"integer\"}},\"required\":[\"id\",\"name\",\"email\"]}"
  }'
```

### Удаление схемы

```bash
# Удаление конкретной версии схемы
curl -X DELETE http://localhost:8081/subjects/users-value/versions/1

# Удаление всех версий схемы
curl -X DELETE http://localhost:8081/subjects/users-value
```

## 📊 Мониторинг

### Статистика Schema Registry

```bash
# Получение статистики
curl http://localhost:8081/subjects/users-value/versions/1/schema

# Получение конфигурации
curl http://localhost:8081/config
```

## 🔒 Настройки безопасности

### CORS настройки

```bash
# Настройка CORS для веб-интерфейса
curl -X PUT http://localhost:8081/config \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{
    "compatibility": "BACKWARD"
  }'
```

## 📚 Дополнительные ресурсы

- [Confluent Schema Registry Documentation](https://docs.confluent.io/platform/current/schema-registry/index.html)
- [JSON Schema Specification](https://json-schema.org/)
- [Avro Schema Specification](https://avro.apache.org/docs/current/spec.html)

## 🚨 Устранение неполадок

### Частые проблемы

1. **Schema Registry недоступен**
   - Проверьте статус Docker контейнера
   - Убедитесь, что порт 8081 свободен

2. **Ошибки валидации**
   - Проверьте формат JSON схемы
   - Убедитесь в совместимости версий

3. **Проблемы с кодированием/декодированием**
   - Проверьте ID схемы
   - Убедитесь в правильности формата данных
