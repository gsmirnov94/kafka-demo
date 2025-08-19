# 📋 Schema Registry - Схемы данных

## 🚀 Быстрый старт (5 минут)

### 1. Запуск инфраструктуры
```bash
docker-compose up -d
```

### 2. Регистрация схемы
```bash
cd schemas
./register-user-schema.sh
```

### 3. Тестирование
```bash
# В отдельном терминале запустите Producer
cd ../producer && npm start

# Вернитесь в папку схем и протестируйте
cd ../schemas
./test-user-schema.sh
```

## 🎯 Схема User

### 📊 Базовая схема v1
```json
{
  "type": "record",
  "name": "User",
  "namespace": "com.kafka.demo",
  "fields": [
    {"name": "name", "type": "string"},
    {"name": "age", "type": "int"}
  ]
}
```

### 📊 Расширенная схема v2
```json
{
  "type": "record",
  "name": "User",
  "namespace": "com.kafka.demo",
  "fields": [
    {"name": "name", "type": "string"},
    {"name": "age", "type": "int"},
    {"name": "email", "type": ["null", "string"], "default": null}
  ]
}
```

### 📁 Файлы схемы
- **`user.avsc`** / **`user-schema.json`** - Базовая схема v1
- **`user-v2.avsc`** / **`user-v2-schema.json`** - Расширенная схема v2
- **`register-user-schema.sh`** - Регистрация схемы
- **`test-user-schema.sh`** - Тестирование схемы
- **`check-compatibility.sh`** - Проверка совместимости
- **`example-producer-usage.js`** - Пример использования в Producer

## 🚀 Быстрый старт

### 1. Запуск инфраструктуры

```bash
# Запуск Kafka, Schema Registry и UI
docker-compose up -d
```

### 2. Регистрация схемы

```bash
# Переход в папку схем
cd schemas

# Регистрация схемы User в Schema Registry
./register-user-schema.sh
```

### 3. Тестирование схемы

```bash
# Запуск Producer сервиса (в отдельном терминале)
cd ../producer
npm start

# Тестирование схемы с отправкой сообщения
cd ../schemas
./test-user-schema.sh
```

### 4. Проверка совместимости

```bash
# Проверка совместимости между версиями схем
./check-compatibility.sh
```

## 🌐 Доступные сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| **Schema Registry** | http://localhost:8081 | API для управления схемами |
| **Schema Registry UI** | http://localhost:8082 | Веб-интерфейс управления |
| **Kafka UI** | http://localhost:8080 | Мониторинг Kafka кластера |
| **Producer API** | http://localhost:3000 | API для отправки сообщений |
| **Consumer API** | http://localhost:3001 | API для получения сообщений |

## 🔧 Использование схемы

### Регистрация через API

```bash
curl -X POST \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d @user-schema.json \
  http://localhost:8081/subjects/user-value/versions
```

### Проверка зарегистрированной схемы

```bash
# Список всех субъектов
curl http://localhost:8081/subjects

# Последняя версия схемы User
curl http://localhost:8081/subjects/user-value/versions/latest

# Все версии схемы User
curl http://localhost:8081/subjects/user-value/versions
```

### Использование в Producer

```javascript
// Пример интеграции с Schema Registry
const { sendUserMessage } = require('./example-producer-usage');

// Отправка сообщения с валидацией
await sendUserMessage({
  name: 'Иван Петров',
  age: 25
});
```

## 📊 Мониторинг

### Schema Registry UI
- **URL**: http://localhost:8082
- **Функции**: Просмотр, редактирование, удаление схем

### Kafka UI
- **URL**: http://localhost:8080
- **Функции**: Мониторинг топиков, сообщений, схем

## 🧪 Примеры и тестирование

### Валидные сообщения

**User v1:**
```json
{"name": "Анна Сидорова", "age": 30}
```

**User v2:**
```json
{"name": "Петр Иванов", "age": 28, "email": "petr@example.com"}
```

### Отправка через Producer API
```bash
curl -X POST http://localhost:3000/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "user-topic",
    "message": {"name": "Петр Иванов", "age": 28},
    "key": "user-002"
  }'
```

### ✅ Результаты тестирования

- **Схема v1 зарегистрирована** - ID: 2
- **Схема v2 зарегистрирована** - ID: 3  
- **Совместимость проверена** - v2 обратно совместима с v1
- **Producer API протестирован** - сообщения успешно отправляются

## 🔄 Эволюция схем

### Принципы совместимости

✅ **Разрешено**:
- Добавление новых полей с значением по умолчанию
- Изменение типа поля на union с null
- Удаление необязательных полей

❌ **Запрещено**:
- Изменение типа существующего поля
- Удаление обязательных полей
- Изменение порядка полей

### Проверка совместимости

```bash
curl -X POST \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d @user-v2-schema.json \
  http://localhost:8081/compatibility/subjects/user-value/versions/latest
```

## 🚨 Устранение неполадок

### Schema Registry недоступен
```bash
# Проверка статуса контейнера
docker-compose ps schema-registry

# Просмотр логов
docker-compose logs schema-registry

# Перезапуск
docker-compose restart schema-registry
```

### Ошибка валидации схемы
- Проверьте синтаксис Avro схемы
- Убедитесь, что все обязательные поля присутствуют
- Проверьте типы данных

### Проблемы с Producer API
```bash
# Проверка статуса
curl http://localhost:3000/health

# Просмотр логов
cd producer
npm start
```

## 📚 Дополнительные ресурсы

- [Apache Avro Documentation](https://avro.apache.org/docs/current/)
- [Confluent Schema Registry](https://docs.confluent.io/platform/current/schema-registry/index.html)
- [Schema Registry API Reference](https://docs.confluent.io/platform/current/schema-registry/develop/api.html)

---

## 🎉 Заключение

Система схем User обеспечивает типобезопасность, эволюцию схем, обратную совместимость и автоматизацию управления. Готова к продакшн использованию!

**Удачной работы со Schema Registry! 🚀** 