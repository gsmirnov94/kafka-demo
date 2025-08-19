#!/bin/bash

# Скрипт для тестирования схемы User
# Отправляет тестовое сообщение через Producer API

# Получаем директорию, где находится скрипт
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PRODUCER_URL="http://localhost:3000"
TOPIC_NAME="user-topic"

echo "🧪 Тестирование схемы User..."
echo "📍 Producer API: $PRODUCER_URL"
echo "📋 Топик: $TOPIC_NAME"
echo ""

# Проверяем, что Producer API доступен
echo "🔍 Проверка доступности Producer API..."
if curl -s "$PRODUCER_URL/health" > /dev/null; then
    echo "✅ Producer API доступен"
else
    echo "❌ Producer API недоступен. Убедитесь, что сервис запущен."
    echo "💡 Запустите: cd producer && npm start"
    exit 1
fi

echo ""
echo "📤 Отправка тестового сообщения User..."

# Создаем тестовое сообщение
TEST_MESSAGE='{
  "topic": "'$TOPIC_NAME'",
  "message": {
    "name": "Иван Петров",
    "age": 25
  },
  "key": "user-001"
}'

echo "📝 Тестовое сообщение:"
echo "$TEST_MESSAGE" | jq '.' 2>/dev/null || echo "$TEST_MESSAGE"

echo ""
echo "📤 Отправка в Kafka..."

# Отправляем сообщение
RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$TEST_MESSAGE" \
    "$PRODUCER_URL/send-message")

echo "📥 Ответ от Producer API:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🎉 Тестовое сообщение User отправлено!"
echo "📊 Проверьте Kafka UI: http://localhost:8080"
echo "👀 Проверьте Consumer для получения сообщения" 