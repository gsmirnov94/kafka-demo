const express = require('express');
const { Kafka } = require('kafkajs');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
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
          const parsedMessage = JSON.parse(message.value.toString());
          const messageData = {
            topic,
            partition,
            offset: message.offset,
            key: message.key?.toString(),
            value: parsedMessage,
            timestamp: new Date().toISOString()
          };

          console.log('Received message:', messageData);
          
          // Emit to all connected clients
          io.emit('message-received', messageData);
          
        } catch (error) {
          console.error('Error parsing message:', error);
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
