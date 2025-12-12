# Руководство по отладке подключения Frontend-Backend

## Проблема
Запросы от frontend не доходят до backend - в логах backend нет записей.

## Пошаговая диагностика

### Шаг 1: Проверка переменных окружения

1. Откройте консоль браузера (F12)
2. Выполните:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

**Ожидаемый результат:** `http://localhost:5001/api` (для разработки)

**Если неверно:**
- Создайте/обновите `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```
- Перезапустите Next.js: `npm run dev`

### Шаг 2: Проверка API клиента

В консоли браузера:
```javascript
// Проверка baseURL
import api from './lib/api'
console.log('Base URL:', api.defaults.baseURL)
```

**Ожидаемый результат:** `http://localhost:5001/api`

### Шаг 3: Проверка backend

1. Убедитесь, что backend запущен:
```bash
cd my-gov-backend
python run.py
```

2. Проверьте health endpoint:
```bash
curl http://localhost:5001/health
```

**Ожидаемый результат:**
```json
{"status": "ok", "service": "mygov-backend"}
```

### Шаг 4: Проверка подключения из браузера

В консоли браузера:
```javascript
// Простой тест подключения
fetch('http://localhost:5001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Если ошибка CORS:**
- Проверьте настройки CORS в `my-gov-backend/app/__init__.py`
- Убедитесь, что `flask-cors` установлен: `pip install flask-cors`

**Если ошибка ECONNREFUSED:**
- Backend не запущен или недоступен
- Проверьте, что порт 5001 не занят другим процессом

### Шаг 5: Проверка авторизации

В консоли браузера:
```javascript
// Проверка токена
import Cookies from 'js-cookie'
console.log('Token:', Cookies.get('auth_token'))
```

**Если токен отсутствует:**
- Войдите в систему через `/login`
- Проверьте, что авторизация работает

### Шаг 6: Тестовый запрос

В консоли браузера:
```javascript
// Тестовый запрос на генерацию
const api = (await import('./lib/api')).default
api.post('/documents/generate', {
  patient_name: 'TEST',
  organization: 'TEST',
  doctor_name: 'TEST',
  issue_date: new Date().toISOString().split('T')[0]
})
  .then(r => console.log('Success:', r.data))
  .catch(e => {
    console.error('Error:', e)
    console.error('Status:', e.response?.status)
    console.error('Data:', e.response?.data)
    console.error('Code:', e.code)
  })
```

**Проверьте:**
1. В консоли браузера - логи запроса
2. В логах backend - появилась ли запись `[REQUEST] POST /api/documents/generate`

### Шаг 7: Использование диагностического скрипта

1. Запустите диагностику backend:
```bash
cd my-gov-backend
python diagnose_connection.py
```

2. В браузере выполните диагностику frontend:
   - Откройте консоль (F12)
   - Скопируйте содержимое `DIAGNOSTIC_SCRIPT.js`
   - Вставьте и выполните в консоли

## Типичные проблемы и решения

### Проблема 1: "ECONNREFUSED" или "ERR_NETWORK"

**Причина:** Backend не запущен или недоступен

**Решение:**
1. Запустите backend: `python run.py`
2. Проверьте, что порт 5001 свободен:
```bash
# Linux/Mac
lsof -i :5001
# Windows
netstat -ano | findstr :5001
```

### Проблема 2: CORS ошибка

**Причина:** Backend блокирует запросы из-за CORS

**Решение:**
1. Проверьте настройки CORS в `app/__init__.py`
2. Убедитесь, что `flask-cors` установлен
3. Перезапустите backend

### Проблема 3: 401 Unauthorized

**Причина:** Токен отсутствует или неверный

**Решение:**
1. Войдите в систему через `/login`
2. Проверьте, что токен сохраняется в cookies
3. Проверьте формат токена в заголовке Authorization

### Проблема 4: Запрос отправляется, но не доходит до backend

**Причина:** Проблемы с сетью или прокси

**Решение:**
1. Проверьте настройки прокси в браузере
2. Попробуйте другой браузер
3. Проверьте firewall настройки

## Включение детального логирования

### Frontend
Логирование уже включено в `lib/api.js`. Проверьте консоль браузера.

### Backend
Убедитесь, что в `.env`:
```
DEBUG=True
```

Или в `app/config.py` установите:
```python
DEBUG = True
```

## Проверка логов

### Backend логи
```bash
# Если логи в файле
tail -f /var/log/mygov-backend/app.log

# Или в консоли при запуске
python run.py
```

### Frontend логи
Откройте консоль браузера (F12) и проверьте:
- Network tab - все запросы к API
- Console tab - логи из `lib/api.js`

## Контрольный список

- [ ] Backend запущен на порту 5001
- [ ] Health endpoint отвечает: `curl http://localhost:5001/health`
- [ ] `.env.local` содержит правильный `NEXT_PUBLIC_API_URL`
- [ ] Next.js перезапущен после изменения `.env.local`
- [ ] Токен авторизации присутствует в cookies
- [ ] CORS настроен в backend
- [ ] Логирование включено (DEBUG=True)
- [ ] В консоли браузера видны логи запросов
- [ ] В логах backend видны входящие запросы

## Следующие шаги

Если после всех проверок проблема остается:

1. Соберите информацию:
   - Скриншот консоли браузера
   - Логи backend
   - Результат `diagnose_connection.py`
   - Результат диагностики из браузера

2. Проверьте сетевые настройки:
   - Firewall
   - Прокси
   - VPN

3. Попробуйте прямой запрос:
```bash
curl -X POST http://localhost:5001/api/documents/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"patient_name":"TEST","organization":"TEST","doctor_name":"TEST","issue_date":"2024-01-01"}'
```



