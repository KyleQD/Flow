"use client"

import { useEffect, useRef } from "react"

type KeyboardShortcutOptions = {
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  preventDefault?: boolean
}

export function useKeyboardShortcut(key: string, callback: () => void, options: KeyboardShortcutOptions = {}) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const { ctrlKey, shiftKey, altKey, metaKey, preventDefault = true } = options

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        (ctrlKey === undefined || event.ctrlKey === ctrlKey) &&
        (shiftKey === undefined || event.shiftKey === shiftKey) &&
        (altKey === undefined || event.altKey === altKey) &&
        (metaKey === undefined || event.metaKey === metaKey)
      ) {
        if (preventDefault) {
          event.preventDefault()
        }
        callbackRef.current()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [key, options])
}
