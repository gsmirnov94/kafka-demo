const express = require('express');
const { Kafka } = require('kafkajs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Kafka configuration
const kafka = new Kafka({
  clientId: 'demo-producer',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer();

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
    const { topic, message, key } = req.body;
    
    if (!topic || !message) {
      return res.status(400).json({ 
        error: 'Topic and message are required' 
      });
    }

    const messagePayload = {
      topic,
      messages: [
        {
          key: key || 'default-key',
          value: JSON.stringify({
            message,
            timestamp: new Date().toISOString(),
            producer: 'demo-producer'
          })
        }
      ]
    };

    await producer.send(messagePayload);
    
    console.log(`Message sent to topic ${topic}:`, message);
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      topic,
      sentMessage: message,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
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
