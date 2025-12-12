import axios from 'axios'
import Cookies from 'js-cookie'

// Функция для получения baseURL с правильным префиксом /api
function getBaseURL() {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL 
    || process.env.API_URL 
    || 'http://localhost:5001/api'  // Дефолт для my-gov-backend (порт 5001)
  
  // Убираем trailing slash если есть
  baseUrl = baseUrl.replace(/\/+$/, '')
  
  // Добавляем /api только если его еще нет
  if (!baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl}/api`
  }
  
  return baseUrl
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Логирование запросов для отладки
  console.log('[API REQUEST]', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    hasToken: !!token,
    data: config.data ? (typeof config.data === 'string' ? config.data.substring(0, 100) : 'Object') : 'No data'
  })
  
  return config
})

// Обработка ошибок
api.interceptors.response.use(
  (response) => {
    // Логирование успешных ответов
    console.log('[API RESPONSE]', {
      status: response.status,
      url: response.config.url,
      data: response.data ? 'Received' : 'No data'
    })
    return response
  },
  (error) => {
    // Детальное логирование ошибок
    console.error('[API ERROR]', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown',
      responseData: error.response?.data,
      requestData: error.config?.data,
      code: error.code, // ECONNREFUSED, ENOTFOUND и т.д.
    })
    
    // Специальная обработка для ошибок подключения
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('[API ERROR] Backend недоступен! Проверьте:')
      console.error('  1. Запущен ли backend на порту 5001')
      console.error('  2. Правильность URL:', error.config?.baseURL)
      console.error('  3. Настройки CORS в backend')
    }
    
    if (error.response?.status === 401) {
      Cookies.remove('auth_token')
      Cookies.remove('user_role')
      Cookies.remove('user_data')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

