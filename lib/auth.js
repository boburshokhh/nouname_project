import Cookies from 'js-cookie'

export function setAuth(token, userData) {
  Cookies.set('auth_token', token, { expires: 7 })
  Cookies.set('user_role', userData.role, { expires: 7 })
  Cookies.set('user_data', JSON.stringify(userData), { expires: 7 })
}

export function getAuth() {
  const token = Cookies.get('auth_token')
  const role = Cookies.get('user_role')
  const userData = Cookies.get('user_data')
  
  if (!token || !role) {
    return null
  }
  
  return {
    token,
    role,
    userData: userData ? JSON.parse(userData) : null,
  }
}

export function clearAuth() {
  Cookies.remove('auth_token')
  Cookies.remove('user_role')
  Cookies.remove('user_data')
}

export function isSuperAdmin() {
  const auth = getAuth()
  return auth?.role === 'super_admin'
}

export function isMyGovAdmin() {
  const auth = getAuth()
  return auth?.role === 'mygov_admin' || auth?.role === 'super_admin'
}

export function isAdmin() {
  const auth = getAuth()
  // Для MyGov админ-панели разрешаем доступ только mygov_admin и super_admin
  return auth?.role === 'mygov_admin' || auth?.role === 'super_admin'
}

export function getCurrentUser() {
  const auth = getAuth()
  return auth?.userData || null
}

