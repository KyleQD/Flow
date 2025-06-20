"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

// Simple emoji categories for the demo
const EMOJI_CATEGORIES = {
  recent: ["👍", "❤️", "😊", "🎵", "🎸", "🎤", "🎧", "🎼", "🎹", "🥁"],
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
  people: ["👋", "👌", "👍", "👎", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💪", "🦾", "🦿", "🦵", "🦶"],
  nature: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"],
  food: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥"],
  activity: ["⚽️", "🏀", "🏈", "⚾️", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑"],
  travel: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🛴", "🚲"],
  music: ["🎵", "🎶", "🎙", "🎚", "🎛", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗"],
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState("recent")

  // Filter emojis based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmojis([])
      return
    }

    // Combine all emojis and filter
    const allEmojis = Object.values(EMOJI_CATEGORIES).flat()

    // In a real app, you would have emoji metadata to search through
    // For this demo, we'll just return all emojis since we can't search by name
    setFilteredEmojis(allEmojis)
  }, [searchQuery])

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-md shadow-lg p-2 w-full max-w-xs">
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search emojis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {searchQuery ? (
        <div className="h-[200px] overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`search-${index}`}
                className="h-8 w-8 flex items-center justify-center hover:bg-gray-800 rounded"
                onClick={() => onEmojiSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          {filteredEmojis.length === 0 && <div className="text-center py-4 text-gray-500">No emojis found</div>}
        </div>
      ) : (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-5 bg-gray-800 mb-2">
            <TabsTrigger value="recent">🕒</TabsTrigger>
            <TabsTrigger value="smileys">😊</TabsTrigger>
            <TabsTrigger value="people">👋</TabsTrigger>
            <TabsTrigger value="nature">🐶</TabsTrigger>
            <TabsTrigger value="music">🎵</TabsTrigger>
          </TabsList>

          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <TabsContent key={category} value={category} className="h-[200px] overflow-y-auto">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={`${category}-${index}`}
                    className="h-8 w-8 flex items-center justify-center hover:bg-gray-800 rounded"
                    onClick={() => onEmojiSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
