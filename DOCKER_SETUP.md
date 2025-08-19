# 🐳 Настройка Docker для Kafka Demo

## ⚠️ Проблема: Docker daemon не запущен

Если вы видите ошибку:
```
error during connect: this error may indicate that the docker daemon is not running
```

Это означает, что Docker Desktop не запущен или не установлен.

## 🔧 Решение для Windows

### 1. Установка Docker Desktop

Если Docker не установлен:
1. Скачайте Docker Desktop с официального сайта: https://www.docker.com/products/docker-desktop/
2. Установите Docker Desktop
3. Перезагрузите компьютер

### 2. Запуск Docker Desktop

1. Найдите "Docker Desktop" в меню Пуск
2. Запустите приложение
3. Дождитесь полной загрузки (может занять 2-3 минуты)
4. В системном трее должна появиться иконка Docker

### 3. Проверка статуса

```bash
# Проверка версии Docker
docker --version

# Проверка статуса Docker
docker info

# Тест работы Docker
docker run hello-world
```

### 4. Включение WSL 2 (рекомендуется)

Для лучшей производительности на Windows:
1. Откройте Docker Desktop
2. Перейдите в Settings → General
3. Включите "Use the WSL 2 based engine"
4. Перезапустите Docker Desktop

## 🚀 После настройки Docker

Когда Docker заработает, выполните:

```bash
# Проверка Docker Compose
docker-compose --version

# Запуск Kafka Demo
docker-compose up -d

# Проверка статуса контейнеров
docker-compose ps
```

## 🔍 Диагностика проблем

### Проблема: Docker Desktop не запускается

**Решение:**
1. Перезагрузите компьютер
2. Запустите Docker Desktop от имени администратора
3. Проверьте, включена ли виртуализация в BIOS

### Проблема: WSL 2 не работает

**Решение:**
1. Установите WSL 2: https://docs.microsoft.com/en-us/windows/wsl/install
2. Обновите ядро WSL 2
3. Перезапустите Docker Desktop

### Проблема: Медленная работа

**Решение:**
1. Выделите больше ресурсов Docker в Settings → Resources
2. Используйте WSL 2 вместо Hyper-V
3. Исключите папку проекта из антивируса

## 📊 Системные требования

- **OS**: Windows 10 версии 2004 или выше
- **RAM**: Минимум 4GB, рекомендуется 8GB
- **CPU**: Поддержка виртуализации (Intel VT-x или AMD-V)
- **Место на диске**: Минимум 4GB свободного места

## 🎯 Альтернативное решение (без Docker)

Если Docker не удается настроить, можно запустить только Node.js сервисы:

### 1. Установка Kafka локально

```bash
# Скачать Kafka
wget https://downloads.apache.org/kafka/2.13-3.6.0/kafka_2.13-3.6.0.tgz
tar -xzf kafka_2.13-3.6.0.tgz
cd kafka_2.13-3.6.0

# Запуск Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Запуск Kafka (в другом терминале)
bin/kafka-server-start.sh config/server.properties
```

### 2. Запуск только Node.js сервисов

```bash
# Producer
cd producer
npm install
npm start

# Consumer
cd consumer
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

## 🆘 Получение помощи

Если проблемы с Docker продолжаются:

1. **Docker Desktop Troubleshooting**: https://docs.docker.com/desktop/troubleshoot/
2. **Stack Overflow**: Поиск по тегу [docker-desktop]
3. **Docker Community**: https://forums.docker.com/

## ✅ Проверка готовности

После настройки Docker выполните:

```bash
# Проверка Docker
docker run hello-world

# Запуск Kafka Demo
docker-compose up -d

# Проверка логов
docker-compose logs
```

Если все команды выполняются без ошибок - Docker настроен правильно!

---

**Следующий шаг**: Вернитесь к [QUICKSTART.md](QUICKSTART.md) для запуска демо-системы.
