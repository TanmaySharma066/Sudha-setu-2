import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../api/axiosInstance'

export const fetchCaseById = createAsyncThunk(
  'activeCase/fetchCaseById',
  async (caseId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/cases/${caseId}`)
      return response.data.case
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch case details')
    }
  }
)

export const updateCasePrescription = createAsyncThunk(
  'activeCase/updateCasePrescription',
  async ({ caseId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/cases/${caseId}`, payload)
      return response.data.case
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update prescription')
    }
  }
)

export const downloadCasePdf = createAsyncThunk(
  'activeCase/downloadCasePdf',
  async (caseId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/cases/${caseId}/pdf`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `case-sheet-${caseId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl)
      }, 2000)
      return { success: true }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download PDF')
    }
  }
)

const initialState = {
  currentCase: null,
  status: 'idle',
  error: null,
  updateStatus: 'idle',
  updateError: null,
  pdfDownloading: false
}

const activeCaseSlice = createSlice({
  name: 'activeCase',
  initialState,
  reducers: {
    clearActiveCase: (state) => {
      state.currentCase = null
      state.status = 'idle'
      state.error = null
      state.updateStatus = 'idle'
      state.updateError = null
      state.pdfDownloading = false
    },
    caseUpdatedLive: (state, action) => {
      if (state.currentCase && String(state.currentCase._id) === String(action.payload.caseId || action.payload._id)) {
        state.currentCase = {
          ...state.currentCase,
          ...action.payload
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaseById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCaseById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentCase = action.payload
        state.error = null
      })
      .addCase(fetchCaseById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(updateCasePrescription.pending, (state) => {
        state.updateStatus = 'loading'
        state.updateError = null
      })
      .addCase(updateCasePrescription.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded'
        state.currentCase = action.payload
        state.updateError = null
      })
      .addCase(updateCasePrescription.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.updateError = action.payload
      })
      .addCase(downloadCasePdf.pending, (state) => {
        state.pdfDownloading = true
      })
      .addCase(downloadCasePdf.fulfilled, (state) => {
        state.pdfDownloading = false
      })
      .addCase(downloadCasePdf.rejected, (state) => {
        state.pdfDownloading = false
      })
  }
})

export const { clearActiveCase, caseUpdatedLive } = activeCaseSlice.actions
export default activeCaseSlice.reducer
