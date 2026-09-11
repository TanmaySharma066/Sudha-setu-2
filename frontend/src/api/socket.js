import { io } from 'socket.io-client'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const socketBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')

export const socket = io(socketBaseUrl, {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket', 'polling']
})

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect()
  }
}

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect()
  }
}

export const joinDoctorsRoom = () => {
  connectSocket()
  socket.emit('doctors:join')
}

export const joinCaseRoom = (caseId) => {
  if (!caseId) return
  connectSocket()
  socket.emit('case:join', caseId)
}

export const leaveCaseRoom = (caseId) => {
  if (!caseId) return
  socket.emit('case:leave', caseId)
}

export const joinAmbulanceRoom = () => {
  connectSocket()
  socket.emit('ambulance:join')
}

export const joinSupportRoom = () => {
  connectSocket()
  socket.emit('support:join')
}
