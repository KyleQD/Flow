"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, Hash } from 'lucide-react'
import { motion } from 'framer-motion'

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
}

// Mock trending searches (in a real app, these would come from analytics)
const TRENDING_SEARCHES = [
  { query: "indie artists", category: "artist", growth: "+24%" },
  { query: "live venues", category: "venue", growth: "+18%" },
  { query: "new music", category: "general", growth: "+35%" },
  { query: "jazz clubs", category: "venue", growth: "+12%" },
  { query: "singer songwriter", category: "artist", growth: "+28%" }
]

const SUGGESTED_CATEGORIES = [
  { label: "Artists", icon: "🎵", searches: ["indie artists", "singer songwriter", "electronic music", "local bands"] },
  { label: "Venues", icon: "🏟️", searches: ["jazz clubs", "concert halls", "outdoor venues", "intimate spaces"] },
  { label: "Genres", icon: "🎶", searches: ["jazz", "rock", "electronic", "indie", "folk", "hip hop"] }
]

export function SearchSuggestions({ onSuggestionClick }: SearchSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState(0)

  return (
    <div className="p-4 space-y-6">
      {/* Trending Searches */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-foreground">Trending Now</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {TRENDING_SEARCHES.map((item, index) => (
            <motion.button
              key={item.query}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSuggestionClick(item.query)}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/50 transition-all duration-200"
            >
              <Hash className="h-3 w-3 text-emerald-600" />
              <span className="text-sm text-emerald-900 font-medium">{item.query}</span>
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                {item.growth}
              </Badge>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Category Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium text-foreground">Popular Categories</span>
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
          {SUGGESTED_CATEGORIES.map((category, index) => (
            <button
              key={category.label}
              onClick={() => setSelectedCategory(index)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedCategory === index
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Category Content */}
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_CATEGORIES[selectedCategory].searches.map((search, index) => (
              <motion.button
                key={search}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSuggestionClick(search)}
                className="flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-muted transition-colors duration-200 group"
              >
                <Hash className="h-3 w-3 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                <span className="text-sm text-foreground">{search}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}