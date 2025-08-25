"use client"

import { useEffect, useRef } from "react"
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandDialog,
} from "@/components/ui/command"
import { useCommandMenu } from "@/hooks/venue/use-command-menu"
import dynamic from "next/dynamic"

// Dynamically import all Lucide icons
const DynamicIcon = dynamic(
  () =>
    import("lucide-react").then((mod) => {
      return ({ name, ...props }: { name: string; [key: string]: any }) => {
        const LucideIcon = (mod as any)[name]
        return LucideIcon ? <LucideIcon {...props} /> : null
      }
    }),
  { ssr: false },
)

interface CommandMenuProps {
  placeholder?: string
  shortcutText?: string
}

export function CommandMenu({ placeholder = "Type a command or search...", shortcutText = "⌘K" }: CommandMenuProps) {
  const { isOpen, toggleMenu, searchQuery, handleSearch, filteredItems, handleSelect } = useCommandMenu({
    shortcut: {
      modifiers: ["meta"],
      key: "k",
    },
    placeholder,
  })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Group items by category
  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof filteredItems>,
  )

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedItems).sort()

  return (
    <>
      <CommandDialog open={isOpen} onOpenChange={toggleMenu}>
        <CommandInput ref={inputRef} placeholder={placeholder} value={searchQuery} onValueChange={handleSearch} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {sortedCategories.map((category, index) => (
            <div key={category}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={category.charAt(0).toUpperCase() + category.slice(1)}>
                {groupedItems[category].map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center gap-2 py-2"
                  >
                    {item.icon && <DynamicIcon name={item.icon} className="h-4 w-4 text-muted-foreground" />}
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
