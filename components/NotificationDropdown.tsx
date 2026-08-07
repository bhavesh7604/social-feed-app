// components/NotificationDropdown.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface NotificationItem {
  id: string
  type: 'like' | 'comment' | 'follow'
  read: boolean
  created_at: string
  post_id?: string
  actor: {
    username: string
    full_name: string
    avatar_url: string
  }
}

export default function NotificationDropdown({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Fetch initial notifications
  useEffect(() => {
    async function loadNotifications() {
      const { data } = await supabase
        .from('notifications')
        .select(`
          id, type, read, created_at, post_id,
          actor:profiles!actor_id (username, full_name, avatar_url)
        `)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setNotifications(data as unknown as NotificationItem[])
      }
    }

    loadNotifications()
  }, [userId, supabase])

  // Subscribe to real-time notification events
  useEffect(() => {
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch full row with actor details
          const { data } = await supabase
            .from('notifications')
            .select(`
              id, type, read, created_at, post_id,
              actor:profiles!actor_id (username, full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setNotifications((prev) => [data as unknown as NotificationItem, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  // Mark all unread notifications as read when opening dropdown
  const handleToggleOpen = async () => {
    setIsOpen(!isOpen)

    if (!isOpen && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('receiver_id', userId)
        .eq('read', false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleOpen}
        className="relative p-2 rounded-full hover:bg-slate-100 transition text-slate-600 cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Notifications
            </h3>
          </div>

          <div className="space-y-1 max-h-80 overflow-y-auto">
            {notifications.map((item) => (
              <Link
                key={item.id}
                href={
                  item.type === 'follow'
                    ? `/profile/${item.actor.username}`
                    : `/post/${item.post_id}`
                }
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded-xl text-xs transition ${
                  item.read ? 'hover:bg-slate-50' : 'bg-indigo-50/50 hover:bg-indigo-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden shrink-0">
                  {item.actor?.avatar_url ? (
                    <img src={item.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    item.actor?.username?.[0]?.toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 truncate">
                    <span className="font-bold">{item.actor?.username}</span>{' '}
                    {item.type === 'like' && 'liked your post.'}
                    {item.type === 'comment' && 'commented on your post.'}
                    {item.type === 'follow' && 'started following you.'}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </Link>
            ))}

            {notifications.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">
                No notifications yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}