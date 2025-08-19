const express = require('express');
const { Kafka } = require('kafkajs');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://frontend:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Kafka configuration
const kafka = new Kafka({
  clientId: 'demo-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const consumer = kafka.consumer({ groupId: 'demo-consumer-group' });
let isConsuming = false;
let currentTopics = [];

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
async function connectConsumer() {
  try {
    await consumer.connect();
    console.log('Consumer connected to Kafka');
  } catch (error) {
    console.error('Failed to connect consumer:', error);
  }
}

// Disconnect from Kafka
async function disconnectConsumer() {
  try {
    await consumer.disconnect();
    console.log('Consumer disconnected from Kafka');
  } catch (error) {
    console.error('Failed to disconnect consumer:', error);
  }
}

// Start consuming messages
async function startConsuming(topics) {
  if (isConsuming) {
    console.log('Consumer is already running');
    return;
  }

  try {
    isConsuming = true;
    currentTopics = topics;

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
      console.log(`Subscribed to topic: ${topic}`);
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const rawMessage = message.value.toString();
          let parsedMessage;
          let messageData;
          
          try {
            parsedMessage = JSON.parse(rawMessage);
            
            // Валидация по схеме User если это user топик
            let validationResult = null;
            if (topic.includes('user')) {
              try {
                const schema = await getSchemaFromRegistry();
                if (schema) {
                  validateUserMessage(parsedMessage);
                  validationResult = {
                    valid: true,
                    schema: {
                      subject: schema.subject,
                      version: schema.version,
                      id: schema.id
                    }
                  };
                  console.log(`✅ Сообщение валидировано по схеме ${schema.subject} v${schema.version}`);
                }
              } catch (validationError) {
                validationResult = {
                  valid: false,
                  error: validationError.message,
                  schema: 'user-value'
                };
                console.warn(`⚠️ Ошибка валидации сообщения: ${validationError.message}`);
              }
            }
            
            messageData = {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
              value: parsedMessage,
              timestamp: new Date().toISOString(),
              schemaValidation: validationResult,
              isJson: true
            };
            
          } catch (parseError) {
            // Handle non-JSON messages
            console.warn(`⚠️ Non-JSON message received in topic ${topic}:`, rawMessage.substring(0, 100));
            
            messageData = {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
              value: rawMessage,
              timestamp: new Date().toISOString(),
              schemaValidation: null,
              isJson: false,
              parseError: parseError.message
            };
          }

          console.log('📥 Received message:', messageData);
          
          // Emit to all connected clients
          io.emit('message-received', messageData);
          
        } catch (error) {
          console.error('❌ Error processing message:', error);
          console.error('Message details:', {
            topic,
            partition,
            offset: message.offset,
            rawValue: message.value?.toString().substring(0, 100)
          });
        }
      },
    });

    console.log('Consumer started successfully');
    
  } catch (error) {
    console.error('Error starting consumer:', error);
    isConsuming = false;
    throw error;
  }
}

// Stop consuming messages
async function stopConsuming() {
  try {
    if (isConsuming) {
      await consumer.stop();
      isConsuming = false;
      currentTopics = [];
      console.log('Consumer stopped');
    }
  } catch (error) {
    console.error('Error stopping consumer:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Consumer', 
    isConsuming,
    currentTopics,
    timestamp: new Date().toISOString() 
  });
});

// Start consuming endpoint
app.post('/start-consuming', async (req, res) => {
  try {
    const { topics } = req.body;
    
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ 
        error: 'Topics array is required' 
      });
    }

    await startConsuming(topics);
    
    res.json({ 
      success: true, 
      message: 'Consumer started successfully',
      topics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error starting consumer:', error);
    res.status(500).json({ 
      error: 'Failed to start consumer',
      details: error.message 
    });
  }
});

// Stop consuming endpoint
app.post('/stop-consuming', async (req, res) => {
  try {
    await stopConsuming();
    
    res.json({ 
      success: true, 
      message: 'Consumer stopped successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error stopping consumer:', error);
    res.status(500).json({ 
      error: 'Failed to stop consumer',
      details: error.message 
    });
  }
});

// Get consumer status
app.get('/status', (req, res) => {
  res.json({
    isConsuming,
    currentTopics,
    timestamp: new Date().toISOString()
  });
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
      res.json({
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.emit('connected', {
    message: 'Connected to Consumer service',
    timestamp: new Date().toISOString()
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down consumer...');
  await stopConsuming();
  await disconnectConsumer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down consumer...');
  await stopConsuming();
  await disconnectConsumer();
  process.exit(0);
});

// Start server
server.listen(PORT, async () => {
  console.log(`Consumer service running on port ${PORT}`);
  await connectConsumer();
});
