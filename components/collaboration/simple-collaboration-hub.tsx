"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FolderOpen, GitBranch } from "lucide-react"

export function SimpleCollaborationHub() {
  return (
    <Card className="bg-slate-950/90 border-slate-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Collaboration Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <Users className="h-6 w-6" />
            <span>Find Collaborators</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <FolderOpen className="h-6 w-6" />
            <span>Browse Projects</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto p-4 flex-col"
          >
            <GitBranch className="h-6 w-6" />
            <span>Create Project</span>
          </Button>
        </div>
        
        <div className="text-center text-sm text-slate-400">
          Collaboration features are loading...
        </div>
      </CardContent>
    </Card>
  )
}