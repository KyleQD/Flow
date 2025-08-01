import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, Image, Video, Music, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DragDropIndicatorProps {
  isDragOver: boolean
  isDragValid: boolean
  errorMessage?: string | null
  allowedTypes?: string[]
  className?: string
  children?: React.ReactNode
}

export function DragDropIndicator({
  isDragOver,
  isDragValid,
  errorMessage,
  allowedTypes = ['image', 'video', 'audio', 'document'],
  className,
  children
}: DragDropIndicatorProps) {
  const getTypeIcons = () => {
    const icons = []
    if (allowedTypes.includes('image')) icons.push(<Image key="image" className="h-6 w-6" />)
    if (allowedTypes.includes('video')) icons.push(<Video key="video" className="h-6 w-6" />)
    if (allowedTypes.includes('audio')) icons.push(<Music key="audio" className="h-6 w-6" />)
    if (allowedTypes.includes('document')) icons.push(<FileText key="document" className="h-6 w-6" />)
    return icons
  }

  return (
    <div className={cn('relative', className)}>
      {children}
      
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed',
              isDragValid 
                ? 'bg-purple-500/20 border-purple-500/50' 
                : 'bg-red-500/20 border-red-500/50'
            )}
          >
            <div className="text-center p-8">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                {isDragValid ? (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Upload className="h-12 w-12 text-purple-400" />
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Upload className="h-12 w-12 text-red-400" />
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className={cn(
                  'text-lg font-medium mb-2',
                  isDragValid ? 'text-purple-400' : 'text-red-400'
                )}>
                  {isDragValid ? 'Drop files here' : 'Invalid files'}
                </div>
                
                <div className={cn(
                  'text-sm mb-4',
                  isDragValid ? 'text-purple-400/70' : 'text-red-400/70'
                )}>
                  {isDragValid 
                    ? `Supported: ${allowedTypes.join(', ')}`
                    : errorMessage || 'Please check file types and sizes'
                  }
                </div>
                
                {isDragValid && (
                  <div className="flex items-center justify-center gap-3">
                    {getTypeIcons().map((icon, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="p-2 bg-purple-500/20 rounded-lg"
                      >
                        {icon}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple drag overlay for basic use cases
export function SimpleDragOverlay({
  isDragOver,
  isDragValid,
  className
}: {
  isDragOver: boolean
  isDragValid: boolean
  className?: string
}) {
  return (
    <AnimatePresence>
      {isDragOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute inset-0 bg-purple-500/20 border-2 border-dashed border-purple-500/50 rounded-lg flex items-center justify-center z-10',
            !isDragValid && 'bg-red-500/20 border-red-500/50',
            className
          )}
        >
          <div className="text-center">
            <Upload className={cn(
              'h-8 w-8 mx-auto mb-2',
              isDragValid ? 'text-purple-400' : 'text-red-400'
            )} />
            <div className={cn(
              'text-sm font-medium',
              isDragValid ? 'text-purple-400' : 'text-red-400'
            )}>
              {isDragValid ? 'Drop files here' : 'Invalid files'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 