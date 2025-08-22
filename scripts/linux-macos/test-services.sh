#!/bin/bash

echo "🧪 Testing Kafka Demo Services"
echo "================================"

# Test Producer
echo "Testing Producer (http://localhost:3000)..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Producer is running"
    
    # Test topics endpoint
    echo "Testing topics endpoint..."
    TOPICS_RESPONSE=$(curl -s http://localhost:3000/topics)
    echo "Topics response: $TOPICS_RESPONSE"
else
    echo "❌ Producer is not responding"
fi

echo ""

# Test Consumer
echo "Testing Consumer (http://localhost:3001)..."
if curl -s http://localhost:3001/status > /dev/null; then
    echo "✅ Consumer is running"
    
    # Test status endpoint
    echo "Testing status endpoint..."
    STATUS_RESPONSE=$(curl -s http://localhost:3001/status)
    echo "Status response: $STATUS_RESPONSE"
else
    echo "❌ Consumer is not responding"
fi

echo ""

# Test Frontend
echo "Testing Frontend (http://localhost:3002)..."
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "�� Test completed!" 