import { configureStore } from '@reduxjs/toolkit'
import authReducer, { forceLogout } from './authSlice'
import doctorQueueReducer from './doctorQueueSlice'
import activeCaseReducer from './activeCaseSlice'
import { setupAxiosInterceptors } from '../api/axiosInstance'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctorQueue: doctorQueueReducer,
    activeCase: activeCaseReducer
  }
})

setupAxiosInterceptors(store, forceLogout)

export default store
