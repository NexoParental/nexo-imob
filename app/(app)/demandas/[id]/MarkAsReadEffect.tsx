'use client'
import { useEffect } from 'react'

export default function MarkAsReadEffect({ messageIds, autorId, currentUserId }: { messageIds: string[]; autorId?: string; currentUserId: string }) {
  useEffect(() => {
    const markAllAsRead = async () => {
      for (const msgId of messageIds) {
        if (autorId !== currentUserId) {
          await fetch(`/api/mensagens/${msgId}/mark-read`, { method: 'POST' }).catch(() => {})
        }
      }
    }
    markAllAsRead()
  }, [messageIds, autorId, currentUserId])

  return null
}
