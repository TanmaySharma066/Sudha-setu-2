import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

let activeRefreshPromise = null

export const setupAxiosInterceptors = (store, logoutAction) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const responseStatus = error.response?.status
      const errorCode = error.response?.data?.code

      if (responseStatus === 401 && errorCode === 'TOKEN_EXPIRED' && !originalRequest._retry) {
        originalRequest._retry = true

        if (!activeRefreshPromise) {
          activeRefreshPromise = axiosInstance
            .post('/auth/refresh', {})
            .then(() => {
              activeRefreshPromise = null
            })
            .catch((refreshError) => {
              activeRefreshPromise = null
              if (store && logoutAction) {
                store.dispatch(logoutAction())
              }
              return Promise.reject(refreshError)
            })
        }

        try {
          await activeRefreshPromise
          return axiosInstance(originalRequest)
        } catch (refreshFailed) {
          return Promise.reject(refreshFailed)
        }
      }

      if (responseStatus === 401 && !originalRequest._retry) {
        if (store && logoutAction) {
          store.dispatch(logoutAction())
        }
      }

      return Promise.reject(error)
    }
  )
}

export default axiosInstance
