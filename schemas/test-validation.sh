#!/bin/bash

# Скрипт для тестирования валидации сообщений по схеме User
# Тестирует Producer и Consumer API с валидацией

PRODUCER_URL="http://localhost:3000"
CONSUMER_URL="http://localhost:3001"

echo "🧪 Тестирование валидации сообщений по схеме User..."
echo "📍 Producer API: $PRODUCER_URL"
echo "📍 Consumer API: $CONSUMER_URL"
echo ""

# Проверяем, что сервисы доступны
echo "🔍 Проверка доступности сервисов..."

if curl -s "$PRODUCER_URL/health" > /dev/null; then
    echo "✅ Producer API доступен"
else
    echo "❌ Producer API недоступен"
    exit 1
fi

if curl -s "$CONSUMER_URL/health" > /dev/null; then
    echo "✅ Consumer API доступен"
else
    echo "❌ Consumer API недоступен"
    exit 1
fi

echo ""

# Тест 1: Валидация корректного сообщения User v1
echo "📋 Тест 1: Валидация корректного сообщения User v1"
VALID_MESSAGE_V1='{"name": "Иван Петров", "age": 25}'

echo "📝 Сообщение: $VALID_MESSAGE_V1"

echo "🔍 Валидация через Producer API..."
PRODUCER_VALIDATION=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"message\": $VALID_MESSAGE_V1}" \
    "$PRODUCER_URL/validate-message")

echo "📥 Ответ Producer:"
echo "$PRODUCER_VALIDATION" | jq '.' 2>/dev/null || echo "$PRODUCER_VALIDATION"

echo "🔍 Валидация через Consumer API..."
CONSUMER_VALIDATION=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"message\": $VALID_MESSAGE_V1}" \
    "$CONSUMER_URL/validate-message")

echo "📥 Ответ Consumer:"
echo "$CONSUMER_VALIDATION" | jq '.' 2>/dev/null || echo "$CONSUMER_VALIDATION"

echo ""

# Тест 2: Валидация корректного сообщения User v2
echo "📋 Тест 2: Валидация корректного сообщения User v2"
VALID_MESSAGE_V2='{"name": "Анна Сидорова", "age": 30, "email": "anna@example.com"}'

echo "📝 Сообщение: $VALID_MESSAGE_V2"

echo "🔍 Валидация через Producer API..."
PRODUCER_VALIDATION_V2=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"message\": $VALID_MESSAGE_V2}" \
    "$PRODUCER_URL/validate-message")

echo "📥 Ответ Producer:"
echo "$PRODUCER_VALIDATION_V2" | jq '.' 2>/dev/null || echo "$PRODUCER_VALIDATION_V2"

echo ""

# Тест 3: Валидация некорректного сообщения
echo "📋 Тест 3: Валидация некорректного сообщения"
INVALID_MESSAGE='{"name": "Петр", "age": "не число"}'

echo "📝 Сообщение: $INVALID_MESSAGE"

echo "🔍 Валидация через Producer API..."
PRODUCER_INVALID=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"message\": $INVALID_MESSAGE}" \
    "$PRODUCER_URL/validate-message")

echo "📥 Ответ Producer:"
echo "$PRODUCER_INVALID" | jq '.' 2>/dev/null || echo "$PRODUCER_INVALID"

echo ""

# Тест 4: Отправка валидного сообщения в Kafka
echo "📋 Тест 4: Отправка валидного сообщения в Kafka"
echo "📤 Отправка сообщения User v1 в топик user-topic..."

KAFKA_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{
      \"topic\": \"user-topic\",
      \"message\": $VALID_MESSAGE_V1,
      \"key\": \"test-user-001\"
    }" \
    "$PRODUCER_URL/send-message")

echo "📥 Ответ от Producer:"
echo "$KAFKA_RESPONSE" | jq '.' 2>/dev/null || echo "$KAFKA_RESPONSE"

echo ""
echo "🎉 Тестирование валидации завершено!"
echo "📊 Проверьте Kafka UI: http://localhost:8080"
echo "👀 Запустите Consumer для получения сообщения" 