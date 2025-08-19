# 🏗️ Упрощенная архитектура Kafka Demo

## Основная схема системы

```mermaid
graph TB
    subgraph "👤 Пользователь"
        USER[Веб-браузер]
    end
    
    subgraph "🖥️ Веб-интерфейс"
        FRONTEND[React Dashboard<br/>Port 3002]
    end
    
    subgraph "📤 Отправка сообщений"
        PRODUCER[Producer Service<br/>Port 3000<br/>Node.js API]
    end
    
    subgraph "📥 Получение сообщений"
        CONSUMER[Consumer Service<br/>Port 3001<br/>Node.js + WebSocket]
    end
    
    subgraph "📨 Система сообщений"
        KAFKA[Apache Kafka<br/>Port 9092]
        ZOOKEEPER[Zookeeper<br/>Port 2181]
    end
    
    subgraph "📋 Управление данными"
        SCHEMA[Schema Registry<br/>Port 8081]
    end
    
    subgraph "📊 Мониторинг"
        KAFKA_UI[Kafka UI<br/>Port 8080]
        SCHEMA_UI[Schema UI<br/>Port 8082]
    end
    
    %% Основные потоки
    USER --> FRONTEND
    FRONTEND -->|HTTP API| PRODUCER
    FRONTEND -->|HTTP + WebSocket| CONSUMER
    
    PRODUCER -->|Отправка| KAFKA
    CONSUMER -->|Получение| KAFKA
    
    KAFKA --> ZOOKEEPER
    KAFKA --> SCHEMA
    
    KAFKA_UI --> KAFKA
    SCHEMA_UI --> SCHEMA
    
    %% Стили
    classDef user fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    classDef frontend fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef service fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    classDef infrastructure fill:#fce4ec,stroke:#c2185b,stroke-width:3px
    classDef monitoring fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    
    class USER user
    class FRONTEND frontend
    class PRODUCER,CONSUMER service
    class KAFKA,ZOOKEEPER,SCHEMA infrastructure
    class KAFKA_UI,SCHEMA_UI monitoring
```

## Как это работает

### 1️⃣ **Отправка сообщения**
```
Пользователь → React → Producer API → Kafka
```

### 2️⃣ **Получение сообщения**
```
Kafka → Consumer → WebSocket → React → Пользователь
```

### 3️⃣ **Создание топика**
```
React → Producer API → Kafka → Автоматическое создание
```

## Порты системы

| Сервис | Порт | Описание |
|--------|------|----------|
| 🖥️ React Frontend | 3002 | Веб-интерфейс |
| 📤 Producer API | 3000 | API для отправки сообщений |
| 📥 Consumer API | 3001 | API для получения сообщений |
| 📨 Kafka Broker | 9092 | Основной брокер сообщений |
| 🐘 Zookeeper | 2181 | Координация кластера |
| 📋 Schema Registry | 8081 | Валидация схем данных |
| 📊 Kafka UI | 8080 | Мониторинг Kafka |
| 🎨 Schema UI | 8082 | Управление схемами |

## Технологии

- **Frontend**: React.js + Socket.IO + Axios
- **Backend**: Node.js + Express.js + KafkaJS
- **Infrastructure**: Docker + Docker Compose
- **Message Queue**: Apache Kafka 7.4.0
- **Schema**: Avro + Schema Registry

## Преимущества архитектуры

✅ **Микросервисы** - независимые компоненты  
✅ **Real-time** - WebSocket для мгновенных обновлений  
✅ **Масштабируемость** - легко добавлять новые сервисы  
✅ **Мониторинг** - встроенные инструменты наблюдения  
✅ **Простота** - Docker для быстрого развертывания 