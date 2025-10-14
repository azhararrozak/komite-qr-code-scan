import axios from 'axios'
import useAuthStore from '../stores/useAuthStore'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

// Request interceptor: attach token from zustand store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().user?.accessToken
    if (token) {
      config.headers = config.headers || {}
      config.headers['x-access-token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: if 401, clear auth state
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config
    // if no response or not 401, reject
    if (!err.response || err.response.status !== 401) {
      return Promise.reject(err)
    }

    // avoid infinite loop
    if (originalRequest._retry) {
      useAuthStore.getState().logout()
      return Promise.reject(err)
    }

    originalRequest._retry = true

    try {
      // attempt to refresh token
      const refreshRes = await axios.post('http://localhost:3000/api/auth/refreshtoken', {
        // backend may require refresh token in body or cookie — try sending stored refreshToken
        refreshToken: useAuthStore.getState().user?.refreshToken,
      })

      const newData = refreshRes.data
      if (newData && newData.accessToken) {
        // update store with new tokens
        useAuthStore.getState().setUser(newData)

        // set header and retry original request
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers['x-access-token'] = newData.accessToken
        return api(originalRequest)
      }
    } catch (refreshError) {
      // refresh failed -> logout
      useAuthStore.getState().logout()
      return Promise.reject(refreshError)
    }

    return Promise.reject(err)
  }
)

export default api
