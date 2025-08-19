# 🏗️ Архитектура Kafka Demo Application

## Общая архитектура системы

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Frontend<br/>Port: 3002]
    end
    
    subgraph "Application Services"
        PROD[Producer Service<br/>Port: 3000<br/>Node.js + Express]
        CONS[Consumer Service<br/>Port: 3001<br/>Node.js + Express + Socket.IO]
    end
    
    subgraph "Message Queue Infrastructure"
        KAFKA[Apache Kafka Broker<br/>Port: 9092<br/>Version: 7.4.0]
        ZK[Zookeeper<br/>Port: 2181<br/>Cluster Coordination]
    end
    
    subgraph "Data Management"
        SR[Schema Registry<br/>Port: 8081<br/>Avro Schema Validation]
        SR_UI[Schema Registry UI<br/>Port: 8082<br/>Schema Management]
    end
    
    subgraph "Monitoring & Management"
        KUI[Kafka UI<br/>Port: 8080<br/>Cluster Monitoring]
    end
    
    subgraph "Data Flow"
        MSG[Message Flow]
        SCHEMA[Schema Validation]
    end
    
    %% Frontend connections
    UI -->|HTTP API| PROD
    UI -->|HTTP API + WebSocket| CONS
    
    %% Service connections
    PROD -->|Produce Messages| KAFKA
    CONS -->|Consume Messages| KAFKA
    
    %% Infrastructure dependencies
    KAFKA -->|Depends on| ZK
    SR -->|Depends on| KAFKA
    KUI -->|Monitors| KAFKA
    KUI -->|Monitors| SR
    SR_UI -->|Manages| SR
    
    %% Data flow
    MSG -->|Message Validation| SCHEMA
    SCHEMA -->|Schema Check| SR
    
    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef service fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef infrastructure fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef monitoring fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef data fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    
    class UI frontend
    class PROD,CONS service
    class KAFKA,ZK,SR infrastructure
    class KUI,SR_UI monitoring
    class MSG,SCHEMA data
```

## Детальная архитектура Producer Service

```mermaid
graph LR
    subgraph "Producer Service Architecture"
        subgraph "HTTP Layer"
            EXPRESS[Express.js Server]
            CORS[CORS Middleware]
            VALID[Request Validation]
        end
        
        subgraph "Kafka Integration"
            KAFKAJS[KafkaJS Client]
            PRODUCER[Kafka Producer]
            CONN[Connection Manager]
        end
        
        subgraph "Business Logic"
            MSG_HANDLER[Message Handler]
            TOPIC_MGR[Topic Management]
            ERROR_HANDLER[Error Handling]
        end
        
        subgraph "External Dependencies"
            KAFKA_BROKER[Kafka Broker<br/>localhost:9092]
        end
    end
    
    %% Flow
    EXPRESS --> CORS
    CORS --> VALID
    VALID --> MSG_HANDLER
    MSG_HANDLER --> KAFKAJS
    KAFKAJS --> PRODUCER
    PRODUCER --> CONN
    CONN --> KAFKA_BROKER
    
    TOPIC_MGR --> MSG_HANDLER
    ERROR_HANDLER --> MSG_HANDLER
    
    %% Styling
    classDef http fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef kafka fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef business fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class EXPRESS,CORS,VALID http
    class KAFKAJS,PRODUCER,CONN kafka
    class MSG_HANDLER,TOPIC_MGR,ERROR_HANDLER business
    class KAFKA_BROKER external
```

## Детальная архитектура Consumer Service

```mermaid
graph LR
    subgraph "Consumer Service Architecture"
        subgraph "HTTP Layer"
            EXPRESS[Express.js Server]
            CORS[CORS Middleware]
            ROUTES[API Routes]
        end
        
        subgraph "WebSocket Layer"
            SOCKET_IO[Socket.IO Server]
            WS_MANAGER[WebSocket Manager]
            CLIENT_MGR[Client Management]
        end
        
        subgraph "Kafka Integration"
            KAFKAJS[KafkaJS Client]
            CONSUMER[Kafka Consumer]
            CONN[Connection Manager]
        end
        
        subgraph "Message Processing"
            MSG_PARSER[Message Parser]
            MSG_HANDLER[Message Handler]
            TOPIC_SUB[Topic Subscription]
        end
        
        subgraph "External Dependencies"
            KAFKA_BROKER[Kafka Broker<br/>localhost:9092]
            FRONTEND[React Frontend<br/>WebSocket Client]
        end
    end
    
    %% Flow
    EXPRESS --> CORS
    CORS --> ROUTES
    
    SOCKET_IO --> WS_MANAGER
    WS_MANAGER --> CLIENT_MGR
    
    ROUTES --> TOPIC_SUB
    TOPIC_SUB --> KAFKAJS
    KAFKAJS --> CONSUMER
    CONSUMER --> CONN
    CONN --> KAFKA_BROKER
    
    CONSUMER --> MSG_PARSER
    MSG_PARSER --> MSG_HANDLER
    MSG_HANDLER --> SOCKET_IO
    SOCKET_IO --> FRONTEND
    
    %% Styling
    classDef http fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef websocket fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef kafka fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef processing fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class EXPRESS,CORS,ROUTES http
    class SOCKET_IO,WS_MANAGER,CLIENT_MGR websocket
    class KAFKAJS,CONSUMER,CONN kafka
    class MSG_PARSER,MSG_HANDLER,TOPIC_SUB processing
    class KAFKA_BROKER,FRONTEND external
```

## Архитектура React Frontend

```mermaid
graph TB
    subgraph "React Frontend Architecture"
        subgraph "UI Components"
            APP[App.js - Main Component]
            PROD_UI[Producer UI<br/>Topic Creation<br/>Message Sending]
            CONS_UI[Consumer UI<br/>Topic Subscription<br/>Message Display]
            STATUS[Status Display<br/>Service Health]
        end
        
        subgraph "State Management"
            STATE[React State<br/>useState Hooks]
            EFFECTS[useEffect Hooks<br/>Lifecycle Management]
        end
        
        subgraph "External Communication"
            HTTP_CLIENT[Axios HTTP Client]
            WEBSOCKET[Socket.IO Client]
        end
        
        subgraph "External Services"
            PROD_API[Producer API<br/>localhost:3000]
            CONS_API[Consumer API<br/>localhost:3001]
        end
    end
    
    %% Component hierarchy
    APP --> PROD_UI
    APP --> CONS_UI
    APP --> STATUS
    
    %% State management
    PROD_UI --> STATE
    CONS_UI --> STATE
    STATUS --> STATE
    
    STATE --> EFFECTS
    
    %% External communication
    PROD_UI --> HTTP_CLIENT
    CONS_UI --> HTTP_CLIENT
    CONS_UI --> WEBSOCKET
    
    HTTP_CLIENT --> PROD_API
    HTTP_CLIENT --> CONS_API
    WEBSOCKET --> CONS_API
    
    %% Styling
    classDef component fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef state fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef communication fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef service fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class APP,PROD_UI,CONS_UI,STATUS component
    class STATE,EFFECTS state
    class HTTP_CLIENT,WEBSOCKET communication
    class PROD_API,CONS_API service
```

## Поток данных в системе

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🖥️ React Frontend
    participant Producer as 📤 Producer Service
    participant Kafka as 📨 Kafka Broker
    participant Consumer as 📥 Consumer Service
    participant SchemaReg as 📋 Schema Registry
    
    Note over User,SchemaReg: 1. Создание топика
    User->>Frontend: Создать новый топик
    Frontend->>Producer: POST /create-topic
    Producer->>Kafka: Create Topic
    Kafka-->>Producer: Topic Created
    Producer-->>Frontend: Success Response
    Frontend-->>User: Топик создан
    
    Note over User,SchemaReg: 2. Отправка сообщения
    User->>Frontend: Отправить сообщение
    Frontend->>Producer: POST /send-message
    Producer->>SchemaReg: Validate Schema (optional)
    SchemaReg-->>Producer: Schema Valid
    Producer->>Kafka: Produce Message
    Kafka-->>Producer: Message Acknowledged
    Producer-->>Frontend: Success Response
    Frontend-->>User: Сообщение отправлено
    
    Note over User,SchemaReg: 3. Потребление сообщений
    User->>Frontend: Подписаться на топики
    Frontend->>Consumer: POST /start-consumer
    Consumer->>Kafka: Subscribe to Topics
    Kafka-->>Consumer: Subscription Confirmed
    
    Note over User,SchemaReg: 4. Получение сообщений в реальном времени
    Kafka->>Consumer: New Message
    Consumer->>Frontend: WebSocket Event
    Frontend->>User: Отображение сообщения
```

## Компоненты инфраструктуры

```mermaid
graph TB
    subgraph "Infrastructure Components"
        subgraph "Core Services"
            ZK[Zookeeper<br/>Port: 2181<br/>Cluster Coordination]
            KAFKA[Kafka Broker<br/>Port: 9092<br/>Message Queue]
        end
        
        subgraph "Data Management"
            SR[Schema Registry<br/>Port: 8081<br/>Schema Storage]
            SR_UI[Schema Registry UI<br/>Port: 8082<br/>Web Interface]
        end
        
        subgraph "Monitoring"
            KUI[Kafka UI<br/>Port: 8080<br/>Cluster Monitoring]
            JMX[JMX Monitoring<br/>Port: 9101<br/>Metrics]
        end
        
        subgraph "Storage"
            KAFKA_DATA[Kafka Data Volume]
            ZK_DATA[Zookeeper Data Volume]
        end
    end
    
    %% Dependencies
    KAFKA -->|Depends on| ZK
    SR -->|Depends on| KAFKA
    KUI -->|Monitors| KAFKA
    KUI -->|Monitors| SR
    SR_UI -->|Manages| SR
    
    %% Storage
    KAFKA -->|Stores data in| KAFKA_DATA
    ZK -->|Stores data in| ZK_DATA
    
    %% Monitoring
    KAFKA -->|Exposes metrics via| JMX
    
    %% Styling
    classDef core fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef monitoring fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class ZK,KAFKA core
    class SR,SR_UI data
    class KUI,JMX monitoring
    class KAFKA_DATA,ZK_DATA storage
```

## Технологический стек

```mermaid
graph LR
    subgraph "Frontend Technologies"
        REACT[React.js 18]
        SOCKET_IO[Socket.IO Client]
        AXIOS[Axios HTTP Client]
        CSS[CSS3 + Modern UI]
    end
    
    subgraph "Backend Technologies"
        NODE[Node.js]
        EXPRESS[Express.js]
        KAFKAJS[KafkaJS]
        SOCKET_SERVER[Socket.IO Server]
    end
    
    subgraph "Infrastructure"
        DOCKER[Docker]
        COMPOSE[Docker Compose]
        KAFKA[Apache Kafka 7.4.0]
        ZOOKEEPER[Zookeeper]
    end
    
    subgraph "Data & Schema"
        AVRO[Avro Schema]
        SCHEMA_REG[Schema Registry]
        JSON[JSON Messages]
    end
    
    subgraph "Monitoring & UI"
        KAFKA_UI[Kafka UI]
        SCHEMA_UI[Schema Registry UI]
        JMX[JMX Metrics]
    end
    
    %% Relationships
    REACT --> SOCKET_IO
    REACT --> AXIOS
    REACT --> CSS
    
    NODE --> EXPRESS
    EXPRESS --> KAFKAJS
    EXPRESS --> SOCKET_SERVER
    
    DOCKER --> COMPOSE
    COMPOSE --> KAFKA
    COMPOSE --> ZOOKEEPER
    
    KAFKA --> AVRO
    AVRO --> SCHEMA_REG
    SCHEMA_REG --> JSON
    
    KAFKA --> KAFKA_UI
    SCHEMA_REG --> SCHEMA_UI
    KAFKA --> JMX
    
    %% Styling
    classDef frontend fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef backend fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef infrastructure fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef data fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef monitoring fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class REACT,SOCKET_IO,AXIOS,CSS frontend
    class NODE,EXPRESS,KAFKAJS,SOCKET_SERVER backend
    class DOCKER,COMPOSE,KAFKA,ZOOKEEPER infrastructure
    class AVRO,SCHEMA_REG,JSON data
    class KAFKA_UI,SCHEMA_UI,JMX monitoring
```

## Порты и сетевые соединения

```mermaid
graph LR
    subgraph "Port Mapping"
        subgraph "Frontend"
            FRONTEND_PORT[3002:3000<br/>React App]
        end
        
        subgraph "Application Services"
            PRODUCER_PORT[3000:3000<br/>Producer API]
            CONSUMER_PORT[3001:3001<br/>Consumer API]
        end
        
        subgraph "Kafka Infrastructure"
            KAFKA_PORT[9092:9092<br/>Kafka Broker]
            ZK_PORT[2181:2181<br/>Zookeeper]
            JMX_PORT[9101:9101<br/>JMX Metrics]
        end
        
        subgraph "Schema & Monitoring"
            SR_PORT[8081:8081<br/>Schema Registry]
            SR_UI_PORT[8082:8000<br/>Schema Registry UI]
            KUI_PORT[8080:8080<br/>Kafka UI]
        end
    end
    
    %% Network connections
    FRONTEND_PORT -->|HTTP API| PRODUCER_PORT
    FRONTEND_PORT -->|HTTP API + WebSocket| CONSUMER_PORT
    
    PRODUCER_PORT -->|Kafka Protocol| KAFKA_PORT
    CONSUMER_PORT -->|Kafka Protocol| KAFKA_PORT
    
    KAFKA_PORT -->|Coordination| ZK_PORT
    SR_PORT -->|Kafka Protocol| KAFKA_PORT
    KUI_PORT -->|Kafka Protocol| KAFKA_PORT
    KUI_PORT -->|HTTP API| SR_PORT
    
    %% Styling
    classDef frontend fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef service fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef infrastructure fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef monitoring fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class FRONTEND_PORT frontend
    class PRODUCER_PORT,CONSUMER_PORT service
    class KAFKA_PORT,ZK_PORT,JMX_PORT infrastructure
    class SR_PORT,SR_UI_PORT,KUI_PORT monitoring
```

---

## 📋 Краткое описание архитектуры

### 🏗️ **Общая структура**
Система построена по микросервисной архитектуре с четким разделением ответственности между компонентами.

### 🔄 **Поток данных**
1. **Producer Service** принимает HTTP запросы и отправляет сообщения в Kafka
2. **Kafka Broker** хранит сообщения в топиках с партициями
3. **Consumer Service** подписывается на топики и получает сообщения в реальном времени
4. **React Frontend** предоставляет веб-интерфейс для управления всей системой

### 🛠️ **Ключевые технологии**
- **Backend**: Node.js + Express.js + KafkaJS
- **Frontend**: React.js + Socket.IO + Axios
- **Infrastructure**: Docker + Docker Compose
- **Message Queue**: Apache Kafka 7.4.0
- **Schema Management**: Confluent Schema Registry

### 📊 **Мониторинг и управление**
- **Kafka UI** для мониторинга кластера Kafka
- **Schema Registry UI** для управления схемами данных
- **JMX метрики** для производительности
- **Health check endpoints** для всех сервисов

### 🔒 **Безопасность**
- CORS настройки для веб-интерфейса
- Изоляция сервисов через Docker
- Валидация схем через Schema Registry

Эта архитектура обеспечивает масштабируемость, отказоустойчивость и простоту развертывания для демонстрационных и образовательных целей. 