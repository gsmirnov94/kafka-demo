# 🐳 Запуск Docker Desktop

## 🔍 Текущая ситуация

Docker установлен, но Docker Desktop не запущен. Нужно запустить Docker Desktop.

## 🚀 Простое решение

### 1. Запуск Docker Desktop

**Способ 1: Через меню Пуск**
1. Нажмите `Win + S`
2. Введите "Docker Desktop"
3. Запустите приложение

**Способ 2: Через командную строку**
```bash
# Запуск Docker Desktop
"C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### 2. Ожидание запуска

- Docker Desktop запускается 1-3 минуты
- В системном трее появится иконка Docker
- Иконка станет зеленой когда Docker готов

### 3. Проверка готовности

```bash
# Проверка статуса
docker info

# Тест работы
docker run hello-world
```

### 4. ⚠️ Важно: Права администратора

Если получаете ошибку о правах доступа:
1. **Закройте текущий терминал**
2. **Запустите PowerShell/CMD от имени администратора**
3. **Перейдите в папку проекта**
4. **Повторите команды**

### 5. ⚠️ Ошибка подключения к Docker daemon

Если получаете ошибку `open //./pipe/docker_engine`:
1. **Дождитесь зеленой иконки Docker в трее** (3-5 минут)
2. **Перезапустите Docker Desktop** (правый клик → Restart)
3. **Проверьте WSL 2**: `wsl --status`
4. **Обновите WSL**: `wsl --update`
5. **Перезагрузите компьютер** (если ничего не помогает)

### 6. 🚨 Виртуализация отключена

Если получаете "Virtualization support not detected":
1. **Перезагрузите компьютер**
2. **Войдите в BIOS** (F2, F10, F12, Delete или Esc при загрузке)
3. **Найдите и включите виртуализацию**:
   - Intel: `Intel VT-x` → **Enabled**
   - AMD: `AMD-V` → **Enabled**
4. **Сохраните изменения** (F10)
5. **Перезагрузитесь и попробуйте снова**

## ⚡ После запуска Docker

Когда Docker Desktop запустится, выполните:

```bash
# Запуск Kafka Demo
docker-compose up -d

# Проверка статуса
docker-compose ps
```

## 🎯 Ожидаемый результат

После успешного запуска Docker Desktop:

```bash
$ docker info
# Должна показаться информация о Docker без ошибок

$ docker-compose up -d
Creating network "kafka-demo_default" with the default driver
Creating kafka-demo_zookeeper_1 ... done
Creating kafka-demo_kafka_1     ... done
Creating kafka-demo_schema-registry_1 ... done
Creating kafka-demo_kafka-ui_1  ... done
```

## 🚨 Если Docker Desktop не запускается

1. **Перезагрузите компьютер**
2. **Запустите от имени администратора**
3. **Проверьте виртуализацию в BIOS**
4. **Обновите Docker Desktop**

## 📞 Альтернативное решение

Если Docker не удается запустить, используйте: [NO_DOCKER_SETUP.md](NO_DOCKER_SETUP.md)

---

**Следующий шаг**: После запуска Docker → [QUICKSTART.md](QUICKSTART.md)
