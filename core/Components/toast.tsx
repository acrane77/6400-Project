'use client'

import { useEffect, useState } from 'react'

export type ToastVariant = 'default' | 'success' | 'error' | 'info' | 'warning'

type ToastItem = {
  id: number
  message: string
  variant: ToastVariant
}

type ToastListener = (item: ToastItem) => void

const listeners = new Set<ToastListener>()
let nextToastId = 0

export function toast(message: string, variant: ToastVariant = 'default') {
  const item = { id: ++nextToastId, message, variant }
  listeners.forEach((listener) => listener(item))
  return item.id
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white',
  success: 'border-green-700 bg-green-700 text-white',
  error: 'border-red-700 bg-red-700 text-white',
  info: 'border-blue-700 bg-blue-700 text-white',
  warning: 'border-amber-600 bg-amber-500 text-black',
}

export function ToastProvider() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const listener: ToastListener = (item) => {
      setItems((current) => [...current, item])
      window.setTimeout(() => {
        setItems((current) => current.filter((toastItem) => toastItem.id !== item.id))
      }, 4000)
    }

    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {items.map((item) => (
        <div
          key={item.id}
          role={item.variant === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-center justify-between gap-4 rounded-lg border px-4 py-3 shadow-lg ${variantStyles[item.variant]}`}
        >
          <span>{item.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="shrink-0 rounded px-1 text-lg leading-none opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => setItems((current) => current.filter((toastItem) => toastItem.id !== item.id))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
