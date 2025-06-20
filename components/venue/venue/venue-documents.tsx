import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, FileText, Upload } from "lucide-react"

interface VenueDocumentsProps {
  venue: any
}

export function VenueDocuments({ venue }: VenueDocumentsProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Documents</CardTitle>
          <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {venue.documents.slice(0, 3).map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-400 mr-3" />
                <div>
                  <h3 className="font-medium text-white">{doc.name}</h3>
                  <p className="text-xs text-gray-400">
                    {doc.type.toUpperCase()} • {doc.size}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1 text-purple-400 border-purple-800/50 hover:bg-purple-900/20">
            <Upload className="h-4 w-4 mr-2" /> Upload
          </Button>
          <Button variant="outline" className="flex-1 text-purple-400 border-purple-800/50 hover:bg-purple-900/20">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
