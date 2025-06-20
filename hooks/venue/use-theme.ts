"use client"

import { useState, useEffect } from "react"

type Theme = "dark" | "light" | "system"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    // Get saved theme from localStorage or default to system
    const savedTheme = localStorage.getItem("theme") as Theme | null
    const initialTheme = savedTheme || "dark"
    setTheme(initialTheme)

    // Apply theme to document
    applyTheme(initialTheme)
  }, [])

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem("theme", theme)

    // Apply theme to document
    applyTheme(theme)
  }, [theme])

  // Apply theme to document
  const applyTheme = (currentTheme: Theme) => {
    const root = window.document.documentElement

    if (currentTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  return { theme, setTheme }
}
