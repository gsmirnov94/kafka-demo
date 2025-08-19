#!/bin/bash

echo "🚀 Starting Kafka Demo with Docker (Full Stack)"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ All services are now running!"
echo ""
echo "🌐 Access your applications:"
echo "   Frontend:     http://localhost:3002"
echo "   Producer:     http://localhost:3000"
echo "   Consumer:     http://localhost:3001"
echo "   Kafka UI:     http://localhost:8080"
echo "   Schema Registry UI: http://localhost:8082"
echo ""
echo "📝 To view logs: docker-compose logs -f [service-name]"
echo "🛑 To stop: docker-compose down" 