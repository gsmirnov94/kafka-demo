// Пример использования схемы User в Producer сервисе
// Этот код демонстрирует, как интегрировать Schema Registry с Producer

const { Kafka } = require('kafkajs');
const axios = require('axios');

// Конфигурация
const SCHEMA_REGISTRY_URL = 'http://localhost:8081';
const KAFKA_BROKER = 'localhost:9092';
const TOPIC_NAME = 'user-topic';
const SUBJECT_NAME = 'user-value';

// Kafka клиент
const kafka = new Kafka({
  clientId: 'user-producer-with-schema',
  brokers: [KAFKA_BROKER]
});

const producer = kafka.producer();

// Функция для получения схемы из Schema Registry
async function getSchemaFromRegistry() {
  try {
    const response = await axios.get(
      `${SCHEMA_REGISTRY_URL}/subjects/${SUBJECT_NAME}/versions/latest`
    );
    console.log('✅ Схема получена из Schema Registry:', response.data.schema);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка получения схемы:', error.message);
    return null;
  }
}

// Функция для валидации данных по схеме
function validateUserData(userData) {
  // Простая валидация (в реальном проекте используйте avsc для полной валидации)
  if (!userData.name || typeof userData.name !== 'string') {
    throw new Error('Поле name должно быть строкой');
  }
  
  if (!userData.age || typeof userData.age !== 'number' || userData.age < 0) {
    throw new Error('Поле age должно быть положительным числом');
  }
  
  // Проверка опционального поля email
  if (userData.email && typeof userData.email !== 'string') {
    throw new Error('Поле email должно быть строкой');
  }
  
  return true;
}

// Функция для отправки сообщения с валидацией схемы
async function sendUserMessage(userData) {
  try {
    // Валидация данных
    validateUserData(userData);
    
    // Получение схемы из Registry
    const schemaInfo = await getSchemaFromRegistry();
    if (!schemaInfo) {
      throw new Error('Не удалось получить схему из Schema Registry');
    }
    
    // Подготовка сообщения
    const message = {
      topic: TOPIC_NAME,
      messages: [
        {
          key: `user-${Date.now()}`,
          value: JSON.stringify({
            ...userData,
            schemaVersion: schemaInfo.version,
            timestamp: new Date().toISOString()
          })
        }
      ]
    };
    
    // Отправка в Kafka
    await producer.send(message);
    
    console.log('✅ Сообщение User отправлено:', {
      user: userData,
      schemaVersion: schemaInfo.version,
      topic: TOPIC_NAME
    });
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error.message);
    return false;
  }
}

// Примеры использования
async function examples() {
  // Подключение к Kafka
  await producer.connect();
  console.log('🔗 Подключен к Kafka');
  
  // Пример 1: Базовая схема v1
  console.log('\n📤 Пример 1: Отправка User v1');
  await sendUserMessage({
    name: 'Иван Петров',
    age: 25
  });
  
  // Пример 2: Расширенная схема v2
  console.log('\n📤 Пример 2: Отправка User v2');
  await sendUserMessage({
    name: 'Анна Сидорова',
    age: 30,
    email: 'anna@example.com'
  });
  
  // Пример 3: User v2 без email
  console.log('\n📤 Пример 3: Отправка User v2 без email');
  await sendUserMessage({
    name: 'Петр Иванов',
    age: 28
  });
  
  // Отключение
  await producer.disconnect();
  console.log('\n🔌 Отключен от Kafka');
}

// Запуск примеров (если файл запущен напрямую)
if (require.main === module) {
  examples().catch(console.error);
}

module.exports = {
  sendUserMessage,
  validateUserData,
  getSchemaFromRegistry
}; 