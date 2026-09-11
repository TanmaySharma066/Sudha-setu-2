import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../api/axiosInstance'
import { disconnectSocket } from '../api/socket'

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/auth/me')
    return response.data.user
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Authentication check failed')
  }
})

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials)
    return response.data.user
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/auth/register', payload)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed')
  }
})

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', payload)
    return response.data.user
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'OTP verification failed')
  }
})

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/auth/logout')
    disconnectSocket()
    return response.data
  } catch (error) {
    disconnectSocket()
    return rejectWithValue(error.response?.data?.message || 'Logout failed')
  }
})

const initialState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
  devOtp: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    clearDevOtp: (state) => {
      state.devOtp = null
    },
    forceLogout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.status = 'idle'
      state.error = null
      state.devOtp = null
      disconnectSocket()
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.isAuthenticated = Boolean(action.payload)
        state.error = null
      })
      .addCase(checkAuth.rejected, (state) => {
        state.status = 'failed'
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.devOtp = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.devOtp = action.payload.devOtp || null
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
        state.devOtp = null
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.status = 'idle'
        state.error = null
        state.devOtp = null
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.status = 'idle'
        state.error = null
        state.devOtp = null
      })
  }
})

export const { clearAuthError, clearDevOtp, forceLogout } = authSlice.actions
export default authSlice.reducer
