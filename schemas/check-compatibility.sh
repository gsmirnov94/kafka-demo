#!/bin/bash

# Скрипт для проверки совместимости схем User
# Проверяет совместимость между версиями схем

# Получаем директорию, где находится скрипт
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SCHEMA_REGISTRY_URL="http://localhost:8081"
SUBJECT_NAME="user-value"
V1_SCHEMA="$SCRIPT_DIR/user-schema.json"
V2_SCHEMA="$SCRIPT_DIR/user-v2-schema.json"

echo "🔍 Проверка совместимости схем User..."
echo "📍 Schema Registry: $SCHEMA_REGISTRY_URL"
echo "📋 Субъект: $SUBJECT_NAME"
echo ""

# Проверяем, что Schema Registry доступен
echo "🔍 Проверка доступности Schema Registry..."
if curl -s "$SCHEMA_REGISTRY_URL/subjects" > /dev/null; then
    echo "✅ Schema Registry доступен"
else
    echo "❌ Schema Registry недоступен. Убедитесь, что сервис запущен."
    exit 1
fi

# Проверяем существование файлов схем
if [ ! -f "$V1_SCHEMA" ]; then
    echo "❌ Файл схемы $V1_SCHEMA не найден"
    exit 1
fi

if [ ! -f "$V2_SCHEMA" ]; then
    echo "❌ Файл схемы $V2_SCHEMA не найден"
    exit 1
fi

echo ""
echo "📋 Схема v1 (базовая):"
cat "$V1_SCHEMA" | jq '.' 2>/dev/null || cat "$V1_SCHEMA"

echo ""
echo "📋 Схема v2 (с email):"
cat "$V2_SCHEMA" | jq '.' 2>/dev/null || cat "$V2_SCHEMA"

echo ""
echo "🔍 Проверка совместимости v2 -> v1..."

# Проверяем совместимость новой схемы с последней версией
COMPATIBILITY_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/vnd.schemaregistry.v1+json" \
    -d @$V2_SCHEMA \
    "$SCHEMA_REGISTRY_URL/compatibility/subjects/$SUBJECT_NAME/versions/latest")

echo "📥 Ответ о совместимости:"
echo "$COMPATIBILITY_RESPONSE" | jq '.' 2>/dev/null || echo "$COMPATIBILITY_RESPONSE"

echo ""
echo "📊 Анализ совместимости..."

# Парсим ответ о совместимости
if echo "$COMPATIBILITY_RESPONSE" | grep -q '"is_compatible":true'; then
    echo "✅ Схемы совместимы! Можно безопасно обновить схему."
    echo "💡 Новая схема обратно совместима с предыдущей версией."
else
    echo "❌ Схемы несовместимы!"
    echo "💡 Новая схема может нарушить обратную совместимость."
    echo "🔧 Рекомендуется пересмотреть изменения в схеме."
fi

echo ""
echo "📚 Дополнительная информация:"
echo "🌐 Schema Registry UI: http://localhost:8082"
echo "📊 Kafka UI: http://localhost:8080"
echo "📖 Документация: https://docs.confluent.io/platform/current/schema-registry/develop/api.html" 