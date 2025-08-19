import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

// Use environment variables with fallbacks for both Docker and local development
const PRODUCER_URL = process.env.REACT_APP_PRODUCER_URL || 'http://localhost:3000';
const CONSUMER_URL = process.env.REACT_APP_CONSUMER_URL || 'http://localhost:3001';

// Debug logging
console.log('Frontend Configuration:');
console.log('PRODUCER_URL:', PRODUCER_URL);
console.log('CONSUMER_URL:', CONSUMER_URL);
console.log('Environment:', process.env.NODE_ENV);

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [consumerStatus, setConsumerStatus] = useState({
    isConsuming: false,
    currentTopics: []
  });
  
  // Producer form state
  const [producerForm, setProducerForm] = useState({
    topic: 'user-topic',
    message: '',
    key: ''
  });
  
  // Consumer form state
  const [consumerForm, setConsumerForm] = useState({
    topics: 'user-topic'
  });

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(CONSUMER_URL);
    setSocket(newSocket);

    newSocket.on('connected', (data) => {
      console.log('Connected to consumer service:', data);
    });

    newSocket.on('message-received', (messageData) => {
      setMessages(prev => [messageData, ...prev].slice(0, 100)); // Keep last 100 messages
    });

    return () => newSocket.close();
  }, []);

  // Load topics on component mount
  useEffect(() => {
    loadTopics();
    loadConsumerStatus();
  }, []);

  // Load available topics
  const loadTopics = async () => {
    try {
      console.log('Loading topics from:', `${PRODUCER_URL}/topics`);
      const response = await axios.get(`${PRODUCER_URL}/topics`);
      console.log('Topics response:', response.data);
      setTopics(response.data.topics || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: `${PRODUCER_URL}/topics`
      });
    }
  };

  // Load consumer status
  const loadConsumerStatus = async () => {
    try {
      console.log('Loading consumer status from:', `${CONSUMER_URL}/status`);
      const response = await axios.get(`${CONSUMER_URL}/status`);
      console.log('Consumer status response:', response.data);
      setConsumerStatus(response.data);
    } catch (error) {
      console.error('Error loading consumer status:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: `${CONSUMER_URL}/status`
      });
    }
  };

  // Create new topic
  const createTopic = async () => {
    const topicName = prompt('Enter topic name:');
    if (!topicName) return;

    try {
      await axios.post(`${PRODUCER_URL}/topics`, {
        topic: topicName,
        partitions: 1,
        replicationFactor: 1
      });
      alert(`Topic "${topicName}" created successfully!`);
      loadTopics();
    } catch (error) {
      alert(`Error creating topic: ${error.response?.data?.error || error.message}`);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!producerForm.topic || !producerForm.message) {
      alert('Please fill in topic and message fields');
      return;
    }

    try {
      await axios.post(`${PRODUCER_URL}/send-message`, producerForm);
      alert('Message sent successfully!');
      setProducerForm({ topic: '', message: '', key: '' });
    } catch (error) {
      alert(`Error sending message: ${error.response?.data?.error || error.message}`);
    }
  };

  // Start consumer
  const startConsumer = async (e) => {
    e.preventDefault();
    
    if (!consumerForm.topics) {
      alert('Please enter topics to consume (comma-separated)');
      return;
    }

    const topicsArray = consumerForm.topics.split(',').map(t => t.trim()).filter(t => t);
    
    try {
      await axios.post(`${CONSUMER_URL}/start-consuming`, { topics: topicsArray });
      alert('Consumer started successfully!');
      setConsumerForm({ topics: '' });
      loadConsumerStatus();
    } catch (error) {
      alert(`Error starting consumer: ${error.response?.data?.error || error.message}`);
    }
  };

  // Stop consumer
  const stopConsumer = async () => {
    try {
      await axios.post(`${CONSUMER_URL}/stop-consuming`);
      alert('Consumer stopped successfully!');
      loadConsumerStatus();
    } catch (error) {
      alert(`Error stopping consumer: ${error.response?.data?.error || error.message}`);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Kafka Demo Dashboard</h1>
        <p>Управление Producer и Consumer сервисами</p>
      </header>

      <div className="container">
        {/* Producer Section */}
        <section className="producer-section">
          <h2>📤 Producer Service</h2>
          
          <div className="topics-control">
            <h3>Topics Management</h3>
            <div className="topics-list">
              <strong>Available Topics:</strong>
              {topics.length > 0 ? (
                <ul>
                  {topics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              ) : (
                <p>No topics available</p>
              )}
            </div>
            <button onClick={createTopic} className="btn btn-primary">
              Create New Topic
            </button>
            <button onClick={loadTopics} className="btn btn-secondary">
              Refresh Topics
            </button>
          </div>

          <div className="send-message">
            <h3>Send Message</h3>
            <form onSubmit={sendMessage}>
              <div className="form-group">
                <label>Topic:</label>
                <input
                  type="text"
                  value={producerForm.topic}
                  onChange={(e) => setProducerForm(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Enter topic name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Message:</label>
                <textarea
                  value={producerForm.message}
                  onChange={(e) => setProducerForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your message"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Key (optional):</label>
                <input
                  type="text"
                  value={producerForm.key}
                  onChange={(e) => setProducerForm(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="Enter message key"
                />
              </div>
              
              <button type="submit" className="btn btn-success">
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Consumer Section */}
        <section className="consumer-section">
          <h2>📥 Consumer Service</h2>
          
          <div className="consumer-control">
            <h3>Consumer Control</h3>
            <div className="status-info">
              <strong>Status:</strong> {consumerStatus.isConsuming ? '🟢 Running' : '🔴 Stopped'}
              {consumerStatus.currentTopics.length > 0 && (
                <div>
                  <strong>Listening to:</strong> {consumerStatus.currentTopics.join(', ')}
                </div>
              )}
            </div>
            
            <form onSubmit={startConsumer}>
              <div className="form-group">
                <label>Topics to Consume (comma-separated):</label>
                <input
                  type="text"
                  value={consumerForm.topics}
                  onChange={(e) => setConsumerForm(prev => ({ ...prev, topics: e.target.value }))}
                  placeholder="e.g., topic1, topic2, topic3"
                  required
                />
              </div>
              
              <div className="consumer-buttons">
                <button type="submit" className="btn btn-success" disabled={consumerStatus.isConsuming}>
                  Start Consumer
                </button>
                <button 
                  type="button" 
                  onClick={stopConsumer} 
                  className="btn btn-danger"
                  disabled={!consumerStatus.isConsuming}
                >
                  Stop Consumer
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Messages Section */}
        <section className="messages-section">
          <h2>📨 Received Messages</h2>
          <div className="messages-control">
            <button onClick={clearMessages} className="btn btn-warning">
              Clear Messages
            </button>
            <span className="message-count">
              Total: {messages.length} messages
            </span>
          </div>
          
          <div className="messages-list">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className={`message-item ${msg.isJson === false ? 'non-json-message' : ''}`}>
                  <div className="message-header">
                    <span className="topic">Topic: {msg.topic}</span>
                    <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    <span className={`message-type ${msg.isJson ? 'json' : 'raw'}`}>
                      {msg.isJson ? '📄 JSON' : '📝 Raw'}
                    </span>
                  </div>
                  <div className="message-content">
                    <div><strong>Key:</strong> {msg.key || 'N/A'}</div>
                    <div><strong>Partition:</strong> {msg.partition}</div>
                    <div><strong>Offset:</strong> {msg.offset}</div>
                    <div><strong>Message:</strong> 
                      {msg.isJson ? (
                        <pre>{JSON.stringify(msg.value, null, 2)}</pre>
                      ) : (
                        <div className="raw-message">
                          <span className="raw-content">{msg.value}</span>
                          {msg.parseError && (
                            <div className="parse-error">❌ Parse Error: {msg.parseError}</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Schema Validation Results */}
                    {msg.schemaValidation && (
                      <div className="schema-validation">
                        <div className="validation-header">
                          <strong>Schema Validation:</strong>
                          <span className={`validation-status ${msg.schemaValidation.valid ? 'valid' : 'invalid'}`}>
                            {msg.schemaValidation.valid ? '✅ Valid' : '❌ Invalid'}
                          </span>
                        </div>
                        {msg.schemaValidation.schema && (
                          <div className="schema-info">
                            <span>Schema: {msg.schemaValidation.schema.subject} v{msg.schemaValidation.schema.version}</span>
                          </div>
                        )}
                        {msg.schemaValidation.error && (
                          <div className="validation-error">
                            Error: {msg.schemaValidation.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-messages">No messages received yet. Start the consumer to see messages here.</p>
            )}
          </div>
        </section>
      </div>

      <footer className="App-footer">
        <p>Kafka Demo Dashboard - Вебинар по Apache Kafka</p>
        <div className="service-links">
          <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
            Kafka UI
          </a>
          <a href="http://localhost:8081" target="_blank" rel="noopener noreferrer">
            Schema Registry
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
