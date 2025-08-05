"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Palette, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useColorHarmony } from "@/hooks/use-color-harmony"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
  showLabel?: boolean
}

const presetColors = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", 
  "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", 
  "#d946ef", "#ec4899", "#f43f5e", "#64748b", "#475569", "#334155", "#1e293b", 
  "#0f172a", "#000000", "#ffffff"
]

export function ColorPicker({ 
  value, 
  onChange, 
  label = "Color", 
  className,
  showLabel = true 
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const popoverRef = useRef<HTMLDivElement>(null)
  const { getHarmonySuggestions } = useColorHarmony()

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleColorChange = (color: string) => {
    onChange(color)
    setInputValue(color)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleInputBlur = () => {
    // Reset to valid color if input is invalid
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(value)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <Label className="text-sm font-medium text-white/80">{label}</Label>
      )}
      
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-12 w-12 p-0 border-2 border-white/20 hover:border-white/40 transition-all duration-200 rounded-xl",
                "relative overflow-hidden shadow-lg hover:shadow-xl"
              )}
              style={{ backgroundColor: value }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
              <Palette className="h-5 w-5 text-white drop-shadow-sm" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent 
            ref={popoverRef}
            className="w-80 p-6 bg-slate-900/95 backdrop-blur border-slate-700 rounded-2xl"
            align="start"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Choose Color</h4>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-xl border-2 border-white/20 shadow-lg"
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-sm text-white/60 font-mono">{value}</span>
                </div>
              </div>
              
                             {/* Preset Colors */}
               <div>
                 <Label className="text-sm text-white/60 mb-3 block font-medium">Preset Colors</Label>
                 <div className="grid grid-cols-8 gap-3">
                   {presetColors.map((color) => (
                     <button
                       key={color}
                       onClick={() => handleColorChange(color)}
                       className={cn(
                         "w-10 h-10 rounded-xl border-2 transition-all duration-200 hover:scale-110 shadow-lg",
                         value === color 
                           ? "border-white shadow-xl" 
                           : "border-white/20 hover:border-white/40"
                       )}
                       style={{ backgroundColor: color }}
                       title={color}
                     >
                       {value === color && (
                         <Check className="h-4 w-4 text-white mx-auto drop-shadow-sm" />
                       )}
                     </button>
                   ))}
                 </div>
               </div>
              
                             {/* Custom Color Input */}
               <div className="space-y-3">
                 <Label className="text-sm text-white/60 font-medium">Custom Color</Label>
                 <div className="flex items-center gap-3">
                   <Input
                     value={inputValue}
                     onChange={handleInputChange}
                     onBlur={handleInputBlur}
                     placeholder="#000000"
                     className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-white/40 rounded-xl"
                   />
                   <div 
                     className="w-10 h-8 rounded-xl border-2 border-white/20 shadow-lg"
                     style={{ backgroundColor: inputValue }}
                   />
                 </div>
                 <p className="text-xs text-white/40">
                   Enter a hex color code (e.g., #ff0000 for red)
                 </p>
               </div>
              
                             {/* Color Harmony Suggestions */}
               <div className="space-y-4">
                 <Label className="text-sm text-white/60 flex items-center gap-2 font-medium">
                   <Sparkles className="h-4 w-4" />
                   Color Harmony Suggestions
                 </Label>
                 
                 {(() => {
                   const suggestions = getHarmonySuggestions(value)
                   return (
                     <div className="space-y-3">
                       <div>
                         <Label className="text-xs text-white/40 mb-2 block font-medium">Complementary</Label>
                         <div className="flex gap-2">
                           <button
                             onClick={() => handleColorChange(suggestions.complementary)}
                             className="w-8 h-8 rounded-xl border-2 border-white/20 hover:scale-110 transition-all duration-200 shadow-lg"
                             style={{ backgroundColor: suggestions.complementary }}
                             title={suggestions.complementary}
                           />
                         </div>
                       </div>
                       
                       <div>
                         <Label className="text-xs text-white/40 mb-2 block font-medium">Analogous</Label>
                         <div className="flex gap-2">
                           {suggestions.analogous.map((color) => (
                             <button
                               key={color}
                               onClick={() => handleColorChange(color)}
                               className="w-8 h-8 rounded-xl border-2 border-white/20 hover:scale-110 transition-all duration-200 shadow-lg"
                               style={{ backgroundColor: color }}
                               title={color}
                             />
                           ))}
                         </div>
                       </div>
                       
                       <div>
                         <Label className="text-xs text-white/40 mb-2 block font-medium">Triadic</Label>
                         <div className="flex gap-2">
                           {suggestions.triadic.map((color) => (
                             <button
                               key={color}
                               onClick={() => handleColorChange(color)}
                               className="w-8 h-8 rounded-xl border-2 border-white/20 hover:scale-110 transition-all duration-200 shadow-lg"
                               style={{ backgroundColor: color }}
                               title={color}
                             />
                           ))}
                         </div>
                       </div>
                       
                       <div>
                         <Label className="text-xs text-white/40 mb-2 block font-medium">Monochromatic</Label>
                         <div className="flex gap-2">
                           {suggestions.monochromatic.map((color) => (
                             <button
                               key={color}
                               onClick={() => handleColorChange(color)}
                               className="w-8 h-8 rounded-xl border-2 border-white/20 hover:scale-110 transition-all duration-200 shadow-lg"
                               style={{ backgroundColor: color }}
                               title={color}
                             />
                           ))}
                         </div>
                       </div>
                     </div>
                   )
                 })()}
               </div>

               {/* Color Categories */}
               <div className="space-y-4">
                 <Label className="text-sm text-white/60 font-medium">Color Categories</Label>
                
                                 {/* Reds */}
                 <div>
                   <Label className="text-xs text-white/40 mb-2 block font-medium">Reds</Label>
                   <div className="flex gap-2">
                     {["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"].map((color) => (
                       <button
                         key={color}
                         onClick={() => handleColorChange(color)}
                         className={cn(
                           "w-8 h-8 rounded-xl border-2 transition-all duration-200 hover:scale-110 shadow-lg",
                           value === color ? "border-white" : "border-white/20"
                         )}
                         style={{ backgroundColor: color }}
                       />
                     ))}
                   </div>
                 </div>
                
                                 {/* Blues */}
                 <div>
                   <Label className="text-xs text-white/40 mb-2 block font-medium">Blues</Label>
                   <div className="flex gap-2">
                     {["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"].map((color) => (
                       <button
                         key={color}
                         onClick={() => handleColorChange(color)}
                         className={cn(
                           "w-8 h-8 rounded-xl border-2 transition-all duration-200 hover:scale-110 shadow-lg",
                           value === color ? "border-white" : "border-white/20"
                         )}
                         style={{ backgroundColor: color }}
                       />
                     ))}
                   </div>
                 </div>
                 
                 {/* Greens */}
                 <div>
                   <Label className="text-xs text-white/40 mb-2 block font-medium">Greens</Label>
                   <div className="flex gap-2">
                     {["#10b981", "#059669", "#047857", "#065f46", "#064e3b"].map((color) => (
                       <button
                         key={color}
                         onClick={() => handleColorChange(color)}
                         className={cn(
                           "w-8 h-8 rounded-xl border-2 transition-all duration-200 hover:scale-110 shadow-lg",
                           value === color ? "border-white" : "border-white/20"
                         )}
                         style={{ backgroundColor: color }}
                       />
                     ))}
                   </div>
                 </div>
                 
                 {/* Purples */}
                 <div>
                   <Label className="text-xs text-white/40 mb-2 block font-medium">Purples</Label>
                   <div className="flex gap-2">
                     {["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"].map((color) => (
                       <button
                         key={color}
                         onClick={() => handleColorChange(color)}
                         className={cn(
                           "w-8 h-8 rounded-xl border-2 transition-all duration-200 hover:scale-110 shadow-lg",
                           value === color ? "border-white" : "border-white/20"
                         )}
                         style={{ backgroundColor: color }}
                       />
                     ))}
                   </div>
                 </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="#000000"
          className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl"
        />
      </div>
    </div>
  )
} 