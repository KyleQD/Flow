import React, { useEffect, useMemo, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ComboboxItem {
  id: string
  label: string
  subLabel?: string
  iconUrl?: string
}

interface ComboboxProps {
  value?: string
  placeholder?: string
  items: ComboboxItem[]
  isLoading?: boolean
  onSearch?: (query: string) => void
  onChange?: (value?: string) => void
  className?: string
}

export function Combobox({ value, placeholder = "Search...", items, isLoading, onSearch, onChange, className }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!onSearch) return
    const t = setTimeout(() => onSearch(query), 200)
    return () => clearTimeout(t)
  }, [query, onSearch])

  const selectedItem = useMemo(() => items.find(i => i.id === value), [items, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between", className)}>
          <div className="truncate text-left">
            <div className="text-sm">{selectedItem ? selectedItem.label : placeholder}</div>
            {selectedItem?.subLabel && <div className="text-xs text-muted-foreground truncate">{selectedItem.subLabel}</div>}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
          <CommandList>
            {!items.length && !isLoading && <CommandEmpty>No results.</CommandEmpty>}
            <CommandGroup>
              {items.map(item => (
                <CommandItem key={item.id} value={item.id} onSelect={() => { onChange?.(item.id); setOpen(false) }}>
                  <div className="flex items-center gap-2">
                    {item.iconUrl && <img src={item.iconUrl} alt="" className="h-5 w-5 rounded-full" />}
                    <div>
                      <div className="text-sm">{item.label}</div>
                      {item.subLabel && <div className="text-xs text-muted-foreground">{item.subLabel}</div>}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}



