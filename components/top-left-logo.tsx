"use client"

import Link from "next/link"

export function TopLeftLogo() {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Link href="/artist" className="block group">
        <img 
          src="/tourify-logo.png" 
          alt="Tourify" 
          className="h-12 w-auto transition-all duration-300 group-hover:scale-105 drop-shadow-lg bg-white/10 backdrop-blur-sm rounded-lg p-2"
        />
      </Link>
    </div>
  )
} 