const express = require('express');
const { Kafka } = require('kafkajs');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://frontend:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Kafka configuration
const kafka = new Kafka({
  clientId: 'demo-producer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer();

// Schema Registry configuration
const SCHEMA_REGISTRY_URL = process.env.SCHEMA_REGISTRY_URL || 'http://localhost:8081';
const USER_SCHEMA_SUBJECT = 'user-value';

// Schema validation functions
async function getSchemaFromRegistry(subject = USER_SCHEMA_SUBJECT) {
  try {
    const response = await axios.get(`${SCHEMA_REGISTRY_URL}/subjects/${subject}/versions/latest`);
    console.log(`✅ Схема получена из Schema Registry: ${subject} v${response.data.version}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Ошибка получения схемы ${subject}:`, error.message);
    return null;
  }
}

function validateUserMessage(message) {
  // Простая валидация по схеме User
  if (!message.name || typeof message.name !== 'string') {
    throw new Error('Поле name должно быть строкой');
  }
  
  if (!message.age || typeof message.age !== 'number' || message.age < 0) {
    throw new Error('Поле age должно быть положительным числом');
  }
  
  // Проверка опционального поля email для v2 схемы
  if (message.email !== undefined && typeof message.email !== 'string') {
    throw new Error('Поле email должно быть строкой или null');
  }
  
  return true;
}

// Connect to Kafka
async function connectProducer() {
  try {
    await producer.connect();
    console.log('Producer connected to Kafka');
  } catch (error) {
    console.error('Failed to connect producer:', error);
  }
}

// Disconnect from Kafka
async function disconnectProducer() {
  try {
    await producer.disconnect();
    console.log('Producer disconnected from Kafka');
  } catch (error) {
    console.error('Failed to disconnect producer:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Producer', timestamp: new Date().toISOString() });
});

// Send message endpoint
app.post('/send-message', async (req, res) => {
  try {
    const { topic, message, key, validateSchema = true } = req.body;
    
    if (!topic || !message) {
      return res.status(400).json({ 
        error: 'Topic and message are required' 
      });
    }

    // Валидация по схеме User если включена
    if (validateSchema && topic.includes('user')) {
      try {
        // Получаем схему из Registry
        const schema = await getSchemaFromRegistry();
        if (!schema) {
          console.warn('⚠️ Схема не найдена, пропускаем валидацию');
        } else {
          // Parse message if it's a JSON string
          let parsedMessage = message;
          if (typeof message === 'string') {
            try {
              parsedMessage = JSON.parse(message);
            } catch (parseError) {
              return res.status(400).json({
                error: 'Invalid JSON format',
                details: 'Message field contains invalid JSON string',
                schema: 'user-value'
              });
            }
          }
          
          // Валидируем сообщение по схеме
          validateUserMessage(parsedMessage);
          console.log(`✅ Сообщение валидировано по схеме ${schema.subject} v${schema.version}`);
        }
      } catch (validationError) {
        return res.status(400).json({
          error: 'Schema validation failed',
          details: validationError.message,
          schema: 'user-value'
        });
      }
    }

    // Use parsed message for payload if validation was performed
    const messageToSend = (validateSchema && topic.includes('user') && typeof message === 'string') 
      ? JSON.parse(message) 
      : message;
      
    const messagePayload = {
      topic,
      messages: [
        {
          key: key || 'default-key',
          value: JSON.stringify({
            ...messageToSend,
            timestamp: new Date().toISOString(),
            producer: 'demo-producer',
            schemaValidated: validateSchema
          })
        }
      ]
    };

    await producer.send(messagePayload);
    
    console.log(`✅ Message sent to topic ${topic}:`, message);
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      topic,
      sentMessage: message,
      timestamp: new Date().toISOString(),
      schemaValidated: validateSchema
    });
    
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// Validate message against schema endpoint
app.post('/validate-message', async (req, res) => {
  try {
    const { message, schemaSubject = USER_SCHEMA_SUBJECT } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Получаем схему из Registry
    const schema = await getSchemaFromRegistry(schemaSubject);
    if (!schema) {
      return res.status(404).json({
        error: 'Schema not found',
        schemaSubject
      });
    }

    // Валидируем сообщение
    try {
      validateUserMessage(message);
      res.json({
        success: true,
        message: 'Message is valid',
        schema: {
          subject: schema.subject,
          version: schema.version,
          id: schema.id
        },
        validatedMessage: message
      });
    } catch (validationError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationError.message,
        schema: {
          subject: schema.subject,
          version: schema.version,
          id: schema.id
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error validating message:', error);
    res.status(500).json({ 
      error: 'Failed to validate message',
      details: error.message 
    });
  }
});

// Get topics endpoint
app.get('/topics', async (req, res) => {
  try {
    const admin = kafka.admin();
    await admin.connect();
    
    const topics = await admin.listTopics();
    await admin.disconnect();
    
    res.json({ topics });
  } catch (error) {
    console.error('Error getting topics:', error);
    res.status(500).json({ 
      error: 'Failed to get topics',
      details: error.message 
    });
  }
});

// Create topic endpoint
app.post('/topics', async (req, res) => {
  try {
    const { topic, partitions = 1, replicationFactor = 1 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        error: 'Topic name is required' 
      });
    }

    const admin = kafka.admin();
    await admin.connect();
    
    await admin.createTopics({
      topics: [{
        topic,
        numPartitions: partitions,
        replicationFactor: replicationFactor
      }]
    });
    
    await admin.disconnect();
    
    console.log(`Topic ${topic} created successfully`);
    res.json({ 
      success: true, 
      message: `Topic ${topic} created successfully`,
      topic,
      partitions,
      replicationFactor
    });
    
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ 
      error: 'Failed to create topic',
      details: error.message 
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down producer...');
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down producer...');
  await disconnectProducer();
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log(`Producer service running on port ${PORT}`);
  await connectProducer();
});
