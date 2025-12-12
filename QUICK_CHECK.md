# Быстрая проверка подключения

## 1. Проверка backend (в терминале)

```bash
cd my-gov-backend
python diagnose_connection.py
```

## 2. Проверка frontend (в консоли браузера F12)

```javascript
// Проверка URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'НЕ УСТАНОВЛЕНА')

// Проверка подключения
fetch('http://localhost:5001/health')
  .then(r => r.json())
  .then(d => console.log('✓ Backend доступен:', d))
  .catch(e => console.error('✗ Backend недоступен:', e.message))
```

## 3. Проверка при генерации документа

1. Откройте консоль браузера (F12)
2. Перейдите на страницу создания документа
3. Заполните форму и нажмите "Создать"
4. Проверьте логи в консоли:
   - `[GENERATE]` - логи из формы
   - `[API REQUEST]` - отправка запроса
   - `[API RESPONSE]` или `[API ERROR]` - ответ от сервера

## 4. Проверка логов backend

В терминале где запущен backend должны появиться:
```
[REQUEST] POST /api/documents/generate
[REQUEST] Headers: {...}
[REQUEST] Remote: 127.0.0.1
```

**Если этих логов нет** - запрос не доходит до backend!

## Возможные причины:

1. **Неправильный URL** - проверьте `.env.local`
2. **Backend не запущен** - запустите `python run.py`
3. **CORS блокирует** - проверьте настройки CORS
4. **Проблемы с сетью** - проверьте firewall/proxy



