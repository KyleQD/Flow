import { ChevronRight, FileText, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TourifyLogo } from "@/components/tourify-logo"

export function DocumentsList() {
  const documents = [
    {
      id: 1,
      title: "Stage Plot & Technical Rider",
      type: "PDF",
      size: "2.4 MB",
    },
    {
      id: 2,
      title: "Floor Plan",
      type: "PDF",
      size: "1.8 MB",
    },
    {
      id: 3,
      title: "Booking Policy",
      type: "PDF",
      size: "0.5 MB",
    },
  ]

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="text-xl font-bold">Documents</CardTitle>
        <TourifyLogo className="h-5 w-auto text-white/60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((document) => (
            <div key={document.id} className="flex items-center gap-3 rounded-md bg-[#0f1117] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{document.title}</h3>
                <div className="text-sm text-white/60">
                  {document.type} • {document.size}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button
            variant="ghost"
            className="justify-center text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            View All
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
