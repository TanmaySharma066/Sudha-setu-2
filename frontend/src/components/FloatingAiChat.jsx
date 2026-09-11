import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../api/axiosInstance'
import { MessageSquare, X, Send, Bot, Sparkles, RefreshCw, Loader2 } from 'lucide-react'

export const FloatingAiChat = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const loadChatHistory = async (targetChatId) => {
    if (!targetChatId) return
    setLoadingHistory(true)
    try {
      const res = await axiosInstance.get(`/ai/chat/${targetChatId}`)
      if (res.data?.messages) {
        setMessages(res.data.messages)
      }
    } catch {
      setMessages([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleStartNewChat = () => {
    setChatId(null)
    setMessages([
      {
        sender: 'ai',
        content: 'Namaste! I am Sudha Setu Ayurvedic Assistant. How can I assist you with wellness guidance or symptom clarification today?',
        timestamp: new Date().toISOString()
      }
    ])
  }

  const handleOpenWidget = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      handleStartNewChat()
    }
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    const trimmed = inputMessage.trim()
    if (!trimmed || sending) return

    const userTurn = {
      sender: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
    }

    setMessages((prev) => [...prev, userTurn])
    setInputMessage('')
    setSending(true)

    try {
      const payload = {
        message: trimmed,
        ...(chatId ? { chatId } : {})
      }
      const response = await axiosInstance.post('/ai/chat', payload)
      if (response.data) {
        if (response.data.chatId && !chatId) {
          setChatId(response.data.chatId)
        }
        const botTurn = {
          sender: 'ai',
          content: response.data.reply,
          timestamp: new Date().toISOString()
        }
        setMessages((prev) => [...prev, botTurn])
      }
    } catch (err) {
      const errorTurn = {
        sender: 'ai',
        content: err.response?.data?.message || 'Sorry, I could not process your query right now. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages((prev) => [...prev, errorTurn])
    } finally {
      setSending(false)
    }
  }

  if (!isAuthenticated || user?.role !== 'patient') {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen ? (
        <button
          onClick={handleOpenWidget}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 border-emerald-400/40"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-200 animate-spin" style={{ animationDuration: '6s' }} />
            <Bot className="w-5 h-5 absolute inset-0 text-white" />
          </div>
          <span className="text-sm font-semibold pr-1">Ayush AI Chat</span>
        </button>
      ) : (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/25">
                <Bot className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  Ayush AI Wellness Guide
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </h3>
                <p className="text-xs text-emerald-100">Ayurvedic pre-consultation companion</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleStartNewChat}
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/15 transition-colors"
                title="Start New Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/15 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full text-emerald-700">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              messages.map((m, index) => {
                const isUser = m.sender === 'user'
                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      <span
                        className={`text-[10px] mt-1 block text-right ${
                          isUser ? 'text-emerald-100' : 'text-gray-400'
                        }`}
                      >
                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 border border-gray-200 px-4 py-2 rounded-2xl text-xs flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Formulating Ayurvedic guidance...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about symptoms, herbs, or diet..."
              maxLength={2000}
              disabled={sending}
              className="flex-1 px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default FloatingAiChat
