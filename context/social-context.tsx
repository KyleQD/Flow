"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface SocialContextType {
  posts: any[]
  addPost: (post: any) => void
  deletePost: (postId: string) => void
}

const SocialContext = createContext<SocialContextType | undefined>(undefined)

export function SocialProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<any[]>([])

  const addPost = (post: any) => {
    setPosts(prev => [...prev, post])
  }

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId))
  }

  return (
    <SocialContext.Provider value={{ posts, addPost, deletePost }}>
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (context === undefined) {
    throw new Error("useSocial must be used within a SocialProvider")
  }
  return context
} 