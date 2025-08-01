"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingStateProps {
  type?: 'dashboard' | 'table' | 'cards' | 'form'
  count?: number
}

export function OptimizedLoading({ type = 'dashboard', count = 6 }: LoadingStateProps) {
  const DashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-slate-700" />
                    <Skeleton className="h-8 w-20 bg-slate-700" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg bg-slate-700" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-slate-700" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4 bg-slate-700" />
                      <Skeleton className="h-3 w-1/2 bg-slate-700" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const TableSkeleton = () => (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-slate-700" />
        <Skeleton className="h-10 w-32 bg-slate-700" />
      </div>

      {/* Table */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className="p-4 text-left">
                      <Skeleton className="h-4 w-20 bg-slate-700" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: count }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <Skeleton className="h-4 w-24 bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const CardsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-lg bg-slate-700" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4 bg-slate-700" />
                  <Skeleton className="h-3 w-1/2 bg-slate-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full bg-slate-700" />
              <Skeleton className="h-4 w-2/3 bg-slate-700" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-8 w-20 bg-slate-700" />
                <Skeleton className="h-8 w-16 bg-slate-700" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )

  const FormSkeleton = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-slate-700" />
        <Skeleton className="h-4 w-64 bg-slate-700" />
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-6 space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24 bg-slate-700" />
              <Skeleton className="h-10 w-full bg-slate-700" />
            </div>
          ))}
          
          <div className="flex items-center space-x-4 pt-4">
            <Skeleton className="h-10 w-24 bg-slate-700" />
            <Skeleton className="h-10 w-24 bg-slate-700" />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-slate-700 border-t-purple-500 rounded-full mx-auto"
        />
        <div className="space-y-2">
          <p className="text-slate-400 font-medium">Loading your dashboard...</p>
          <p className="text-slate-500 text-sm">Please wait while we prepare your data</p>
        </div>
      </div>
    </div>
  )

  switch (type) {
    case 'dashboard':
      return <DashboardSkeleton />
    case 'table':
      return <TableSkeleton />
    case 'cards':
      return <CardsSkeleton />
    case 'form':
      return <FormSkeleton />
    default:
      return <LoadingSpinner />
  }
}

// Specific loading components for different pages
export function DashboardLoading() {
  return <OptimizedLoading type="dashboard" />
}

export function TableLoading() {
  return <OptimizedLoading type="table" count={8} />
}

export function CardsLoading() {
  return <OptimizedLoading type="cards" count={6} />
}

export function FormLoading() {
  return <OptimizedLoading type="form" />
} 