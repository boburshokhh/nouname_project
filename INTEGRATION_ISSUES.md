# Проблемы интеграции между my-gov-frontend и my-gov-backend

## Обнаруженные проблемы

### 1. Неправильный URL API по умолчанию

**Проблема:**
- Frontend использует дефолтный URL: `https://backend2.dmed.gubkin.uz/api`
- Это URL для dmed backend (порт 5000), а не для my-gov-backend (порт 5001)

**Файлы:**
- `lib/api.js` - строка 8
- `next.config.js` - строки 7-8
- `app/documents/page.js` - строка 143
- `app/documents/create/page.js` - строка 209

**Решение:**
Нужно изменить дефолтный URL на правильный для my-gov-backend:
```javascript
// В lib/api.js
const baseUrl = process.env.NEXT_PUBLIC_API_URL 
  || process.env.API_URL 
  || 'http://localhost:5001/api'  // Для разработки
  // Или 'https://your-mygov-backend-url.com/api' для продакшена
```

### 2. Формат дат

**Проблема:**
- Frontend отправляет даты в формате ISO (YYYY-MM-DD): `issue_date`, `days_off_from`, `days_off_to`
- Backend ожидает строки в формате YYYY-MM-DD и конвертирует их в DD.MM.YYYY для шаблона

**Статус:** ✅ Работает корректно - backend правильно обрабатывает ISO формат

### 3. Обязательные поля

**Проблема:**
- Frontend отправляет все необходимые поля
- Backend требует: `organization`, `doctor_name` (помечены как обязательные в форме)
- Поле `attached_medical_institution` опционально

**Статус:** ✅ Работает корректно - все обязательные поля присутствуют

### 4. Обработка ошибок

**Проблема:**
- Backend возвращает детальные ошибки с типами
- Frontend показывает только `error.response?.data?.message` или общее сообщение

**Рекомендация:**
Улучшить обработку ошибок на frontend для более информативных сообщений:
```javascript
catch (error) {
  const errorData = error.response?.data
  const errorMessage = errorData?.message 
    || errorData?.error 
    || error.message 
    || 'Ошибка генерации документа. Проверьте подключение к серверу.'
  
  // Показываем тип ошибки если есть
  if (errorData?.error_type) {
    console.error('Тип ошибки:', errorData.error_type)
  }
  
  alert(errorMessage)
  console.error('Ошибка генерации документа:', error)
}
```

### 5. Конфигурация переменных окружения

**Проблема:**
- В `netlify.toml` указан пример URL, но не настроена переменная окружения
- В `next.config.js` есть дублирование конфигурации

**Решение:**
1. В Netlify Dashboard добавить переменную окружения:
   - `NEXT_PUBLIC_API_URL` = `https://your-mygov-backend-url.com/api`

2. Для локальной разработки создать `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

## Рекомендации по исправлению

### Приоритет 1: Исправить URL API

1. Обновить `lib/api.js`:
```javascript
function getBaseURL() {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL 
    || process.env.API_URL 
    || 'http://localhost:5001/api'  // Изменить дефолт на my-gov-backend
  
  baseUrl = baseUrl.replace(/\/+$/, '')
  
  if (!baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl}/api`
  }
  
  return baseUrl
}
```

2. Обновить `next.config.js`:
```javascript
env: {
  API_URL: process.env.API_URL || 'http://localhost:5001/api',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
}
```

3. Обновить все места где используется хардкод URL:
   - `app/documents/page.js` - строка 143
   - `app/documents/create/page.js` - строка 209
   - `app/files/page.js` - строка 460

### Приоритет 2: Улучшить обработку ошибок

Добавить более детальную обработку ошибок в `app/documents/create/page.js`:
```javascript
catch (error) {
  const errorData = error.response?.data
  let errorMessage = 'Ошибка генерации документа. Проверьте подключение к серверу.'
  
  if (errorData) {
    errorMessage = errorData.message || errorData.error || errorMessage
    
    // Логируем детали для отладки
    if (errorData.error_type) {
      console.error('Тип ошибки:', errorData.error_type)
    }
    
    // Специфичные сообщения для разных типов ошибок
    if (errorData.message?.includes('база данных')) {
      errorMessage = 'Ошибка подключения к базе данных. Обратитесь к администратору.'
    } else if (errorData.message?.includes('шаблон')) {
      errorMessage = 'Ошибка при работе с шаблоном документа. Обратитесь к администратору.'
    } else if (errorData.message?.includes('хранилище')) {
      errorMessage = 'Ошибка при сохранении файла. Попробуйте еще раз.'
    }
  } else if (error.message) {
    errorMessage = error.message
  }
  
  alert(errorMessage)
  console.error('Ошибка генерации документа:', error)
}
```

### Приоритет 3: Настроить переменные окружения

1. Создать `.env.local` для локальной разработки:
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

2. В Netlify Dashboard добавить:
   - `NEXT_PUBLIC_API_URL` = `https://your-mygov-backend-url.com/api`

3. Обновить `netlify.toml` с комментарием:
```toml
# Переменные окружения настраиваются в Netlify Dashboard
# Settings > Environment variables > Add variable
# NEXT_PUBLIC_API_URL = https://your-mygov-backend-url.com/api
```

## Проверка работоспособности

После исправлений проверить:

1. ✅ Подключение к API:
   ```javascript
   // В консоли браузера
   fetch('http://localhost:5001/api/health')
     .then(r => r.json())
     .then(console.log)
   ```

2. ✅ Авторизация:
   - Войти в систему через `/login`
   - Проверить что токен сохраняется в cookies

3. ✅ Генерация документа:
   - Заполнить форму создания документа
   - Отправить запрос
   - Проверить ответ от сервера
   - Проверить что документ создается в БД

4. ✅ Скачивание документа:
   - После генерации попробовать скачать PDF/DOCX
   - Проверить что файлы доступны

## Логи для отладки

Backend логирует детальную информацию:
- `[API:CREATE_DOC]` - запросы на создание документа
- `[DOC_GEN:...]` - этапы генерации документа
- `[DOCX_TEMPLATE:...]` - работа с шаблоном
- `[PDF_CONVERSION:...]` - конвертация в PDF

Проверьте логи backend при возникновении проблем.



