# Исправление .env.local

## Проблема
В файле `.env.local` указан неправильный URL для my-gov-backend.

## Решение

Обновите файл `my-gov-frontend/.env.local`:

### Для локальной разработки:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### Для продакшена (если используете другой URL):
```env
NEXT_PUBLIC_API_URL=https://your-mygov-backend-url.com/api
```

**Важно:** 
- my-gov-backend работает на порту **5001** (не 5000 как dmed)
- URL должен заканчиваться на `/api`

## После изменения

1. Перезапустите Next.js dev server:
   ```bash
   npm run dev
   ```

2. Очистите кэш браузера или откройте в режиме инкогнито

3. Проверьте подключение к API в консоли браузера:
   ```javascript
   fetch('http://localhost:5001/api/health')
     .then(r => r.json())
     .then(console.log)
   ```



