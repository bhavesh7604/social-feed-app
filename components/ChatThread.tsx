// components/ChatThread.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message, Profile } from '@/lib/types'

interface ChatThreadProps {
  conversationId: string
  currentUserId: string
  recipientProfile: Profile
}

export default function ChatThread({
  conversationId,
  currentUserId,
  recipientProfile,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load existing messages
  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data as unknown as Message[])
        setTimeout(scrollToBottom, 100)
      }
    }

    loadMessages()
  }, [conversationId, supabase])

  // Realtime subscription for new incoming messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch sender details for the new message
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles!sender_id(*)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data as unknown as Message])
            setTimeout(scrollToBottom, 50)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const contentText = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: contentText,
    })

    if (error) {
      alert('Failed to send message: ' + error.message)
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[600px] glass-card rounded-2xl border border-slate-200/80 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white/50 flex items-center gap-3">
        {recipientProfile.avatar_url ? (
          <img
            src={recipientProfile.avatar_url}
            alt={recipientProfile.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
            {recipientProfile.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="font-bold text-sm text-slate-900">
            {recipientProfile.full_name || recipientProfile.username}
          </h3>
          <p className="text-xs text-slate-400">@{recipientProfile.username}</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                }`}
              >
                <p>{msg.content}</p>
                <span
                  className={`text-[9px] block mt-1 ${
                    isMe ? 'text-indigo-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message..."
          className="flex-1 bg-slate-100 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}