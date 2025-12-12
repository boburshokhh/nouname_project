/**
 * Диагностический скрипт для проверки подключения к backend
 * Запустите в консоли браузера (F12) на странице создания документа
 */

async function diagnoseBackendConnection() {
  console.log('🔍 Начинаем диагностику подключения к backend...\n');
  
  // 1. Проверка переменных окружения
  console.log('1️⃣ Проверка переменных окружения:');
  console.log('   NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'НЕ УСТАНОВЛЕНА');
  console.log('   API_URL:', process.env.API_URL || 'НЕ УСТАНОВЛЕНА');
  
  // 2. Проверка API клиента
  console.log('\n2️⃣ Проверка API клиента:');
  try {
    const api = await import('./lib/api.js');
    console.log('   API клиент загружен:', !!api.default);
    console.log('   Base URL:', api.default.defaults.baseURL);
  } catch (e) {
    console.error('   ❌ Ошибка загрузки API клиента:', e);
  }
  
  // 3. Проверка токена авторизации
  console.log('\n3️⃣ Проверка авторизации:');
  const Cookies = (await import('js-cookie')).default;
  const token = Cookies.get('auth_token');
  console.log('   Токен:', token ? `✓ Найден (${token.substring(0, 20)}...)` : '❌ НЕ НАЙДЕН');
  console.log('   Роль:', Cookies.get('user_role') || 'НЕ УСТАНОВЛЕНА');
  
  // 4. Проверка health endpoint
  console.log('\n4️⃣ Проверка health endpoint:');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const healthUrl = baseUrl.replace('/api', '') + '/health';
  
  try {
    const healthResponse = await fetch(healthUrl);
    const healthData = await healthResponse.json();
    console.log('   ✓ Health check успешен:', healthData);
  } catch (e) {
    console.error('   ❌ Health check не удался:', e.message);
    console.log('   URL:', healthUrl);
  }
  
  // 5. Проверка подключения к API
  console.log('\n5️⃣ Проверка подключения к API:');
  const apiUrl = baseUrl + '/documents';
  
  try {
    const testResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    console.log('   Статус:', testResponse.status);
    console.log('   Headers:', Object.fromEntries(testResponse.headers.entries()));
    
    if (testResponse.status === 401) {
      console.log('   ⚠️ Требуется авторизация');
    } else if (testResponse.ok) {
      console.log('   ✓ Подключение к API работает');
    } else {
      const errorData = await testResponse.json();
      console.log('   ❌ Ошибка:', errorData);
    }
  } catch (e) {
    console.error('   ❌ Ошибка подключения:', e.message);
    console.log('   URL:', apiUrl);
    console.log('   Проверьте:');
    console.log('     - Запущен ли backend на порту 5001');
    console.log('     - Правильность URL в переменных окружения');
    console.log('     - Настройки CORS в backend');
  }
  
  // 6. Тестовый запрос на генерацию (без реальной генерации)
  console.log('\n6️⃣ Тестовый запрос на генерацию:');
  console.log('   (Этот запрос покажет, доходит ли запрос до backend)');
  
  const testFormData = {
    patient_name: 'TEST',
    organization: 'TEST',
    doctor_name: 'TEST',
    issue_date: new Date().toISOString().split('T')[0]
  };
  
  try {
    const generateUrl = baseUrl + '/documents/generate';
    console.log('   Отправка запроса на:', generateUrl);
    
    const generateResponse = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(testFormData)
    });
    
    console.log('   Статус ответа:', generateResponse.status);
    const responseData = await generateResponse.json();
    console.log('   Ответ:', responseData);
    
    if (generateResponse.status === 401) {
      console.log('   ⚠️ Проблема: Требуется авторизация');
    } else if (generateResponse.status === 400) {
      console.log('   ✓ Запрос дошел до backend! (Ошибка валидации - это нормально)');
    } else if (generateResponse.ok) {
      console.log('   ✓ Запрос успешен!');
    }
  } catch (e) {
    console.error('   ❌ Ошибка при отправке запроса:', e);
    console.log('   Это означает, что запрос не доходит до backend');
    console.log('   Возможные причины:');
    console.log('     - Backend не запущен');
    console.log('     - Неправильный URL');
    console.log('     - Проблемы с сетью');
    console.log('     - CORS блокирует запрос');
  }
  
  console.log('\n✅ Диагностика завершена');
  console.log('\n📋 Следующие шаги:');
  console.log('   1. Проверьте логи backend при выполнении запроса');
  console.log('   2. Убедитесь, что backend запущен: python run.py');
  console.log('   3. Проверьте переменные окружения в .env.local');
  console.log('   4. Проверьте консоль браузера на наличие ошибок CORS');
}

// Запуск диагностики
diagnoseBackendConnection();



