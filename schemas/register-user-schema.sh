#!/bin/bash

# Скрипт для регистрации схемы User в Schema Registry
# Убедитесь, что Schema Registry запущен на localhost:8081

# Получаем директорию, где находится скрипт
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SCHEMA_REGISTRY_URL="http://localhost:8081"
SUBJECT_NAME="user-value"  # Имя субъекта для схемы
SCHEMA_FILE="$SCRIPT_DIR/user-schema.json"

echo "🚀 Регистрация схемы User в Schema Registry..."
echo "📍 URL: $SCHEMA_REGISTRY_URL"
echo "📋 Субъект: $SUBJECT_NAME"
echo "📄 Файл схемы: $SCHEMA_FILE"
echo ""

# Проверяем, что Schema Registry доступен
echo "🔍 Проверка доступности Schema Registry..."
if curl -s "$SCHEMA_REGISTRY_URL/subjects" > /dev/null; then
    echo "✅ Schema Registry доступен"
else
    echo "❌ Schema Registry недоступен. Убедитесь, что сервис запущен."
    echo "💡 Запустите: docker-compose up -d"
    exit 1
fi

# Проверяем существование файла схемы
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Файл схемы $SCHEMA_FILE не найден"
    exit 1
fi

echo ""
echo "📤 Отправка схемы в Schema Registry..."

# Регистрируем схему
RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/vnd.schemaregistry.v1+json" \
    -d @$SCHEMA_FILE \
    "$SCHEMA_REGISTRY_URL/subjects/$SUBJECT_NAME/versions")

echo "📥 Ответ от Schema Registry:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🔍 Проверяем зарегистрированную схему..."

# Получаем информацию о зарегистрированной схеме
SCHEMA_INFO=$(curl -s "$SCHEMA_REGISTRY_URL/subjects/$SUBJECT_NAME/versions/latest")
echo "📋 Информация о схеме:"
echo "$SCHEMA_INFO" | jq '.' 2>/dev/null || echo "$SCHEMA_INFO"

echo ""
echo "🎉 Схема User успешно зарегистрирована в Schema Registry!"
echo "🌐 Schema Registry UI доступен по адресу: http://localhost:8082"
echo "📊 Kafka UI доступен по адресу: http://localhost:8080" 