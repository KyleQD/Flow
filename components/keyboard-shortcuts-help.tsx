"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Keyboard, X } from 'lucide-react'

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    { key: ['Ctrl', 'N'], description: 'Create new event' },
    { key: ['Ctrl', 'S'], description: 'Save event (in modal)' },
    { key: ['Escape'], description: 'Close modal' },
    { key: ['?'], description: 'Show this help' },
  ]

  // Listen for ? key to toggle help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only if not focused on an input
        const activeElement = document.activeElement
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setIsOpen(prev => !prev)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-800/80 border border-slate-700/50 text-gray-400 hover:text-white z-50"
        title="Keyboard shortcuts (Press ? for help)"
      >
        <Keyboard className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-slate-800/95 border-slate-700/50 shadow-xl z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">Keyboard Shortcuts</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-300">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.key.map((key, keyIndex) => (
                <span key={keyIndex} className="flex items-center">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-slate-700 border border-slate-600 rounded">
                    {key}
                  </kbd>
                  {keyIndex < shortcut.key.length - 1 && (
                    <span className="text-gray-400 mx-1">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-2 text-xs text-gray-400">
          Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-300 bg-slate-700 border border-slate-600 rounded">?</kbd> to toggle this help
        </div>
      </CardContent>
    </Card>
  )
} 