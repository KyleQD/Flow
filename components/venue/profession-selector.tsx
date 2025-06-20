"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { mockProfessions } from "@/lib/mock-data"

interface ProfessionSelectorProps {
  selectedProfessions: string[]
  onChange: (professions: string[]) => void
  maxSelections?: number
}

export default function ProfessionSelector({
  selectedProfessions = [],
  onChange,
  maxSelections = 3,
}: ProfessionSelectorProps) {
  const [open, setOpen] = useState(false)
  const [professions, setProfessions] = useState(mockProfessions)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSelect = (professionId: string) => {
    if (selectedProfessions.includes(professionId)) {
      onChange(selectedProfessions.filter((id) => id !== professionId))
    } else {
      if (selectedProfessions.length < maxSelections) {
        onChange([...selectedProfessions, professionId])
      }
    }
  }

  const handleRemove = (professionId: string) => {
    onChange(selectedProfessions.filter((id) => id !== professionId))
  }

  const getSelectedProfessionNames = () => {
    return selectedProfessions.map((id) => {
      const profession = professions.find((p) => p.id === id)
      return profession ? profession.name : ""
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedProfessions.map((id) => {
          const profession = professions.find((p) => p.id === id)
          if (!profession) return null

          return (
            <Badge key={id} variant="secondary" className="px-3 py-1.5 text-sm">
              {profession.name}
              <button
                type="button"
                onClick={() => handleRemove(id)}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={selectedProfessions.length >= maxSelections}
            className="w-full justify-between"
          >
            {selectedProfessions.length === 0
              ? "Select professions..."
              : `${selectedProfessions.length} profession${selectedProfessions.length > 1 ? "s" : ""} selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search professions..." value={searchQuery} onValueChange={setSearchQuery} />
            <CommandList>
              <CommandEmpty>No profession found.</CommandEmpty>
              <CommandGroup>
                {professions.map((profession) => (
                  <CommandItem
                    key={profession.id}
                    value={profession.name}
                    onSelect={() => {
                      handleSelect(profession.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedProfessions.includes(profession.id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{profession.name}</span>
                      <span className="text-xs text-muted-foreground">{profession.category}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedProfessions.length >= maxSelections && (
        <p className="text-xs text-muted-foreground mt-1">Maximum of {maxSelections} professions can be selected.</p>
      )}
    </div>
  )
}
