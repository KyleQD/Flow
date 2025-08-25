"use client"

import { useState } from "react"
import { AlertTriangle, X, Info, Clock, Users, Upload, CreditCard } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getDemoBannerMessage, getDemoLimitations, isDemoMode } from "@/lib/utils/demo-mode"

export function DemoBanner() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (!isDemoMode || isDismissed) return null

  const limitations = getDemoLimitations()

  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Demo Mode
              </Badge>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {getDemoBannerMessage()}
              </span>
            </div>
            
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200">
                  <Info className="h-4 w-4 mr-1" />
                  {isExpanded ? 'Hide' : 'Show'} limitations
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-2">
                  {limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-yellow-700 dark:text-yellow-300">
                      {limitation.includes('reset') && <Clock className="h-4 w-4" />}
                      {limitation.includes('profiles') && <Users className="h-4 w-4" />}
                      {limitation.includes('upload') && <Upload className="h-4 w-4" />}
                      {limitation.includes('payment') && <CreditCard className="h-4 w-4" />}
                      <span>{limitation}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="h-auto p-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  )
}
