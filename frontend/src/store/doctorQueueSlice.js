import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../api/axiosInstance'

export const fetchDoctorQueue = createAsyncThunk(
  'doctorQueue/fetchDoctorQueue',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { doctorQueue } = getState()
      const { filters, page, limit } = doctorQueue
      const params = new URLSearchParams()

      if (filters.status) {
        params.append('status', filters.status)
      }
      if (filters.dangerLevel) {
        params.append('dangerLevel', filters.dangerLevel)
      }
      if (filters.mine) {
        params.append('mine', 'true')
      }
      if (page) {
        params.append('page', String(page))
      }
      if (limit) {
        params.append('limit', String(limit))
      }

      const queryString = params.toString()
      const url = queryString ? `/doctor/queue?${queryString}` : '/doctor/queue'
      const response = await axiosInstance.get(url)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor queue')
    }
  }
)

const initialState = {
  cases: [],
  filters: {
    status: '',
    dangerLevel: '',
    mine: false
  },
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  status: 'idle',
  error: null
}

const doctorQueueSlice = createSlice({
  name: 'doctorQueue',
  initialState,
  reducers: {
    setQueueFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.page = 1
    },
    setQueuePage: (state, action) => {
      state.page = action.payload
    },
    caseNewReceived: (state, action) => {
      const newCase = action.payload
      const exists = state.cases.some((c) => String(c._id) === String(newCase.caseId || newCase._id))
      if (!exists) {
        const item = {
          _id: newCase.caseId || newCase._id,
          patient: newCase.patient || { name: 'New Patient' },
          dangerLevel: newCase.dangerLevel || 'medium',
          status: newCase.status || 'pending_doctor',
          createdAt: newCase.createdAt || new Date().toISOString(),
          firstMessage: newCase.firstMessage || '',
          symptoms: newCase.symptoms || []
        }
        state.cases = [item, ...state.cases]
        state.total += 1
      }
    },
    caseUpdatedReceived: (state, action) => {
      const updated = action.payload
      const id = updated.caseId || updated._id
      const index = state.cases.findIndex((c) => String(c._id) === String(id))
      if (index !== -1) {
        state.cases[index] = {
          ...state.cases[index],
          ...updated,
          _id: id
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorQueue.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDoctorQueue.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.cases = action.payload.cases || []
        state.page = action.payload.page || 1
        state.limit = action.payload.limit || 10
        state.total = action.payload.total || 0
        state.totalPages = action.payload.totalPages || 1
        state.error = null
      })
      .addCase(fetchDoctorQueue.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  }
})

export const { setQueueFilters, setQueuePage, caseNewReceived, caseUpdatedReceived } =
  doctorQueueSlice.actions
export default doctorQueueSlice.reducer
