"use client"
import { createContext, useContext } from "react"

const ToastContext = createContext({})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastContext.Provider value={{}}>{children}</ToastContext.Provider>
}

export function useToastContext() {
  return useContext(ToastContext)
}
