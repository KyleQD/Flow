"use client"

import { useState } from "react"

export function useVenueEvents() {
  // Placeholder: returns empty events and loading false
  const [events] = useState([])
  const [isLoading] = useState(false)
  return { events, isLoading }
} 